import * as d3 from 'd3';
import {FileAttachment} from "observablehq:stdlib";


function getColor(key, dark=false) {
  return {
    landFill: 'none',
    landStroke: dark ? 'white' : 'black',
    seaFill: dark ? 'steelblue' : 'lightblue',
    pointFill: dark ? 'white' : 'darkgrey',
    pointStroke: dark ? 'black' : 'white',
    tooltipBg: dark ? 'darkslategrey' : 'ivory',
    tooltipFg: dark ? 'ivory' : 'darkslategrey'
  }[key];
}

const tooltip = getTooltipElement();

let lastTransform = d3.zoomIdentity;

export async function worldMap(geodata, width=1000, dark=false) {

  // If geodata is a FileAttachment, await its JSON
  if (geodata?.json) {
    geodata = await geodata.json();
  }

  // Calculate responsive dimensions
  const height = width * 0.6; // Maintain aspect ratio

  // Create projection with responsive scale
  const padding = 20;
  const projection = d3.geoNaturalEarth1()
    .fitExtent([[padding, padding], [width - padding, height - padding]], geodata);

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[-100, -100], [width + 100, height + 100]])
    .wheelDelta(event => -event.deltaY * 0.00085)
    .on('zoom', zoomed);

  const container = d3.create('svg')
    .attr('width', width)
    .attr('height', height);

  const g = container.append('g');

  const path = d3.geoPath(projection);
  const sphere = ({ type: 'Sphere' });

  g.append('path')
    .datum(sphere)
    .attr('fill', getColor('seaFill', dark))
    .attr('stroke', 'black')
    .attr('stroke-width', 1.5)
    .attr('d', path);

  const land = g.append('g')
    .selectAll('path')
    .data(geodata.features)
    .join('path')
      .attr('fill', d => getName(d) ? 'lightgrey' : 'darkgrey')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.8)
      .attr('stroke-opacity', d => getName(d) ? 0.3 : 0.8)
      .attr('d', path)
      .on('mouseover', (_, d) => {
        const name = getName(d);
        if (name !== null) {
          tooltip
            .html(`${name}`)
            .style('visibility', 'visible');
        }
      })
      .on('mousemove', (event) => {
        tooltip
          .style('top', (event.pageY + 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

  g.on('dblclick', resetZoom);

  const dots = g.append('g');

  function resetZoom(event) {
    event.preventDefault();
    event.stopPropagation();
    lastTransform = d3.zoomIdentity;
    container.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  }

  function zoomed({ transform }) {
    g.attr('transform', transform);
    lastTransform = transform;
  }

  container.call(zoom); // Make it zoomable
  container.call(zoom.transform, lastTransform); // Restore last transform

  return Object.assign(
    container.node(), {
      getTransform: () => d3.zoomTransform(container.node()),
      setTransform: (transform) => container.call(zoom.transform, transform),
      update: (data) => {
        dots.selectAll('circle')
          .data(data, d => `${d.year}-${d.longitude}-${d.latitude}-${d.description}`)
          .join(
            enter => enter.append('circle')
              .attr('fill', getColor('pointFill', dark))
              .attr('stroke', getColor('pointStroke', dark))
              .attr('r', 3)
              .attr('transform', d => `translate(${projection([d.longitude, d.latitude])})`)
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
              }),
            update => update,
            exit => exit.remove()
          )
      }
    }
  );
}

function getName(d) {
  const { NAME, SUBJECTO } = d.properties;
  if (NAME === null || NAME === 'unclaimed') {
    return null;
  } else if (NAME === SUBJECTO) {
    return NAME;
  } else {
    return `${NAME}\t${SUBJECTO}`
  }
}

function getTooltipElement(dark=false) {
  const tooltip = d3.select('body').append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', getColor('tooltipBg', dark))
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '14px')
    .style('font-family', 'Avenir, sans-serif')
    .style('color', getColor('tooltipFg', dark))
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
