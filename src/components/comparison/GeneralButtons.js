import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {moveToStep, resetPlayer} from "../shared/features/PlayerSlice";
import {initNewCurrent} from "../shared/features/SavingsSlice";
import Settings from "../shared/components/Settings";
import Player from "../shared/components/histogram/Player";
import {PlayerSlider, StyledButton} from "../../static/style/muiStyling";

const GeneralButtons = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const boxRef = useRef()

    const divided = useSelector(state => state.settings.histogram.divided)
    const events = useSelector(state => state.comparison.events)
    const [currentStep,
        totalSteps
    ] = useSelector(state => {
        const player = state.player
        return [player.currentStep,
            player.totalSteps
        ]
    })

    const [anchorEl, setAnchorEl] = useState()
    const [legendStyle, setLegendStyle] = useState({})

    useEffect(() => {
        divided && events.length > 0 ? setLegendStyle({flexDirection: "column"}) : setLegendStyle({display: "none", flexDirection: "column"})
    }, [divided, events.length])

    useEffect(() => {
        setTimeout(() => setAnchorEl(boxRef?.current), 1)
    },  [boxRef])

    const handleClick = () => {
        dispatch(initNewCurrent())
        dispatch(resetPlayer())
        navigate(`/selection`)
    }

    const handleSliderChange = (event) => dispatch(moveToStep(event.target.value))

    return (
        <div id={"GeneralButtonContainer"} style={{minWidth: "300px"}} ref={boxRef}>
            {events.length>0 &&
                <>
                    <div id={"SliderBox"}>
                        <div style={{width: '395px', marginTop: '3px'}}>
                            <PlayerSlider
                                valueLabelDisplay="off"
                                aria-label="Player Slider"
                                value={currentStep}
                                min={0}
                                max={totalSteps}
                                onChange={handleSliderChange}
                            />
                        </div>
                        <div id={"ComparisonPlayer"}>
                            <Player isComparison={true}/>
                        </div>
                    </div>
                </>
            }
            <div id={"GeneralButtons"}>
                <StyledButton sx={{marginBottom: "10px"}} onClick={handleClick}>Add Event</StyledButton>
                <div style={{padding: "0 5px 5px 5px", backgroundColor: "white", borderRadius: "8px", ...legendStyle}}>
                    <div className="histLegend"><span style={{backgroundColor: "var(--main-bg-color)"}}></span><p>Without images</p></div>
                    <div className="histLegend"><span style={{backgroundColor: "var(--shadow-bg-color)"}}></span><p>With images</p></div>
                </div>
                <Settings additional boxAnchor={anchorEl}/>
            </div>
        </div>
    )
}

export default GeneralButtons;
