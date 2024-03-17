import {useSelector} from "react-redux";
import {LayerGroup, MapContainer, Marker, TileLayer, useMap} from "react-leaflet";
import {useEffect, useState} from "react";
import {getMapIcon, getPieIcon} from "../../shared/functions/WeatherIcons";
// import {createClusterCustomIcon, getMapIcon, getPieIcon} from "../../shared/functions/WeatherIcons";
// import MarkerClusterGroup from "../../shared/components/MarkerClusterGroup";
import {getGridData} from "../../shared/functions/MapFunctions";
import {Button} from "@mui/material";
import Arrow from "../../../static/images/left-arrow.png";
import MarkerMode from "../../../static/data/MarkerMode.json";

const minSize = 5.5

const MiniMap = ({color, id, mapData}) => {
    const [events,
        hasEvents
    ] = useSelector(state => {
        const events = state.comparison.events
        return [events,
            events.length>0
        ]
    })
    const data = useSelector(state => state.map.focusedData)
    const [mapTile,
        zoomLevel,
        center,
        markerMode,
    ] = useSelector(state => {
        const settings = state.settings
        return [
            settings.mapTile,
            settings.zoomLevel,
            settings.center,
            settings.markerMode
        ]
    })

    const [showMap, setMap] = useState(false)
    const [pointsData, setPointsData] = useState([])
    const [gridData, setGridData] = useState([])

    const [maxCount, setMaxCount] = useState(0)
    const [gridDist, setGridDist] = useState(0)
    const [meterPerPixel, setMeterPerPixel] = useState(0)

    useEffect(() => setMap(hasEvents), [hasEvents])

    useEffect(() => {
        if (showMap) {
            if (events.length>0) {
                let localMapData = data.map(d => {
                    let e = {...d}
                    e.color = color
                    e.eventId = id
                    return e
                }).concat(events.filter(event => event.info.id !== id && !event.hidden).map(e => e.data)).flat()

                let coordsList = []
                let newPointsData = []
                localMapData.forEach(e => {
                    let index = coordsList.findIndex(c => [0, 1].every(k => e.coordinates[k] === c[k]))
                    if (index === -1) {
                        newPointsData.push({coordinates: e.coordinates, focused: [e]})
                        coordsList.push(e.coordinates)
                    } else {
                        let multiIndex = newPointsData.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
                        newPointsData[multiIndex].focused.push(e)
                    }
                })
                setPointsData(newPointsData)
            } else {
                setPointsData(mapData)
            }
        }
    }, [color, data, events, id, mapData, showMap])

    useEffect(() => {
        if (markerMode===MarkerMode["ClutterFree"]) {
            const gridInput = pointsData.map(e => e.focused).flat()
            const [newGridData, newMaxCount, newDist] = getGridData(gridInput, zoomLevel)
            setGridData(newGridData)
            setMaxCount(newMaxCount)
            setGridDist(newDist)
        } else {
            setMaxCount(Math.max(...pointsData.map(e => e.focused.length)))
        }
    }, [markerMode, pointsData, zoomLevel])

    useEffect(() => {
        const lat = center.lat === undefined ? center[0] : center.lat
        setMeterPerPixel(40075016.686 * Math.abs(Math.cos(lat / 180 * Math.PI)) / Math.pow(2, zoomLevel-2+8))
    }, [zoomLevel, center])

    const handleCloseClick = () => setMap(false)

    const handleOpenClick = () => setMap(true)

    const MiniMapResize = ({center, zoomLevel}) => {
        const map = useMap()

        useEffect(() => {
            map.setView(center, zoomLevel-2 < 0 ? 0 : zoomLevel-2)
        }, [center, map, zoomLevel])
    }

    if (showMap) {
        return (
            <div className={"leaflet-minimap"}>
                <div>
                    <div className={"MapBoxTitle"}>Preview</div>
                    <Button id={"previewButton"} onClick={handleCloseClick}><img src={Arrow} width={16} alt={"close"} style={{transform: "rotate(180deg)"}}/></Button>
                </div>
                <div>
                </div>
                <MapContainer
                    style={{ height: 170, width: 250, pointerEvents: "none" }}
                    center={center}
                    zoom={zoomLevel-2 < 0 ? 0 : zoomLevel-2}
                    dragging={false}
                    doubleClickZoom={false}
                    scrollWheelZoom={false}
                    attributionControl={false}
                    zoomControl={false}
                >
                    <MiniMapResize center={center} zoomLevel={zoomLevel}/>
                    {mapTile === "CH" && <TileLayer url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png" />}
                    {mapTile === "OSM" && <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
                    {mapTile === "NationalMapColor" && <TileLayer url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg" />}
                    {mapTile === "NationalMapGrey" && <TileLayer url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg" />}
                    {mapTile === "SWISSIMAGE" && <TileLayer url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg" />}
                    {markerMode===MarkerMode["ClutterFree"] &&
                        <LayerGroup>
                            {gridData.map(e => {
                                if (e.focused.length === 1) {
                                    const singlePoint = e.focused[0]
                                    const pointColor = hasEvents ? singlePoint.color : color
                                    return (
                                        <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                                position={e.coordinates}
                                                icon={getMapIcon(singlePoint.category, pointColor, minSize)}
                                        />
                                    )
                                } else {
                                    return (
                                        <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                                color={color}
                                                data={e}
                                                position={e.coordinates}
                                                icon={getPieIcon(e.focused, hasEvents ?
                                                    {sum: e.focused.length, maxCount: maxCount, gridDist: gridDist, meterPerPixel: meterPerPixel, size: minSize} :
                                                    {color: color, sum: e.focused.length, maxCount: maxCount, gridDist: gridDist, meterPerPixel: meterPerPixel, size: minSize})}
                                        />
                                    )
                                }
                            })}
                        </LayerGroup>
                    }
                    {/*{markerMode===MarkerMode["Cluster"] &&*/}
                    {/*    <MarkerClusterGroup*/}
                    {/*        iconCreateFunction={d => createClusterCustomIcon(d, 7)}*/}
                    {/*        zoomToBoundsOnClick={false}*/}
                    {/*        chunkedLoading={true}*/}
                    {/*        maxClusterRadius={20}*/}
                    {/*    >*/}
                    {/*        {pointsData.filter(e => e.focused.length !== 0).map(e => {*/}
                    {/*            if (e.focused.length === 1) {*/}
                    {/*                return (*/}
                    {/*                    <Marker key={e.coordinates[0] + "," + e.coordinates[1]}*/}
                    {/*                            color={color}*/}
                    {/*                            data={e.focused[0]}*/}
                    {/*                            position={e.coordinates}*/}
                    {/*                            icon={getMapIcon(e.focused[0].category, hasEvents ? e.focused[0].color : color, 7, "minimapMarkers minimapSingle")}*/}
                    {/*                    />*/}
                    {/*                )*/}
                    {/*            } else {*/}
                    {/*                return (*/}
                    {/*                    <Marker opacity={1} key={e.coordinates[0] + "," + e.coordinates[1]}*/}
                    {/*                            color={color}*/}
                    {/*                            data={e}*/}
                    {/*                            position={e.coordinates}*/}
                    {/*                            icon={getPieIcon(e.focused, hasEvents ? {size: 7} : {color: color, size: 7})}*/}
                    {/*                    />*/}
                    {/*                )*/}
                    {/*            }*/}
                    {/*        })}*/}
                    {/*    </MarkerClusterGroup>*/}
                    {/*}*/}
                    {markerMode===MarkerMode["Location"] &&
                        <LayerGroup>
                            {pointsData.map(e => {
                                if (e.focused.length === 1) {
                                    return (
                                        <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                                position={e.coordinates}
                                                icon={getMapIcon(e.focused[0].category, hasEvents ? e.focused[0].color : color, minSize, "minimapMarkers minimapSingle")}
                                        />
                                    )
                                } else {
                                    return (
                                        <Marker opacity={1} key={e.coordinates[0] + "," + e.coordinates[1]}
                                                position={e.coordinates}
                                                icon={getPieIcon(e.focused, hasEvents ? {size: minSize, className: "minimapMarkers"} : {color: color, size: minSize, className: "minimapMarkers"})}
                                        />
                                    )
                                }
                            })}
                        </LayerGroup>
                    }
                </MapContainer>
            </div>
        )
    } else {
        return (
            <div className={"leaflet-minimap"}>
                <Button id={"previewButton"} onClick={handleOpenClick}><img src={Arrow} width={16} alt={"open"}/></Button>
            </div>
        )
    }
}

export default MiniMap;
