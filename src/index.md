# Map history

```js
import { stripHtml } from "./components/lib.js";

import * as aq from "npm:arquero";
import * as vega from "npm:vega@5";
import * as vegaLite from "npm:vega-lite@5";
import * as vegaLiteApi from "npm:vega-lite-api@5";
import * as tooltip from "npm:vega-tooltip@0.30.0";

const options = {
  config: {
      // vega-lite default configuration
      config: {
        view: {continuousWidth: 400, continuousHeight: 300},
        mark: {tooltip: null}
      }
    },
    init: view => {
      // initialize tooltip handler
      const handler = new tooltip.Handler().call;
      view.tooltip(handler);
      // enable horizontal scrolling for large plots
      if (view.container()) view.container().style['overflow-x'] = 'auto';
    },
    view: {
      // view constructor options
      renderer: 'canvas'
    }
};

const vl = vegaLiteApi.register(vega, vegaLite, options);
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

<small>

* Shift + Scroll to Zoom
* Click and drag to pan
* Double click to reset

</small>

```js
const earth = vl
  .layer(
    vl.markGeoshape({ stroke: 'lightgrey', fill: 'white' })
      .data(vl.sphere()),
    vl.markGeoshape({ stroke: 'lightgrey', fill: 'white' })
      .data(vl.topojson(world).feature('land'))
  )

const pointSelect = vl.selectPoint()
  .on('mouseover')
  .toggle(false)
  .nearest(true);

const pointsBase = vl.markCircle()
  .data(eventsToDraw)
  .transform(
    vl.calculate('datum.month + " " + datum.day + ", " + abs(datum.year) + " " + (datum.year < 0 ? "BC" : "AD")')
      .as('date'),
  )
  .encode(
    vl.longitude().field('longitude'),
    vl.latitude().field('latitude'),
  )

const points = pointsBase
  .markCircle({ size: 50 })
  .params(pointSelect)
  .encode(
    vl.tooltip([
      { field: 'date', type: 'nominal', title: 'Date' },
      { field: 'cleanDescription', type: 'nominal', title: 'Event' }
    ]),
    vl.color().fieldQ('year')
      .bin({maxbins: 20})
      .scale({ scheme: 'viridis', reverse: true })
      .legend({
        direction: 'horizontal',
        orient: 'top',
        title: 'Year',
        labelExpr: 'datum.value < 0 ? abs(datum.value) + " BC" : datum.value + " AD"'
      })
  )

const chosenPoint = pointsBase
  .markPoint({ color: 'firebrick', size: 150 })
  .transform(
    vl.filter(pointSelect.empty(false))
  );

const chart = vl.layer(earth, points, chosenPoint)
  .params(
    // Drag signal
    {
      name: "drag",
      value: [0, 0], // Initial center
      on: [
        {
          events: '[mousedown, mouseup] > mousemove!', // Capture mousemove between mousedown and mouseup events
          update: '[drag[0] - event.movementX * 0.1, drag[1] + event.movementY * 0.1]'
        },
        {
          events: 'dblclick', // Double-click to reset
          update: '[0, 0]'
        }
      ]
    },
    // Zoom signal
    {
      name: 'zoom',
      value: 150,
      on: [
        {
          events: "wheel![event.shiftKey]", // Scroll wheel while shift is pressed
          update: "clamp(zoom * (event.deltaY < 0 ? 1.1 : 0.9), 150, 2000)"
        },
        {
          events: 'dblclick', // Double-click to reset
          update: '150'
        }
      ]
    },
  )
  .project(
    vl.projection('naturalEarth1')
      .scale(vl.expr('zoom'))
      .center(vl.expr('[drag[0], drag[1]]'))
  )
  .width(width - 100)
  .height(width / 2)
  .render();

display(await chart);
```

```js
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
const world = FileAttachment("data/land-50m.json").json()
```
