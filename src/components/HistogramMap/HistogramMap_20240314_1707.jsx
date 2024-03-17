import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import HistogramData from './linechart_month_data.json';
import HistogramDataWeek from './linechart_week_data.json';
import UserHistogramData from './userhistogramdata.json';
import { useButtonContext } from '../ButtonContext/ButtonContext';
import { useUserContext } from '../UserContext/UserContext';

const aggregateDataByMonth = (data) => {
  const aggregatedData = {};

  data.forEach((entry) => {
    const month = entry.timestamp.split('/')[0];
    if (!aggregatedData[month]) {
      aggregatedData[month] = {
        timestamp: `${month}/${entry.timestamp.split('/')[1]}/${entry.timestamp.split('/')[2]}`,
        Total: 0,
        Cloudiness: 0,
        Lightning: 0,
        Icy_Conditions: 0,
        Hail: 0,
        Fog: 0,
        Rain: 0,
        Snow: 0,
        Snow_Cover: 0,
        Tornado: 0,
        Wind: 0,
      };
    }

    // Update each weather condition with the maximum value
    Object.keys(aggregatedData[month]).forEach((condition) => {
      if (condition !== 'timestamp') {
        aggregatedData[month][condition] = Math.max(
          aggregatedData[month][condition],
          entry[condition]
        );
      }
    });
  });

  return Object.values(aggregatedData);
};

const aggregateUserDataByMonth = (data) => {
  const aggregatedData = {};

  data.forEach((entry) => {
    const month = entry.timestamp.split('/')[0];
    if (!aggregatedData[month]) {
      aggregatedData[month] = {
        timestamp: `${month}/${entry.timestamp.split('/')[2]}`,
        Total: 0,
        Cloudiness: 0,
        Lightning: 0,
        Icy_Conditions: 0,
        Hail: 0,
        Fog: 0,
        Rain: 0,
        Snow: 0,
        Snow_Cover: 0,
        Tornado: 0,
        Wind: 0,
      };
    }

    aggregatedData[month].Total += entry.freq;

    if (entry.category in aggregatedData[month]) {
      aggregatedData[month][entry.category] += entry.freq;
    }
  });

  const result = Object.values(aggregatedData);

  return result;
};

const HistogramMap = ({ }) => {
  const { selectedButton } = useButtonContext();
  const { selectedUserName } = useUserContext();

  const chartRefMonth = useRef();
  const chartRefWeek = useRef();
  const [selectedCondition, setSelectedCondition] = useState('Total');
  const [aggregatedData, setAggregatedData] = useState([]);
  const [aggregatedDataWeek, setAggregatedDataWeek] = useState([]);

  useEffect(() => {
    if (selectedUserName === 'noUser') {
      setAggregatedData(aggregateDataByMonth(HistogramData));
    } else {
      const filteredHistogramData = UserHistogramData.filter(
        (entry) => entry.username === selectedUserName
      );
      setAggregatedData(aggregateUserDataByMonth(filteredHistogramData));
    }

    setAggregatedDataWeek(aggregateDataByMonth(HistogramDataWeek));
  }, [HistogramData, HistogramDataWeek, UserHistogramData, selectedUserName, selectedButton]);

  useEffect(() => {
    // Rendering logic for month data SVG
    if (!aggregatedData.length) return;

    const totalWidth = 250; // Adjust width as needed
    const height = 200; // Adjust height as needed
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    const svg = d3.select(chartRefMonth.current);
    svg.selectAll('*').remove();

    const x = d3.scaleBand()
      .domain(aggregatedData.map(d => d.timestamp))
      .range([marginLeft, totalWidth - marginRight])
      .padding(0);

    const y = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d[selectedButton]) + 10])
      .range([height - marginBottom, marginTop]);

    svg.attr("width", totalWidth)
      .attr("height", height);

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .style("font-size", "6px");

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .style("font-size", "8px");

    const line = d3.line()
      .x(d => x(d.timestamp) + x.bandwidth() / 2)
      .y(d => y(d[selectedButton]));

    svg.append("path")
      .datum(aggregatedData)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    svg.selectAll(".dot")
      .data(aggregatedData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.timestamp) + x.bandwidth() / 2)
      .attr("cy", d => y(d[selectedButton]))
      .attr("r", 3)
      .style("fill", "steelblue");

    // Add horizontal lines
    const yAxisTicks = svg.selectAll('.y-axis .tick');

    yAxisTicks.each(function (d) {
      const tickValue = d3.select(this).select('text').text();
      svg.append("line")
        .attr("class", "horizontal-line")
        .attr("x1", marginLeft)
        .attr("y1", y(tickValue))
        .attr("x2", totalWidth - marginRight)
        .attr("y2", y(tickValue))
        .attr("stroke", "lightgray")
        .attr("stroke-dasharray", "3");
    });

  }, [aggregatedData, selectedButton, selectedUserName]);

  useEffect(() => {
    // Rendering logic for week data SVG
    if (!aggregatedDataWeek.length) return;

    const totalWidth = 250; // Adjust width as needed
    const height = 200; // Adjust height as needed
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    const svg = d3.select(chartRefWeek.current);
    svg.selectAll('*').remove();

    const x = d3.scaleBand()
      .domain(aggregatedDataWeek.map(d => d.timestamp))
      .range([marginLeft, totalWidth - marginRight])
      .padding(0);

    const y = d3.scaleLinear()
      .domain([0, d3.max(aggregatedDataWeek, d => d[selectedButton]) + 10])
      .range([height - marginBottom, marginTop]);

    svg.attr("width", totalWidth)
      .attr("height", height);

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .style("font-size", "6px");

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .style("font-size", "8px");

    const line = d3.line()
      .x(d => x(d.timestamp) + x.bandwidth() / 2)
      .y(d => y(d[selectedButton]));

    svg.append("path")
      .datum(aggregatedDataWeek)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    svg.selectAll(".dot")
      .data(aggregatedDataWeek)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.timestamp) + x.bandwidth() / 2)
      .attr("cy", d => y(d[selectedButton]))
      .attr("r", 3)
      .style("fill", "steelblue");

    // Add horizontal lines
    const yAxisTicks = svg.selectAll('.y-axis .tick');

    yAxisTicks.each(function (d) {
      const tickValue = d3.select(this).select('text').text();
      svg.append("line")
        .attr("class", "horizontal-line")
        .attr("x1", marginLeft)
        .attr("y1", y(tickValue))
        .attr("x2", totalWidth - marginRight)
        .attr("y2", y(tickValue))
        .attr("stroke", "lightgray")
        .attr("stroke-dasharray", "3");
    });

  }, [aggregatedDataWeek, selectedButton, selectedUserName]);

  const handleToggle = (condition) => {
    setSelectedCondition(condition);
  };

  return (
    <div style={{ display: 'flex' }}>
      <svg ref={chartRefMonth}></svg>
      <svg ref={chartRefWeek}></svg>
    </div>
  );
};

export default HistogramMap;

