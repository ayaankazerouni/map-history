---
toc: false
---

# Map history

```js
// Load components
import { worldMap, getGeoData } from "./components/map.js"
import { stripHtml, filterEvents } from './components/lib.js'
```

```js
// Load data
const events = await FileAttachment('data/events.json').json();
const basemaps = (await FileAttachment('data/time-periods.json').json()).years;
```

```js
const eventsToDraw = filterEvents(events, searchTerms, yearInput);
map.update(eventsToDraw);
```

```js
const years = basemaps.map(d => d.year);
const yearIndexInput = Inputs.range(
  [0, years.length - 1],
  {
    step: 1,
    label: 'Year',
    value: years.length - 1,
    format: i => years[i],
    width: 350 
  }
);
yearIndexInput.querySelector("input[type=number]").remove();
yearIndexInput.querySelector('label').style.setProperty('display', 'none');
const yearIndex = Generators.input(yearIndexInput);
```

```js
const searchTermsInput = Inputs.text({
  label: 'Events containing the word or phrase',
  placeholder: 'e.g., Gandhi',
  width: 500,
})
searchTermsInput.querySelector('label').style.setProperty('display', 'none');
const searchTerms = Generators.input(searchTermsInput);
```

```js
const yearInput = years[yearIndex];
const currentBasemap = basemaps[yearIndex];
const geodata = getGeoData(currentBasemap.filename);
const map = await worldMap(geodata);
```

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2">
    <div>
      <div style="display: flex; flex-flow: column; align-items: center;">
        <span style='font-size: 1.2em'>Selected year: ${yearInput}</span>
        ${yearIndexInput} 
        <small>Show historical borders for the given year.</small>
      </div>
      <div style="overflow: hidden;">
      ${display(map)}
      </div>
    </div>
  </div>
  <div class="card grid-colspan-1">
    <div style='display: flex; flex-flow: column; align-items: left;'>
      <div style='font-size: 1.1em'>Search for events containing a word or phrase.</div>
      ${searchTermsInput}
      <small>Will only show matching events before or during ${yearInput}.</small>
    </div>
    <div>
    </div>
  </div>
</div>
