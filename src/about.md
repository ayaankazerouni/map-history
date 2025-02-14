# About

<small>

> _I mean the Vikings were cool and all, but some of y'all just way too obsessed with them, there was some srsly banger  shit happening around the world at the exact same time that was at least as interesting if not more_
> 
> – [Shiv Ramdas](http://shivramdas.net/) on [BlueSky](https://bsky.app/profile/nameshiv.bsky.social/post/3ldvpyw2z7k2r)

</small>

This "map of history" was a fun little side project for me.
I wanted to be able to think about simultaneous events in human history that I wouldn't expect to be contemporary.

So I tried to explore the idea with a bit of data visualisation.

## Obtaining historical event data

I used [BeautifulSoup](https://pypi.org/project/beautifulsoup4/) scraped historical events from English Wikipedia's "On This Day" pages.
See the page on [September 15](https://en.wikipedia.org/wiki/September_15) as an example.
The page contains a list of major events (decided by Wikipedia editors) that occurred on September 15 throughout history.

The main event-scraping code is in [`events.py`](https://github.com/ayaankazerouni/map-history/blob/main/src/events.py).

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

## Caveats

There are many limitations to this method of gathering event data.

- Not all listed events in the Wikipedia page will result in an event object being emitted. For example, if there was no location identified for the event (since the goal was to plot events on a map).
- Scraping the English Wikipedia means that data is very skewed to European history. Events in other continents tend to appear when Europeans reached those other continents. Consider other sources of data, perhaps non-English Wikipedia.
- Many events may not have recorded exact dates with the month and day, so they wouldn't show up here, English Wikipedia or no.
