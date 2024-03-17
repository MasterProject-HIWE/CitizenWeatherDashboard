import {createSlice} from '@reduxjs/toolkit'

export const setHistogramData = (data, timeRange) => {
    return (dispatch) => {
        const timeData = data.map(a => a.timestamp)
        const imageData = data.filter(a => a.imageName !== null).map(a => a.timestamp)
        dispatch(setData({
            data: timeData,
            image: imageData,
            timeRange: timeRange
        }))
    }
}

const initalState = {
    data: [],
    imageData: [],
    isFocused: false,
    focusedData: [],
    focusedImageData: [],
    timeRange: [],
}
export const histogramSlice = createSlice({
    name: 'histogramSlice',
    initialState: initalState,
    reducers: {
        setData: (state, action) => {
            state.data = action.payload.data
            state.imageData = action.payload.image
            state.timeRange = action.payload.timeRange
        },
        setHistogramFocused: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.focusedData = action.payload.isFocused ? action.payload.focusedData : []
            state.focusedImageData = action.payload.isFocused ? action.payload.focusedImageData : []
        },
        clearHistogram: (state) => {
            state.data = []
            state.imageData = []
            state.timeRange = []
            state.isFocused = false
            state.focusedData = []
            state.focusedImageData = []
        }
    }
})

export const {setData, setHistogramFocused, clearHistogram} = histogramSlice.actions
export default histogramSlice.reducer
