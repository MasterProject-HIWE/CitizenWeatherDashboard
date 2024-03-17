import {useDispatch, useSelector} from "react-redux";
import {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import {controlBinNumber, setBinTimeBorders, setHistData} from "../../shared/functions/HistogramFunctions";

const Histogram = ({dimensions, id}) => {
    const dispatch = useDispatch()

    const svgRef = useRef(null)

    const [data,
        localTimeRange,
        hidden
    ] = useSelector(state => {
        const event = state.comparison.events.find(e => e.info.id === id)
        return [
            event.data,
            event.info.timeRange,
            event.hidden
        ]})

    const [binType,
        binCount,
        divided
    ] = useSelector(state => {
        const histogram = state.settings.histogram
        return [histogram.type,
            histogram.bins,
            histogram.divided]
    })

    const [syncType,
        syncedTime
    ] = useSelector(state => {
        const comparison = state.comparison
        return [
            comparison.syncType,
            comparison.syncedTime
        ]})

    const [inPlayerMode,
        playerData,
        playerImageData
    ] = useSelector(state => {
        const player = state.player
        return [player.isActive,
            player.isPrepared && !hidden ? player.histData[id][player.currentStep] : [],
            player.isPrepared && !hidden ? player.histImageData[id][player.currentStep] : []]
    })

    const [histData, setLocalHistData] = useState([])
    const [imageData, setImageData] = useState([])

    // const [dragStart, setDrag] = useState(undefined)

    useEffect(() => {
        setLocalHistData(data.map(e => e.timestamp))
        setImageData(data.filter(e => e.imageName!==null).map(e => e.timestamp))
    }, [data])

    useEffect(() => {
        const margin = {top: 10, right: 50, bottom: 50, left: 40}
        const width = dimensions.width - dimensions.margin.left - dimensions.margin.right
        const height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

        // const handleMouseDown = (event) => {
        //     const rectList = document.querySelector('#histogram').querySelectorAll('rect')
        //     const newTimeRange = getBinTimeRange(event.clientX, rectList)
        //     if (newTimeRange !== undefined) {
        //         setDrag(newTimeRange)
        //         dispatch(changeFocusedTimeRange(newTimeRange))
        //     }
        // }
        //
        // const handleMouseOver = (event) => {
        //     const rectList = document.querySelector('#histogram').querySelectorAll('rect')
        //     const newTimeRange = getBinTimeRange(event.clientX, rectList)
        //     if (newTimeRange !== undefined) {
        //         if (dragStart !== undefined) {
        //             const start = dragStart[0] < newTimeRange[0] ? dragStart[0] : newTimeRange[0]
        //             const end = dragStart[1] > newTimeRange[1] ? dragStart[1] : newTimeRange[1]
        //             dispatch(changeFocusedTimeRange([start, end]))
        //         } else {
        //             dispatch(changeFocusedTimeRange([]))
        //         }
        //     }
        // }

        let timeRange
        switch (syncType) {
            case "syncDuration":
                timeRange = [localTimeRange[0], localTimeRange[0] + syncedTime]
                break
            case "syncAll":
                timeRange = syncedTime
                break
            default:
                timeRange = localTimeRange
        }

        const toDelay = inPlayerMode ? false : controlBinNumber(timeRange, binType, binCount, divided, dispatch, true)

        if (!toDelay) {
            if (document.getElementsByTagName('g').length>0) d3.select(svgRef.current).select('g').remove()
            if (inPlayerMode ||  histData.length !== 0) {
                const [binTimeStart, binTimeBorder] = setBinTimeBorders(binType, binCount, timeRange)
                let histDataFocused, histDataUnfocused, imageHistData, yMax

                if (inPlayerMode) {
                    histDataUnfocused = setHistData(histData, binTimeStart, binTimeBorder, timeRange)
                    histDataFocused = setHistData(playerData, binTimeStart, binTimeBorder, timeRange)
                    imageHistData = divided ? setHistData(playerImageData, binTimeStart, binTimeBorder, timeRange) : []

                    yMax = d3.max(histDataUnfocused, (d) => {return d.length})
                } else {
                    histDataFocused = setHistData(histData, binTimeStart, binTimeBorder, timeRange)
                    imageHistData = divided ? setHistData(imageData, binTimeStart, binTimeBorder, timeRange): []

                    yMax = d3.max(histDataFocused, function(d) {return d.length})
                }

                const x = d3
                    .scaleTime()
                    .domain([binTimeBorder[0], binTimeBorder.slice(-1)])
                    .range([0, width-25]);

                const y = d3.scaleLinear()
                    .domain([0, yMax]).nice() // d3.hist has to be called before the Y axis obviously
                    .range([height, 0]);

                const marginLeft = margin.left+20
                const svg = d3.select(svgRef.current)
                    .append("g")
                    .attr("transform", "translate(" + marginLeft + "," + margin.top + ")")

                const appendHistData = (data, color, opacity) => {
                    svg.append("svg")
                        // .on("mousedown", (event) => {
                        //     handleMouseDown(event)
                        // })
                        // .on("mousemove", (event) => {
                        //     if (event.buttons === 1) {
                        //         handleMouseOver(event)
                        //     }
                        // })
                        // .attr("cursor", "pointer")
                        .selectAll("rect")
                        .data(data)
                        .enter()
                        .append("rect")
                        .attr("x", 1)
                        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
                        .attr("height", function(d) { return height - y(d.length); })
                        .style("fill", color)
                        .style("opacity", opacity)
                }

                if (inPlayerMode) appendHistData(histDataUnfocused, "var(--opacity-bg-color)", "0.4", x, y)
                if (histDataFocused.length !== 0) appendHistData(histDataFocused, "var(--main-bg-color)", "1")
                if (divided && imageHistData.length!==0) appendHistData(imageHistData, "var(--shadow-bg-color)", "1")

                // Add the X Axis
                let formatDate = d3.timeFormat("%d.%m.%y");
                if (d3.timeMonth.count(timeRange[0], timeRange[1])===0)
                    formatDate = d3.timeDay.count(timeRange[0], timeRange[1])<2 ?
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
                    .attr("dy", "-2.9em")
                    .style("text-anchor", "end")
                    .text("Number of Reports");
            }
        }
    }, [binCount, binType, dimensions, dispatch, divided, histData, imageData, inPlayerMode, localTimeRange, playerData, playerImageData, syncType, syncedTime]);

    return (
        <div style={{opacity: hidden ? "0.4" : "1", pointerEvents: hidden ? "none" : "all"}}>
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{flexShrink: "0"}} />
        </div>
    )
}

export default Histogram;
