import {createSlice} from "@reduxjs/toolkit";
import {clearMap} from "./MapSlice";
import {clearHistogram} from "./HistogramSlice";

const getSyncedTime = (syncType, events) => {
    let timeRanges = events.map(e => e.info.timeRange)
    let syncedTime
    switch (syncType) {
        case "syncDuration":
            syncedTime = Math.max(...timeRanges.map(e => e[1]-e[0]))
            break
        case "syncAll":
            syncedTime = [Math.min(...timeRanges.map(e => e[0])), Math.max(...timeRanges.map(e => e[1]))]
            break
        default:
            syncedTime = undefined
    }
    return syncedTime
}

export const saveEvent = (eventInfo) => {
    return (dispatch, getState) => {
        const state = getState()

        let newEventData = eventInfo === undefined ? state.map.allData : eventInfo.data
        newEventData = newEventData.map(e => {
            const e2 = {...e}
            e2.color = state.savings.current.color
            e2.eventId = state.savings.current.id
            return e2
        })
        const newEventInfo = eventInfo === undefined ? state.savings.saved : eventInfo.info
        const newEvent = {info: newEventInfo, data: newEventData, hidden:false}

        let index = -1
        if (state.comparison.events.length > 0) {
            index = state.comparison.events.findIndex(e => e.info.id === newEvent.info.id)
        }
        let events = [...state.comparison.events]
        index === -1 ? events.push(newEvent) : events[index] = newEvent

        const syncedTime = getSyncedTime(state.comparison.syncType, events)
        dispatch(editComparison({events: events, syncedTime: syncedTime}))
        dispatch(clearMap())
        dispatch(clearHistogram())
    }
}

export const deleteEvent = (id) => {
    return (dispatch, getState) => {
        const state = getState()
        const events = [...state.comparison.events]
        const index = events.findIndex(event => event.info.id === id)
        if (index !== -1) {
            events.splice(index, 1)
            const syncedTime = getSyncedTime(state.comparison.syncType, events)
            dispatch(editComparison({events: events, syncedTime: syncedTime}))
        }
    }
}

export const setSynchronization = (syncType) => {
    return (dispatch, getState) => {
        const state = getState()
        const syncedTime = getSyncedTime(syncType, state.comparison.events)
        dispatch(setSyncs({syncType: syncType, syncedTime: syncedTime}))
    }
}

export const changeVisibility = (id, hidden) => {
    return (dispatch, getState) => {
        const state = getState()
        const events = [...state.comparison.events]
        const index = events.findIndex(event => event.info.id === id)
        const event = {...events[index]}
        event.hidden = hidden
        events[index] = event
        const syncedTime = getSyncedTime(state.comparison.syncType, events)
        dispatch(editComparison({events: events, syncedTime: syncedTime}))
    }
}

// const getImage = async (name) => {
//     return await fetch('getImage', {
//         'method': 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(name)
//     })
//         .then(response => {
//             console.log(response)
//         })
// }
//
// export const getImage2 = createAsyncThunk('posts/getImage',
//     async (file) => {
//     console.log(file.name)
//     const img = await getImage(file.name);
//     return img
//     })

export const comparisonSlice = createSlice({
    name: "comparisonSlice",
    initialState: {
        events: [],
        syncType: "syncDuration",
        syncedTime: []
    },
    reducers: {
        editComparison: (state, action) => {
            state.events = action.payload.events
            state.syncedTime = action.payload.syncedTime
        },
        setSyncs: (state, action) => {
            state.syncedTime = action.payload.syncedTime
            state.syncType = action.payload.syncType
        }
    }
})

export const {editComparison, setSyncs} = comparisonSlice.actions
export default comparisonSlice.reducer
