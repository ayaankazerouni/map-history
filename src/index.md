# Map history

```js
import { stripHtml } from './components/lib.js'
import { worldMap } from './components/map.js'
```

Hover over points on the map to see event descriptions (sourced from Wikipedia's "on this day" pages).

<small>Multiple selections will also include all events in between those year ranges.</small>

```js
const ranges = view(
  Inputs.checkbox(
    [ "Pre-1600", "1600-1899", "1900-1949", "1950-1999", "2000-2024" ],
    {
      value: "Pre-1600",
      valueof: el => ({
        "Pre-1600": { start: -1500, end: 1600 },
        "1600-1899": { start: 1600, end: 1899 },
        "1900-1949": { start: 1900, end: 1940 },
        "1950-1999": { start: 1950, end: 1999 },
        "2000-2024": { start: 2000, end: 2025 }
      }[el]),
      disabled: !!searchTerms.length, // Disabled if searchTerms.length > 0
    }
  )
);
```

```js
const searchTerms = view(
  Inputs.text({
    label: 'Events containing the word or phrase',
    placeholder: 'e.g., Gandhi',
    width: 500,
  })
);
```

```js
const map = worldMap(world);
display(map);
```

```js
// Reactive: run whenever eventsToDraw changes.
map.update(eventsToDraw);
```

```js
// Reactive: run whenver searchTerms, start, or end change.
const start = Math.min(...ranges.map(e => e.start));
const end = Math.max(...ranges.map(e => e.end));

const eventsToDraw = searchTerms.length === 0 ?
  events
    .params({ start, end })
    .filter((d, $) => d.year >= $.start && d.year <= $.end) :
  events
    .params({ searchTerms })
    .filter((d, $) => {
      const lowerSearch = aq.op.lower($.searchTerms);
      return aq.op.includes(aq.op.lower(d.cleanDescription), lowerSearch);
    });
```

```js
const events = aq
  .fromJSON(await FileAttachment('data/events.json').json())
  .derive({
    cleanDescription: aq.escape(d => stripHtml(d.description))
  });
const world = FileAttachment('./data/land-50m.json').json();
const projection = d3.geoNaturalEarth1()
  .scale(200)
  .translate([550, 300]);
```
