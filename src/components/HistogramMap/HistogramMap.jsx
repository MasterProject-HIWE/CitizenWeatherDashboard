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
      aggregatedData[month] = { timestamp: `${month}/${entry.timestamp.split('/')[1]}/${entry.timestamp.split('/')[2]}`, Total: 0, Cloudiness: 0, Lightning: 0, Icy_Conditions: 0, Hail: 0, Fog: 0, Rain: 0, Snow: 0, Snow_Cover: 0, Tornado: 0, Wind: 0 };
    }

    Object.keys(aggregatedData[month]).forEach((condition) => {
      if (condition !== 'timestamp') {
        aggregatedData[month][condition] = Math.max(aggregatedData[month][condition], entry[condition]);
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
      aggregatedData[month] = { timestamp: `${month}/${entry.timestamp.split('/')[2]}`, Total: 0, Cloudiness: 0, Lightning: 0, Icy_Conditions: 0, Hail: 0, Fog: 0, Rain: 0, Snow: 0, Snow_Cover: 0, Tornado: 0, Wind: 0 };
    }

    aggregatedData[month].Total += entry.freq;

    if (entry.category in aggregatedData[month]) {
      aggregatedData[month][entry.category] += entry.freq;
    }
  });

  return Object.values(aggregatedData);
};

const drawChart = (svg, data, totalWidth, height, marginLeft, marginRight, marginTop, marginBottom, selectedButton, lineDotColor) => {
  const x = d3.scaleBand()
    .domain(data.map(d => d.timestamp))
    .range([marginLeft, totalWidth - marginRight])
    .padding(0);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[selectedButton]) + 10])
    .range([height - marginBottom, marginTop]);

  svg.attr("width", totalWidth)
    .attr("height", height);

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .style("font-size", "6px");

  svg.selectAll(".horizontal-line")
    .data(y.ticks())
    .enter().append("line")
    .attr("class", "horizontal-line")
    .attr("x1", marginLeft)
    .attr("y1", d => y(d))
    .attr("x2", totalWidth - marginRight)
    .attr("y2", d => y(d))
    .attr("stroke", "#aaa")
    .attr("stroke-width", 0.4)
    .attr("stroke-dasharray", "3,3");

  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .selectAll("text")
    .style("font-size", "6px");

  const line = d3.line()
    .x(d => x(d.timestamp) + x.bandwidth() / 2)
    .y(d => y(d[selectedButton]));

  svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", lineDotColor)
    .attr("stroke-width", 1.5)
    .attr("d", line);

  svg.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.timestamp) + x.bandwidth() / 2)
    .attr("cy", d => y(d[selectedButton]))
    .attr("r", 4)
    .style("fill", lineDotColor);
};

const HistogramMap = () => {
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
      const filteredHistogramData = UserHistogramData.filter((entry) => entry.username === selectedUserName);
      setAggregatedData(aggregateUserDataByMonth(filteredHistogramData));
    }

    setAggregatedDataWeek(aggregateDataByMonth(HistogramDataWeek));
  }, [HistogramData, HistogramDataWeek, UserHistogramData, selectedUserName, selectedButton]);

  useEffect(() => {
    if (!aggregatedData.length) return;

    const totalWidth = 520;
    const height = 132;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    const svg = d3.select(chartRefMonth.current);
    svg.selectAll('*').remove();

    drawChart(svg, aggregatedData, totalWidth, height, marginLeft, marginRight, marginTop, marginBottom, selectedButton, "#679EC5");
  }, [aggregatedData, selectedButton, selectedUserName]);

  useEffect(() => {
    if (!aggregatedDataWeek.length) return;

    const totalWidth = 520;
    const height = 132;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    const svg = d3.select(chartRefWeek.current);
    svg.selectAll('*').remove();

    drawChart(svg, aggregatedDataWeek, totalWidth, height, marginLeft, marginRight, marginTop, marginBottom, selectedButton, "#FCB65E");
  }, [aggregatedDataWeek, selectedButton, selectedUserName]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <svg ref={chartRefMonth}></svg>
      <svg ref={chartRefWeek}></svg>
    </div>
  );
};

export default HistogramMap;