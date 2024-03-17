// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// function D3GraphComponent({ mapRef, isD3Enabled, hoveredUser, svgRef }) {
//   useEffect(() => {
//     const width = 1160;
//     const height = 720;

//     const userDegrees = {};

//     // ... (fetch centrality measures and populate userDegrees)

//     const userLocation = {};

//     // ... (fetch user relation locations and populate userLocation)

//     const filterValidCoordinates = (locations, mapInstance) => {
//       return Object.entries(locations)
//         .filter(([_, { latitude, longitude }]) => latitude && longitude)
//         .map(([id, { latitude, longitude }]) => {
//           const point = mapInstance.latLngToLayerPoint([latitude, longitude]);
//           return { id, x: point.x, y: point.y, latitude, longitude };
//         });
//     };

//     const mapInstance = mapRef.current;

//     if (mapInstance) {
//       const validUserLocations = filterValidCoordinates(userLocation, mapInstance);

//       const edges = user_relation_location.map((relation) => {
//         // ... (calculate source and target locations)
//       }).filter(Boolean);

//       // ... (calculate minMaxDegree, mapValue, and colorScale)

//       const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

//       const colorScale = d3.scaleLinear()
//         .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
//         .range(['#470357', '#491c6f', '#424384', '#32638e', '#287e8f', '#32b57a', '#6acc5c', '#87d349', '#b5dd2b', '#f1df2d']);

//       if (isD3Enabled) {
//         const links = svg
//           .selectAll('.link')
//           .data(edges)
//           .enter()
//           .append('line')
//           .attr('class', 'link')
//           .attr('x1', (d) => d.source.x)
//           .attr('y1', (d) => d.source.y)
//           .attr('x2', (d) => d.target.x)
//           .attr('y2', (d) => d.target.y)
//           .attr('stroke', 'white')
//           .attr('stroke-width', 0.5);

//         const users = svg
//           .selectAll('.user')
//           .data(validUserLocations)
//           .enter()
//           .append('g')
//           .attr('class', 'user-group')
//           .attr('transform', (d) => `translate(${d.x},${d.y})`)
//           .on('mouseover', (event, d) => setHoveredUser(d.id))
//           .on('mouseout', () => setHoveredUser(null));

//         users
//           .append('circle')
//           .attr('class', 'user')
//           .attr('r', 8)
//           .attr('fill', (d) => {
//             if (d.id) {
//               return colorScale(mapValue(userDegrees[d.id]));
//             }
//             return "blue";
//           });

//         users
//           .append('text')
//           .attr('class', 'username')
//           .attr('x', 8)
//           .attr('y', 3)
//           .text(((d) => d.id))
//           .style('visibility', (d) => (d.id === hoveredUser ? 'visible' : 'hidden'));

//         function ticked() {
//           users.attr('transform', (d) => `translate(${d.x},${d.y})`);
//           links
//             .attr('x1', (d) => d.source.x)
//             .attr('y1', (d) => d.source.y)
//             .attr('x2', (d) => d.target.x)
//             .attr('y2', (d) => d.target.y);

//           users.select('.username')
//             .style('visibility', (d) => (d.id === hoveredUser ? 'visible' : 'hidden'));
//         }

//         const handleZoom = () => {
//           const newZoom = mapInstance._zoom;
//           setLeafletZoom(newZoom);

//           svg.attr('transform', `scale(${Math.pow(2, newZoom - 8)})`);
//           ticked();
//         };

//         mapInstance.on('zoom', handleZoom);

//         return () => {
//           mapInstance.off('zoom', handleZoom);
//         };
//       } else {
//         svg.selectAll('.link').remove();
//         svg.selectAll('.user-group').remove();
//       }
//     }
//   }, [isD3Enabled, hoveredUser, mapRef]);

//   return <svg className="testTest" ref={svgRef}></svg>;
// }

// export default D3GraphComponent;
