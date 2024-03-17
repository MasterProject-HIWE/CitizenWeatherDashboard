import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { resetPlayer } from "../../shared/features/PlayerSlice";
import { changeMapFilters, checkChanges, reset, revert, save, saveAllChanges } from "../../shared/features/SavingsSlice";
import { saveEvent } from "../../shared/features/ComparisonSlice";
import GoToDialog from "./GoToDialog";
import { StyledButton } from "../../../static/style/muiStyling";

export default function EndButtons() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { pathname } = useLocation()

    const isSaved = useSelector(state => !state.savings.isSaved)
    const data = useSelector(state => state.map.allData)

    const [open, setOpen] = useState(false)
    const [dialogValue, setValue] = useState("")

    const handleSave = () => dispatch(save(data))

    const handleReset = () => dispatch(reset())

    const handleRevert = () => dispatch(revert())

    const handleGoTo = () => {
        let savingsState = dispatch(checkChanges())

        if (data.length === 0) {
            setValue("noData")
            setOpen(true)
        } else if (savingsState.isChanged) {
            setValue("changed")
            setOpen(true)
        } else if (!savingsState.isSaved) {
            setValue("noSave")
            setOpen(true)
        } else if (savingsState.hasMapFilter) {
            setValue("mapFilter")
            setOpen(true)
        } else {
            dispatch(saveEvent())
            dispatch(resetPlayer())
            navigate(`/comparison`)
        }
    }

    const handleClose = (response) => {
        setOpen(false)
        if (response.answer === "noSave") {
            dispatch(reset())
            dispatch(resetPlayer())
            navigate(`/comparison`)
        } else if (response.answer === "save") {
            if (response.type === "changed") {
                dispatch(saveAllChanges())
                dispatch(resetPlayer())
                navigate(`/comparison`)
            } else if (response.type === "mapFilter") {
                dispatch(changeMapFilters())
                dispatch(saveEvent())
                dispatch(resetPlayer())
                navigate(`/comparison`)
            }
        }
    }

    const handleNavigate=()=>{
        const navigationPath = pathname === "/hiwe" ? "/selection" : "/hiwe"
        navigate(navigationPath)
    }

    return (
        <div id="EndButtonContainer">
            <div id="SaveButtons">
                <StyledButton onClick={handleSave}>Save</StyledButton>
                <StyledButton onClick={handleReset}>Reset</StyledButton>
            </div>
            <StyledButton sx={{ width: "65%" }} onClick={handleRevert} disabled={isSaved}>Set last save</StyledButton>
            <StyledButton sx={{ marginBottom: "15px", width: "100%" }} onClick={handleGoTo}>Go to Comparison View</StyledButton>
            <GoToDialog
                open={open}
                value={dialogValue}
                onClose={handleClose}
            />
            <StyledButton sx={{ marginBottom: "15px", width: "100%" }} onClick={handleNavigate}>{pathname === "/hiwe" ? "Go to Selection" : "Go to HIWE"}</StyledButton>
        </div>
    )
}
