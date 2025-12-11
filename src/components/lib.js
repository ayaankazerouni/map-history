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
 * @typedef {Object} Event
 * @property {number} year
 * @property {string} description
 */

/**
 * @param {string} searchTerms A search phrase
 * @returns {(e: Event) => boolean} A predicate that checks if the event matches search terms.
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
  "world_bc123000.geojson": FileAttachment("../data/historical-basemaps/world_bc123000.geojson"),
  "world_bc10000.geojson": FileAttachment("../data/historical-basemaps/world_bc10000.geojson"),
  "world_bc8000.geojson": FileAttachment("../data/historical-basemaps/world_bc8000.geojson"),
  "world_bc5000.geojson": FileAttachment("../data/historical-basemaps/world_bc5000.geojson"),
  "world_bc4000.geojson": FileAttachment("../data/historical-basemaps/world_bc4000.geojson"),
  "world_bc3000.geojson": FileAttachment("../data/historical-basemaps/world_bc3000.geojson"),
  "world_bc2000.geojson": FileAttachment("../data/historical-basemaps/world_bc2000.geojson"),
  "world_bc1500.geojson": FileAttachment("../data/historical-basemaps/world_bc1500.geojson"),
  "world_bc1000.geojson": FileAttachment("../data/historical-basemaps/world_bc1000.geojson"),
  "world_bc700.geojson": FileAttachment("../data/historical-basemaps/world_bc700.geojson"),
  "world_bc500.geojson": FileAttachment("../data/historical-basemaps/world_bc500.geojson"),
  "world_bc400.geojson": FileAttachment("../data/historical-basemaps/world_bc400.geojson"),
  "world_bc323.geojson": FileAttachment("../data/historical-basemaps/world_bc323.geojson"),
  "world_bc300.geojson": FileAttachment("../data/historical-basemaps/world_bc300.geojson"),
  "world_bc200.geojson": FileAttachment("../data/historical-basemaps/world_bc200.geojson"),
  "world_bc100.geojson": FileAttachment("../data/historical-basemaps/world_bc100.geojson"),
  "world_bc1.geojson": FileAttachment("../data/historical-basemaps/world_bc1.geojson"),
  "world_100.geojson": FileAttachment("../data/historical-basemaps/world_100.geojson"),
  "world_200.geojson": FileAttachment("../data/historical-basemaps/world_200.geojson"),
  "world_300.geojson": FileAttachment("../data/historical-basemaps/world_300.geojson"),
  "world_400.geojson": FileAttachment("../data/historical-basemaps/world_400.geojson"),
  "world_500.geojson": FileAttachment("../data/historical-basemaps/world_500.geojson"),
  "world_600.geojson": FileAttachment("../data/historical-basemaps/world_600.geojson"),
  "world_700.geojson": FileAttachment("../data/historical-basemaps/world_700.geojson"),
  "world_800.geojson": FileAttachment("../data/historical-basemaps/world_800.geojson"),
  "world_900.geojson": FileAttachment("../data/historical-basemaps/world_900.geojson"),
  "world_1000.geojson": FileAttachment("../data/historical-basemaps/world_1000.geojson"),
  "world_1100.geojson": FileAttachment("../data/historical-basemaps/world_1100.geojson"),
  "world_1200.geojson": FileAttachment("../data/historical-basemaps/world_1200.geojson"),
  "world_1279.geojson": FileAttachment("../data/historical-basemaps/world_1279.geojson"),
  "world_1300.geojson": FileAttachment("../data/historical-basemaps/world_1300.geojson"),
  "world_1400.geojson": FileAttachment("../data/historical-basemaps/world_1400.geojson"),
  "world_1492.geojson": FileAttachment("../data/historical-basemaps/world_1492.geojson"),
  "world_1500.geojson": FileAttachment("../data/historical-basemaps/world_1500.geojson"),
  "world_1530.geojson": FileAttachment("../data/historical-basemaps/world_1530.geojson"),
  "world_1600.geojson": FileAttachment("../data/historical-basemaps/world_1600.geojson"),
  "world_1650.geojson": FileAttachment("../data/historical-basemaps/world_1650.geojson"),
  "world_1700.geojson": FileAttachment("../data/historical-basemaps/world_1700.geojson"),
  "world_1715.geojson": FileAttachment("../data/historical-basemaps/world_1715.geojson"),
  "world_1783.geojson": FileAttachment("../data/historical-basemaps/world_1783.geojson"),
  "world_1800.geojson": FileAttachment("../data/historical-basemaps/world_1800.geojson"),
  "world_1815.geojson": FileAttachment("../data/historical-basemaps/world_1815.geojson"),
  "world_1880.geojson": FileAttachment("../data/historical-basemaps/world_1880.geojson"),
  "world_1900.geojson": FileAttachment("../data/historical-basemaps/world_1900.geojson"),
  "world_1914.geojson": FileAttachment("../data/historical-basemaps/world_1914.geojson"),
  "world_1920.geojson": FileAttachment("../data/historical-basemaps/world_1920.geojson"),
  "world_1930.geojson": FileAttachment("../data/historical-basemaps/world_1930.geojson"),
  "world_1938.geojson": FileAttachment("../data/historical-basemaps/world_1938.geojson"),
  "world_1945.geojson": FileAttachment("../data/historical-basemaps/world_1945.geojson"),
  "world_1960.geojson": FileAttachment("../data/historical-basemaps/world_1960.geojson"),
  "world_1994.geojson": FileAttachment("../data/historical-basemaps/world_1994.geojson"),
  "world_2000.geojson": FileAttachment("../data/historical-basemaps/world_2000.geojson"),
  "world_2010.geojson": FileAttachment("../data/historical-basemaps/world_2010.geojson")
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
