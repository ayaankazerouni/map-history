---
toc: false
theme: ['slate', 'wide']
---

# About 

<link rel="stylesheet" href="./styles.css"/>

Just for fun, a little project to help visualize contemporaneous events in history.
[Here's the code.](https://github.com/ayaankazerouni/map-history)

## The data

The map shows two types of data, each with its own caveats:

**Historical borders**, collected and made available by André Ourednik ([`aourednik/historical-basemaps`](https://github.com/aourednik/historical-basemaps)).

Ourednik emphasises:

> When using the data, keep in mind that
> * historical boundaries are even more disputed than contemporary ones, that
> * the actual concept of territory and national boundary becomes meaningful, in Europe, only since the [Peace of Westphalia](https://en.wikipedia.org/wiki/Peace_of_Westphalia) (1648), that
> * areas of civilizations actually overlap, especially in ancient history, and that
> * overlaying these ancient vector maps on contemporary physical maps can be misleading; rivers, lakes, shorelines _do_ change very much over millennia; think for instance about the evolution of the [Aral Sea](https://en.wikipedia.org/wiki/Aral_Sea) since the 1980s.

**"On this day" events**, obtained from the Wikimedia `onthisday` Feed API. See the code for this on GitHub ([`ayaankazerouni/map-history`](https://github.com/ayaankazerouni/map-history)).
Only events with coordinates (locations) were included.
If an event contained multiple coordinates, the event is included twice, once at each place.
Data was sourced from English Wikipedia; there is a bit of a bias toward events that involved Europeans, especially farther back in time.

## A note about colours

The specific colours in the map don't mean anything.
They are chosen by cycling through a list of 50 colours.
Some effort was made for consistency (e.g., different regions under British rule appear in the same colour).
But there are still colour collisions (because there are more than 50 regions/governments/political entities in most of the maps).
For example, in 2010 CE, Australia and Canada are both light blue.

## TO-DOs

**This is a work in progress.**

- Add fuzziness for uncertain borders.
- Refactor event data.
  - Events don't only occur on single days or in single places. So the longer term plan is to have an event database that allows GeoJSON features with start and end dates. Then we can draw events with larger spatial and temporal spans.
  - So the idea is: if someone searches for the an event that's not necessarily on one day, or in one place, like "the Rennaissance". We can search for _other_ events that overlapped with the Rennaissance temporally, and show those events on the map as well. Those events might be regions or points, and might span single days or longer time periods.
- Explore the [Human History](https://en.wikipedia.org/wiki/Human_history) Wikipedia page.
