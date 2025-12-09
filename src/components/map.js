import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const PROJECTION = d3.geoNaturalEarth1();

export function worldMap(geodata) {
  const width = 1100;
  const height = 600;

  const zoom = d3.zoom()
    .scaleExtent([0.8, 3])
    .translateExtent([[-100, -100], [width + 100, height + 100]])
    .wheelDelta(event => -event.deltaY * 0.00085)
    .on('zoom', zoomed);

  const container = d3.create('svg')
    .attr('width', width)
    .attr('height', height);

  const g = container.append('g');

  const path = d3.geoPath(PROJECTION);

  const land = g.append('g')
    .selectAll('path')
    .data(topojson.feature(geodata, geodata.objects.land).features)
    .join('path')
      .attr('fill', 'white')
      .attr('stroke', 'lightgrey')
      .attr('d', path);

  const dots = g.append('g');

  // Reusable tooltip div 
  const tooltip = d3.select('body').append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', 'darkgrey')
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '14px')
    .style('font-family', 'Avenir sans-serif')
    .style('color', 'black')
    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('max-width', '300px');

  function zoomed({ transform }) {
    g.attr('transform', transform);
  }

  container.call(zoom);

  return Object.assign(
    container.node(), {
      update: (data) => {
        dots.selectAll('circle')
          .data(data, d => `${d.year}-${d.longitude}-${d.latitude}-${d.cleanDescription}`)
          .join(
            enter => enter.append('circle')
              .attr('fill', 'firebrick')
              .attr('r', 3)
              .attr('transform', d => `translate(${PROJECTION([d.longitude, d.latitude])})`)
              .on('mouseover', (_, d) => {
                const bce = d.year < 0 ? 'BCE' : 'CE';
                const date = `${d.month} ${d.day}, ${Math.abs(d.year)} ${bce}`;
                tooltip
                  .html(`<strong>${date}</strong><br/>${d.cleanDescription}`)
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
