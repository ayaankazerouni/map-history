import re
import urllib.request as request
from urllib.error import HTTPError
import bs4
import json
from typing import TypedDict

MONTHS_WITH_DAYS = {
    'January': 31,
    'February': 29,
    'March': 31,
    'April': 30,
    'May': 31,
    'June': 30,
    'July': 31,
    'August': 31,
    'September': 30,
    'October': 31,
    'November': 30,
    'December': 31
}

# Example: 1 BC – The Roman Senate posthumously deifies Julius Caesar
# Example: 1812 — The Bishop James Madison of Virginia founds the University of Virginia.
EVENT_RE = re.compile(r'^(\d+)( BC)* –')

class Event(TypedDict, total=False):
    day: int
    month: str
    year: int
    description: str
    longitude: float
    latitude: float

def get_event_items(soup: bs4.BeautifulSoup) -> list[bs4.Tag]:
    """
    Get all <li> events whose text matches `EVENT_RE` and that
    occur between the "Events" and "Births" `<h2>` tags.

    Params:
        - soup: BeautifulSoup object obtained by parsing the HTML page.
    
    Returns a list of Tags
    """
    events_header = soup.find('h2', id='Events')
    events_parent = events_header.find_parent() if events_header is not None else None
    births_header = soup.find('h2', id='Births')
    births_parent = births_header.find_parent() if births_header is not None else None

    if (events_parent and births_parent):
        elements = _get_event_items_between([], events_parent, births_parent)
        return elements
    return []

def _get_event_items_between(elements: list[bs4.Tag], start,  stop) -> list[bs4.Tag]:
    if (start.next_sibling == stop):
        return elements
    elif (start.name == 'li' and EVENT_RE.match(start.text)):
        elements.append(start)
    return _get_event_items_between(elements, start.next, stop)

def get_events_on_day(month: str, day: int) -> tuple[int, list[bs4.Tag]]:
    """
    Get the events that are listed on the Wikipedia page for the given month and day.
    This includes all events that occurred on the given day in history.
    Ignores "Births", "Deaths", and "Holidays and observances" sections.

    Params:
        - month -- A month name. Provide full months (e.g., "January", "February", etc.).
        - day -- The day of the month.

    Returns a tuple containing:
        - The number of requests made to wikipedia
        - A list of bs4.element.Tag objects, each representing a list item on the page
    """
    url = f'https://en.wikipedia.org/wiki/{month}_{day}'
    response = request.urlopen(url).read()
    soup = bs4.BeautifulSoup(response, 'html.parser')

    event_list_items = get_event_items(soup)

    events_on_day = []

    total_wiki_calls = 1 # The initial call to the main page
    for list_item in event_list_items:
        # Remove the citation from the list item
        citations = list_item.find_all('sup')
        for citation in citations:
            citation.decompose()

        wiki_calls, events = get_events_with_locations(list_item)

        # Add the month and day to each event object and append to the list
        events_on_day.extend(
            map(lambda x: {**x, 'month': month, 'day': day}, events)
        )
        
        total_wiki_calls += wiki_calls

    return total_wiki_calls, events_on_day 

def get_events_with_locations(event_tag: bs4.Tag) -> tuple[int, list[Event]]:
    """Given a list item from the Wikipedia page, extract the year, event description,
    and any coordinates from the event.

    The returned list contains "incomplete" Events — they will be missing the day and month, since that
    information comes from the Wikipedia page url, and not the event list item.
    """
    year, _ = event_tag.text.split(' – ', 1)

    # Remove the BC suffix from the year if it exists
    year = year.strip()
    if 'BC' in year:
        year = year.replace(' BC', '')
        year = -int(year)
    else:
        year = int(year)

    # The description is everything after the year, including HTML tags.
    description = event_tag.decode_contents().split(' – ', 1)[1]
    # Replace all /wiki/ links with a full /wikipedia.org/ URL
    description = re.sub(r'href="/wiki/', 'href="https://en.wikipedia.org/wiki/', description)

    # If there are links in the description, try to extract coordinates and emit an event object.
    # If multiple location links are present, emit multiple event objects.
    # If no location links are present, emit an empty list.
    events: list[Event] = []
    links = event_tag.select('a')
    total_wiki_calls = 0
    for link in links:
        href = link['href']
        page_url = ""
        if type(href) != str:
            page_url = href[0] if href else ""
        else:
            page_url = href

        # If the link is not a wiki link, quit
        if "wiki/" not in page_url:
            break    

        page_title = page_url.split('wiki/')[-1]

        coordinates = get_wikilink_coordinates(page_title)
        total_wiki_calls += 1
        if coordinates is not None:
            event: Event = {
                'year': year,
                'description': description,
                'longitude': coordinates['longitude'], 
                'latitude': coordinates['latitude']
            }
            events.append(event)
    
    return total_wiki_calls, events

WIKI_API = 'https://en.wikipedia.org/w/rest.php/v1/page/'

# Example coord|33|52|04|S|151|12|36|E
# Example Coord|41|00|49|N|28|57|18|E
# Example coord|28|36|04.6|N|77|12|49.4|E
COORD_NUM = r'\d+\.*\d*'
COORD_RE = re.compile(r'coord\|({}\|{}\|{}\|[N|S])\|({}+\|{}+\|{}+\|[E|W])'.format(
    COORD_NUM, COORD_NUM, COORD_NUM,
    COORD_NUM, COORD_NUM, COORD_NUM
), re.IGNORECASE)

class Coordinates(TypedDict):
    latitude: float
    longitude: float

def get_wikilink_coordinates(page_title: str) -> Coordinates | None:
    """
    Given a wikipedia page title, explore the page's Infobox for coordinates.
    Convert the coordinates from degrees to decimal and return.

    Returns { latitude: float, longitude: float } or None if the page is not a wiki page or
    if there were no coordinates in the Infobox (i.e., it wasn't a page for a place).
    """
    url = WIKI_API + page_title
    try:
        response = request.urlopen(url) # Expecting a JSON response
    except HTTPError as e:
        return None

    if response is None or response.status != 200:
        return None

    data = json.loads(response.read())['source']
    coordinates = re.search(COORD_RE, data, re.IGNORECASE)

    if coordinates is None:
        return None

    latitude = coordinates[1].split('|')
    longitude = coordinates[2].split('|')

    return {
        'latitude': deg_to_dec(int(latitude[0]), int(latitude[1]), int(latitude[2]), latitude[3]),
        'longitude': deg_to_dec(int(longitude[0]), int(longitude[1]), int(longitude[2]), longitude[3])
    }

def deg_to_dec(degrees: int, minutes: int, seconds: int, hemisphere: str) -> float:
    """Convert the given coordinate from degrees to a decimal number.

    Params:
        - degrees
        - minutes
        - seconds
        - hemisphere: 'N', 'S', 'E', or 'W' 
    """
    dec = round(
        degrees + (minutes / 60) + (seconds / 3600),
        4
    )
    if hemisphere in ['S', 'W']:
        dec *= -1
    return dec

####### TESTS #######

import unittest

class TestRegexes(unittest.TestCase):

    def test_coord_with_ints(self):
        coordNE = 'coord|41|00|49|N|28|57|18|E'
        coordSW = 'coord|41|00|49|S|28|57|18|W'
        self.assertRegex(coordNE, COORD_RE)
        self.assertRegex(coordSW, COORD_RE)
    
    def test_coord_with_frac(self):
        coord = 'coord|28|36|04.6|N|77|12|49.4|E' 
        self.assertRegex(coord, COORD_RE)
