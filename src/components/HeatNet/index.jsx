import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, ZoomControl, Pane, GeoJSON } from "react-leaflet";
import * as d3 from "d3";
import "leaflet/dist/leaflet.css";
import { useSelector } from "react-redux";
import MapEvents from "../shared/components/map/MapEvents";
import MapResizer from "../shared/components/map/MapResizer";
import user_relation_location from "../NetMap/user_relation_location.json";
import centrality_measures from "../NetMap/centrality_measures.json";
import { colorGenerator, transformGeoJSON } from "./utils";
import { mapCantonsToKenNames } from "../SwitzerlandChoropleth";
import UserGraphBar from "../shared/components/mapcomps/UserGraphBar";

const filterValidCoordinates = (locations, mapInstance) => {
  return Object.entries(locations)
    .filter(([_, { latitude, longitude }]) => latitude && longitude)
    .map(([id, { latitude, longitude }]) => {
      const point = mapInstance.latLngToLayerPoint([latitude, longitude]);
      return { id, x: point.x, y: point.y, latitude, longitude };
    });
};

function getMinMax(attribute) {
  const values = centrality_measures.map(item => item[attribute]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max };
}

const minMaxDegree = getMinMax("degree");

function mapValue(value) {
  return 1 + (10 - 1) * ((value - minMaxDegree.min) / (minMaxDegree.max - minMaxDegree.min));
}

