import re
import urllib.request as request
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

# Cities database from https://www.kaggle.com/datasets/max-mind/world-cities-database?select=worldcitiespop.csv
# Only kept city name, country, latitude, and longitude
# WORLD_CITIES = pd.read_csv('cities.csv')

def get_events_on_day(month: str, day: int) -> list[bs4.Tag]:
    """
    Get the events that are listed on the Wikipedia page for the given month and day. This includes all events that occurred on the given
    day in history. Ignores "Births", "Deaths", and "Holidays and observances" sections.

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

    return event_items

WIKI_API = 'https://en.wikipedia.org/w/rest.php/v1/page/'

# Example coord|33|52|04|S|151|12|36|E
# Example coord|35|16|27|N|120|39|47|W
COORD_RE = re.compile('coord\|(\d+\|\d+\|\d+)\|[N|S]\|(\d+\|\d+\|\d+)\|[E|W]')

def get_wikilink_coordinates(ref: bs4.element.Tag):
    """
    Given an 'a' tag with a /wiki/xyz link, explore the page's Infobox for coordinates. Convert the coordinates from degrees to decimal
    and return.

    Returns { latitude: float, longitude: float }
    """
    page_title = ref['href'].split('/')[-1]
    url = WIKI_API + page_title

    # use urllib to get the page
    response = request.urlopen(url)
    if response is None or response.status != 200:
        return None

    data = json.loads(response.read())['source']
    coordinates = re.search(COORD_RE, data)

    if coordinates is None:
        return None

    latitude = [int(n) for n in coordinates[1].split('|')]
    longitude = [int(n) for n in coordinates[2].split('|')]

    return {
        'latitude': deg_to_dec(latitude[0], latitude[1], latitude[2]),
        'longitude': deg_to_dec(longitude[0], longitude[1], longitude[2]),
    }

def deg_to_dec(degrees, minutes, seconds):
    return round(
        degrees + (minutes / 60) + (seconds / 3600),
        4
    )
