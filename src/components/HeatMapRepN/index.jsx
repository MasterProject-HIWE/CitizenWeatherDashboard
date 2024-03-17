import React, { useCallback, useMemo, useState, useRef, useEffect, useLayoutEffect } from "react";
import { MapContainer, TileLayer, ZoomControl, Pane } from "react-leaflet";
import * as d3 from "d3";
import "leaflet/dist/leaflet.css";
import { useSelector } from "react-redux";
import MapEvents from "../shared/components/map/MapEvents";
import MapResizer from "../shared/components/map/MapResizer";
import { colorGenerator, transformGeoJSON } from "./utils";
import { mapCantonsToKenNames } from "../SwitzerlandChoropleth";

function SwitzerlandChoropleth({ data }) {
  const [bounds] = useState([
    [45.7, 5.5],
    [48.0, 11.5],
  ]);

  const [tooltipData, setTooltipData] = useState();
  const [isHovered, setIsHovered] = useState(false);

  const convertedData = useMemo(() => mapCantonsToKenNames(data), [data]);
  const transformedGeoJSON = useMemo(
    () => transformGeoJSON(convertedData),
    [convertedData]
  );

  const [center] = useSelector((state) => {
    const settings = state.settings;
    return [settings.center];
  });

  const customColorGenerator = useMemo(() => {
    const severity = convertedData.map((ele) => ele.value);
    const maxSeverity = Math.max(...severity);
    const minSeverity = Math.min(...severity);
    const generator = colorGenerator(maxSeverity, minSeverity);
    return generator;
  }, [convertedData]);

  const d3PaneRef = useRef(null);

  useEffect(() => {
    const d3Pane = d3.select(d3PaneRef.current);
    console.log("Selected Element:", d3Pane);

    d3Pane.selectAll("*").remove();  
    // d3Pane
    //   .style("background-color", "red")
    //   .style("width", "200px")
    //   .style("height", "1000px");

    // Create and append the 'svg' element
    const svg = d3Pane.append("svg");

    // Create and append the 'g' element
    const g = svg.append("g");

    var projection = d3.geoMercator()
    // .scale(980)                       // This is like the zoom 
    // .translate([ width, height ])

    const pathGenerator = d3.geoPath();

    console.log("transformedGeoJSON.features:", transformedGeoJSON);
    console.log("pathGenerator:", pathGenerator);

    g.selectAll("path")
      .data(transformedGeoJSON)
      .enter()
      .append("path")
      .attr("d", pathGenerator.projection(projection))
      .style("fill", (feature) => {
      const severity = feature.properties?.severity?.value;
      return severity === undefined ? "#FFFFFF" : customColorGenerator(severity); 
    })
    .style("stroke", "#ccc")
    .style("stroke-width", 1)
    // .on("mouseover", handleMouseOver)
    // .on("mouseout", handleMouseOut);

  }, [transformedGeoJSON, customColorGenerator, d3]);

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
      <Pane name="d3-pane" ref={d3PaneRef} style={{ zIndex: 499 }}></Pane>

    </MapContainer>
  );
}

export default SwitzerlandChoropleth;
