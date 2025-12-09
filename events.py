import urllib.request as request
import json
import os
from typing import TypedDict

MONTHS_WITH_DAYS = {
}

MONTHS = [
    { 'name': 'January', 'days': 31 },
    { 'name': 'February', 'days': 29 },
    { 'name': 'March', 'days': 31 },
    { 'name': 'April', 'days': 30 },
    { 'name': 'May', 'days': 31 },
    { 'name': 'June', 'days': 30 },
    { 'name': 'July', 'days': 31 },
    { 'name': 'August', 'days': 31 },
    { 'name': 'September', 'days': 30 },
    { 'name': 'October', 'days': 31 },
    { 'name': 'November', 'days': 30 },
    { 'name': 'December', 'days': 31 },
]

class Event(TypedDict, total=False):
    day: int
    month: str
    year: int
    description: str
    longitude: float
    latitude: float

def get_events_on_day(month: int, day: int) -> tuple[int, list[Event]]:
    """
    Get the events that occurred on the given month and day using the Wikimedia onthisday API.

    Params:
        - month -- A month number (1-indexed).
        - day -- The day of the month.

    Returns a tuple containing:
        - The number of requests made to the API (always 1 for this endpoint)
        - A list of Event objects with coordinates from linked pages
    """

    if (month < 1 or month > len(MONTHS)):
        raise ValueError(f'{month} is not a valid month number')
    elif (day < 1 or day > MONTHS[month - 1]['days']):
        raise ValueError(f'{day} is not a valid day number for {MONTHS[month - 1]['name']}')

    url = f'https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/{month}/{day}'

    headers = {
        'User-Agent': f'MapHistory/1.0 ({os.environ.get("WIKI_USERNAME", "")})'
    }
    req = request.Request(url, headers=headers)
    response = request.urlopen(req)
    data = json.loads(response.read())

    events_on_day = []

    # The API returns an 'events' array
    for event in data.get('events', []):
        year = event.get('year')
        description = event.get('text', '')

        # Look through the pages array for any with coordinates
        for page in event.get('pages', []):
            coordinates = page.get('coordinates')
            if coordinates:
                event_obj: Event = {
                    'day': day,
                    'month': MONTHS[month - 1]['name'],
                    'year': year,
                    'description': description,
                    'latitude': coordinates['lat'],
                    'longitude': coordinates['lon']
                }
                events_on_day.append(event_obj)

    return 1, events_on_day

