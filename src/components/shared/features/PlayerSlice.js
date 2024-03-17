import {createSlice} from "@reduxjs/toolkit";
import * as d3 from "d3";
import {setPointsData} from "../functions/MapFunctions";

const setPlayerData = (state, props, event) => {
    const data = event === undefined ? state.map.allData : event.data.filter(e => !e.hidden)
    const totalTimeRange = props.timeRange === undefined ? state.savings.current.timeRange : props.timeRange
    const type = props.type === undefined ? state.player.type : props.type
    const totalSteps = props.totalSteps === undefined ? state.player.totalSteps : props.totalSteps
    const stepDuration = (totalTimeRange[1]-totalTimeRange[0])/totalSteps
    let timeSteps

    switch (type) {
        case "add":
            timeSteps = [...new Array(totalSteps)].map((e, i) => [totalTimeRange[0], totalTimeRange[0]+(i+1)*stepDuration])
            break
        case "delete":
            timeSteps = [...new Array(totalSteps)].map((e, i) => [totalTimeRange[1]-(totalSteps-i)*stepDuration, totalTimeRange[1]])
            break
        case "current":
            timeSteps = [...new Array(totalSteps)].map((e, i) => [totalTimeRange[0]+i*stepDuration, totalTimeRange[0]+(i+1)*stepDuration])
            break
        default:
    }
    let playerData = timeSteps.map(e => data.filter(d => d.timestamp >= e[0] && d.timestamp <= e[1]))
    type === "delete" ? playerData.push([]) : playerData.unshift([])

    const histData = playerData.map(e => e.map(e2 => e2.timestamp))
    const histImageData = playerData.map(e => e.filter(e2 => e2.imageName !== null).map(e2 => e2.timestamp))

    if (event !== undefined) return [playerData, histData, histImageData]

    const mapData = playerData.map(e => setPointsData(e))
    return [playerData, mapData, histData, histImageData]
}

const setEventPlayerData = (state, props) => {
    const events = state.comparison.events
    const totalSteps = props.totalSteps === undefined ? state.player.totalSteps : props.totalSteps
    let eventBasicPlayerData = {}
    let eventHistData = {}
    let eventHistImageData = {}

    const timeRanges = getTimeRanges(state)
    let newProps = {...props}

    events.forEach(event => {
        if (!event.hidden) {
            newProps.timeRange = timeRanges[event.info.id]
            const [playerData, histData, histImageData] = setPlayerData(state, newProps, event)
            eventBasicPlayerData[event.info.id] = playerData
            eventHistData[event.info.id] = histData
            eventHistImageData[event.info.id] = histImageData
        }
    })

    const eventPlayerData = [...new Array(totalSteps+1)].map((e, i) => events.filter(event => !event.hidden).map(event => eventBasicPlayerData[event.info.id][i]).flat())
    const eventMapData = eventPlayerData.map(e => setPointsData(e))

    return[eventPlayerData, eventMapData, eventHistData, eventHistImageData]
}

const playData = (dispatch, state, currentStep) => {
    const totalSteps = state.player.totalSteps
    const stepTime = state.player.stepTime
    let timerId = state.player.timerId
    clearInterval(timerId)

    timerId = setInterval(() => {
        dispatch(setCurrentStep(currentStep))
        currentStep++;
        if (currentStep === totalSteps+1) clearInterval(timerId)
    }, stepTime)
    dispatch(setTimerId(timerId))
}

const getTimeRanges = (state) => {
    const events = state.comparison.events
    let timeRanges = {}
    switch (state.comparison.syncType) {
        case "syncDuration":
            const durations = events.map(e => e.info.timeRange[1] - e.info.timeRange[0])
            const maxDuration = Math.max(...durations)
            events.forEach(e => timeRanges[e.info.id] = [e.info.timeRange[0], e.info.timeRange[0] + maxDuration])
            break
        case "syncAll":
            const starts = events.map(e => e.info.timeRange[0])
            const minStart = Math.min(...starts)
            const ends = events.map(e => e.info.timeRange[1])
            const maxEnds = Math.max(...ends)
            events.forEach(e => timeRanges[e.info.id] = [minStart, maxEnds])
            break
        default:
            events.forEach(e => timeRanges[e.info.id] = [e.info.timeRange[0], e.info.timeRange[1]])
    }
    return timeRanges
}

