import {
  MapContainer,
  GeoJSON,
  TileLayer,
  ZoomControl,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSelector } from "react-redux";
import MapEvents from "../shared/components/map/MapEvents";
import MapResizer from "../shared/components/map/MapResizer";
import { useCallback, useMemo, useState } from "react";
import { colorGenerator, transformGeoJSON } from "./utils";
import { mapCantonsToKenNames } from "../SwitzerlandChoropleth";

function SwitzerlandChoropleth({ data }) {
  const [tooltipData, setTooltipData] = useState();

  const convertedData = useMemo(() => mapCantonsToKenNames(data), [data]);
  const transformedGeoJSON = useMemo(
    () => transformGeoJSON(convertedData),
    [convertedData]
  );

  const [zoomLevel, center, mapTile] = useSelector((state) => {
    const settings = state.settings;
    return [settings.zoomLevel, settings.center, settings.mapTile];
  });

  const customColorGenerator = useMemo(() => {
    const severity = convertedData.map((ele) => ele.value);
    const maxSeverity = Math.max(...severity);
    const minSeverity = Math.min(...severity);
    const generator = colorGenerator(maxSeverity, minSeverity);
    return generator;
  }, [convertedData]);

  const onEachFeatureStyle = useCallback(
    (feature) => {
      const severity = feature.properties?.severity?.value;
      const color =
        severity === undefined ? "#FFFFFF" : customColorGenerator(severity);

      return {
        fillColor: color,
        fillOpacity: 0.7,
      };
    },
    [customColorGenerator]
  );

  const handleMouseOver = useCallback((event) => {
    const layer = event.target;
    const { severity, kan_name } = layer.feature.properties;
    setTooltipData({
      name: severity?.name ?? kan_name,
      value: severity?.value ?? NaN,
    });
  }, []);

  const handleMouseOut = useCallback(
    (_event) => {
      setTooltipData(undefined);
    },
    []
  );

  const onEachFeature = useCallback(
    (_feature, layer) => {
      layer.on({
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
      });
    },
    [handleMouseOver, handleMouseOut]
  );

  return (
    <MapContainer
      style={{ width: "100vw", height: "100vh", zIndex: "0" }}
      center={center}
      zoom={zoomLevel}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <MapEvents />
      <MapResizer />
      {mapTile === "CH" && (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png"
        />
      )}
      {mapTile === "OSM" && (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      )}
      {mapTile === "NationalMapColor" && (
        <TileLayer
          attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'
          url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg"
        />
      )}
      {mapTile === "NationalMapGrey" && (
        <TileLayer
          attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'
          url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg"
        />
      )}
      {mapTile === "SWISSIMAGE" && (
        <TileLayer
          attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'
          url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg"
        />
      )}
      <GeoJSON
        data={transformedGeoJSON}
        style={onEachFeatureStyle}
        onEachFeature={onEachFeature}
      >
        <Tooltip>
          <div>
            <p>Name: {tooltipData?.name}</p>
            <p>Severity: {tooltipData?.value}</p>
          </div>
        </Tooltip>
      </GeoJSON>
    </MapContainer>
  );
}

export default SwitzerlandChoropleth;
