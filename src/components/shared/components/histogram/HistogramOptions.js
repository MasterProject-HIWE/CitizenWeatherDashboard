import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import * as d3 from "d3";
import {setBinDivided, setBins} from "../../features/SettingsSlice";
import {getBinsValid, resetPlayer} from "../../features/PlayerSlice";
import {setSynchronization} from "../../features/ComparisonSlice";
import {styled} from "@mui/material/styles";
import {Checkbox, RadioGroup} from "@mui/material";
import {
    StyledFormControl,
    StyledFormControlLabel,
    StyledInputField,
    StyledRadio,
    StyledSlider
} from "../../../../static/style/muiStyling";

const StyledCheckBox = styled(Checkbox)({
    color: 'var(--main-bg-color)',
    marginRight: "5px",
    padding: "0",
    '&.Mui-checked': {
        color: 'var(--main-bg-color)',
    },
})

const HistogramOptions = ({additional = false}) => {
    const dispatch = useDispatch()

    const [binType,
        binCount,
        divided]
        = useSelector(state => {
        const histogram = state.settings.histogram
        return [histogram.type,
            histogram.bins,
            histogram.divided]
    })
    const histTimeRange = useSelector(state => state.histogram.timeRange)
    const eventTimeRange = useSelector(state => state.histogram.timeRange)
    const syncType = useSelector(state => state.comparison.syncType)

    const [dayStyle, setDayStyle] = useState({})
    const [hourStyle, setHourStyle] = useState({})
    const [minuteStyle, setMinuteStyle] = useState({})

    useEffect(() => {
        if (additional) {
            const [dayValid, hourValid, minuteValid] = dispatch(getBinsValid())
            setDayStyle(dayValid ? {} : {display: "none"})
            setHourStyle(hourValid ? {} : {display: "none"})
            setMinuteStyle(minuteValid ? {} : {display: "none"})
        } else {
            const topDay = d3.timeDay.count(d3.timeDay.floor(histTimeRange[0]), d3.timeDay.ceil(histTimeRange[1])) > 100 ?
                {display: "none"} : {}
            setDayStyle(topDay)
            const topHour = d3.timeHour.count(d3.timeHour.floor(histTimeRange[0]), d3.timeHour.ceil(histTimeRange[1])) > 100 ?
                {display: "none"} : {}
            setHourStyle(topHour)
            const topMinute = d3.timeMinute.count(d3.timeMinute.floor(histTimeRange[0]), d3.timeMinute.ceil(histTimeRange[1])) > 100 ?
                {display: "none"} : {}
            setMinuteStyle(topMinute)
        }
    }, [additional, dispatch, eventTimeRange, histTimeRange])

    const handleImageInfo = (event) => dispatch(setBinDivided(event.target.checked))

    const handleSyncChange = (event) => {
        dispatch(resetPlayer())
        dispatch(setSynchronization(event.target.value))
    }

    const handleBinsChange = (event) => dispatch(setBins({type: event.target.value, bins: binCount, divided: divided}, additional))

    const handleBinSliderChange = (event) => dispatch(setBins({type: "number", bins: event.target.value, divided: divided}, additional))

    const handleBinInputChange = (event) => {
        let inputValue = Number(event.target.value)
        if (inputValue === "" || inputValue < 1) {
            inputValue = 1
        } else if (inputValue > 100) {
            inputValue = 100
        }
        dispatch(setBins({type: "number", bins: inputValue, divided: divided}, additional))
    }

    return (
        <div style={{flexDirection: "column", marginRight: '8px'}}>
            <p style={{marginBottom: "10px", fontWeight: "bold", fontSize: "larger"}}>Histogram Options</p>
            <StyledFormControlLabel control={<StyledCheckBox checked={divided} onChange={handleImageInfo}/>} label="Divide image information" />
            { additional &&
                <>
                    <p style={{marginBottom: "5px"}}>Synchronization Type</p>
                    <StyledFormControl>
                        <RadioGroup
                            aria-labelledby="sync-group-label"
                            value={syncType}
                            onChange={handleSyncChange}
                            name="sync-group"
                        >
                            <StyledFormControlLabel
                                value="syncDuration"
                                control={<StyledRadio />}
                                label="Sync duration" />
                            <StyledFormControlLabel
                                value="syncAll"
                                control={<StyledRadio />}
                                label="Sync start and end time"
                            />
                            <StyledFormControlLabel
                                value="noSync"
                                control={<StyledRadio />}
                                label="No synchronization"
                            />
                        </RadioGroup>
                    </StyledFormControl>
                </>
            }
            <p style={{marginBottom: "5px"}}>Bin Number</p>
            <StyledFormControl>
                <RadioGroup
                    aria-labelledby="bins-group-label"
                    value={binType}
                    onChange={handleBinsChange}
                    name="bins-group"
                >
                    <StyledFormControlLabel
                        value="month"
                        control={<StyledRadio />}
                        label="Per month" />
                    <StyledFormControlLabel
                        value="day"
                        control={<StyledRadio />}
                        label="Per day"
                        sx={dayStyle}
                    />
                    <StyledFormControlLabel
                        value="hour"
                        control={<StyledRadio />}
                        label="Per hour"
                        sx={hourStyle}
                    />
                    <StyledFormControlLabel
                        value="minute"
                        control={<StyledRadio />}
                        label="Per minute"
                        sx={minuteStyle}
                    />
                    <StyledFormControlLabel
                        value="number"
                        control={<StyledRadio />}
                        sx={{alignItems: "flex-start"}}
                        label={
                            <div>
                                <p style={{marginTop: 0}}>Exact number</p>
                                <div style={{display: "flex", width: "300px"}}>
                                    <StyledSlider
                                        valueLabelDisplay="off"
                                        aria-label="Bin slider"
                                        value={binCount}
                                        min={1}
                                        onChange={handleBinSliderChange}
                                        disabled={binType!=="number"}
                                    />
                                    <StyledInputField
                                        value={binCount}
                                        size="small"
                                        onChange={handleBinInputChange}
                                        disabled={binType!=="number"}
                                        inputProps={{
                                            step: 1,
                                            min: 1,
                                            max: 100,
                                            type: 'number',
                                            'aria-labelledby': 'input-slider',
                                        }}
                                    />
                                </div>
                            </div>}
                    >
                    </StyledFormControlLabel>
                </RadioGroup>
            </StyledFormControl>
        </div>
    )
}

export default HistogramOptions
