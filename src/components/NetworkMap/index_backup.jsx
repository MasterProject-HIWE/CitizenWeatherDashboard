import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, ZoomControl, Pane } from "react-leaflet";
import * as d3 from "d3";
import "leaflet/dist/leaflet.css";
import { useSelector } from "react-redux";
import MapEvents from "../shared/components/map/MapEvents";
import MapResizer from "../shared/components/map/MapResizer";
import user_relation_location from "./user_relation_location.json";
import centrality_measures from "./centrality_measures.json";
import UserGraphBar from "./components/UserGraphBarSingle";
import MinMaxMap from "./components/MinMaxMap";
import UniqueDegree from "./components/UniqueDegree";
import { useUserContext } from '../UserContext/UserContext';

const filterValidCoordinates = (locations, mapInstance) => {
  return Object.entries(locations)
    .filter(([_, { latitude, longitude }]) => latitude && longitude)
    .map(([id, { latitude, longitude }]) => {
      const point = mapInstance.latLngToLayerPoint([latitude, longitude]);
      return { id, x: point.x, y: point.y, latitude, longitude };
    });
};

function SwitzerlandChoropleth({ data }) {
  const { getUserName } = useUserContext();

  const [isD3Enabled, setIsD3Enabled] = useState(false);
  setTimeout(function () {
    setIsD3Enabled((prev) => !prev)
  }, 500);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [userGraphBarValue, setUserGraphBarValue] = useState(0.52);

  const [bounds] = useState([
    [45.7, 5.5],
    [48.0, 11.5],
  ]);

  const [leafletZoom, setLeafletZoom] = useState(8);

  const [center] = useSelector((state) => {
    const settings = state.settings;
    return [settings.center];
  });

  const svgRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const mapInstance = mapRef.current;

    if (mapInstance) {
      const handleZoomEnd = () => {
        setLeafletZoom(mapInstance._zoom);
      };

      mapInstance.on('zoomend', handleZoomEnd);

      return () => {
        mapInstance.off('zoomend', handleZoomEnd);
      };
    }
  }, [mapRef]);

  useEffect(() => {
    const width = 326;
    const height = 292;

    const userDegrees = {};

    centrality_measures.forEach((item) => {
      const user = item.user;
      const degree = item.degree;

      userDegrees[user] = degree;
    });

    const user_location = {};

    user_relation_location.forEach((item) => {
      const source = item.source;
      const latitude = item.latitude;
      const longitude = item.longitude;

      if (!user_location[source]
        && userDegrees[source] < userGraphBarValue
      ) {
        user_location[source] = {
          latitude: latitude,
          longitude: longitude,
          degree: userDegrees[source]
        };
      }
    });

    const mapInstance = mapRef.current;

    if (mapInstance) {
      const validUserLocations = filterValidCoordinates(user_location, mapInstance);

      const edges = user_relation_location.map((relation) => {
        const sourceLocation = validUserLocations.find((location) => location.id === relation.source);
        const targetLocation = validUserLocations.find((location) => location.id === relation.target);

        if (sourceLocation && targetLocation) {
          return {
            source: { x: sourceLocation.x, y: sourceLocation.y },
            target: { x: targetLocation.x, y: targetLocation.y },
          };
        }

        return null;
      }).filter(Boolean);

      const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

      const colorScale = d3.scaleLinear()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .range(['#470357', '#491c6f', '#424384', '#32638e', '#287e8f', '#32b57a', '#6acc5c', '#87d349', '#b5dd2b', '#f1df2d']);

      svg.selectAll('.link').remove();
      svg.selectAll('.user-group').remove();

      // if (isD3Enabled) {


      const links = svg
        .selectAll('.link')
        .data(edges)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)
        .style('stroke', 'rgb(54 74 93)')
        .style('stroke-width', 0.5);

      const users = svg
        .selectAll('.user-group')  // Select existing user-group elements
        .data(validUserLocations, (d) => d.id);  // Bind data to existing user-group elements

      const userGroups = users.enter()  // Enter new data
        .append('g')
        .attr('class', 'user-group')
        // .attr('transform', (d) => `translate(${d.x},${d.y})`)
        .on('mouseover', (event, d) => setHoveredUser(d.id))
        .on('mouseout', () => setHoveredUser(null))
        .on('click', (event, d) => getUserName(d.id));

      userGroups.append('circle')  // Append circle to user-group
        .attr('class', 'user')
        .attr('r', 2)
        .attr('fill', (d) => {
          if (d.id) {
            return colorScale(MinMaxMap(userDegrees[d.id]));
          }
          return "blue";
        });

      userGroups.append('text')  // Append text to user-group
        .attr('class', 'username')
        .attr('x', 8)
        .attr('y', 3)
        .text((d) => d.id)
        .style('visibility', (d) => (d.id === hoveredUser ? 'visible' : 'hidden'));

      users.exit().remove();  // Remove any extra user-group elements
      console.log(validUserLocations);

      const simulation = d3.forceSimulation(validUserLocations.id)
        // .force('link', d3.forceLink().links(user_relation_location))
        // .force('charge', d3.forceManyBody().strength(-.35)) // Adjust strength as needed
        .force('center', d3.forceCenter(width / 2, height / 2)) // Center the nodes
        .on('tick', ticked);

      // Function to update node and link positions
      function ticked() {
        // Update links
        links.attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        // Update nodes
        userGroups.attr('transform', d => `translate(${d.x},${d.y})`);
      }

      // Update node positions on map zoom
      const handleZoom = () => {
        const newZoom = mapInstance._zoom;
        setLeafletZoom(newZoom);

        // Rescale nodes based on zoom level
        svg.attr('transform', `scale(${Math.pow(2, newZoom - 8)})`);
        simulation.alpha(1).restart(); // Restart simulation
      };

      mapInstance.on('zoom', handleZoom);

      return () => {
        mapInstance.off('zoom', handleZoom);
      };

    }
  }, [data, leafletZoom, mapRef, isD3Enabled, hoveredUser, userGraphBarValue]);

  return (<div style={{ position: 'relative' }} id="heatmap-toggle-button">
    <div style={{ position: 'absolute', top: 20, left: 48, zIndex: 99999 }}>
      <button onClick={() => getUserName('noUser')}>Reset</button>
    </div>
    <MapContainer
      style={{ width: "100%", height: "280px", zIndex: "0" }}
      center={[47.16044, 8.4597988]}
      maxZoom={2}
      zoom={7}
      minZoom={7}
      fillOpacity={1}
      zoomControl={false}
      ref={mapRef}
      dragging={false}
    >
      <MapEvents />
      <MapResizer />
      <UserGraphBar
        className="userGraphBar"
        style={{ position: 'absolute', top: 14, right: 8, zIndex: 2000 }}
        defaultValue={userGraphBarValue}
        setValue={setUserGraphBarValue}
      >
      </UserGraphBar>
      <svg className="testTest" ref={svgRef}></svg>
      <Pane name="d3-pane" style={{ zIndex: 499 }}>
      </Pane>
    </MapContainer>
  </div>
  );
}

export default SwitzerlandChoropleth;