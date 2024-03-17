import {createSlice} from '@reduxjs/toolkit'
import l from "lodash";
import {setHistogramFocused} from "./HistogramSlice";
import {
    focusArea,
    focusPoints,
    focusProximity,
    getProximityPoints, setPointsData,
} from "../functions/MapFunctions";

const standardProximity = 20

const focusTime = (state, timeRange, data) => {
    if (timeRange.length === 0) return [data, false]

    let newData = [...data]
    newData.forEach(p => {
        let newFocused = []
        let newUnfocused = []
        let allMultiPoints = p.focused.concat(p.unfocused)
        allMultiPoints.forEach(e => {
            if (e.timestamp >= timeRange[0]
                && e.timestamp <= timeRange[1]) {
                newFocused.push(e)
            } else {
                newUnfocused.push(e)
            }
        })
        p.focused = newFocused
        p.unfocused = newUnfocused
    })
    return [newData, true]
}

const setFocuses = (state, timeRange, areas, points, proximityPoints, loadedData = null) => {
    let allData = loadedData === null ? [...state.map.pointsData] : [...loadedData]
    allData = allData.map(e => {
        let newE = {...e}
        newE.focused = []
        newE.unfocused = e.focused.concat(e.unfocused)
        return newE
    })

    let [data, isAreaFocused] = focusArea(allData, areas)
    let isProximityFocused
    [data, isProximityFocused] = focusProximity(data, proximityPoints, isAreaFocused)

    if (!(isAreaFocused || isProximityFocused)) {
        data = allData.map(e => {
            let newE = {...e}
            newE.focused = e.focused.concat(e.unfocused)
            newE.unfocused = []
            return newE
        })
    }

    let isPointFocused
    [data, isPointFocused] = focusPoints(data, points)

    const isMapFocused = isAreaFocused || isPointFocused || isProximityFocused

    let isTimeFocused
    if (timeRange.length !== 0) [data, isTimeFocused] = focusTime(state, timeRange, data)

    const isFocused = isTimeFocused || isMapFocused;

    const focusedData = data.map(e => e.focused).flat()
    return [focusedData, data, isFocused, isMapFocused]
}

export const setMapData = (originalData) => {
    return (dispatch, getState) => {
        const state = getState()

        const points = setPointsData(originalData)
        const [focusedData, data, isFocused, isMapFocused] = setFocuses(state, [], state.map.mapFilters.focusedArea, {add: [], delete: []}, [], points)
        dispatch(setData({
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedData: focusedData,
            allData: originalData,
            pointsData: data
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp),
            focusedImageData: focusedData.filter(e => e.imageName !== null).map(e => e.timestamp)
        }))
    }
}

export const changeFocusedTimeRange = (timeRange) => {
    return (dispatch, getState) => {
        const state = getState()
        const areas = state.map.mapFilters.focusedArea
        const points = state.map.mapFilters.focusedSpecialPoints
        const proximityPoints = state.map.mapFilters.focusedProximityPoints

        if (!(state.map.focusedTimeRange[0] === timeRange[0] && state.map.focusedTimeRange[1] === timeRange[1])) {
            const [focusedData, data, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints)

            dispatch(setTimeFocus({
                focusedData: focusedData,
                pointsData: data,
                isFocused: isFocused,
                isMapFocused: isMapFocused,
                focusedTimeRange: timeRange
            }))
            dispatch(setHistogramFocused({
                isFocused: isFocused,
                focusedData: focusedData.map(e => e.timestamp),
                focusedImageData: focusedData.filter(e => e.imageName !== null).map(e => e.timestamp)
            }))
        }
    }
}

export const changeFocusedArea = (type, id, newArea = {}) => {
    return (dispatch, getState) => {
        const state = getState()
        const timeRange = state.map.focusedTimeRange
        const areas = {...state.map.mapFilters.focusedArea}
        const points = state.map.mapFilters.focusedSpecialPoints
        const proximityPoints = state.map.mapFilters.focusedProximityPoints

        type === "delete" ? id.forEach(e => delete areas[e]) : areas[id] = newArea
        const [focusedData, data, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints)

        dispatch(setAreaFocus({
            focusedData: focusedData,
            pointsData: data,
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedArea: areas
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp),
            focusedImageData: focusedData.filter(e => e.imageName !== null).map(e => e.timestamp)
        }))
    }
}

export const changeFocusedPoints = (type, latLng) => {
    return (dispatch, getState) => {
        const state = getState()
        const timeRange = state.map.focusedTimeRange
        const areas = state.map.mapFilters.focusedArea
        const points = {...state.map.mapFilters.focusedSpecialPoints}
        const proximityPoints = state.map.mapFilters.focusedProximityPoints

        if (type === "delete") {
            const index = points["add"].findIndex(e => e.lat === latLng.lat && e.lng === latLng.lng)
            if (index !== -1) {
                let array = [...points["add"]]
                array.splice(index, 1)
                points["add"] = array
            } else {
                let array = [...points["delete"]]
                array.push({...latLng})
                points["delete"] = array
            }
        } else {
            const index = points["delete"].findIndex(e => e.lat === latLng.lat && e.lng === latLng.lng)
            if (index !== -1) {
                let array = [...points["delete"]]
                array.splice(index, 1)
                points["delete"] = array
            } else {
                let array = [...points["add"]]
                array.push({...latLng})
                points["add"] = array
            }
        }

        const [focusedData, data, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints,)

        dispatch(setPointFocus({
            focusedData: focusedData,
            pointsData: data,
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedSpecialPoints: points
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp),
            focusedImageData: focusedData.filter(e => e.imageName !== null).map(e => e.timestamp)
        }))
    }
}

