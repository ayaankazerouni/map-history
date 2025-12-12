import * as d3 from "d3";
import { FileAttachment } from "observablehq:stdlib";
import * as topojson from "topojson-client";

/** @type {import('./lib.js').HistEvent} */

/**
 * Get color based on key and dark mode. Dark mode is typically set from
 * an Observable reactive variable.
 *
 * @param { 'landFill' | 'unclaimedFill' | 'landStroke' | 'landHighlight' | 'seaFill' | 'pointFill' | 'pointStroke' | 'tooltipBg' | 'tooltipFg'} key
 * @param {boolean} dark A reactive variable indicating dark mode.
 * @returns {string}
 */
function getColor(key, dark = false) {
  return {
    landFill: "darkgrey",
    unclaimedFill: "lightgrey",
    landHighlight: dark ? "coral" : "crimson",
    landStroke: dark ? "white" : "black",
    seaFill: dark ? "steelblue" : "lightblue",
    pointFill: dark ? "white" : "darkgrey",
    pointStroke: dark ? "black" : "white",
    tooltipBg: dark ? "darkslategrey" : "ivory",
    tooltipFg: dark ? "ivory" : "darkslategrey",
  }[key];
}

const tooltip = getTooltipElement();

// Store the last transform to maintain zoom state between redraws.
let lastTransform = d3.zoomIdentity;

/**
 * @param {FileAttachment} geodata A FileAttachment containing GeoJSON data.
 * @param {number} width Default 1000
 * @param {number} dark Default false
 * @param {HistEvent} chosenEvent An event to highlight. Defaults to null
 * @returns
 */
export async function worldMap(
  geodata,
  width = 1000,
  dark = false,
  chosenEvent = null,
) {
  // If geodata is a FileAttachment, await its JSON
  if (geodata?.json) {
    geodata = await geodata.json();
  }

  const topodata = topojson.feature(geodata, geodata.objects.regions);

  // Calculate responsive dimensions
  const height = width * 0.6; // Maintain aspect ratio

  // Create projection with responsive scale
  const padding = 20;
  const projection = d3.geoNaturalEarth1().fitExtent(
    [
      [padding, padding],
      [width - padding, height - padding],
    ],
    topodata
  );

  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .translateExtent([
      [-100, -100],
      [width + 100, height + 100],
    ])
    .wheelDelta((event) => -event.deltaY * 0.00085)
    .on("zoom", zoomed);

  const container = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height);

  // Stick everything in a group so everything zooms together.
  const g = container.append("g");

  const path = d3.geoPath(projection);
  const sphere = { type: "Sphere" };

  g.append("path")
    .datum(sphere)
    .attr("fill", getColor("seaFill", dark))
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", path);

  const land = g
    .append("g")
    .selectAll("path")
    .data(topodata.features);

  function drawLand(landContainer) {
    const containsChosenEvent = (d) => {
      if (chosenEvent === null) return false;
      const [lon, lat] = [chosenEvent.longitude, chosenEvent.latitude];
      return d3.geoContains(d, [lon, lat]);
    };

    landContainer
      .join("path")
      .attr("d", path)
      .attr("fill", (d) =>
        containsChosenEvent(d)
          ? getColor("landHighlight", dark)
          : getColor(getName(d) ? "landFill" : "unclaimedFill", dark),
      )
      .attr("stroke", "black")
      .attr("stroke-width", (d) => (containsChosenEvent(d) ? 2.5 : 1.5))
      .attr("stroke-opacity", (d) => (getName(d) ? 0.3 : 0.8))
      .on("mouseover", (_, d) => {
        const name = getName(d);
        if (name !== null) {
          tooltip.html(`${name}`).style("visibility", "visible");
        }
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", event.pageY + 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });
  }

  land.call(drawLand);

  g.on("dblclick", resetZoom);

  const dots = g.append("g");

  if (chosenEvent) {
    dots
      .selectAll("circle")
      .data([chosenEvent])
      .join("circle")
      .attr("fill", getColor("pointFill", dark))
      .attr("stroke", getColor("pointStroke", dark))
      .attr("r", 3)
      .attr(
        "transform",
        (d) => `translate(${projection([d.longitude, d.latitude])})`,
      )
      .on("mouseover", (_, d) => {
        const bce = d.year < 0 ? "BCE" : "CE";
        const date = `${d.month} ${d.day}, ${Math.abs(d.year)} ${bce}`;
        tooltip
          .html(`<strong>${date}</strong><br/>${d.description}`)
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", event.pageY + 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });
  }

  function resetZoom(event) {
    event.preventDefault();
    event.stopPropagation();
    lastTransform = d3.zoomIdentity;
    container.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
  }

  function zoomed({ transform }) {
    g.attr("transform", transform);
    lastTransform = transform;
  }

  container.call(zoom); // Make it zoomable
  container.call(zoom.transform, lastTransform); // Restore last transform

  return container.node();
}

/**
 * @param {{ properties: { NAME: string, SUBJECTO: string } }} d A GeoJSON feature
 * @returns { string | null }
 */
function getName(d) {
  const { NAME, SUBJECTO } = d.properties;
  if (NAME === null || NAME === "unclaimed") {
    return null;
  } else if (NAME === SUBJECTO) {
    return NAME;
  } else {
    return `${NAME}\t${SUBJECTO}`;
  }
}

/**
 * @param {boolean} dark
 * @returns A d3 selection representing the tooltip element, initially invisible.
 */
function getTooltipElement(dark = false) {
  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", getColor("tooltipBg", dark))
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "8px")
    .style("font-size", "14px")
    .style("font-family", "Avenir, sans-serif")
    .style("color", getColor("tooltipFg", dark))
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
    .style("pointer-events", "none")
    .style("z-index", "1000")
    .style("max-width", "300px");

  return tooltip;
}
