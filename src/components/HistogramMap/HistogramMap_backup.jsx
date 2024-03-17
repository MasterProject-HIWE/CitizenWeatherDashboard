import React, { useEffect, useRef, useState, useContext } from 'react';
import * as d3 from 'd3';
import HistogramData from './histogramdata.json'
import UserHistogramData from './userhistogramdata.json'
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

const HistogramMap = () => {
  const { selectedButton } = useButtonContext();
  const { selectedUserName } = useUserContext();

  const svgRef = useRef();
  const [selectedCondition, setSelectedCondition] = useState('Total');
  const [aggregatedData, setAggregatedData] = useState([]);

  useEffect(() => {
    if (selectedUserName === 'noUser') {
      setAggregatedData(aggregateDataByMonth(HistogramData));
    } else {
      const filteredHistogramData = UserHistogramData.filter(
        (entry) => entry.username === selectedUserName
      );
      setAggregatedData(aggregateUserDataByMonth(filteredHistogramData));
    }
    console.log(selectedUserName)
    console.log(selectedButton)
  }, [HistogramData, UserHistogramData, selectedUserName, selectedButton]);

  useEffect(() => {
    if (!aggregatedData.length) return;

    const margin = { top: 20, right: 20, bottom: 70, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    // Create scales
    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    // Set domain for scales
    x.domain(aggregatedData.map((d) => d.timestamp));
    y.domain([0, d3.max(aggregatedData, (d) => d[selectedButton]) + 10]);

    // Create axes
    const xAxis = d3.axisBottom().scale(x);
    const yAxis = d3.axisLeft().scale(y);

    // Update existing axes
    svg.select('.x-axis').remove();
    svg.select('.y-axis').remove();

    // Append axes to SVG
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-45)');

    svg
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(yAxis);

    // Update existing bars
    const bars = svg.selectAll('.bar').data(aggregatedData);

    bars
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .merge(bars)
      .transition()
      .duration(500)
      .attr('x', (d) => x(d.timestamp) + margin.left)
      .attr('width', x.bandwidth())
      .attr('y', (d) => y(d[selectedButton]) + margin.top)
      .attr('height', (d) => height - y(d[selectedButton]))
      .attr('fill', 'steelblue');

    bars.exit().remove();

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', zoomed);

    svg.call(zoom);

    function zoomed(event) {
      const new_x = event.transform.rescaleX(x);
      svg.selectAll('.bar')
        .attr('x', (d) => new_x(d.timestamp) + margin.left)
        .attr('width', new_x.bandwidth());

      svg.select('.x-axis').call(xAxis.scale(new_x));
    }
  }, [aggregatedData, selectedButton, useButtonContext, useUserContext, selectedUserName]);

  const handleToggle = (condition) => {
    setSelectedCondition(condition);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          marginTop: '24px',
          position: 'absolute',
          left: 40,
          bottom: 16,
          zIndex: 99999,
        }}
      >
        <p>Selected: {selectedButton}</p>
      </div>
      <svg ref={svgRef} width={600} height={240}></svg>
    </div>
  );
};

export default HistogramMap;