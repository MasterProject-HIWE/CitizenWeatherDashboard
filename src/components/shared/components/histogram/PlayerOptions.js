import {useDispatch, useSelector} from "react-redux";
import {setPlayerType, setStepTime, setTotalSteps, setTotalStepsSync} from "../../features/PlayerSlice";
import {styled} from "@mui/material/styles";
import {Button, RadioGroup} from "@mui/material";
import {
    StyledFormControl,
    StyledFormControlLabel,
    StyledInputField,
    StyledRadio
} from "../../../../static/style/muiStyling";

const OptionStyledInputField = styled(StyledInputField)({
    height: '28px',
    width: '60px',
    "& .MuiInput-input": {
        padding: "0",
    },
})

const DefaultButton = styled(Button)({
    color: 'black',
    fontSize: '12px',
    backgroundColor: 'var(--light-bg-color)',
    padding: '4px',
    height: '24px',
    marginLeft: '6px',
    '&:hover': {
        backgroundColor: 'var(--opacity-bg-color)',
        boxShadow: '1px 1px var(--main-bg-color)',
    }
})

const PlayerOptions = ({additional = false}) => {
    const dispatch = useDispatch()

    const [type,
        stepTime,
        stepSyncType,
        totalSteps
    ] = useSelector(state => {
        const player = state.player
        return [player.type,
            player.stepTime,
            player.stepSyncType,
            player.totalSteps
        ]
    })

    const handleTypeChange = (event) => dispatch(setPlayerType(event.target.value, additional))

    const handleNumberChange = (event) => dispatch(setTotalStepsSync(event.target.value, additional))

    const handleTotalStepInputChange = (event) => dispatch(setTotalSteps(Number(event.target.value), additional))

    const handleStepTimeInputChange = (event) => dispatch(setStepTime(Number(event.target.value)))

    const setDefaultStepTime = () => dispatch(setStepTime(500))

    return (
        <div style={{flexDirection: "column", marginLeft: '8px'}}>
            <p style={{marginBottom: "10px", fontWeight: "bold", fontSize: "larger"}}>Player Options</p>
            <p style={{marginBottom: "5px"}}>Player type</p>
            <StyledFormControl>
                <RadioGroup
                    aria-labelledby="type-group-label"
                    value={type}
                    onChange={handleTypeChange}
                    name="type-group"
                >
                    <StyledFormControlLabel
                        value="add"
                        control={<StyledRadio />}
                        label="Add reports" />
                    <StyledFormControlLabel
                        value="current"
                        control={<StyledRadio />}
                        label="Show report at step"
                    />
                    <StyledFormControlLabel
                        value="delete"
                        control={<StyledRadio />}
                        label="Delete reports"
                    />
                </RadioGroup>
            </StyledFormControl>
            <div style={{display: "flex"}}>
                <p style={{whiteSpace: 'nowrap', marginRight: '5px'}}>Number of steps:</p>
                <StyledFormControl>
                    <RadioGroup
                        aria-labelledby="number-group-label"
                        value={stepSyncType}
                        onChange={handleNumberChange}
                        name="number-group"
                    >
                        <StyledFormControlLabel
                            value="equalBins"
                            control={<StyledRadio />}
                            label="Equal bin number" />
                        <StyledFormControlLabel
                            value="custom"
                            control={<StyledRadio />}
                            label={
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <p style={{marginTop: 0}}>Custom:</p>
                                    <OptionStyledInputField
                                        value={totalSteps}
                                        size="small"
                                        onChange={handleTotalStepInputChange}
                                        disabled={stepSyncType!== "custom"}
                                        inputProps={{
                                            step: 1,
                                            min: 1,
                                            max: 100,
                                            type: 'number',
                                        }}
                                    />
                                </div>
                            }
                        />
                    </RadioGroup>
                </StyledFormControl>
            </div>
            <div style={{display: "flex"}}>
                <p style={{marginBottom: "5px"}}>Time per step:</p>
                <OptionStyledInputField
                    value={stepTime}
                    size="small"
                    onChange={handleStepTimeInputChange}
                    inputProps={{
                        step: 1,
                        min: 1,
                        max: 100,
                        type: 'number',
                    }}
                />
                <p style={{marginBottom: "5px"}}>ms</p>
                <DefaultButton onClick={setDefaultStepTime}>default</DefaultButton>
            </div>
        </div>
    )
}

export default PlayerOptions;
