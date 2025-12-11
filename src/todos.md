# TO-DO

- [ ] Draw only a land basemap if no events are selected
- [ ] If an event is chosen in the table, draw it on the map
- [ ] When an event is chosen, snap to the closest basemap year (update the slider)
- [ ] Only colour in the boundary that contains the event
- [ ] Show the other boundaries with lower opacity, coloured in when hovered

## Refactor event data

Events don't only occur on single days.
So the longer term plan is to have an event database where events are GeoJSON features with start and end dates.
Then we can draw events with larger spatial and temporal spans.

So the idea is: if someone searches for the an event that's not necessarily on one day, or in one place, like "the Rennaissance".
We can search for _other_ events that overlap with the Rennaissance temporally, and show those events on the map as well.
Those other events might be single-day, single-place events, or they might be longer-term events that overlap with the Rennaissance.

- [ ] Explore the [Human History](https://en.wikipedia.org/wiki/Human_history) Wikipedia page.