export const playFromStart = (isComparison= false) => {
    return (dispatch, getState) => {
        const state = getState()

        if (!state.player.isPrepared) {
            const [data, mapData, histData, histImageData] = isComparison ? setEventPlayerData(state, {}) : setPlayerData(state, {})
            dispatch(initPlayer({data: data, mapData: mapData, histData: histData, histImageData: histImageData}))
        }
        return playData(dispatch, state, 0)
    }
}

export const pause = () => {
    return (dispatch, getState) => {
        clearInterval(getState().player.timerId)
        dispatch(setTimerId(null))
    }
}

export const resume = () => {
    return (dispatch, getState) => {
        const state = getState()
        const currentStep = state.player.currentStep
        return playData(dispatch, state, currentStep)
    }
}

export const stop = () => {
    return (dispatch, getState) => {
        clearInterval(getState().player.timerId)
        dispatch(stopPlayer())
    }
}

export const moveToStep = (currentStep) => {
    return (dispatch, getState) => {
        const state = getState()
        state.player.timerId === null ? dispatch(setCurrentStep(currentStep)) : playData(dispatch, state, currentStep)
    }
}

export const getBinsValid = () => {
    return (_, getState) => {
        const state = getState()
        const dayBins = getTotalSteps(state, "equalBins", {type: "day"})
        if (dayBins > 100)  return [false, false, false]
        const hourBins = getTotalSteps(state, "equalBins", {type: "hour"})
        if (hourBins > 100)  return [true, false, false]
        const minuteBins = getTotalSteps(state, "equalBins", {type: "minute"})
        return [true, true, minuteBins > 100]
    }
}

export const getTotalSteps = (state, syncType, binData) => {
    const stepSyncType = syncType===undefined ? state.player.stepSyncType : syncType
    const binSyncType = state.comparison.syncType
    const events = state.comparison.events
    const timeRanges = getTimeRanges(state)

    if (stepSyncType === "custom" || binSyncType === "noSync") return state.player.customSteps

    if (binSyncType === "syncAll") {
        const event0id = events[0].info.id
        switch (state.settings.histogram.type) {
            case "month":
                return d3.timeMonth.count(d3.timeMonth.floor(timeRanges[event0id][0]), d3.timeMonth.ceil(timeRanges[event0id][1]))
            case "day":
                return d3.timeDay.count(d3.timeDay.floor(timeRanges[event0id][0]), d3.timeDay.ceil(timeRanges[event0id][1]))
            case "hour":
                return d3.timeHour.count(d3.timeHour.floor(timeRanges[event0id][0]), d3.timeHour.ceil(timeRanges[event0id][1]))
            case "minute":
                return d3.timeMinute.count(d3.timeMinute.floor(timeRanges[event0id][0]), d3.timeMinute.ceil(timeRanges[event0id][1]))
            default:
                return binData === undefined ? state.settings.histogram.bins : binData.bins
        }
    }

    let steps
    switch (binData === undefined ? state.settings.histogram.type : binData.type) {
        case "month":
            steps = Object.values(timeRanges).map(timeRange => d3.timeMonth.count(d3.timeMonth.floor(timeRange[0]), d3.timeMonth.ceil(timeRange[1])))
            break
        case "day":
            steps = Object.values(timeRanges).map(timeRange => d3.timeDay.count(d3.timeDay.floor(timeRange[0]), d3.timeDay.ceil(timeRange[1])))
            break
        case "hour":
            steps = Object.values(timeRanges).map(timeRange => d3.timeHour.count(d3.timeHour.floor(timeRange[0]), d3.timeHour.ceil(timeRange[1])))
            break
        case "minute":
            steps = Object.values(timeRanges).map(timeRange => d3.timeMinute.count(d3.timeMinute.floor(timeRange[0]), d3.timeMinute.ceil(timeRange[1])))
            break
        default:
            return binData === undefined ? state.settings.histogram.bins: binData.bins
    }
    return Math.max(...steps)
}

export const setPlayerType = (type, isComparison = false) => {
    return (dispatch, getState) => {
        const state = getState()
        clearInterval(state.player.timerId)
        dispatch(setTimerId(null))
        dispatch(setLocalType(type))

        if (state.player.isActive) {
            let updateId = state.player.updateId
            if (updateId !== null) clearTimeout(updateId)
            updateId = setTimeout(() => {
                const [data, mapData, histData, histImageData] = isComparison ? setEventPlayerData(state, {type: type}) : setPlayerData(state, {type: type})
                dispatch(initPlayer({data: data, mapData: mapData, histData: histData, histImageData: histImageData, type: type}))
            }, 200)
            dispatch(setUpdateId(updateId))
        }
    }
}

