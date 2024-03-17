import {styled} from "@mui/material/styles";
import {
    Button,
    FormControl,
    FormControlLabel,
    Input,
    Radio,
    Slider,
    TextField,
    Tooltip,
    tooltipClasses
} from "@mui/material";
import {Popup} from "react-leaflet";

export const StyledTextField = styled(TextField)({
    '& label.Mui-focused': {
        color: 'black',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: '#00000080',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#00000080',
        },
        '&:hover fieldset': {
            borderColor: 'var(--border-bg-color)',
            boxShadow: "1px 1px var(--shadow-bg-color)"
        },
        '&.Mui-focused fieldset': {
            borderColor: 'var(--border-bg-color)',
        },
        '&.Mui-disabled:hover fieldset': {
            borderColor: '#b3b3b3',
        },
    }
})

export const StyledInputField = styled(Input)({
    border: "solid 2px var(--border-bg-color)",
    borderRadius: "4px",
    flexShrink: "0",
    marginLeft: "12px",
    "&.Mui-focused": {
        border: "solid 2px var(--border-bg-color)",
    },
    "&.Mui-disabled": {
        borderColor: "#8080805e"
    },
    "& .MuiInput-input": {
        textAlign: "end",
    },
    '&:after': {
        borderBottom: "2px solid var(--border-bg-color)",
    },
    '&:hover:not(.Mui-disabled):before': {
        borderBottom: "1px solid rgba(0, 0, 0, 0.42)"
    }
})

export const StyledSlider = styled(Slider)({
    color: 'var(--main-bg-color)',
    height: 8,
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-thumb': {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&:before': {
            display: 'none',
        },
    },
})

export const StyledFormControl = styled(FormControl)({
    width: "100%"
})

export const StyledFormControlLabel = styled(FormControlLabel)({
    margin: "0 0 5px 0",
    '& .MuiFormControlLabel-label': {
        width: "100%",
        fontSize: "15px"
    }
})

export const StyledRadio = styled(Radio)({
    color: 'var(--main-bg-color)',
    marginRight: "5px",
    padding: "0",
    '&.Mui-checked': {
        color: 'var(--main-bg-color)',
    },
})

export const StyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow enterDelay={500} classes={{ popper: className }}/>
))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "#46596B",
        color: '#FFFFFF',
        fontSize: 18,
        padding: 18,
        marginTop: 120,
        // maxWidth: '150px',
        boxShadow: '#00000091 0px 0px 3px',
        textAlign: "center",
    },
    [`& .${tooltipClasses.tooltipPlacementBottom}`]: {
        marginTop: "8px !important",
    },
    [`& .${tooltipClasses.tooltipPlacementTop}`]: {
        marginBottom: "8px !important",
    },
    [`& .${tooltipClasses.arrow}`]: {
        // backgroundColor: "#46596B",
        color: '#46596B',
        fontSize: 11,
        maxWidth: '150px',
    },
}))

export const StyledButton = styled(Button)({
    width: "49%",
    backgroundColor: "white",
    border: "#2f2f2f 2px solid",
    marginTop: "10px",
    color: "black",
    "&:hover": {
        backgroundColor: "var(--light-bg-color)",
        boxShadow: "1px 1px grey"
    }
})

export const CancelButton = styled(Button)({
    border: "2px solid black",
    padding: "2px 8px",
    color: "black",
    "&:hover": {
        backgroundColor: "#eaeaea"
    }
})

export const DeleteButton = styled(Button)({
    border: "2px solid black",
    padding: "2px 8px",
    backgroundColor: "#e84242",
    color: "white",
    "&:hover": {
        backgroundColor: "#d44c4c",
    }
})

export const StyledPopup = styled(Popup)({
    marginBottom: 26 + "px"
})

export const ImageButton = styled(StyledButton)({
    border: "0",
    width: "0",
    marginTop: "0px",
    minWidth: "35px"
})

export const PlayerSlider = styled(Slider)({
    color: 'var(--main-bg-color)',
    height: 4,
    padding: "6px 0",
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-thumb': {
        height: 12,
        width: 12,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&:before': {
            display: 'none',
        },
        '&:after': {
            width: '20px',
            height: '20px',
        }
    },
})

export const LinkButton = styled(Button)({
    color: 'black',
    background: 'var(--light-bg-color)',
    fontSize: '13px',
    height: '25px',
    '&:hover': {
        backgroundColor: 'var(--opacity-bg-color)',
        boxShadow: '1px 1px var(--border-bg-color)',
    }
})
