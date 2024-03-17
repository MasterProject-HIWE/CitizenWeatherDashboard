import { configureStore } from '@reduxjs/toolkit'
import settingsReducer from './SettingsSlice'
import savedReducer from './SavingsSlice'
import histogramReducer from './HistogramSlice'
import mapReducer from './MapSlice'
import comparisonReducer from './ComparisonSlice'
import playerReducer from './PlayerSlice'

export default configureStore({
    reducer: {
        settings: settingsReducer,
        savings: savedReducer,
        histogram: histogramReducer,
        map: mapReducer,
        comparison: comparisonReducer,
        player: playerReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})
