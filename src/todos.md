# TO-DO

- Unset the event selection if the year slider is changed manually. Need to figure out a way to know if the slider was changed programmatically due to an event selection, or manually by the user. In the latter case, we want to reset the search and table values.
- ~~If an event is chosen in the table, draw it on the map~~
- ~~When an event is chosen, snap to the closest basemap year (update the slider)~~
- ~~Only colour in the boundary that contains the event~~

## Refactor event data

Events don't only occur on single days or in single places.
So the longer term plan is to have an event database where events are GeoJSON features with start and end dates.
Then we can draw events with larger spatial and temporal spans.

So the idea is: if someone searches for the an event that's not necessarily on one day, or in one place, like "the Rennaissance".
We can search for _other_ events that overlap with the Rennaissance temporally, and show those events on the map as well.
Those other events might be single-day, single-place events, or they might be longer-term events that overlap with the Rennaissance.

- [ ] Explore the [Human History](https://en.wikipedia.org/wiki/Human_history) Wikipedia page.
