import { MapContainer, GeoJSON, TileLayer, ZoomControl, Label } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSelector } from "react-redux";
import MapEvents from "../shared/components/map/MapEvents";
import MapResizer from "../shared/components/map/MapResizer";
import { useCallback, useMemo, useState, useContext } from "react";
import { colorGenerator, transformGeoJSON } from "./utils";
import { mapCantonsToKenNames } from "../SwitzerlandChoropleth";
import { useButtonContext } from '../ButtonContext/ButtonContext';
import { useKantonContext } from '../KantonContext/KantonContext';

function SwitzerlandChoropleth({ data }) {
  const { handleToggle } = useButtonContext();
  const { getKantonName } = useKantonContext();


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


  const onEachFeatureStyle = useCallback(
    (feature, layer) => {
      const severity = feature.properties?.severity?.value;

      const baseColor = severity === undefined ? "#FFFFFF" : customColorGenerator(severity);
      const highlightColor = baseColor;

      const isHighlighted = tooltipData && (tooltipData.name === feature.properties.kan_name);

      const fillColor = isHighlighted ? highlightColor : baseColor;
      const fillOpacity = isHovered ? (isHighlighted ? 1 : 0.55) : 0.9;

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
    (feature, layer) => {
      layer.on({
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
        // click: () => { },
        click: () => {
          console.log(feature["properties"]["kan_name"]);
          getKantonName(feature["properties"]["kan_name"])
        },
      });

      const { kan_name } = feature.properties;
      const label = L.divIcon({ className: 'map-label', html: `<b>${kan_name}</b>` });

      layer.bindTooltip(kan_name, { permanent: true, direction: 'center', className: `map-label-tooltip is-${kan_name}` });
    },
    [handleMouseOver, handleMouseOut]
  );

  return (
    <div style={{ position: 'relative' }} id="heatmap-toggle-button">
      <div style={{ position: 'absolute', top: 10, left: 2, zIndex: 99999 }}>
        <button onClick={() => handleToggle('Total')}>Total</button>
        <button onClick={() => handleToggle('Cloudiness')}>Cloudiness</button>

        <button onClick={() => handleToggle('Lightning')}>Lightning</button>

        <button onClick={() => handleToggle('Icy_Conditions')}>Icy Conditions</button>

        <button onClick={() => handleToggle('Hail')}>Hail</button>
        <button onClick={() => handleToggle('Fog')}>Fog</button>
        <button onClick={() => handleToggle('Rain')}>Rain</button>
        <button onClick={() => handleToggle('Snow')}>Snow</button>
        <button onClick={() => handleToggle('Snow_Cover')}>Snow Cover</button>

        <button onClick={() => handleToggle('Tornado')}>Tornado</button>
        <button onClick={() => handleToggle('Wind')}>Wind</button>
      </div>
      <MapContainer
        style={{ width: "100%", height: "280px", zIndex: "0" }}
        center={[46.8903083, 8.392149]}
        maxZoom={7}
        zoom={7}
        minZoom={7}
        fillOpacity={1}
        zoomControl={false}
        maxBounds={bounds}
        dragging={false}
      >
        {/* <ZoomControl position="bottomright" /> */}
        <MapEvents />
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'
          url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg"
          className="custom-tile-layer"
          opacity={0.3}
          noWrap={true}
        />
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
        {/* <mapDragRestriction /> */}
      </MapContainer >
    </div>
  );
}

export default SwitzerlandChoropleth;
