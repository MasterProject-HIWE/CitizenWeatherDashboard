import PropTypes from "prop-types";
import {styled} from "@mui/material/styles";
import {Dialog, DialogActions, DialogContent} from "@mui/material";
import {StyledButton} from "../../../static/style/muiStyling";

const StyledDialog = styled(Dialog)({
    textAlign: "center"
})

const StyledActions = styled(DialogActions)({
    borderTop: "1px inset",
    paddingTop: "0"
})

const LocalStyledButton = styled(StyledButton)({
    fontSize: "13px",
    width: "auto",
})

const GoToDialog = (props) => {
    const { onClose, value, open } = props

    const handleClose = (event) => onClose({type: value, answer: event.target.name})

    let dialogInfo = ""
    let dialogQuestion = ""

    switch (value) {
        case "noData":
            dialogInfo = "You have no report selected."
            dialogQuestion = "Do you want to continue without a new event?"
            break
        case "noSave":
            dialogInfo = "You have no event saved."
            dialogQuestion = "Do you want to continue without a new event?"
            break
        case "changed":
            dialogInfo = "You have unsaved changes."
            dialogQuestion = "Do you want to save them?"
            break
        case "mapFilter":
            dialogInfo = "You have unsaved filters on the map."
            dialogQuestion = "Do you want to save them?"
            break
        default:
    }

    if (value === "noData" || value === "noSave") {
        return (
            <Dialog
                onClose={handleClose}
                open={open}
            >
                <DialogContent>{dialogInfo}</DialogContent>
                <DialogContent>{dialogQuestion}</DialogContent>
                <DialogActions>
                    <LocalStyledButton name={"cancel"} onClick={handleClose}>Cancel</LocalStyledButton>
                    <LocalStyledButton name={"noSave"} onClick={handleClose} autoFocus>Continue</LocalStyledButton>
                </DialogActions>
            </Dialog>
        )
    }

    return (
        <StyledDialog
            onClose={handleClose}
            open={open}
        >
            <DialogContent>
                <div style={{marginBottom: "10px"}}>{dialogInfo}</div>
                <div>{dialogQuestion}</div>
            </DialogContent>
            <StyledActions>
                <LocalStyledButton name={"cancel"} onClick={handleClose}>Cancel</LocalStyledButton>
                <LocalStyledButton name={"noSave"} onClick={handleClose}>Don't save</LocalStyledButton>
                <LocalStyledButton name={"save"} onClick={handleClose} autoFocus>Save</LocalStyledButton>
            </StyledActions>
        </StyledDialog>
    )
}

GoToDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
};

export default GoToDialog;
