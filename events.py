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

def download_events(directory_path: str) -> None:
    """
    Download events for all days of the year and save to JSON files.

    Creates one JSON file per month (01.json, 02.json, etc.) in the specified directory.
    Each file contains all events from all days in that month.

    Params:
        - directory_path -- Path to directory relative to project root where JSON files will be saved
    """
    import pathlib

    # Create the directory if it doesn't exist
    dir_path = pathlib.Path(directory_path)
    dir_path.mkdir(parents=True, exist_ok=True)

    total_wiki_calls = 0

    for month_num in range(1, len(MONTHS) + 1):
        month_info = MONTHS[month_num - 1]
        month_name = month_info['name']
        num_days = month_info['days']
        month_events = []

        print(f"Downloading events for {month_name}...")

        for day in range(1, num_days + 1):
            wiki_calls, events = get_events_on_day(month_num, day)
            total_wiki_calls += wiki_calls
            month_events.extend(events)

        # Save month's events to a JSON file
        output_file = dir_path / f"{month_num:02d}.json"
        with open(output_file, 'w') as f:
            json.dump(month_events, f, indent=2)

        print(f"  Saved {len(month_events)} events to {output_file}")

    print(f"\nTotal wiki calls made: {total_wiki_calls}")

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

