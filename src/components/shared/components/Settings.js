import {useDispatch, useSelector} from "react-redux";
import {useRef, useEffect, useState} from "react";
import {setMapTile, setTheme} from "../features/SettingsSlice";
import Credits from "./Credits";
import OptionsWindow from "./histogram/OptionsWindow";
import {NestedMenuItem} from "mui-nested-menu";
import {styled} from "@mui/material/styles";
import {Box, Button, Menu, MenuItem, Modal, Popper} from "@mui/material";
import SettingsIcon from "../../../static/images/settings.png";

const creditStyle = {
    background: "var(--main-bg-color)",
    fontSize: "8px",
    color: "black",
    padding: "5px",
    minWidth: "0"
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    backgroundColor: 'white',
    border: '2px solid black',
    boxShadow: 24,
    p: 4,
    padding: "15px"
}

const StyledOuterMenuItem = styled(MenuItem)({
    fontSize: "13px",
})

const StyledInnerMenuItem = styled(MenuItem)({
    fontSize: "13px",
    border: "1px solid transparent",
    lineHeight: "1",
    "&:hover": {
        border: "1px solid #606060"
    }
})

const Settings = ({additional= false, boxAnchor}) => {
    const dispatch = useDispatch()

    let menuRef = useRef()

    const theme = useSelector(state => state.settings.theme)

    const [open, setOpen] = useState(false)
    const [modal, setModal] = useState(false)
    const [optionsOpen, setOptionsOpen] = useState(false)

    useEffect(() => {
        document.documentElement.className = theme
    }, [theme])

    const handleOpenHistogramOptions = () => {
        setOpen(false)
        setOptionsOpen(true)
    }

    const handleOpenCredits = () => {
        setModal(true)
        setOpen(false)
    }

    const handleCloseCredits = () => setModal(false)

    const closeColorMenu = (theme) => {
        if (theme !== "") dispatch(setTheme(theme))
        setOpen(false)
    }

    const closeMapMenu = (tile) => {
        if (theme !== "") dispatch(setMapTile(tile))
        setOpen(false)
    }

    return (<>
        <Button sx={creditStyle} onClick={() => setOpen(true)} ref={menuRef}><img src={SettingsIcon} width={20} alt={"Settings"}/></Button>
        <Menu
            id="color-menu"
            anchorEl={menuRef.current}
            open={open}
            onClose={() => closeColorMenu("")}
        >
            <NestedMenuItem
                label={"Color Theme"}
                parentMenuOpen={open}
                className={"nestedMenu"}
            >
                <StyledInnerMenuItem onClick={() => closeColorMenu("lightGray")} sx={{background: "linear-gradient(90deg, #ededed, #d4d4d4, #ededed)"}}>Light Gray</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeColorMenu("almond")} sx={{background: "linear-gradient(90deg, #f6e8df, #f1d9ca, #f6e8df)"}}>Almond</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeColorMenu("pinkLavender")} sx={{background: "linear-gradient(90deg, #f5e6ed, #deafc6, #f5e6ed)"}}>Pink Lavender</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeColorMenu("manatee")} sx={{background: "linear-gradient(90deg, #c5c4d9, #9796bb, #c5c4d9)"}}>Manatee</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeColorMenu("cobaltBlue")} sx={{background: "linear-gradient(90deg, #c1d9f1, #82b3e3, #c1d9f1)"}}>Cobalt Blue</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeColorMenu("crystal")} sx={{background: "linear-gradient(90deg, #e1eff4, #aad2e0, #e1eff4)"}}>Crystal</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeColorMenu("opal")} sx={{background: "linear-gradient(90deg, #d4e8e2, #a1ccbf, #d4e8e2)"}}>Opal</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeColorMenu("grannySmithApple")} sx={{background: "linear-gradient(90deg, #dcefd7, #add9a1, #dcefd7)"}}>Granny Smith Apple</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeColorMenu("bone")} sx={{background: "linear-gradient(90deg, #eeecdd, #ddd8ba, #eeecdd)"}}>Bone</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeColorMenu("gold")} sx={{background: "linear-gradient(90deg, #f6e8d5, #e9c694, #f6e8d5)"}}>Gold</StyledInnerMenuItem>
            </NestedMenuItem>
            <NestedMenuItem
                label={"Map Background"}
                parentMenuOpen={open}
                className={"nestedMenu"}
            >
                <StyledInnerMenuItem onClick={() => closeMapMenu("CH")}>CH</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeMapMenu("OSM")}>OSM</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeMapMenu("NationalMapColor")}>NationalMapColor</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeMapMenu("NationalMapGrey")}>NationalMapGrey</StyledInnerMenuItem>
                <StyledInnerMenuItem onClick={() => closeMapMenu("SWISSIMAGE")}>SWISSIMAGE</StyledInnerMenuItem>
            </NestedMenuItem>
            <StyledOuterMenuItem onClick={handleOpenCredits}>Credits</StyledOuterMenuItem>
            {additional &&
                <StyledOuterMenuItem onClick={handleOpenHistogramOptions}>Open Histogram Options</StyledOuterMenuItem>
            }
        </Menu>
        <Modal
            open={modal}
            onClose={handleCloseCredits}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box style={modalStyle}>
                <Credits/>
            </Box>
        </Modal>
        { boxAnchor &&
            <Popper open={optionsOpen} anchorEl={boxAnchor} placement={"left-end"}>
                <Box sx={{
                    border: "2px solid var(--border-bg-color)",
                    p: 1,
                    backgroundColor: 'white',
                    marginBottom: "0px",
                    marginLeft: "1px",
                    paddingBottom: "16px"
                }}>
                    <OptionsWindow additional setOptionsOpen={setOptionsOpen}/>
                </Box>
            </Popper>
        }
    </>)
}

export default Settings;
