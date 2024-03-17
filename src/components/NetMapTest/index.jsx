import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import user_relation_location from "./user_relation_location.json";
import centrality_measures from "./centrality_measures.json";

const NetworkGraph = () => {
    const svgRef = useRef();

    useEffect(() => {
        const svgElement = d3.select(svgRef.current).select('svg');

        if (svgElement.empty()) {
            // Set the dimensions and margins of the graph
            const margin = { top: 10, right: 30, bottom: 30, left: 40 };
            const width = 364 - margin.left - margin.right;
            const height = 280 - margin.top - margin.bottom;

            // Append the SVG object to the body of the page
            const svg = d3
                .select(svgRef.current)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(1)`);

            // Initialize the links
            const link = svg
                .selectAll('line')
                .data(user_relation_location)
                .enter()
                .append('line')
                .style('stroke', 'rgb(54 74 93)')
                .style('stroke-width', 0.5);

            // Initialize the nodes
            const node = svg
                .selectAll('circle')
                .data(centrality_measures)
                .enter()
                .append('circle')
                .attr('r', 4)
                .style('fill', '#69b3a2')
                .on('mouseenter', handleMouseEnter)
                .on('mouseleave', handleMouseLeave);

            // Initialize the text for displaying user names
            const text = svg.selectAll('.text')
                .data(centrality_measures)
                .enter()
                .append('text')
                .attr('class', (d) => 'username username-' + d.sl)
                .attr('x', (d) => d.x + 10)
                .attr('y', (d) => d.y - 10)
                .style('font-size', '18px')
                .style('fill', '#FFF')
                .text((d) => d.user)
                .style('visibility', 'hidden'); // Initially hide usernames

            // Let's list the force we wanna apply on the network
            const simulation = d3
                .forceSimulation(centrality_measures)
                .force('link', d3.forceLink().id((d) => d.user).links(user_relation_location))
                .force('charge', d3.forceManyBody().strength(-100))
                .force('center', d3.forceCenter(width / 1, height / 1))
                .on('tick', ticked);

            // Function to handle mouse enter event
            function handleMouseEnter(d) {
                d3.select(this).attr('r', 8); // Increase node size
                svg.selectAll('.username').filter(textData => textData.user === d.user).style('visibility', 'visible'); // Show username
            }

            // Function to handle mouse leave event
            function handleMouseLeave(d) {
                d3.select(this).attr('r', 4); // Reset node size
                svg.selectAll('.username').filter(textData => textData.user === d.user).style('visibility', 'hidden'); // Hide username
            }

            // This function is run at each iteration of the force algorithm, updating the nodes position.
            function ticked() {
                link
                    .attr('x1', (d) => d.source.x)
                    .attr('y1', (d) => d.source.y)
                    .attr('x2', (d) => d.target.x)
                    .attr('y2', (d) => d.target.y);

                node
                    .attr('cx', (d) => d.x)
                    .attr('cy', (d) => d.y);

                text
                    .attr('x', (d) => d.x + 10)
                    .attr('y', (d) => d.y - 10);
            }
        }
    }, []);

    return <div className='network-graph-svg' style={{ width: '45%', marginTop: '6px' }} ref={svgRef} />;
};

export default NetworkGraph;
