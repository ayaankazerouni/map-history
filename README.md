# World Events 

Scrape historical events from English Wikipedia. Data is used in a little project I played around with for fun: [https://observablehq.com/@ayaankazerouni/map-history](https://observablehq.com/@ayaankazerouni/map-history).

## Overview 

Use BeautifulSoup to inspect "on this day" pages on English Wikipedia.
See the page on [January 1](https://en.wikipedia.org/wiki/January_1) as an example.
The page contains a list of events that occurred on January 1 throughout history[^1].

[^1]: There are many limitations to this method of obtaining event data.

The `get_events_on_day` function in [events.py](events.py) inspects all items under the **Events** subheading in the Wikipedia page, and attempts to assemble a record that looks like this:

```
{
  'year': number, # negative for years in BC
  'month': string,
  'day': number,
  'longitude' number,
  'latitude': number,
  'description': string, # An HTML string
}
```

Each list item in the **Events** subsection includes a brief description, which often contains links to other Wikipedia pages.
The function will inspect the info boxes in _those_ Wikipedia pages, looking for coordinates (nominally, the "location" of the event). If the event description contains references to multiple linked locations, the function emits an event for each location.

## Caveats

- Not all listed events in the Wikipedia page will result in an event object being emitted. For example, if there was no location identified for the event (since the goal was to plot events on a map).
- Scraping the English Wikipedia means that data is very skewed to European history. Events in other continents tend to appear when Europeans reached those other continents. Consider other sources of data, perhaps non-English Wikipedia.
- Many events may not have recorded exact dates with the month and day, so they wouldn't show up here, English Wikipedia or no.

## Installation and usage

1. Install Python and [Pipenv](https://pipenv.pypa.io/en/latest/).
2. Clone this repository.
3. `cd world-events`
4. `pipenv install` to install dependencies from `Pipenv.lock`

Begin looking for events by importing the `get_events_on_day` function.

Scraped events as of October 25, 2024 are in `events-by-month`.
Each file corresponds to a month.

