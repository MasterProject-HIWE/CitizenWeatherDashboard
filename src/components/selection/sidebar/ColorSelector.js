import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {HexColorPicker} from "react-colorful";
import {setCurrent} from "../../shared/features/SavingsSlice";
import {Box, Popper} from "@mui/material";
import {StyledTextField} from "../../../static/style/muiStyling";

export default function ColorSelector() {
    const dispatch = useDispatch()

    const color = useSelector(state => state.savings.current.color)

    const [colorStyle, setColorStyle] = useState({})
    const [boxFocus, setBoxFocus] = useState(false)
    const [fieldFocus, setFieldFocus] = useState(false)
    const [pickerFocus, setPickerFocus] = useState(false)

    useEffect(() => {
        setColorStyle({backgroundColor: color})
    }, [color])

    const handleTextChange = (event) => dispatch(setCurrent({name: "color", value: event.target.value}))

    const handlePickerChange = (val) => dispatch(setCurrent({name: "color", value: val}))

    return(
        <div id="colorAll">
            <Box id="colorOption">
                <input id="colorBox"
                       style={colorStyle}
                       onFocus={() => setBoxFocus(true)}
                       onBlur={() => setBoxFocus(false)}
                       readOnly
                />
                <StyledTextField
                    id="outlined-basic"
                    label="Color"
                    variant="outlined"
                    size="small"
                    value={color}
                    sx={{
                        width: "100%",
                        fontSize: "16px"
                    }}
                    onChange={handleTextChange}
                    onFocus={() => setFieldFocus(true)}
                    onBlur={() => setFieldFocus(false)}
                />
            </Box>
            <Popper
                open={boxFocus || fieldFocus || pickerFocus}
                anchorEl={document.querySelector("#colorOption")}
                placement={"right"}
            >
                <div id="colorPickerBox">
                    <div className="pin-left"/>
                    <div className="pin">
                        <div
                            className="colorPicker"
                            onFocus={() => setPickerFocus(true)}
                            onBlur={() => setPickerFocus(false)}
                        >
                            <HexColorPicker color={color} onChange={handlePickerChange} />
                        </div>
                    </div>
                </div>
            </Popper>
        </div>
    )
}
