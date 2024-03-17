import {createSlice} from "@reduxjs/toolkit";
import * as d3 from "d3";
import {getTotalSteps, setTotalSteps} from "./PlayerSlice";
import MarkerMode from "../../../static/data/MarkerMode.json";

export const setBins = (binData, isComparison= false) => {
    return (dispatch, getState) => {
        const state = getState()
        if (state.player.stepSyncType === "equalBins") {
            let totalSteps
            if (isComparison) {
                totalSteps = getTotalSteps(state, "equalBins", binData)
            } else {
                const timeRange = state.savings.current.timeRange
                switch (binData.type) {
                    case "month":
                        totalSteps = d3.timeMonth.count(d3.timeMonth.floor(timeRange[0]), d3.timeMonth.ceil(timeRange[1]))
                        break
                    case "day":
                        totalSteps = d3.timeDay.count(d3.timeDay.floor(timeRange[0]), d3.timeDay.ceil(timeRange[1]))
                        break
                    case "hour":
                        totalSteps = d3.timeHour.count(d3.timeHour.floor(timeRange[0]), d3.timeHour.ceil(timeRange[1]))
                        break
                    case "minute":
                        totalSteps = d3.timeMinute.count(d3.timeMinute.floor(timeRange[0]), d3.timeMinute.ceil(timeRange[1]))
                        break
                    default:
                        totalSteps = binData.bins
                }
            }
            dispatch(setTotalSteps(totalSteps, isComparison))
        }
        dispatch(setLocalBins(binData))
    }
}

export const settingsSlice = createSlice(({
    name: "settingsSlice",
    initialState: {
        theme: "crystal",
        mapTile: "CH",
        zoomLevel: 8,
        center: [46.3985, 8.2318],
        markerMode: MarkerMode["ClutterFree"],
        binDivided: true,
        histogram: {
            type: "number",
            bins: 20,
            divided: true
        }
    },
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload
        },
        setMapTile: (state, action) => {
            state.mapTile = action.payload
        },
        setZoomLevel: (state, action) => {
            state.zoomLevel = action.payload
        },
        setCenter: (state, action) => {
            state.center = action.payload
        },
        setMarkerMode: (state, action) => {
            state.markerMode = action.payload
        },
        setBinDivided: (state, action) => {
            state.histogram.divided = action.payload
        },
        setLocalBins: (state, action) => {
            state.histogram = action.payload
        }
    }
}))

export const {setTheme, setMapTile, setZoomLevel, setCenter, setMarkerMode, setBinDivided, setLocalBins} = settingsSlice.actions
export default settingsSlice.reducer
