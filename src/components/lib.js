import { FileAttachment } from "observablehq:stdlib";

/**
 * Split the input string into words (or phrases
 * if they are quoted).
 * @param {string} input
 * @returns {string[]} an array of strings
 */
export function tokenize(input) {
    const regex = /"([^"]*)"|\S+/g;
    let match;
    const tokens = [];

    while ((match = regex.exec(input)) !== null) {
        // If content was quoted, add the capture group
        //  to the list. Otherwise, add the match as is.
        tokens.push(match[1] ? match[1] : match[0]);
    }

    return tokens;
}

/**
 * @param {string} element An HTML string.
 * @returns The string with all HTML content stripped.
 */
export function stripHtml(element) {
  let tmp = document.createElement('div');
  tmp.innerHTML = element;
  return tmp.innerText || "";
}

/**
 * @typedef {Object} HistEvent
 * @property {number} year
 * @property {string} description
 */

/**
 * @param {string} searchTerms A search phrase
 * @returns {(e: HistEvent) => boolean} A predicate that checks if the event matches search terms.
 */
export function filterTest(searchTerms) {
  const lowerSearch = searchTerms.toLowerCase();

  return (e) => {
    const lowerDesc = e.description.toLowerCase();
    const tokenized = tokenize(lowerSearch);
    return tokenized.some(t => lowerDesc.includes(t));
  };
}

// FileAttachment requires a string literal for static analysis,
// so we need to map filenames to FileAttachment objects manually.
const BASEMAPS = {
  "world_bc123000.json": FileAttachment("../data/topo-data/world_bc123000.json"),
  "world_bc10000.json": FileAttachment("../data/topo-data/world_bc10000.json"),
  "world_bc8000.json": FileAttachment("../data/topo-data/world_bc8000.json"),
  "world_bc5000.json": FileAttachment("../data/topo-data/world_bc5000.json"),
  "world_bc4000.json": FileAttachment("../data/topo-data/world_bc4000.json"),
  "world_bc3000.json": FileAttachment("../data/topo-data/world_bc3000.json"),
  "world_bc2000.json": FileAttachment("../data/topo-data/world_bc2000.json"),
  "world_bc1500.json": FileAttachment("../data/topo-data/world_bc1500.json"),
  "world_bc1000.json": FileAttachment("../data/topo-data/world_bc1000.json"),
  "world_bc700.json": FileAttachment("../data/topo-data/world_bc700.json"),
  "world_bc500.json": FileAttachment("../data/topo-data/world_bc500.json"),
  "world_bc400.json": FileAttachment("../data/topo-data/world_bc400.json"),
  "world_bc323.json": FileAttachment("../data/topo-data/world_bc323.json"),
  "world_bc300.json": FileAttachment("../data/topo-data/world_bc300.json"),
  "world_bc200.json": FileAttachment("../data/topo-data/world_bc200.json"),
  "world_bc100.json": FileAttachment("../data/topo-data/world_bc100.json"),
  "world_bc1.json": FileAttachment("../data/topo-data/world_bc1.json"),
  "world_100.json": FileAttachment("../data/topo-data/world_100.json"),
  "world_200.json": FileAttachment("../data/topo-data/world_200.json"),
  "world_300.json": FileAttachment("../data/topo-data/world_300.json"),
  "world_400.json": FileAttachment("../data/topo-data/world_400.json"),
  "world_500.json": FileAttachment("../data/topo-data/world_500.json"),
  "world_600.json": FileAttachment("../data/topo-data/world_600.json"),
  "world_700.json": FileAttachment("../data/topo-data/world_700.json"),
  "world_800.json": FileAttachment("../data/topo-data/world_800.json"),
  "world_900.json": FileAttachment("../data/topo-data/world_900.json"),
  "world_1000.json": FileAttachment("../data/topo-data/world_1000.json"),
  "world_1100.json": FileAttachment("../data/topo-data/world_1100.json"),
  "world_1200.json": FileAttachment("../data/topo-data/world_1200.json"),
  "world_1279.json": FileAttachment("../data/topo-data/world_1279.json"),
  "world_1300.json": FileAttachment("../data/topo-data/world_1300.json"),
  "world_1400.json": FileAttachment("../data/topo-data/world_1400.json"),
  "world_1492.json": FileAttachment("../data/topo-data/world_1492.json"),
  "world_1500.json": FileAttachment("../data/topo-data/world_1500.json"),
  "world_1530.json": FileAttachment("../data/topo-data/world_1530.json"),
  "world_1600.json": FileAttachment("../data/topo-data/world_1600.json"),
  "world_1650.json": FileAttachment("../data/topo-data/world_1650.json"),
  "world_1700.json": FileAttachment("../data/topo-data/world_1700.json"),
  "world_1715.json": FileAttachment("../data/topo-data/world_1715.json"),
  "world_1783.json": FileAttachment("../data/topo-data/world_1783.json"),
  "world_1800.json": FileAttachment("../data/topo-data/world_1800.json"),
  "world_1815.json": FileAttachment("../data/topo-data/world_1815.json"),
  "world_1880.json": FileAttachment("../data/topo-data/world_1880.json"),
  "world_1900.json": FileAttachment("../data/topo-data/world_1900.json"),
  "world_1914.json": FileAttachment("../data/topo-data/world_1914.json"),
  "world_1920.json": FileAttachment("../data/topo-data/world_1920.json"),
  "world_1930.json": FileAttachment("../data/topo-data/world_1930.json"),
  "world_1938.json": FileAttachment("../data/topo-data/world_1938.json"),
  "world_1945.json": FileAttachment("../data/topo-data/world_1945.json"),
  "world_1960.json": FileAttachment("../data/topo-data/world_1960.json"),
  "world_1994.json": FileAttachment("../data/topo-data/world_1994.json"),
  "world_2000.json": FileAttachment("../data/topo-data/world_2000.json"),
  "world_2010.json": FileAttachment("../data/topo-data/world_2010.json")
};

/**
 * Get the time period closest to the specified year.
 *
 * @param {number} year
 * @param {number[]} years A list of available time periods.
 * @returns {number} The closest time period to the specified year.
 */
export function getClosestTimePeriod(year, years) {
  return years.reduce((a, b) => {
    return Math.abs(b - year) < Math.abs(a - year) ? b : a;
  })
}

/**
 * Get the GeoJSON data for a given historical basemap filename.
 *
 * @param {string} filename
 * @returns {FileAttachment} The corresponding FileAttachment for the GeoJSON data.
 */
export function getGeoData(filename) {
  return BASEMAPS[filename];
}
