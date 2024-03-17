import {useDispatch} from "react-redux";
import {useMapEvents} from "react-leaflet";
import {setCenter, setMarkerMode, setZoomLevel} from "../../features/SettingsSlice";

const MapEvents = () => {
    const dispatch = useDispatch()

    const mapEvents = useMapEvents({
        zoomend: () => dispatch(setZoomLevel(mapEvents.getZoom())),
        baselayerchange: e => dispatch(setMarkerMode(e.name)),
        moveend: () => dispatch(setCenter(mapEvents.getCenter()))
    });
    return null
}

export default MapEvents;
