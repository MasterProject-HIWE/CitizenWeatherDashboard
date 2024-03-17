import {Dialog, DialogActions, DialogContent} from "@mui/material";
import PropTypes from "prop-types";
import {CancelButton, DeleteButton} from "../../../static/style/muiStyling";

const DeleteDialog = (props) => {
    const {onClose, name, open} = props

    const handleClose = (deleteConfirmed) => onClose(deleteConfirmed)

    return (
        <Dialog
            onClose={() => handleClose(false)}
            open={open}
        >
            <DialogContent>Do you want to delete "{name}"?</DialogContent>
            <DialogActions>
                <CancelButton onClick={() => handleClose(false)} autoFocus>Cancel</CancelButton>
                <DeleteButton onClick={() => handleClose(true)}>Delete</DeleteButton>
            </DialogActions>
        </Dialog>
    )
}

DeleteDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
};

export default DeleteDialog;
