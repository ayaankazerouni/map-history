import re
import urllib.request as request
from urllib.error import HTTPError
import bs4
import json

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
EVENT_RE = re.compile('^(\d+)( BC)* –')

def get_events_on_day(month: str, day: int) -> list[bs4.Tag]:
    """
    Get the events that are listed on the Wikipedia page for the given month and day.
    This includes all events that occurred on the given day in history.
    Ignores "Births", "Deaths", and "Holidays and observances" sections.

    Provide months as full months (e.g., "January", "February", etc.).

    Returns a list of bs4.element.Tag objects, each representing a list item on the page.
    """
    url = f'https://en.wikipedia.org/wiki/{month}_{day}'
    response = request.urlopen(url).read()
    soup = bs4.BeautifulSoup(response, 'html.parser')

    # Remove everything that appears after the "Births" h2 span
    birth_span = soup.find('span', id='Births')
    if birth_span:
        births_onward = birth_span.find_parent('h2').find_all_next()
        for event in births_onward:
            event.decompose()
    
    all_list_items = soup.select('.mw-parser-output ul li')
    event_items = list(filter(lambda x: EVENT_RE.match(x.text), all_list_items))

    events_on_day = []

    total_wiki_calls = 1 # The initial call to the main page
    for list_item in event_items:
        # Remove the citation from the list item
        citations = list_item.find_all('sup')
        for citation in citations:
            citation.decompose()

        wiki_calls, events = get_events_with_locations(list_item)
        events_on_day.extend(events)
        total_wiki_calls += wiki_calls

    return total_wiki_calls, events_on_day 

def get_events_with_locations(event: bs4.Tag) -> list[dict]:
    """
    Given a list item from the Wikipedia page, extract the year, event description, and any coordinates from the event.
    """
    year, _ = event.text.split(' – ', 1)

    # Remove the BC suffix from the year if it exists
    year = year.strip()
    if 'BC' in year:
        year = year.replace(' BC', '')
        year = -int(year)
    else:
        year = int(year)

    # The description is everything after the year, including HTML tags.
    description = event.decode_contents().split(' – ', 1)[1]
    # Replace all /wiki/ links with a full /wikipedia.org/ URL
    description = re.sub(r'href="/wiki/', 'href="https://en.wikipedia.org/wiki/', description)

    # If there are links in the description, try to extract coordinates and emit an event object.
    # If multiple location links are present, emit multiple event objects.
    # If no location links are present, emit an empty list.
    events = []
    links = event.select('a')
    total_wiki_calls = 0
    for link in links:
        coordinates = get_wikilink_coordinates(link)
        total_wiki_calls += 1
        if coordinates is not None:
            events.append({
                'year': year,
                'description': description,
                'longitude': coordinates['longitude'], 
                'latitude': coordinates['latitude']
            })
    
    return total_wiki_calls, events

WIKI_API = 'https://en.wikipedia.org/w/rest.php/v1/page/'

# Example coord|33|52|04|S|151|12|36|E
# Example coord|35|16|27|N|120|39|47|W
COORD_RE = re.compile('coord\|(\d+\|\d+\|\d+\|[N|S])\|(\d+\|\d+\|\d+\|[E|W])')

def get_wikilink_coordinates(ref: bs4.element.Tag):
    """
    Given an 'a' tag with a /wiki/xyz link, explore the page's Infobox for coordinates.
    Convert the coordinates from degrees to decimal and return.

    Returns { latitude: float, longitude: float } or None if the page is not a wiki page or
    if there were no coordinates in the Infobox (i.e., it wasn't a page for a place).
    """
    page_url = ref['href']
    # If the link is not a wiki link, quit
    if "wiki/" not in page_url:
        return None

    page_title = page_url.split('wiki/')[-1]
    url = WIKI_API + page_title
    try:
        response = request.urlopen(url) # Expecting a JSON response
    except HTTPError as e:
        if e.code == 404:
            print(f"Page not found: {page_title}. Failed to get coordinates.")
        return None

    if response is None or response.status != 200:
        return None

    data = json.loads(response.read())['source']
    coordinates = re.search(COORD_RE, data)

    if coordinates is None:
        return None

    latitude = coordinates[1].split('|')
    longitude = coordinates[2].split('|')

    return {
        'latitude': deg_to_dec(latitude[0], latitude[1], latitude[2], latitude[3]),
        'longitude': deg_to_dec(longitude[0], longitude[1], longitude[2], longitude[3]),
    }

def deg_to_dec(degrees, minutes, seconds, hemisphere):
    dec = round(
        int(degrees) + (int(minutes) / 60) + (int(seconds) / 3600),
        4
    )
    if hemisphere in ['S', 'W']:
        dec *= -1
    return dec