export const setTotalStepsSync = (syncType, isComparison = false) => {
    return (dispatch, getState) => {
        const state = getState()
        clearInterval(state.player.timerId)
        dispatch(setTimerId(null))
        dispatch(setCurrentStep(0))
        dispatch(setLocalStepSyncType(syncType))

        if (state.player.isActive) {
            let updateId = state.player.updateId
            if (updateId !== null) clearTimeout(updateId)
            updateId = setTimeout(() => {
                const totalSteps = syncType === "equalBins" ? getTotalSteps(state, syncType) : state.player.totalSteps
                const [data, mapData, histData, histImageData] = isComparison ? setEventPlayerData(state, {syncType: syncType}) : setPlayerData(state, {syncType: syncType})
                dispatch(initPlayer({data: data, mapData: mapData, histData: histData, histImageData: histImageData, syncType: syncType, totalSteps: totalSteps}))
            }, 200)
            dispatch(setUpdateId(updateId))
        }
    }
}

export const setTotalSteps = (totalSteps, isComparison = false) => {
    return (dispatch, getState) => {
        const state = getState()
        clearInterval(state.player.timerId)
        dispatch(setTimerId(null))
        dispatch(setCurrentStep(0))
        dispatch(setLocalTotalSteps(totalSteps))

        if (state.player.isActive) {
            let updateId = state.player.updateId
            if (updateId !== null) clearTimeout(updateId)
            updateId = setTimeout(() => {
                const [data, mapData, histData, histImageData] = isComparison ? setEventPlayerData(state, {totalSteps: totalSteps}) : setPlayerData(state, {totalSteps: totalSteps})
                dispatch(initPlayer({data: data, mapData: mapData, histData: histData, histImageData: histImageData, totalSteps: totalSteps}))
            }, 200)
            dispatch(setUpdateId(updateId))
        }
    }
}

export const setStepTime = (stepTime) => {
    return (dispatch, getState) => {
        clearInterval(getState().player.timerId)
        dispatch(setTimerId(null))
        dispatch(setLocalStepTime(stepTime))
    }
}

export const playerSlice = createSlice(({
    name: "playerSlice",
    initialState: {
        isPrepared: false,
        isActive: false,
        updateId: null,
        timerId: null,
        type: "add",
        stepTime: 500,
        stepSyncType: "equalBins",
        customSteps: 20,
        totalSteps: 20,
        currentStep: 0,
        data: [],
        mapData: [],
        histData: [],
        histImageData: []
    },
    reducers: {
        initPlayer: (state, action) => {
            state.updateId = null
            state.isPrepared = true
            state.isActive = true
            state.data = action.payload.data
            state.mapData = action.payload.mapData
            state.histData = action.payload.histData
            state.histImageData = action.payload.histImageData
            if (action.payload.type !== undefined) state.type = action.payload.type
            if (action.payload.stepTime !== undefined) state.stepTime = action.payload.stepTime
            if (action.payload.totalSteps !== undefined) state.totalSteps = action.payload.totalSteps
        },
        resetPlayer: (state) => {
            state.isPrepared = false
            state.isActive = false
            state.timerId = null
            state.currentStep = 0
            state.data = []
            state.mapData = []
            state.histData = []
            state.histImageData = []
        },
        stopPlayer: (state) => {
            state.isActive = false
            state.timerId = null
            state.currentStep = 0
        },
        setTimerId: (state, action) => {
            state.timerId = action.payload
            if (action.payload !== null) state.isActive = true
        },
        setUpdateId: (state, action) => {
            state.updateId = action.payload
        },
        setCurrentStep: (state, action) => {
            state.currentStep = action.payload
        },
        setLocalType: (state, action) => {
            state.type = action.payload
        },
        setLocalStepSyncType: (state, action) => {
            state.stepSyncType = action.payload
        },
        setLocalTotalSteps: (state, action) => {
            state.totalSteps = action.payload
        },
        setLocalStepTime: (state, action) => {
            state.stepTime = action.payload
        }
    }
}))

export const {initPlayer, resetPlayer, stopPlayer, setTimerId, setUpdateId, setCurrentStep, setLocalType, setLocalStepSyncType, setLocalTotalSteps, setLocalStepTime} = playerSlice.actions
export default playerSlice.reducer
