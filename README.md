# Map-history

## View the map

A map of historical events (dots on a map). You can see the Observable notebook version [here](https://observablehq.com/@ayaankazerouni/map-history.

To run the site locally as an [Observable Framework](https://observablehq.com/framework/) site:

Make sure you have Node installed. I'm using v22.13.1.

* Install Observable dependencies: `npm install -g yarn && yarn` (install yarn and use yarn to install dependencies)
* `yarn dev` to run the dev server at [https://localhost:3000](https://localhost:3000)
  - The first time you run this, Observable Framework will install some further dependencies that are being used in [`index.md`](./src/index.md), e.g., vega, vega-lite, vega-lite-api, vega-tooltip

## Getting events from Wikipedia

This all happens in [`src/events.py`](src/events.py).
To play with the code:

- Install Python
- `cd map-history`
- `python3 -m venv .venv && source .venv/bin/activate` to set up and activate a virtual environmnt
- `python3 -m pip install -r requirements.txt` to install dependencies from `requirements.txt`

The `get_events_on_day` function in `events.py` inspects all items under the **Events** subheading in the Wikipedia page, and attempts to assemble a record that looks like this:

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
The function will inspect the info boxes in *those* Wikipedia pages, looking for coordinates (nominally, the "location" of the event).
If the event description contains references to multiple linked locations, the function emits an event for each location.

Scraped events as of February, 2025 are in [`src/data/events-by-month/`](src/data/events-by-month).
Each file corresponds to a month.
