import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import * as d3 from "d3";
import {changeFocusedTimeRange} from "../../shared/features/MapSlice";
import {setBins} from "../../shared/features/SettingsSlice";
import {
    controlBinNumber,
    setBinTimeBorders,
    setHistData
} from "../../shared/functions/HistogramFunctions";

const Histogram = ({dimensions}) => {
    const dispatch = useDispatch()

    const svgRef = useRef(null)

    const [binType,
        binCount,
        divided]
        = useSelector(state => {
        const histogram = state.settings.histogram
        return [histogram.type,
            histogram.bins,
            histogram.divided]
    })

    const [data,
        imageData,
        isFocused,
        focusedData,
        focusedImageData,
        timeRange
    ] = useSelector(state => {
        const histogram = state.histogram
        return [histogram.data,
            histogram.imageData,
            histogram.isFocused,
            histogram.focusedData,
            histogram.focusedImageData,
            histogram.timeRange]
    })

    const [inPlayerMode,
        playerData,
        playerImageData
    ] = useSelector(state => {
        const player = state.player
        return [player.isActive,
            player.isPrepared ? player.histData[player.currentStep] : [],
            player.isPrepared ? player.histImageData[player.currentStep] : []]
    })

    const [dragStart, setDrag] = useState(undefined)

    useEffect(() => {
        dispatch(setBins({type: binType, bins: binCount, divided: divided}))
    }, [binCount, binType, data, dispatch, divided])

    useEffect(() => {
        const margin = {top: 10, right: 50, bottom: 50, left: 40}
        const width = dimensions.width - dimensions.margin.left - dimensions.margin.right
        const height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

        const getBinTimeRange = (x, rectList) => {
            let rectBound = []
            for (let rect of rectList) {
                rectBound.push({
                    x: [rect.getBoundingClientRect().left, rect.getBoundingClientRect().right],
                    t: [rect.__data__.x0, rect.__data__.x1]
                })
            }
            const xRect = rectBound.find(rect => rect.x[0] <= x && rect.x[1] >= x)
            if (xRect !== undefined) {
                return xRect.t
            } else {
                return undefined
            }
        }

        const handleMouseDown = (event) => {
            if (!inPlayerMode) {
                const rectList = document.querySelectorAll('rect')
                const newTimeRange = getBinTimeRange(event.clientX, rectList)
                if (newTimeRange !== undefined) {
                    setDrag(newTimeRange)
                    dispatch(changeFocusedTimeRange(newTimeRange))
                }
            }
        }

        const handleMouseOver = (event) => {
            if (!inPlayerMode) {
                const rectList = document.querySelectorAll('rect')
                const newTimeRange = getBinTimeRange(event.clientX, rectList)
                if (newTimeRange !== undefined) {
                    if (dragStart !== undefined) {
                        const start = dragStart[0] < newTimeRange[0] ? dragStart[0] : newTimeRange[0]
                        const end = dragStart[1] > newTimeRange[1] ? dragStart[1] : newTimeRange[1]
                        dispatch(changeFocusedTimeRange([start, end]))
                    } else {
                        dispatch(changeFocusedTimeRange([]))
                    }
                }
            }
        }

        const toDelay = inPlayerMode ? false : controlBinNumber(timeRange, binType, binCount, divided, dispatch)

        if (!toDelay) {
            if (document.getElementsByTagName('g').length>0) d3.select(svgRef.current).select('g').remove()
            if (inPlayerMode || data.length !== 0) {
                const [binTimeStart, binTimeBorder] = setBinTimeBorders(binType, binCount, timeRange)
                let histDataFocused, histDataUnfocused, imageHistData, yMax

                if (inPlayerMode) {
                    histDataUnfocused = setHistData(data, binTimeStart, binTimeBorder, timeRange)
                    histDataFocused = setHistData(playerData, binTimeStart, binTimeBorder, timeRange)
                    imageHistData = divided ? setHistData(playerImageData, binTimeStart, binTimeBorder, timeRange) : []

                    yMax = d3.max(histDataUnfocused, (d) => {return d.length})
                } else {
                    histDataUnfocused = isFocused ?
                        setHistData(data, binTimeStart, binTimeBorder, timeRange) : []

                    histDataFocused = isFocused ?
                        setHistData(focusedData, binTimeStart, binTimeBorder, timeRange) :
                        setHistData(data, binTimeStart, binTimeBorder, timeRange)

                    if (divided) {
                        imageHistData = isFocused ?
                            setHistData(focusedImageData, binTimeStart, binTimeBorder, timeRange) :
                            setHistData(imageData, binTimeStart, binTimeBorder, timeRange)
                    } else {
                        imageHistData = []
                    }

                    yMax = d3.max(isFocused ? histDataUnfocused: histDataFocused, (d) => {return d.length})
                }

                const x = d3
                    .scaleTime()
                    .domain([binTimeBorder[0], binTimeBorder.slice(-1)[0]])
                    .range([0, width-25])

                const y = d3.scaleLinear()
                    .domain([0, yMax]).nice()
                    .range([height, 0])

                const marginLeft = margin.left+25
                const svg = d3.select(svgRef.current)
                    .append("g")
                    .attr("transform", "translate(" + marginLeft + "," + margin.top + ")")

                const appendData = (data, color, opacity, x, y) => {
                    svg.append("svg")
                        .on("mousedown", (event) => handleMouseDown(event))
                        .on("mousemove", (event) => {
                            if (event.buttons === 1) handleMouseOver(event)
                        })
                        .attr("cursor", inPlayerMode ? "default" : "pointer")
                        .selectAll("rect")
                        .data(data)
                        .enter()
                        .append("rect")
                        .attr("x", 1)
                        .attr("transform", (d) => {return "translate(" + x(d.x0) + "," + y(d.length) + ")"})
                        .attr("width", (d) => {return x(d.x1) - x(d.x0) -1})
                        .attr("height", (d) => {return height - y(d.length)})
                        .style("fill", color)
                        .style("opacity", opacity)
                }

                if (inPlayerMode || isFocused) appendData(histDataUnfocused, "var(--opacity-bg-color)", "0.4", x, y)
                if (histDataFocused.length !== 0) appendData(histDataFocused, "var(--main-bg-color)", "1", x, y)
                if (divided && imageHistData.length !== 0) appendData(imageHistData, "var(--shadow-bg-color)", "1", x, y)

                // Add the X Axis
                let formatDate = d3.timeFormat("%d.%m.%y");
                if (d3.timeMonth.count(binTimeBorder[0], binTimeBorder.slice(-1))===0)
                    formatDate = d3.timeDay.count(binTimeBorder[0], binTimeBorder.slice(-1))<2 ?
                        d3.timeFormat("%d.%m. %H:%M") : d3.timeFormat("%d.%m.")
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x).tickFormat(formatDate).ticks(10))
                    .selectAll("text")
                    .attr("y", 8)
                    .attr("x", 5)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(45)")
                    .style("text-anchor", "start")
                    .style("user-select", "none")

                // Add the Y Axis and label
                const yTicks = yMax<10 ? yMax : 5
                svg.append("g")
                    .attr("class", "y axis")
                    .call(d3.axisLeft(y).ticks(yTicks))
                    .style("user-select", "none")

                svg.append("text")
                    .attr("transform", "rotate(-90) translate(-25, 0)")
                    .attr("y", 6)
                    .attr("dy", "-3.2em")
                    .style("text-anchor", "end")
                    .text("Number of Reports")
            }
        }
    }, [binCount, binType, data, dimensions, dispatch, divided, dragStart, focusedData, focusedImageData, imageData, inPlayerMode, isFocused, playerData, playerImageData, timeRange]);

    return <>
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{flexShrink: "0"}} />
    </>
}

export default Histogram;
