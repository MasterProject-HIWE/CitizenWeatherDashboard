import {LayerGroup,
    LayersControl,
    MapContainer,
    Marker,
    // Polygon,
    TileLayer,
    ZoomControl} from "react-leaflet";
import {useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {getCategoryName, getIntensityName} from "../shared/functions/WeatherCategories";
import {getMapIcon, getPieIcon} from "../shared/functions/WeatherIcons";
import {getGridData} from "../shared/functions/MapFunctions";
// import {createClusterCustomIcon, getMapIcon, getPieIcon} from "../shared/functions/WeatherIcons";
// import {getClusterList, getGridData} from "../shared/functions/MapFunctions";
// import MarkerClusterGroup from "../shared/components/MarkerClusterGroup";
import {MultiMarkerEventPopup} from "../shared/components/map/MultiMarkerPopup";
import MapEvents from "../shared/components/map/MapEvents";
import MapResizer from "../shared/components/map/MapResizer";
import {StyledPopup} from "../../static/style/muiStyling";
import MarkerMode from "../../static/data/MarkerMode.json";

const Map = () => {
    const events = useSelector(state => state.comparison.events)
    const [mapTile,
        zoomLevel,
        center,
        markerMode
    ] = useSelector(state => {
        const settings = state.settings
        return [
            settings.mapTile,
            settings.zoomLevel,
            settings.center,
            settings.markerMode
        ]
    })
    const [inPlayerMode,
        playerData,
        playerFlatData,
        currentStep
    ] = useSelector(state => {
        const player = state.player
        return [player.isActive,
            player.mapData,
            player.data,
            player.currentStep]
    })

    // const [selectionButton, setButton] = useState(null)
    const [pointsData, setPointsData] = useState([])
    const [maxCount, setMaxCount] = useState(0)
    const [gridDist, setGridDist] = useState(0)
    const [meterPerPixel, setMeterPerPixel] = useState(0)

    // const [markerPos, setMarkerPos] = useState(null)
    // const [clusterPopup, setClusterPopup] = useState(null)
    // const [clusterData, setClusterData] = useState(null)

    const [gridData, setGridData] = useState([])
    // const [hoverPoint, setHoverPoint] = useState(null)

    useEffect(() => {
        if (inPlayerMode) {
            setPointsData(playerData[currentStep])
        } else {
            const shownEvents = events.filter(event => !event.hidden)
            let coordsList = []
            let newPointsData = []

            shownEvents.forEach(event => {
                event.data.forEach(e => {
                    const e2 = {...e}
                    let index = coordsList.findIndex(c => [0, 1].every(k => e.coordinates[k] === c[k]))
                    if (index === -1) {
                        newPointsData.push({coordinates: e.coordinates, focused: [e2], unfocused:[]})
                        coordsList.push(e.coordinates)
                    } else {
                        let pointsIndex = newPointsData.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
                        newPointsData[pointsIndex].focused.push(e2)
                    }
                })
            })
            setPointsData(newPointsData)
        }

    }, [currentStep, events, inPlayerMode, playerData])

    useEffect(() => {
        if (markerMode === MarkerMode['ClutterFree']) {
            let data = inPlayerMode ? playerFlatData[currentStep] : pointsData.map(e => e.focused).flat()
            const [newGridData, newMaxCount, newDist] = getGridData(data, zoomLevel)
            setGridData(newGridData)
            if (!inPlayerMode) setMaxCount(newMaxCount)
            setGridDist(newDist)
        } else if (!inPlayerMode) {
            setMaxCount(Math.max(...pointsData.map(e => e.focused.length)))
        }
    }, [currentStep, inPlayerMode, markerMode, playerFlatData, pointsData, zoomLevel])

    useEffect(() => {
        const lat = center.lat === undefined ? center[0] : center.lat
        setMeterPerPixel(40075016.686 * Math.abs(Math.cos(lat / 180 * Math.PI)) / Math.pow(2, zoomLevel+8))
    }, [zoomLevel, center])

    // const showClusterPopup = (event) => {
    //     let dataList = getClusterList(event)
    //     setClusterData(dataList)
    //     setMarkerPos(event.latlng)
    //     setClusterPopup(true)
    // }

    return (
        <MapContainer style={{width: "100vw", height: "100vh", zIndex: "0"}} center={center} zoom={zoomLevel} zoomControl={false}>
            <MapResizer/>
            <ZoomControl position="bottomright" />
            <MapEvents/>
            {mapTile === "CH" && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png" />}
            {mapTile === "OSM" && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
            {mapTile === "NationalMapColor" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg" />}
            {mapTile === "NationalMapGrey" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg" />}
            {mapTile === "SWISSIMAGE" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg" />}
            <LayersControl position="bottomright">
                <LayersControl.BaseLayer name={MarkerMode["Clutterfree"]} checked={markerMode===MarkerMode["ClutterFree"]}>
                    <LayerGroup>
                        {gridData.map(e => {
                            if (e.focused.length === 1) {
                                const singlePoint = e.focused[0]
                                return (
                                    <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getMapIcon(singlePoint.category, singlePoint.color)}
                                    >
                                        <StyledPopup>
                                            <p>{getCategoryName(singlePoint.category)}: {getIntensityName(singlePoint.category, singlePoint.auspraegung)}</p>
                                        </StyledPopup>
                                    </Marker>
                                )
                            } else {
                                return (
                                    <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                            data={e}
                                            position={e.coordinates}
                                            icon={getPieIcon(e.focused, {sum: e.focused.length, maxCount: maxCount, gridDist: gridDist, meterPerPixel: meterPerPixel})}
                                            // eventHandlers={{
                                            //     mouseover: e => setHoverPoint(selectionButton===null ? e.target.options.data: null),
                                            //     mouseout: () => setHoverPoint(null)
                                            // }}
                                    >
                                        <MultiMarkerEventPopup data={e}/>
                                    </Marker>
                                )
                            }
                        })}
                    </LayerGroup>
                    {/*{hoverPoint &&*/}
                    {/*    <Polygon*/}
                    {/*        pathOptions={{color: 'var(--border-bg-color)', fillOpacity: "0.4", zIndex: "2000"}}*/}
                    {/*        positions={hoverPoint.convexHull}*/}
                    {/*        pane={"markerPane"}*/}
                    {/*        eventHandlers={{*/}
                    {/*            mouseout: () => setHoverPoint(null)*/}
                    {/*        }}*/}
                    {/*    >*/}
                    {/*        <MultiMarkerEventPopup data={hoverPoint}/>*/}
                    {/*    </Polygon>}*/}
                </LayersControl.BaseLayer>
                {/*<LayersControl.BaseLayer name={MarkerMode["Cluster"]} checked={markerMode===MarkerMode["Cluster"]}>*/}
                {/*    <MarkerClusterGroup*/}
                {/*        iconCreateFunction={d => createClusterCustomIcon(d)}*/}
                {/*        zoomToBoundsOnClick={false}*/}
                {/*        chunkedLoading={true}*/}
                {/*        eventHandlers={{*/}
                {/*            clusterclick: e => showClusterPopup(e)*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        {pointsData.filter(e => e.focused.length !== 1).map(e => {*/}
                {/*            if (e.focused.length === 1 && e.unfocused.length === 0) {*/}
                {/*                return (*/}
                {/*                    <Marker opacity={1} key={e.coordinates[0] + "," + e.coordinates[1]}*/}
                {/*                            data={e.focused[0]}*/}
                {/*                            position={e.coordinates}*/}
                {/*                            icon={getMapIcon(e.focused[0].category, e.focused[0].color)}*/}
                {/*                    >*/}
                {/*                        <MultiMarkerEventPopup data={e}/>*/}
                {/*                    </Marker>*/}
                {/*                )*/}
                {/*            } else {*/}
                {/*                return (*/}
                {/*                    <Marker opacity={1} key={e.coordinates[0] + "," + e.coordinates[1]}*/}
                {/*                            data={e}*/}
                {/*                            position={e.coordinates}*/}
                {/*                            icon={getPieIcon(e.focused)}*/}
                {/*                    >*/}
                {/*                        <MultiMarkerEventPopup data={e}/>*/}
                {/*                    </Marker>*/}
                {/*                )*/}
                {/*            }*/}
                {/*        })}*/}
                {/*    </MarkerClusterGroup>*/}
                {/*    {clusterPopup &&*/}
                {/*        <MultiMarkerEventPopup*/}
                {/*            position={markerPos}*/}
                {/*            data={clusterData}*/}
                {/*            isCluster={true}*/}
                {/*        />*/}
                {/*    }*/}
                {/*</LayersControl.BaseLayer>*/}
                <LayersControl.BaseLayer name={MarkerMode["Location"]} checked={markerMode===MarkerMode["Location"]}>
                    <LayerGroup>
                        {pointsData.map(e => {
                            if (e.focused.length === 1 && e.unfocused.length === 0) {
                                return (
                                    <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getMapIcon(e.focused[0].category, e.focused[0].color)}
                                    >
                                        <StyledPopup>
                                            <p>{getCategoryName(e.focused[0].category)}: {getIntensityName(e.focused[0].category, e.focused[0].auspraegung)}</p>
                                        </StyledPopup>
                                    </Marker>
                                )
                            } else if (e.focused.length === 0 && e.unfocused.length === 1) {
                                return (
                                    <Marker opacity={0.5} zIndexOffset={-1000}
                                            key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getMapIcon(e.unfocused[0].category, "var(--gray-bg-color)")}
                                    >
                                        <StyledPopup>
                                            <p>{getCategoryName(e.unfocused[0].category)}: {getIntensityName(e.unfocused[0].category, e.unfocused[0].auspraegung)}</p>
                                        </StyledPopup>
                                    </Marker>
                                )
                            } else if (e.focused.length === 0) {
                                return (
                                    <Marker opacity={0.5} zIndexOffset={-1000}
                                            key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getPieIcon(e.focused, {color: "var(--gray-bg-color)"})}
                                    >
                                        <MultiMarkerEventPopup data={e}/>
                                    </Marker>
                                )
                            } else {
                                return (
                                    <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getPieIcon(e.focused)}
                                    >
                                        <MultiMarkerEventPopup data={e}/>
                                    </Marker>
                                )
                            }
                        })}
                    </LayerGroup>
                </LayersControl.BaseLayer>
            </LayersControl>
        </MapContainer>
    )
}

export default Map;
