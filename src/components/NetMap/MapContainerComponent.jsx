// import React, { useEffect, useRef } from "react";
// import { MapContainer, TileLayer, ZoomControl, Pane } from "react-leaflet";
// import MapEvents from "../shared/components/map/MapEvents";
// import MapResizer from "../shared/components/map/MapResizer";
// import D3GraphComponent from "./D3GraphComponent";

// function MapContainerComponent({
//   isD3Enabled,
//   toggleD3,
//   hoveredUser,
//   bounds,
//   leafletZoom,
//   center,
//   svgRef,
//   mapRef,
// }) {
//   useEffect(() => {
//     const mapInstance = mapRef.current;

//     if (mapInstance) {
//       const handleZoom = () => {
//         const newZoom = mapInstance._zoom;
//         setLeafletZoom(newZoom);

//         svg.attr('transform', `scale(${Math.pow(2, newZoom - 8)})`);
//         ticked();
//       };

//       mapInstance.on('zoom', handleZoom);

//       return () => {
//         mapInstance.off('zoom', handleZoom);
//       };
//     }
//   }, [leafletZoom, mapRef]);

//   return (
//     <MapContainer
//       style={{ width: "1160px", height: "720px", zIndex: "0" }}
//       center={center}
//       maxZoom={19}
//       zoom={8}
//       minZoom={8}
//       fillOpacity={1}
//       zoomControl={false}
//       maxBounds={bounds}
//       ref={mapRef}
//     >
//       <ZoomControl position="bottomright" />
//       <MapEvents />
//       <MapResizer />
//       <TileLayer
//         attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'
//         url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg"
//         className="custom-tile-layer"
//         opacity={0.3}
//       />
//       <Pane name="d3-pane" style={{ zIndex: 499 }}>
//         <button onClick={toggleD3} id="mapNetworkToggleButton" style={{ position: 'absolute', top: 10, left: 10, zIndex: 4999 }}>
//           {isD3Enabled ? 'Disable Graph' : 'Enable Graph'}
//         </button>
//         <D3GraphComponent
//           mapRef={mapRef}
//           isD3Enabled={isD3Enabled}
//           hoveredUser={hoveredUser}
//           svgRef={svgRef}
//         />
//       </Pane>
//     </MapContainer>
//   );
// }

// export default MapContainerComponent;
