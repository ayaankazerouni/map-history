/**
 * Utilities for assigning consistent colours to map regions.
 */


 /** @type {import('./map.js').Region} */

/**
 * A palette of visually distinct colours.
 */
const palette = [
  "#4e79a7", // blue
  "#f28e2b", // orange
  "#e15759", // red
  "#76b7b2", // teal
  "#59a14f", // green
  "#edc948", // yellow
  "#b07aa1", // purple
  "#ff9da7", // pink
  "#9c755f", // brown
  "#bab0ac", // grey
  "#1f77b4", // darker blue
  "#2ca02c", // darker green
  "#d62728", // crimson
  "#9467bd", // violet
  "#8c564b", // chocolate
  "#e377c2", // orchid
  "#7f7f7f", // dark grey
  "#bcbd22", // olive
  "#17becf", // cyan
  "#aec7e8", // light blue
  "#ffbb78", // light orange
  "#98df8a", // light green
  "#ff9896", // light red
  "#c5b0d5", // light purple
  "#c49c94", // light brown
  "#f7b6d2", // light pink
  "#c7c7c7", // silver
  "#dbdb8d", // light olive
  "#9edae5", // light cyan
  "#393b79", // navy
  "#5254a3", // indigo
  "#6b6ecf", // periwinkle
  "#637939", // dark olive
  "#8ca252", // moss
  "#b5cf6b", // lime
  "#8c6d31", // bronze
  "#bd9e39", // gold
  "#e7ba52", // amber
  "#843c39", // maroon
  "#ad494a", // brick
  "#d6616b", // salmon
  "#7b4173", // plum
  "#a55194", // magenta
  "#ce6dbd", // fuschia
  "#de9ed6", // lavender
  "#3182bd", // royal blue
  "#6baed6", // sky blue
  "#9ecae1", // powder blue
  "#31a354", // emerald
  "#74c476", // seafoam
];



/**
 * Compute a non-negative integer hash from a string.
 *
 * @param {string} str
 * @returns {number}
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get a consistent colour for a given name.
 * The same name will always return the same colour.
 *
 * @param {string} name
 * @returns {string} A hex colour from the palette
 */
export function getColourByName(name) {
  const index = hashString(name) % palette.length;
  return palette[index];
}

/**
 * Get the colour for a GeoJSON feature based on its SUBJECTO or NAME property.
 * Returns a default colour for unclaimed or unnamed regions.
 *
 * @param {Region} feature
 * @param {string} [unclaimedColour="lightgrey"]
 * @returns {string}
 */
export function getRegionColour(feature, unclaimedColour = "lightgrey") {
  const { NAME, SUBJECTO } = feature.properties;
  const key = SUBJECTO || NAME;

  if (!key || key === "unclaimed") {
    return unclaimedColour;
  }

  // Some region's SUBJECTO fields are inconsistent. Normalise them first.
  const normalisedKey = key === "United Kingdom of Great Britain and Ireland" ?
    "United Kingdom" :
    key === "United States" ? "United States of America" :
    key;

  return getColourByName(normalisedKey);
}
