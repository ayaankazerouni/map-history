import re
import urllib.request as request
from bs4 import BeautifulSoup

months_with_days = {
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

def get_events(month, day):
    url = f'https://en.wikipedia.org/wiki/{month}_{day}'
    response = request.urlopen(url).read()
    soup = BeautifulSoup(response, 'html.parser')

    # Remove everything that appears after the Birth h2 span
    birth_span = soup.find('span', id='Births')
    if birth_span:
        births_onward = birth_span.find_parent('h2').find_all_next()
        for event in births_onward:
            event.decompose()
    
    all_list_items = soup.select('.mw-parser-output ul li')
    event_regex = re.compile('^(\d+)( BC)* –')
    events = filter(lambda x: event_regex.match(x.text), all_list_items)

    return list(map(lambda x: x.text, events))