function SwitzerlandChoropleth({ data }) {

  const [isD3Enabled, setIsD3Enabled] = useState(false);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [tooltipData, setTooltipData] = useState();
  const [isHovered, setIsHovered] = useState(false);
  const [userGraphBarValue, setUserGraphBarValue] = useState([2, 7]);
  // const [previewSliderValue, setPreviewSliderValue] = useState('');
  const toggleD3 = () => {
    setIsD3Enabled((prev) => !prev);
  };
  const [bounds] = useState([[45.7, 5.5], [48.0, 11.5],]);
  const convertedData = useMemo(() => mapCantonsToKenNames(data), [data]);
  const transformedGeoJSON = useMemo(() => transformGeoJSON(convertedData), [convertedData]);
  const customColorGenerator = useMemo(() => colorGenerator(Math.max(...convertedData.map(ele => ele.value)), Math.min(...convertedData.map(ele => ele.value))), [convertedData]);
  const [leafletZoom, setLeafletZoom] = useState(8);
  const [center] = useSelector((state) => {
    const settings = state.settings;
    return [settings.center];
  });
  const svgRef = useRef(null);
  const mapRef = useRef(null);


  const onEachFeatureStyle = useCallback(
    (feature, layer) => {
      const severity = feature.properties?.severity?.value;

      const baseColor = severity === undefined ? "#FFFFFF" : customColorGenerator(severity);
      const highlightColor = baseColor;

      const isHighlighted = tooltipData && (tooltipData.name === feature.properties.kan_name);

      const fillColor = isHighlighted ? highlightColor : baseColor;
      const fillOpacity = isHovered ? (isHighlighted ? .9 : 0.55) : 0.75;

      return {
        weight: isHovered ? 1 : 0,
        opacity: 1,
        fillColor: fillColor,
        color: '#ccc',
        dashArray: '',
        fillOpacity: fillOpacity,
      };
    },
    [customColorGenerator, tooltipData, isHovered]
  );

  const handleMouseOver = useCallback((event) => {
    const layer = event.target;
    const { severity, kan_name } = layer.feature.properties;
    setTooltipData({
      name: severity?.name ?? kan_name,
      value: severity?.value ?? NaN,
    });
    setIsHovered(true);
  }, []);

  const handleMouseOut = useCallback((_event) => {
    setTooltipData(undefined);
    setIsHovered(false);
  }, []);

  const onEachFeature = useCallback(
    (_feature, layer) => {
      layer.on({
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
        click: () => {
        },
      });
    },
    [handleMouseOver, handleMouseOut]
  );

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
    const width = 1160;
    const height = 720;

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
        && mapValue(userDegrees[source]) >= userGraphBarValue[0] 
        && mapValue(userDegrees[source]) <= userGraphBarValue[1]
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

      const colorScale = d3.scaleLinear()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .range(['#470357', '#491c6f', '#424384', '#32638e', '#287e8f', '#32b57a', '#6acc5c', '#87d349', '#b5dd2b', '#f1df2d']);

      if (isD3Enabled) {
        const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

        const filteredLinks = svg
        .selectAll('.link')
        .data(edges)
        .enter()
        .append('line')
        .attr('class', 'link linkDark')
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)
        .attr('stroke', 'white')
        .attr('stroke-width', 0.5);

        const filteredUsers = svg
          .selectAll('.user')
          .data(validUserLocations)
          .enter()
          .append('g')
          .attr('class', 'user-group')
          .attr('transform', (d) => `translate(${d.x},${d.y})`)
          .on('mouseover', (event, d) => setHoveredUser(d.id))
          .on('mouseout', () => setHoveredUser(null));

        filteredUsers
          .append('circle')
          .attr('class', 'user')
          .attr('r', 8)
          .attr('fill', (d) => {
            if (d.id) {
              return colorScale(mapValue(userDegrees[d.id]));
            }
            return 'blue';
          });

        filteredUsers
          .append('text')
          .attr('class', 'username')
          .attr('x', 8)
          .attr('y', 3)
          .text((d) => d.id)
          .style('visibility', (d) => (d.id === hoveredUser ? 'visible' : 'hidden'));

        function ticked() {
          filteredUsers.attr('transform', (d) => `translate(${d.x},${d.y})`);
          filteredLinks
            .attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y);

          filteredUsers.select('.username').style('visibility', (d) => (d.id === hoveredUser ? 'visible' : 'hidden'));
        }

        const handleZoom = () => {
          const newZoom = mapInstance._zoom;
          setLeafletZoom(newZoom);

          svg.attr('transform', `scale(${Math.pow(2, newZoom - 8)})`);
          ticked();
        };

        mapInstance.on('zoom', handleZoom);

        return () => {
          mapInstance.off('zoom', handleZoom);
        };

      } else {
        const svg = d3.select(svgRef.current).attr('width', 0).attr('height', 0);
        svg.selectAll('.link').remove();
        svg.selectAll('.user-group').remove();
      }

    }
  }, [data, leafletZoom, mapRef, isD3Enabled, hoveredUser, userGraphBarValue]);

  return (
    <MapContainer
      style={{ width: "100%", height: "80vh", zIndex: "0" }}
      center={center}
      maxZoom={19}
      zoom={8}
      minZoom={8}
      fillOpacity={1}
      zoomControl={false}
      maxBounds={bounds}
      ref={mapRef}
    >
      <ZoomControl position="bottomright" />
      <MapEvents />
      <MapResizer />
      <TileLayer
        attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'
        url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg"
        className="custom-tile-layer"
        opacity={0.3}
      />
      <button onClick={toggleD3} id="mapNetworkToggleButton" style={{ position: 'absolute', top: 86, left: 22, zIndex: 4999, }}>
        {isD3Enabled ? 'Disable Graph' : 'Enable Graph'}
      </button>
      <UserGraphBar
        className="userGraphBar"
        style={{ position: 'absolute', top: 136, right: 22, zIndex: 2000 }}
        value={userGraphBarValue}
        setValue={setUserGraphBarValue}
      >
      </UserGraphBar>
      <Pane name="d3-pane" style={{ zIndex: 499 }}>
        <svg className="testTest" ref={svgRef}></svg>
      </Pane>
      <GeoJSON
        data={transformedGeoJSON}
        style={onEachFeatureStyle}
        onEachFeature={onEachFeature}
        pathOptions={{
          lineJoin: 'round',
          lineCap: 'round',
          smoothFactor: 0.5,
          fillRule: 'evenodd',
        }}
      >
      </GeoJSON>
    </MapContainer>
  );
}

export default SwitzerlandChoropleth;