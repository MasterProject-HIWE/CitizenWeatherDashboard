import {useDispatch, useSelector} from "react-redux";
import {moveToStep} from "../../shared/features/PlayerSlice";
import Player from "../../shared/components/histogram/Player";
import {PlayerSlider, StyledTooltip} from "../../../static/style/muiStyling";
import {Box} from "@mui/material";

const PlayerBox = () => {
    const dispatch = useDispatch()

    const [isActive,
        currentStep,
        totalSteps
    ] = useSelector(state => {
        const player = state.player
        return [player.isActive,
            player.currentStep,
            player.totalSteps]
    })

    const handleSliderChange = (event) => dispatch(moveToStep(event.target.value))

    return (
        <div className={"playerBox"}>
            <Player/>
            {isActive &&
                <div style={{position: 'absolute', width: '395px', bottom: '84.5px', flexDirection: 'column'}}>
                    <StyledTooltip title={"Stop player to focus bins"} arrow placement="top" followCursor enterDelay={500}>
                        <Box height={175} width={395}/>
                    </StyledTooltip>
                    <PlayerSlider
                        valueLabelDisplay="off"
                        aria-label="Player Slider"
                        value={currentStep}
                        min={0}
                        max={totalSteps}
                        onChange={handleSliderChange}
                    />
                </div>
            }
        </div>
    )
}

export default PlayerBox;
