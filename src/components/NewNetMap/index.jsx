import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import data from '../NewNetMap/flare.json';

function NewNetMap({ }) {
  const svgRef = useRef();
  const [sliderValue, setSliderValue] = useState(0.0052);

  useEffect(() => {
    if (!data) return;

    const width = 420;
    const radius = width / 2;

    const tree = d3.cluster().size([2 * Math.PI, radius - 100]);
    const root = tree(bilink(d3.hierarchy(data)
      .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

    const colorScale = d3.scaleQuantize()
      .domain(d3.extent(root.leaves(), d => d.data.degree))
      .range(['#470357', '#491c6f', '#424384', '#32638e', '#287e8f', '#32b57a', '#6acc5c', '#87d349', '#b5dd2b', '#f1df2d']);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", width)
      .attr("viewBox", [-width / 2, -width / 2, width, width])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
      .classed("hierarchicalEdgeBundling-networkMap", true);

    const filteredNodes = root.leaves().filter(node => node.data.degree <= sliderValue);

    const node = svg.append("g")
      .selectAll()
      .data(filteredNodes)
      .join("g")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .append("circle")
      .attr("r", 2)
      .attr("fill", d => colorScale(d.data.degree))
      .attr("class", "hierarchicalEdgeBundling-networkMap-node")
      .on("mouseover", overed)
      .on("mouseout", outed)
      .call(circle => circle.append("title").text(d => `${d.data.name}
        ${d.outgoing.length} outgoing
        ${d.incoming.length} incoming`));

    const line = d3.lineRadial()
      .curve(d3.curveBundle.beta(0.85))
      .radius(d => d.y)
      .angle(d => d.x);

    const link = svg.append("g")
      .attr("stroke", colornone)
      .attr("stroke-width", 0.2)
      .attr("fill", "none")
      .selectAll()
      .data(root.leaves().flatMap(leaf => leaf.outgoing))
      .join("path")
      .style("mix-blend-mode", "color-dodge")
      .attr("d", ([i, o]) => line(i.path(o)))
      .each(function (d) { d.path = this; });

    function overed(event, d) {
      link.style("mix-blend-mode", null);
      d3.select(this).attr("font-weight", "bold");
      d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", colorin).raise();
      d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", colorin).attr("font-weight", "bold");
      d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorout).raise();
      d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
    }

    function outed(event, d) {
      link.style("mix-blend-mode", "color-dodge");
      d3.select(this).attr("font-weight", null);
      d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
      d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", "white").attr("font-weight", null);
      d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
      d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", "white").attr("font-weight", null);
    }

    return () => {
      svg.selectAll("*").remove();
    };

  }, [data, sliderValue]);

  return (
    <div>
      <input
        style={{ position: 'absolute' }}
        type="range"
        min="0.0052"
        max="0.5"
        step="0.01"
        value={sliderValue}
        onChange={(e) => setSliderValue(e.target.value)}
      />
      <svg ref={svgRef}></svg>
    </div>
  );
}

const colornone = "white";
const colorin = "blue";
const colorout = "red";

function id(d) {
  return d.data.name;
}

function bilink(root) {
  const map = new Map(root.leaves().map(d => [id(d), d]));
  for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.imports.map(i => [d, map.get(i)]);
  for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
  return root;
}

export default NewNetMap;