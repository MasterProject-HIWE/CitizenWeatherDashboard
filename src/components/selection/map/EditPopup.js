import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import {Popup, useMapEvent} from "react-leaflet";
import {pointInCircle, pointInPolygon, pointInRectangle} from "../../shared/functions/MapFunctions";
import {changeFocusedArea} from "../../shared/features/MapSlice";
import {styled} from "@mui/material/styles";
import {Button} from "@mui/material";
import Edit from "../../../static/images/edit.png";
import Delete from "../../../static/images/delete.png";

const StyledPopupButtons = styled(Button)({
    width: "32px",
    height: "32px",
    minWidth: "0"
})

const EditPopup = ({selectionButton, featureRef, editControlRef}) => {
    const dispatch = useDispatch()

    const focusedArea = useSelector(state => state.map.mapFilters.focusedArea)

    const [position, setPosition] = useState(null)
    const [clickedAreas, setAreas] = useState(null)

    const pointInArea = (coords) => {
        return Object.keys(focusedArea).filter(k => {
            switch (focusedArea[k].type) {
                case "rectangle":
                    return pointInRectangle(coords, focusedArea[k])
                case "circle":
                    return pointInCircle(coords, focusedArea[k])
                case "polygon":
                    return pointInPolygon(coords, focusedArea[k])
                default:
                    return []
            }
        })
    }

    const handleEdit = (clickedAreas) => {
        editControlRef.current._map.closePopup()
        Object.keys(featureRef.current._layers).forEach(e => {
            featureRef.current._layers[e].editing.disable()
        })
        clickedAreas.forEach(e => {
            featureRef.current._layers[e].editing.enable()
        })
    }

    const handleDelete = (clickedAreas) => {
        clickedAreas.forEach(e => {
            const layer = featureRef.current._layers[e]
            featureRef.current.removeLayer(layer)
        })
        dispatch(changeFocusedArea("delete", clickedAreas))
    }

    useMapEvent('click', (e) => {
        if (selectionButton !== "editAll") {
            const getAreas = pointInArea([e.latlng.lat, e.latlng.lng])
            setAreas(getAreas)
            if (getAreas.length > 0) setPosition(e.latlng)
            Object.keys(featureRef.current._layers).forEach(f => {
                if (!getAreas.includes(f)) featureRef.current._layers[f].editing.disable()
            })
        }
    })

    return position === null ? null : (
        <Popup position={position} closeButton={false}>
            <div style={{display: "flex"}}>
                <StyledPopupButtons onClick={() => handleEdit(clickedAreas)}>
                    <img src={Edit} width={20} alt={"edit"}/>
                </StyledPopupButtons>
                <StyledPopupButtons onClick={() => handleDelete(clickedAreas)}>
                    <img src={Delete} width={20} alt={"delete"}/>
                </StyledPopupButtons>
            </div>
        </Popup>
    )
}

export default EditPopup;
