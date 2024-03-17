import * as d3 from "d3";
import {setBins} from "../features/SettingsSlice";

export const controlBinNumber = (timeRange, binType, binCount, divided, dispatch, isComparison= false) => {
    let toDelay = false
    switch (binType) {
        case "day":
            if (d3.timeDay.count(d3.timeDay.floor(timeRange[0]), d3.timeDay.ceil(timeRange[1])) > 100) {
                toDelay = true
                dispatch(setBins({type: "month", bins: binCount, divided: divided}, isComparison))
            }
            break
        case "hour":
            if (d3.timeHour.count(d3.timeHour.floor(timeRange[0]), d3.timeHour.ceil(timeRange[1])) > 100) {
                toDelay = true
                dispatch(setBins({type: "day", bins: binCount, divided: divided}, isComparison))
            }
            break
        case "minute":
            if (d3.timeMinute.count(d3.timeMinute.floor(timeRange[0]), d3.timeMinute.ceil(timeRange[1])) > 100) {
                toDelay = true
                dispatch(setBins({type: "hour", bins: binCount, divided: divided}, isComparison))
            }
            break
        default:
    }
    return toDelay
}

export const setBinTimeBorders = (binType, binCount, timeRange) => {
    let binTimeStart, binTimeBorder, startTime, endTime
    switch (binType) {
        case "month":
            binTimeStart = d3.timeMonths(timeRange[0], timeRange[1])
            startTime = d3.timeMonth.floor(new Date(timeRange[0]))
            if (binTimeStart.length === 0 || startTime.getTime() !== binTimeStart[0].getTime()) {
                binTimeStart.unshift(startTime)
            }
            binTimeStart = binTimeStart.map(e => e.getTime())
            binTimeBorder = [...binTimeStart]
            endTime = d3.timeMonth.ceil(new Date(timeRange[1])).getTime()
            if (endTime !== binTimeBorder.slice(-1)) {
                binTimeBorder.push(new Date(endTime).getTime())
            }
            break
        case "day":
            binTimeStart = d3.timeDays(timeRange[0], timeRange[1])
            startTime = d3.timeDay.floor(new Date(timeRange[0]))
            if (binTimeStart.length === 0 || startTime.getTime() !== binTimeStart[0].getTime()) {
                binTimeStart.unshift(startTime)
            }
            binTimeStart = binTimeStart.map(e => e.getTime())
            binTimeBorder = [...binTimeStart]
            endTime = d3.timeDay.ceil(new Date(timeRange[1])).getTime()
            if (endTime !== binTimeBorder.slice(-1)) {
                binTimeBorder.push(endTime)
            }
            break
        case "hour":
            binTimeStart = d3.timeHours(timeRange[0], timeRange[1])
            startTime = d3.timeHour.floor(new Date(timeRange[0]))
            if (binTimeStart.length === 0 || startTime.getTime() !== binTimeStart[0].getTime()) {
                binTimeStart.unshift(startTime)
            }
            binTimeStart = binTimeStart.map(e => e.getTime())
            binTimeBorder = [...binTimeStart]
            endTime = d3.timeHour.ceil(new Date(timeRange[1])).getTime()
            if (endTime !== binTimeBorder.slice(-1)) {
                binTimeBorder.push(endTime)
            }
            break
        case "minute":
            binTimeStart = d3.timeMinutes(timeRange[0], timeRange[1])
            startTime = d3.timeMinute.floor(new Date(timeRange[0]))
            if (binTimeStart.length === 0 || startTime.getTime() !== binTimeStart[0].getTime()) {
                binTimeStart.unshift(startTime)
            }
            binTimeStart = binTimeStart.map(e => e.getTime())
            binTimeBorder = [...binTimeStart]
            endTime = d3.timeMinute.ceil(new Date(timeRange[1])).getTime()
            if (endTime !== binTimeBorder.slice(-1)) {
                binTimeBorder.push(endTime)
            }
            break
        default:
            binTimeStart = d3.range(binCount).map(t => timeRange[0] + (t / binCount) * (timeRange[1] - timeRange[0]))
            binTimeBorder = [...binTimeStart]
            binTimeBorder.push(timeRange[1])
    }
    return [binTimeStart, binTimeBorder]
}

export const setHistData = (d, binTimeStart, binTimeBorder, timeRange) => {
    if (d.length === 0) {
        return []
    }
    const binDataRange = d3
        .bin()
        .thresholds(binTimeStart)

    let histData = binDataRange(d)
    histData.map(a => {
        a.x0 = a.x0 === undefined ? timeRange[0] : d3.max(binTimeBorder.filter(e => e <= a.x0))
        a.x1 = a.x1 === undefined ? timeRange[1] : d3.min(binTimeBorder.filter(e => e >= a.x1))
        return a
    })
    for (let i in binTimeBorder) {
        let iP = Number(i)+1
        if (i < binTimeBorder.length-1) {
            const binStart = histData.find(e => e.x0 === binTimeBorder[i])
            if (binStart === undefined) {
                const newBin = []
                newBin.x0 = binTimeBorder[i]
                newBin.x1 = binTimeBorder[iP]
                histData.push(newBin)
            }
        }
    }
    return histData
}