export const changeFocusedProximityPoints = (latLng) => {
    return (dispatch, getState) => {
        const state = getState()
        const timeRange = state.map.focusedTimeRange
        const areas = state.map.mapFilters.focusedArea
        const points = state.map.mapFilters.focusedSpecialPoints
        let proximityPoints = [...state.map.mapFilters.focusedProximityPoints]
        const proximityDistance = state.map.mapFilters.proximityDistance
        const index = proximityPoints.findIndex(list =>
            list.findIndex(c => c[0] === latLng.lat && c[1] === latLng.lng) !== -1
        )

        if (index === -1) {
            const coordsList = state.map.pointsData.map(e => e.coordinates)
            const newEntry = getProximityPoints([latLng.lat, latLng.lng], coordsList, proximityDistance)
            proximityPoints.push(newEntry)
        } else {
            let array = [...proximityPoints]
            array.splice(index, 1)
            proximityPoints = array
        }

        const [focusedData, data, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints)

        dispatch(setProximityFocus({
            focusedData: focusedData,
            pointsData: data,
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedProximityPoints: proximityPoints
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp),
            focusedImageData: focusedData.filter(e => e.imageName !== null).map(e => e.timestamp)
        }))
    }
}

export const changeProximityDistance = (distance) => {
    return (dispatch, getState) => {
        const state = getState()
        const timeRange = state.map.focusedTimeRange
        const areas = state.map.mapFilters.focusedArea
        const points = state.map.mapFilters.focusedSpecialPoints
        const proximityPoints = state.map.mapFilters.focusedProximityPoints

        const startPoints = proximityPoints.map(e => e[0])
        const coordsList = state.map.pointsData.map(e => e.coordinates)
        const newPoints = startPoints.map(e => getProximityPoints(e, coordsList, distance))

        const [focusedData, data, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, newPoints)

        dispatch(setProximityFocus({
            focusedData: focusedData,
            pointsData: data,
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedProximityPoints: newPoints,
            proximityDistance: distance
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp),
            focusedImageData: focusedData.filter(e => e.imageName !== null).map(e => e.timestamp)
        }))
    }
}

export const deleteAllAreas = () => {
    return (dispatch, getState) => {
        const state = getState()
        const timeRange = state.map.focusedTimeRange
        const areas = {}
        const points = {add: [], delete: []}
        const proximityPoints = []

        const [focusedData, data, isFocused] = setFocuses(state, timeRange, areas, points, proximityPoints)

        dispatch(setDeleted({
            focusedData: focusedData,
            pointsData: data,
            isFocused: isFocused
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp),
            focusedImageData: focusedData.filter(e => e.imageName !== null).map(e => e.timestamp)
        }))
    }
}

export const isMapFilterChanged = () => {
    return (_, getState) => {
        return !l.isEqual(getState().map.mapFilters, initialMapFilter)
    }
}

const initialMapFilter = {
    focusedArea: {},
    focusedSpecialPoints: {
        add: [],
        delete: []
    },
    focusedProximityPoints: [],
    proximityDistance: standardProximity
}

const initialState = {
    allData: [],
    focusedData: [],
    pointsData: [],
    isFocused: false,
    isMapFocused: false,
    focusedTimeRange: [],
    mapFilters: initialMapFilter
}

export const mapSlice = createSlice({
    name: 'mapSlice',
    initialState: initialState,
    reducers: {
        setData: (state, action) => {
            state.allData = action.payload.allData
            state.focusedData = action.payload.focusedData
            state.pointsData = action.payload.pointsData
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedTimeRange = []
            state.mapFilters.focusedSpecialPoints = {add: [], delete: []}
            state.mapFilters.focusedProximityPoints = []
        },
        setLoading: (state) => {
            state.status = 'loading'
        },
        setTimeFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.focusedData = action.payload.focusedData
            state.isMapFocused = action.payload.isMapFocused
            state.pointsData = action.payload.pointsData
            state.focusedTimeRange = action.payload.focusedTimeRange
        },
        setAreaFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedData = action.payload.focusedData
            state.pointsData = action.payload.pointsData
            state.mapFilters.focusedArea = action.payload.focusedArea
        },
        setPointFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedData = action.payload.focusedData
            state.pointsData = action.payload.pointsData
            state.mapFilters.focusedSpecialPoints = action.payload.focusedSpecialPoints
        },
        setProximityFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedData = action.payload.focusedData
            state.pointsData = action.payload.pointsData
            state.mapFilters.focusedProximityPoints = action.payload.focusedProximityPoints
            if (action.payload.proximityDistance !== undefined) state.mapFilters.proximityDistance = action.payload.proximityDistance
        },
        setDeleted: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = false
            state.focusedData = action.payload.focusedData
            state.pointsData = action.payload.pointsData
            state.mapFilters.focusedArea = {}
            state.mapFilters.focusedSpecialPoints = {add: [], delete: []}
            state.mapFilters.focusedProximityPoints = []
        },
        clearMap: (state) => {
            state.allData = []
            state.focusedData = []
            state.pointsData = []
            state.isFocused = false
            state.isMapFocused = false
            state.focusedTimeRange = []
            state.mapFilters = initialMapFilter
        }
    }
})

export const {setData, setTimeFocus, setAreaFocus, setPointFocus, setProximityFocus, setDeleted, clearMap} = mapSlice.actions
export default mapSlice.reducer
