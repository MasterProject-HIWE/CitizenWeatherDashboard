<MapContainer
  style={{ width: "100%", height: "384px", zIndex: "0" }}
  center={[47.16044, 8.4597988]}
  maxZoom={7.6}
  zoom={7.6}
  minZoom={7.6}
  fillOpacity={1}
  zoomControl={false}
  ref={mapRef}
  dragging={false}
>
  {/* <ZoomControl position="bottomright" /> */}
  <MapEvents />
  <MapResizer />
  {/* <TileLayer
        attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'
        url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg"
        className="custom-tile-layer"
        opacity={0.3}
      /> */}
  {/* <button onClick={toggleD3} id="mapNetworkToggleButton" style={{ position: 'absolute', top: 10, left: 10, zIndex: 4999 }}>
        {isD3Enabled ? 'Disable Graph' : 'Enable Graph'}
      </button> */}
  <UserGraphBar
    className="userGraphBar"
    style={{ position: 'absolute', top: 36, right: 22, zIndex: 2000 }}
    defaultValue={userGraphBarValue}
    setValue={setUserGraphBarValue}
  >
  </UserGraphBar>
  <Pane name="d3-pane" style={{ zIndex: 499 }}>
    {/* <svg className="testTest" ref={svgRef}></svg> */}
  </Pane>
</MapContainer>