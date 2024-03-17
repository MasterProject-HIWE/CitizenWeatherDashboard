import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const BarChart = ({ }) => {
    const dummyData = [
        { letter: 'A', frequency: 10 },
        { letter: 'B', frequency: 20 },
        { letter: 'C', frequency: 15 },
        { letter: 'D', frequency: 25 },
        { letter: 'E', frequency: 18 },
    ];

    const chartRef = useRef();

    useEffect(() => {
        const totalWidth = 564;
        const height = 292;
        const marginTop = 20;
        const marginRight = 20;
        const marginBottom = 30;
        const marginLeft = 40;

        const x = d3.scaleBand()
            .domain(d3.sort(dummyData, d => -d.frequency).map(d => d.letter))
            .range([marginLeft, totalWidth - marginRight])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(dummyData, d => d.frequency)]).nice()
            .range([height - marginBottom, marginTop]);

        const svg = d3.select(chartRef.current)
            .attr("width", totalWidth)
            .attr("height", height)
            .call(zoom);

        svg.append("g")
            .attr("class", "bars")
            .attr("fill", "steelblue")
            .selectAll("rect")
            .data(dummyData)
            .join("rect")
            .attr("x", d => x(d.letter))
            .attr("y", d => y(d.frequency))
            .attr("height", d => y(0) - y(d.frequency))
            .attr("width", x.bandwidth());

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove());

        function zoom(svg) {
            const extent = [[marginLeft, marginTop], [totalWidth - marginRight, height - marginTop]];

            svg.call(d3.zoom()
                .scaleExtent([1, 8])
                .translateExtent(extent)
                .extent(extent)
                .on("zoom", zoomed));

            function zoomed(event) {
                x.range([marginLeft, totalWidth - marginRight].map(d => event.transform.applyX(d)));
                svg.selectAll(".bars rect").attr("x", d => x(d.letter)).attr("width", x.bandwidth());
                svg.selectAll(".x-axis").call(d3.axisBottom(x).tickSizeOuter(0));
            }
        }
    }, [dummyData]);

    return <svg ref={chartRef}></svg>;
}

export default BarChart;
