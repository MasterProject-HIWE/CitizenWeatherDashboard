import distance from "@turf/distance";
import {ChanConvexHull} from "./ConvexHull";

const getDistance = (c1, c2) => {
    return distance([c1[1], c1[0]], [c2[1], c2[0]])
}

export const pointInCircle = (point, circle) => {
    return getDistance([circle.center.lat, circle.center.lng], point)*1000 <= circle.radius
}

// taken from https://www.algorithms-and-technologies.com/point_in_polygon/javascript
export const pointInPolygon = (point, polygonObj) => {
    const polygon = polygonObj.coordinates
    let odd = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
        if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1]))
            && (point[0] < ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))) {
            odd = !odd;
        }
        j = i;
    }
    return odd;
}

export const pointInRectangle = (point, rectangle) => {
    return point[0] <= rectangle.northEast.lat &&
        point[0] >= rectangle.southWest.lat &&
        point[1] <= rectangle.northEast.lng &&
        point[1] >= rectangle.southWest.lng
}

const arrangeArea = (allPoints, focused) => {
    let newAll = [...allPoints]
    focused.forEach(e => {
        const index = newAll.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
        let changing = {...newAll[index]}
        changing.focused = changing.focused.concat(changing.unfocused)
        changing.unfocused = []
        newAll[index] = changing
    })
    return newAll
}

export const focusArea = (focused, areas) => {
    if (Object.keys(areas).length === 0) return [focused, false]

    let newFocused = Object.values(areas).map(e => {
        switch (e.type) {
            case "rectangle":
                return focused.filter(f =>
                    pointInRectangle(f.coordinates, e))
            case "circle":
                return focused.filter(f =>
                    pointInCircle(f.coordinates, e))
            case "polygon":
                return focused.filter(f =>
                    pointInPolygon(f.coordinates, e))
            case "point":
                return focused.filter(f =>
                    f.coordinates[0] === e.latLng.lat && f.coordinates[1] === e.latLng.lng)
            default:
                return []
        }
    }).flat()
    if (newFocused.length>0 && newFocused[0].category===undefined) newFocused = arrangeArea(focused, newFocused)
    return [newFocused, true]
}

export const focusPoints = (focused, points) => {
    if (points["add"].length === 0 && points["delete"].length === 0) return [focused, false]

    let newFocused = [...focused]
    points["delete"].forEach(c => {
        const index = newFocused.findIndex(e => e.coordinates[0] === c.lat && e.coordinates[1] === c.lng)
        if (index !== -1) {
            const el = {...newFocused[index]}
            el.unfocused = el.focused.concat(el.unfocused)
            el.focused = []
            newFocused[index] = el
        }
    })
    points["add"].forEach(c => {
        const index = newFocused.findIndex(e => e.coordinates[0] === c.lat && e.coordinates[1] === c.lng)
        if (index !== -1) {
            const el = {...newFocused[index]}
            el.focused = el.focused.concat(el.unfocused)
            el.unfocused = []
            newFocused[index] = el
        }
    })
    return [newFocused, true]
}

export const focusProximity = (data, proximityPoints) => {
    if (proximityPoints.length === 0) return [data, false]
    let newData = [...data]
    proximityPoints.flat().forEach(c => {
        const index = newData.findIndex(v => [0, 1].every(k => v.coordinates[k]===c[k]))
        if (index!==-1) {
            const el = {...newData[index]}
            el.focused = el.focused.concat(el.unfocused)
            el.unfocused = []
            newData[index] = el
        }
    })
    return [newData, true]
}

export const getProximityPoints = (coords, coordsList, distance) => {
    let queue = []
    let visited = []
    let proximityList = []

    queue.push(coords)
    let index = coordsList.findIndex(c => [0, 1].every(k => c[k]===coords[k]))
    if (index !== -1) visited[index] = true

    while (queue.length > 0) {
        let node = queue.shift()
        coordsList.forEach((e, i) => {
            if (!visited[i] && getDistance(e, node) <= distance) {
                queue.push(e)
                visited[i] = true
            }
        })
        proximityList.push(node)
    }
    return proximityList
}

export const setPointsData = (data) => {
    let coordsList = []
    let points = []
    data.forEach(e => {
        let index = coordsList.findIndex(c => [0, 1].every(k => e.coordinates[k] === c[k]))
        if (index === -1) {
            points.push({coordinates: e.coordinates, focused: [e], unfocused:[]})
            coordsList.push(e.coordinates)
        } else {
            let pointsIndex = points.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
            points[pointsIndex].focused.push(e)
        }
    })
    return points
}

export const getGridData = (allData, zoomLevel) => {
    const gridData = []
    let maxCount = 0
    let gridDist = 0

    const latList = allData.map(e => e.coordinates[0])
    const minLat = Math.min(...latList)
    const maxLat = Math.max(...latList)
    const lngList = allData.map(e => e.coordinates[1])
    const minLng = Math.min(...lngList)
    const maxLng = Math.max(...lngList)

    if (allData.length===1) {
        gridData.push({focused: allData, unfocused: [], coordinates: allData[0].coordinates, convexHull: [allData[0].coordinates]})
    } else if (allData.length>1) {

        const latDist = getDistance([minLat, minLng], [maxLat, minLng])
        const lngDist = getDistance([minLat, minLng], [minLat, maxLng])

        const maxGridSize = 10240 / (Math.pow(2, zoomLevel))
        const latGrid = Math.ceil(latDist/maxGridSize) > 0 ? Math.ceil(latDist/maxGridSize) : 1
        const lngGrid = Math.ceil(lngDist/maxGridSize) > 0 ? Math.ceil(lngDist/maxGridSize) : 1
        const latGridSize = (maxLat-minLat+0.005) / latGrid
        const lngGridSize = (maxLng-minLng+0.005) / lngGrid
        gridDist = Math.min(latDist/latGrid, lngDist/lngGrid)
        if (gridDist === 0) gridDist = 40

        const grid = new Array(latGrid)
        for (let i=0; i<latGrid; i++) grid[i] = new Array(lngGrid)

        allData.forEach(e => {
            const x = Math.floor((e.coordinates[0]-minLat) / latGridSize)
            const y = Math.floor((e.coordinates[1]-minLng) / lngGridSize)
            if (grid[x][y] === undefined) {
                grid[x][y] = []
            }
            grid[x][y].push(e)
        })

        for (let i=0; i<latGrid; i++) {
            for (let j=0; j<lngGrid; j++) {
                const gridContent = grid[i][j]
                if (gridContent !== undefined) {
                    const convexHull = ChanConvexHull.calculate(gridContent.map(e => e.coordinates)).convexHull
                    const avgLat =  convexHull.map(e => e[0]).reduce((a, b) => a + b, 0) / convexHull.length
                    const avgLng =  convexHull.map(e => e[1]).reduce((a, b) => a + b, 0) / convexHull.length
                    // gridData.push({focused: gridContent, unfocused: [], coordinates: [avgLat, avgLng], convexHull: convexHull})
                    gridData.push({focused: gridContent, unfocused: [], coordinates: [avgLat, avgLng]})
                    if (gridContent.length > maxCount) maxCount = gridContent.length
                }
            }
        }
    }
    return [gridData, maxCount, gridDist]
}

// export const getClusterList = (event) => {
//     let markerList = event.layer.getAllChildMarkers().map(e => e.options.data)
//     return markerList.map(e => e.focused === undefined ? e : e.focused).flat()
// }
