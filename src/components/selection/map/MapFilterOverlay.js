import {Circle, Polygon} from "react-leaflet";
import circle from "@turf/circle";
import union from "@turf/union";
import intersect from "@turf/intersect";
import * as turf from "@turf/helpers";

const MapFilterOverlay = ({mapFilter}) => {
    const localMapFilter = mapFilter.length === undefined ? [mapFilter] : mapFilter
    if (localMapFilter.length === 0) return null

    let remainingPolygons = []
    let remainingPoints = []

    localMapFilter.forEach(e => {
        const polygons = Object.values(e.focusedArea).map(s => {
            switch (s.type) {
                case "circle":
                return circle([s.center.lng, s.center.lat], s.radius/1000).geometry.coordinates[0]
                case "rectangle":
                    return [[s.northEast.lng, s.northEast.lat], [s.northEast.lng, s.southWest.lat], [s.southWest.lng, s.southWest.lat], [s.southWest.lng, s.northEast.lat], [s.northEast.lng, s.northEast.lat]]
                default:
                    const coords = s.coordinates.map(e => [e[1], e[0]])
                    coords.push(coords[0])
                    return coords
            }
        })
        if (polygons.length>0) {
            remainingPoints = []
            let groupedPolygons = turf.polygon([polygons[0]])
            if (polygons.length>1) {
                for (let i=1; i<polygons.length; i++) {
                    groupedPolygons = union(groupedPolygons, turf.polygon([polygons[i]]))
                }
            }
            remainingPolygons = remainingPolygons.length === 0 ? groupedPolygons : intersect(remainingPolygons, groupedPolygons)
        } else {
            remainingPolygons = []
        }
        if (remainingPolygons.length>0) remainingPoints = []
        remainingPoints = remainingPoints.concat(e.focusedProximityPoints).concat(e.focusedSpecialPoints.add.map(v => [v.lat, v.lng]))
        e.focusedSpecialPoints.delete.forEach(f => {
            const index = remainingPoints.findIndex(e => e[0]===f.lat && e[1]===f.lng)
            if (index !== -1) {
                const e2 = [...remainingPoints[0]]
                e2.splice(index, 1)
                remainingPoints[0] = e2
            }
        })
    })
    if (remainingPolygons.length===undefined) remainingPolygons = remainingPolygons.geometry.type === "Polygon" ?
            [remainingPolygons.geometry.coordinates.map(e => e.map(e2 => [e2[1], e2[0]]))] :
            remainingPolygons.geometry.coordinates.map(e => e.map(e2 => e2.map(e3 => [e3[1], e3[0]])))

    return (
        <>
            {remainingPolygons.map(e => (
                <Polygon
                    key={e}
                    pathOptions={{color: 'var(--border-bg-color)', fillOpacity: "0.4", zIndex: "2000"}}
                    positions={e}
                    pane={"markerPane"}
                />
            ))}
            {remainingPoints.length>0 && remainingPoints[0].map(e => (
                <Circle
                    key={e}
                    center={e}
                    radius={50}
                    pane={"markerPane"}
                />
            ))}
        </>
    )
}

export default MapFilterOverlay;
