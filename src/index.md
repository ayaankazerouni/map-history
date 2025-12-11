---
toc: false
---

<link rel="stylesheet" href="styles.css" >

# Map history

```js
// Load components
import { worldMap } from "./components/map.js";
import {
  stripHtml,
  filterTest,
  getGeoData,
  getClosestTimePeriod,
} from "./components/lib.js";
```

```js
// Load data
const events = await FileAttachment("data/events.json").json();
const basemaps = (await FileAttachment("data/time-periods.json").json()).years;
const timePeriods = basemaps.map(d => d.year);
```

<!--Reactive variables -->

```js
const dark = Generators.dark();
const width = Generators.width(document.querySelector("#map"));
```

```js
const yearIndexInput = Inputs.range([0, timePeriods.length - 1], {
  step: 1,
  label: "Year",
  value: timePeriods.length - 1,
  format: (i) => timePeriods[i],
  width: 350,
});
yearIndexInput.querySelector("input[type=number]").remove();
yearIndexInput.querySelector("label").style.setProperty("display", "none");
const yearIndex = Generators.input(yearIndexInput);
```

```js
// Search input for events data
const searchInput = Inputs.search(events, {
  width: 500,
  placeholder: "Search events...",
  required: false,
  filter: filterTest,
});
const searchResult = Generators.input(searchInput);
```

```js
// A table input showing filtered events based on search input
const filteredEventsTable = Inputs.table(
  searchResult.map((d) => ({
    Year: String(d.year),
    Description: d.description,
  })),
  {
    width: {
      Year: 40,
    },
    height: 1000,
    required: false,
    select: true,
    multiple: false,
  },
);
const chosenEvent = Generators.input(filteredEventsTable);
```

```js
const chosenEventYear = chosenEvent?.Year;
if (chosenEventYear !== undefined) {
  const closestTimePeriod = getClosestTimePeriod(
    +chosenEventYear,
    timePeriods
  );
  yearIndexInput.value = timePeriods.indexOf(closestTimePeriod);
  yearIndexInput.dispatchEvent(new Event("input"));
}
```

```js
const yearInput = timePeriods[yearIndex];
const currentBasemap = basemaps[yearIndex];
const geodata = getGeoData(currentBasemap.filename);
```

```js
const map = await worldMap(geodata, width, dark);
```

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2">
    <div>
      <div style="display: flex; flex-flow: column; align-items: center;">
        <span style='font-size: 1.2em'>Selected year: ${yearInput}</span>
        ${yearIndexInput} 
        <small>Show historical borders for the given year.</small>
      </div>
      <div style="overflow: hidden;" id='map'>
      ${map}
      </div>
    </div>
  </div>
  <div class="card grid-colspan-1">
    <div style='display: flex; flex-flow: column; align-items: left;'>
      <div style='font-size: 1.1em'>Search for events containing a word or phrase.</div>
      ${searchInput}
      ${filteredEventsTable}
    </div>
  </div>
</div>
