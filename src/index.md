# Map history

```js
import { worldMap, getGeoData } from "./components/map.js"
import { stripHtml } from './components/lib.js'
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
// Reactive: run whenever eventsToDraw changes.
map.update(eventsToDraw);
```

```js
// Reactive: run whenver searchTerms, start, or end change.
const eventsToDraw = 
  events
    .params({ searchTerms, year: yearInput })
    .filter((d, $) => {
      if (aq.op.length($.searchTerms)) {
        const lowerSearch = aq.op.lower($.searchTerms);
        return d.year <= $.year && 
          aq.op.includes(aq.op.lower(d.cleanDescription), lowerSearch);
      } else {
        return false;
      }
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

```js
const basemaps = (await FileAttachment('data/time-periods.json').json()).years;
```

```js
const years = basemaps.map(d => d.year);
const yearIndexInput = view(
  Inputs.range(
    [0, years.length - 1],
    {
      step: 1,
      label: 'Year',
      value: years.length - 1,
      format: i => years[i],
      width: 640
    }
  )
);
```

<small>

_Colours in the map don't mean anything; they are used only to help demarcate borders. The only exceptions are <span style='padding: 2px; border: darkgrey 1pt solid; background-color: lightgrey'>grey</span> regions. Those are unnamed or unclaimed in that time period (according to [`historical-basemaps`](https://github.com/aourednik/historical-basemaps))._

</small>

```js
const yearInput = years[yearIndexInput];
const currentBasemap = basemaps[yearIndexInput];
const geodata = getGeoData(currentBasemap.filename);
const map = await worldMap(geodata);
display(map);
```
