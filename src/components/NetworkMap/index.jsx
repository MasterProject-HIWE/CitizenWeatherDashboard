import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, ZoomControl, Pane } from "react-leaflet";
import * as d3 from "d3";
// @ts-ignore
import * as d3fisheye from 'd3-fisheye';
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
import { useKantonContext } from '../KantonContext/KantonContext';
import DAroow from "../../static/images/darrow.svg";

function randomLatitude() {
  const minLat = 46.7207797;
  const maxLat = 48.00214;
  return Math.random() * (maxLat - minLat) + minLat;
}

function randomLongitude() {
  const minLon = 7.11292;
  const maxLon = 19.0691047;
  return Math.random() * (maxLon - minLon) + minLon;
}

const filterValidCoordinates = (locations, mapInstance) => {
  return Object.entries(locations)
    .filter(([_, { latitude, longitude }]) => latitude && longitude)
    .map(([id, { latitude, longitude, cantons }]) => {
      const point = mapInstance.latLngToLayerPoint([latitude, longitude]);
      return { id, x: point.x, y: point.y, latitude, longitude, cantons };
    });
};

function SwitzerlandChoropleth({ data }) {
  const { getUserName } = useUserContext();
  const { selectedKantonName } = useKantonContext();


  const [isD3Enabled, setIsD3Enabled] = useState(false);
  setTimeout(function () {
    setIsD3Enabled((prev) => !prev)
  }, 500);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [userGraphBarValue, setUserGraphBarValue] = useState(0.2);
  const [highlightedKanton, setHighlightedKanton] = useState();

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
    const user_location = {};

    centrality_measures.forEach((item) => {
      const user = item.user;
      const degree = item.degree;

      userDegrees[user] = degree;
    });

    user_relation_location.forEach((item) => {
      const source = item.source;
      const latitude = item.latitude;
      const longitude = item.longitude;
      const cantons = item.cantons;

      if (!user_location[source]
        && userDegrees[source] < userGraphBarValue
      ) {
        user_location[source] = {
          latitude: latitude,
          longitude: longitude,
          degree: userDegrees[source],
          cantons: cantons
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

      const links = svg
        .selectAll('.link')
        .data(edges)
        .enter()
        .append('line')
        .attr('class', 'link networkmap-link')
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)
        .style('stroke', 'rgb(54 74 93)')
        .style('stroke-width', 0.5);

      const users = svg
        .selectAll('.user-group')
        .data(validUserLocations, (d) => d.id);

      const userGroups = users.enter()
        .append('g')
        .attr('class', 'user-group')
        .on('mouseover', (event, d) => setHoveredUser(d.id))
        .on('mouseout', () => setHoveredUser(null))
        .on('click', (event, d) => getUserName(d.id));

      userGroups.append('circle')
        .attr('class', 'user')
        .attr('r', 3)
        .attr('z-index', 3)
        .attr('fill', (d) => {
          if (d.id) {
            if (selectedKantonName && d.cantons && d.cantons.includes(selectedKantonName)) {
              return "red";
            } else {
              return colorScale(MinMaxMap(userDegrees[d.id]));
            }
          }
          return "blue";
        });

      userGroups.append('rect')
        .attr('x', -4)
        .attr('y', -12)
        .attr('width', 120)
        .attr('height', 40)
        .attr('fill', 'rgb(54 74 93 0.75)')
        .attr('rx', 5)
        .attr('z-index', 2)
        .style('visibility', (d) => (d.id === hoveredUser ? 'visible' : 'hidden'));

      userGroups.append('text')
        .attr('class', 'username')
        .attr('x', 8)
        .attr('y', 3)
        .attr('z-index', 4)
        .text((d) => `${d.id}\n${d.latitude}, ${d.longitude}\nDegree: ${d.degree}`) // Add more data values
        .style('visibility', (d) => (d.id === hoveredUser ? 'visible' : 'hidden'))
        .attr('fill', 'black'); // Set text color

      users.exit().remove();
      
      // const fisheyeDistortion = d3fisheye.circular()
      // .radius(100)
      // .distortion(2);
      
      // svg.on('mousemove', function (event) {
      //   const [x, y] = d3.pointer(event, this);
      //   userGroups.each(function (d) {
      //     const { x: newX, y: newY } = fisheyeDistortion({ x: d.x, y: d.y }, [x, y]);
      //     d.fisheyeX = newX;
      //     d.fisheyeY = newY;
      //   });
      //   ticked();
      // });

      const simulation = d3.forceSimulation(validUserLocations.id)
        .force('center', d3.forceCenter(width / 2, height / 2)) // Center the nodes
        .on('tick', ticked);

      function ticked() {
        links
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        userGroups.attr('transform', d => `translate(${d.x},${d.y})`);
      }

      const handleZoom = () => {
        const newZoom = mapInstance._zoom;
        setLeafletZoom(newZoom);

        svg.attr('transform', `scale(${Math.pow(2, newZoom - 8)})`);
        simulation.alpha(1).restart();
      };

      mapInstance.on('zoom', handleZoom);

      return () => {
        mapInstance.off('zoom', handleZoom);
      };

    }
  }, [data, leafletZoom, mapRef, isD3Enabled, hoveredUser, userGraphBarValue, selectedKantonName]);

  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (<div style={{ position: 'relative' }} id="heatmap-toggle-button">
    <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 99999 }}>
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
      className="netmap-container"
    >
      <MapEvents />
      <MapResizer />
      <button id="toggleButtonNetmap" onClick={toggleSidebar}>{sidebarVisible ? <img style={{ width: 12, transform: 'rotate(180deg)' }} src={DAroow} alt="" /> : <img style={{ width: 12 }} src={DAroow} alt="" />}</button>
      <UserGraphBar
        className={`userGraphBar right-slider ${sidebarVisible ? 'visible' : ''}`}
        style={{ position: 'absolute', bottom: 6, right: 8, zIndex: 2000 }}
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