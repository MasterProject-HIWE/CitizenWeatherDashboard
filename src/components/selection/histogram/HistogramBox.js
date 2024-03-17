import React, {useEffect, useState, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import * as d3 from "d3";
import {changeFilter, setCurrent} from "../../shared/features/SavingsSlice";
import {setBins} from "../../shared/features/SettingsSlice";
import {changeFocusedTimeRange} from "../../shared/features/MapSlice";
import OptionsWindow from "../../shared/components/histogram/OptionsWindow";
import Histogram from "./Histogram";
import PlayerBox from "./PlayerBox";
import {styled} from "@mui/material/styles";
import {Box, Button, CircularProgress, Popper} from "@mui/material";
import Arrow from "../../../static/images/left-arrow.png";
import SettingsIcon from "../../../static/images/settings.png";

const StyledButton = styled(Button)({
    backgroundColor: "var(--light-bg-color)",
    border: "var(--border-bg-color) 2px solid",
    marginTop: "18px",
    marginBottom: "0px",
    color: "black",
    fontSize: "12px",
    width: "93px",
    height: "52px",
    "&:hover": {
        backgroundColor: "var(--light-bg-color)",
        boxShadow: "1px 1px var(--border-bg-color)"
    },
    "&.Mui-disabled": {
        border: "2px solid #b9b9b9",
    }
})

const OpenCloseButton = styled(Button)({
    position: "absolute",
    bottom: "0",
    left: "0",
    minWidth: "16px",
    marginBottom: "-3px",
    padding: "4px",
    background: "var(--main-bg-color)",
    borderRadius: "0",
    zIndex: "1000",
    "&:hover": {
        backgroundColor: "var(--border-bg-color)",
        boxShadow: "1px 1px var(--shadow-bg-color)"
    }
})

const SettingsButton = styled(Button)({
    color: "var(--main-bg-color)",
    minWidth: "0",
    position: 'absolute',
    top: 0,
    left: 0,
    "&:hover": {
        backgroundColor: "var(--light-bg-color)",
        boxShadow: "1px 1px var(--border-bg-color)"
    }
})

const HistogramBox = ({dimensions}) => {
    const dispatch = useDispatch()

    let anchorRef = useRef()

    const isLoading = useSelector(state => state.savings.status === "loading")

    const [data,
        imageData
    ] = useSelector(state => {
        const histogram = state.histogram
        return [histogram.data,
        histogram.imageData]
    })

    const [binType,
        binCount,
        divided]
        = useSelector(state => {
        const histogram = state.settings.histogram
        return [histogram.type,
            histogram.bins,
            histogram.divided]
    })
    const [isFocused,
        focusedTimeRange,
        focusedData,
        focusedImageData
    ] = useSelector(state => {
        const map = state.map
        return [
            map.isFocused,
            map.focusedTimeRange,
            map.focusedData,
            map.focusedData.filter(e => e.imageName!==null)
        ]})

    const inPlayerMode = useSelector(state => state.player.isActive)

    const [showHistogram, setHistogram] = useState(true)

    const [legendStyle, setLegendStyle] = useState({})
    const [histMiniStyle, setHistMiniStyle] = useState({})
    const [histContentStyle, setHistContentStyle] = useState({})
    const [histLoadingStyle, setHistLoadingStyle] = useState({})

    const [anchorEl, setAnchorEl] = useState(null)
    const [optionsOpen, setOptionsOpen] = useState(false)

    useEffect(() => {
        setTimeout(() => setAnchorEl(anchorRef?.current), 1)
    },  [anchorRef])

    useEffect(() => {
        divided ? setLegendStyle({}) : setLegendStyle({display: "none"})
    }, [divided])

    useEffect(() => {
        isLoading ? setHistLoadingStyle({display: "flex"}) : setHistLoadingStyle({display: "none"})
    }, [isLoading])

    useEffect(() => {
        if (showHistogram) {
            setHistContentStyle({display: "flex"})
            setHistMiniStyle({display: "none"})
        } else {
            setHistContentStyle({display: "none"})
            setHistMiniStyle({display: "flex"})
        }
    }, [showHistogram])

    useEffect(() => {
        if (optionsOpen === false) {
            setAnchorEl(null)
        }
    }, [optionsOpen])

    const handleCloseClick = () => {
        setHistogram(false)
        setOptionsOpen(false)
    }

    const handleOpenClick = () => setHistogram(true)

    const resetSelection = () => dispatch(changeFocusedTimeRange([]))

    const openSettings = (e) => {
        setAnchorEl(e.currentTarget)
        setOptionsOpen(!optionsOpen)
    }

    const zoomSelection = async () => {
        const filter = {
            "timestamp": {
                '$gt': focusedTimeRange[0],
                '$lt': focusedTimeRange[1]
            }
        }
        const response = await dispatch(changeFilter([{type: "add", filter: [filter]}]))
        if (response) {
            dispatch(setCurrent({name: "timeRange", value: focusedTimeRange}))
            switch (binType) {
                case "month":
                    if (d3.timeDay.count(d3.timeDay.floor(focusedTimeRange[0]), d3.timeDay.ceil(focusedTimeRange[1])) <= 100) {
                        dispatch(setBins({type: "day", bins: binCount, divided: divided}))
                    }
                    break
                case "day":
                    if (d3.timeHour.count(d3.timeHour.floor(focusedTimeRange[0]), d3.timeHour.ceil(focusedTimeRange[1])) <= 100) {
                        dispatch(setBins({type: "hour", bins: binCount, divided: divided}))
                    }
                    break
                case "hour":
                    if (d3.timeMinute.count(d3.timeMinute.floor(focusedTimeRange[0]), d3.timeMinute.ceil(focusedTimeRange[1])) <= 100) {
                        dispatch(setBins({type: "minute", bins: binCount, divided: divided}))
                    }
                    break
                default:
            }
        }
    }

    const styleDateString = (dateVal) => {
        const date = new Date(dateVal)
        const day = date.getDate()<10 ? "0" + date.getDate() : date.getDate()
        const month = date.getMonth()+1<10 ? "0" + (date.getMonth()+1) : (date.getMonth()+1)
        const year = date.getFullYear()
        const hours = date.getHours()<10 ? "0" + date.getHours() : date.getHours()
        const minutes = date.getMinutes()<10 ? "0" + date.getMinutes() : date.getMinutes()
        return day + "." + month + "." + year + " (" + hours + ":" + minutes + ")"
    }

    const imageInfo = imageData.length === 0 ? "" : ` (${imageData.length} with images)`
    const focusedImageInfo = focusedImageData.length === 0 ? "" : ` (${focusedImageData.length} with images)`

    if (data.length === 0 && !inPlayerMode) {
        return (
            <>
                <div style={{margin: "25px", ...histContentStyle}} className="histogramContent">
                    <OpenCloseButton onClick={handleCloseClick}><img src={Arrow} width={16} alt={"close"}/></OpenCloseButton>
                    <SettingsButton onClick={openSettings} ref={anchorRef}><img src={SettingsIcon} width={20} alt={"Settings"}/></SettingsButton>
                    <div className={"histogramLoading"} style={histLoadingStyle}>
                        <CircularProgress size={80}/>
                    </div>
                    <div style={{"fontSize": "40px", "flex": "1"}}>No Data</div>
                </div>
                <div style={{position: "relative", ...histMiniStyle}} className={"histogramMini"}>
                    <OpenCloseButton onClick={handleOpenClick}><img src={Arrow} width={16} alt={"open"} style={{transform: "rotate(180deg)"}}/></OpenCloseButton>
                </div>
                { optionsOpen &&
                    <Popper open={optionsOpen} anchorEl={anchorEl} placement={"top-start"}>
                        <Box sx={{
                            border: "2px solid var(--border-bg-color)",
                            borderLeft: "0",
                            p: 1,
                            backgroundColor: 'white',
                            marginBottom: "1px",
                        }}>
                            <OptionsWindow setOptionsOpen={setOptionsOpen}/>
                        </Box>
                    </Popper>
                }
            </>
        )
    } else {
        return <>
            <div style={histContentStyle} className="histogramContent">
                <OpenCloseButton onClick={handleCloseClick}><img src={Arrow} width={16} alt={"close"}/></OpenCloseButton>
                <SettingsButton onClick={openSettings}><img src={SettingsIcon} width={20} alt={"Settings"}/></SettingsButton>
                <div className={"histogramLoading"} style={{display: "none"}}>
                    <CircularProgress size={80}/>
                </div>
                <div style={{alignItems: "flex-start", padding: '6px 0 6px 63px', flexDirection: "column"}}>
                    <p style={{marginTop: "10px"}}>Total reports: {data.length}{imageInfo}</p>
                    <p hidden={!isFocused}>Selected reports: {focusedData.length}{focusedImageInfo}</p>
                    <p hidden={focusedTimeRange.length===0}>Time range: {styleDateString(focusedTimeRange[0])} to {styleDateString(focusedTimeRange[1])}</p>
                </div>
                <div>
                    <div style={{flexDirection: "column", alignItems: "center"}}>
                        <Histogram
                            dimensions={dimensions}
                        />
                        <PlayerBox/>
                    </div>
                    <div className="histogramButtons">
                        <div style={{flexDirection: "column", ...legendStyle}}>
                            <div className="histLegend"><span style={{backgroundColor: "var(--main-bg-color)"}}></span><p>Without images</p></div>
                            <div className="histLegend"><span style={{backgroundColor: "var(--shadow-bg-color)"}}></span><p>With images</p></div>
                        </div>
                        <StyledButton
                            disabled={focusedTimeRange.length===0}
                            onClick={resetSelection}
                        >
                            Reset selection
                        </StyledButton>
                        <StyledButton
                            disabled={focusedTimeRange.length===0}
                            onClick={zoomSelection}
                        >
                            Zoom selection
                        </StyledButton>
                    </div>
                </div>
            </div>
            <div style={{position: "relative", ...histMiniStyle}} className={"histogramMini"}>
                <OpenCloseButton onClick={handleOpenClick}><img src={Arrow} width={16} alt={"open"} style={{transform: "rotate(180deg)"}}/></OpenCloseButton>
            </div>
            { optionsOpen &&
                <Popper open={optionsOpen} anchorEl={anchorEl} placement={"top-start"}>
                    <Box sx={{
                        border: "2px solid var(--border-bg-color)",
                        borderLeft: "0",
                        p: 1,
                        backgroundColor: 'white',
                        marginBottom: "1px",
                    }}>
                        <OptionsWindow setOptionsOpen={setOptionsOpen}/>
                    </Box>
                </Popper>
            }
        </>
    }
}

export default HistogramBox;
