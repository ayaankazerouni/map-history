import * as d3 from 'd3';
import {FileAttachment} from "observablehq:stdlib";

const PROJECTION = d3.geoNaturalEarth1()
  .scale(150);

const IS_DARK = window.matchMedia('(prefers-color-scheme: dark)').matches;
const COLORS = {
  landFill: 'none',
  landStroke: IS_DARK ? 'white' : 'black',
  pointFill: 'white',
  pointStroke: 'black',
  tooltipBg: IS_DARK ? 'darkslategrey' : 'ivory',
  tooltipFg: IS_DARK ? 'ivory' : 'graphite'
}

// Create consistent color scale based on all countries across all years
const timePeriods = await FileAttachment("../data/time-periods.json").json();
const allCountries = [...new Set(
  timePeriods.years.flatMap(y => y.countries)
)].sort();

const COLOR_SCALE = d3.scaleOrdinal()
  .domain(allCountries)
  .range(d3.quantize(d3.interpolateCubehelixDefault, allCountries.length));

export async function worldMap(geodata) {

  // If geodata is a FileAttachment, await its JSON
  if (geodata?.json) {
    geodata = await geodata.json();
  }

  const width = 1000;
  const height = 600;

  const zoom = d3.zoom()
    .scaleExtent([0.8, 8])
    .translateExtent([[-100, -100], [width + 100, height + 100]])
    .wheelDelta(event => -event.deltaY * 0.00085)
    .on('zoom', zoomed);

  const container = d3.create('svg')
    .attr('width', width)
    .attr('height', height);

  const g = container.append('g');

  const path = d3.geoPath(PROJECTION);
  const sphere = ({ type: 'Sphere' });

  // Reusable tooltip div
  const tooltip = getTooltipElement();
  const landTooltip = getTooltipElement();

  g.append('path')
    .datum(sphere)
    .attr('fill', 'lightblue')
    .attr('stroke', 'black')
    .attr('stroke-width', 1.5)
    .attr('d', path);

  const land = g.append('g')
    .selectAll('path')
    .data(geodata.features)
    .join('path')
      .attr('fill', d => {
        const name = d.properties.SUBJECTO || d.properties.NAME;
        if (name === 'Antarctica' || name === null || name === 'unclaimed') {
          return 'lightgrey';
        } else {
          return COLOR_SCALE(name);
        }
      })
      .attr('stroke', d => {
        const name = d.properties.SUBJECTO || d.properties.NAME;
        if (name === null || name === 'unclaimed') {
          return 'lightgrey';
        }
        return COLORS.landStroke;
      })
      .attr('stroke-opacity', d => {
        const name = d.properties.SUBJECTO || d.properties.NAME;
        if (name === null || name === 'unclaimed') {
          return 0.3;
        }
        return 0.8;
      })
      .attr('d', path)
      .on('mouseover', (_, d) => {
        const subjecto = d.properties.SUBJECTO;
        const name = d.properties.NAME;
        const content =  name === subjecto ? name :
          name || subjecto;
        if (content) {
          landTooltip
            .html(`${content}`)
            .style('visibility', 'visible');
        }
      })
      .on('mousemove', (event) => {
        landTooltip
          .style('top', (event.pageY + 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        landTooltip.style('visibility', 'hidden');
      });

  const dots = g.append('g');

  function zoomed({ transform }) {
    g.attr('transform', transform);
  }

  container.call(zoom);

  return Object.assign(
    container.node(), {
      update: (data) => {
        dots.selectAll('circle')
          .data(data, d => `${d.year}-${d.longitude}-${d.latitude}-${d.description}`)
          .join(
            enter => enter.append('circle')
              .attr('fill', COLORS.pointFill)
              .attr('stroke', COLORS.pointStroke)
              .attr('r', 3)
              .attr('transform', d => `translate(${PROJECTION([d.longitude, d.latitude])})`)
              .on('mouseover', (_, d) => {
                const bce = d.year < 0 ? 'BCE' : 'CE';
                const date = `${d.month} ${d.day}, ${Math.abs(d.year)} ${bce}`;
                tooltip
                  .html(`<strong>${date}</strong><br/>${d.description}`)
                  .style('visibility', 'visible');
              })
              .on('mousemove', (event) => {
                tooltip
                  .style('top', (event.pageY + 10) + 'px')
                  .style('left', (event.pageX + 10) + 'px');
              })
              .on('mouseout', () => {
                tooltip.style('visibility', 'hidden');
              })
          )
      }
    }
  );
}

function getTooltipElement() {
  const tooltip = d3.select('body').append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', COLORS.tooltipBg)
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '14px')
    .style('font-family', 'Avenir, sans-serif')
    .style('color', COLORS.tooltipFg)
    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('max-width', '300px');

  return tooltip;
}

// FileAttachment requires a string literal for static analysis,
// so we need to map filenames to FileAttachment objects manually.
export function getGeoData(filename) {
  const basemaps = {
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

  return basemaps[filename];
}
