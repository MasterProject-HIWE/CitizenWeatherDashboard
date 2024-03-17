import {useMap} from "react-leaflet";

// for loading whole map when changing size
const MapResizer = () => {
    const mapDiv = document.getElementById("Map");
    const map = useMap()
    if (map !== undefined) {
        const resizeObserver = new ResizeObserver(() => {
            if (map._panes.length !== 0) map.invalidateSize()
        });
        resizeObserver.observe(mapDiv)
    }
}

export default MapResizer;
