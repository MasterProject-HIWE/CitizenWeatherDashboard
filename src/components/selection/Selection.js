import {useDispatch, useSelector} from "react-redux";
import {initNewCurrent} from "../shared/features/SavingsSlice";
import Map from "./map/Map";
import Sidebar from "./sidebar/Sidebar";
import HistogramBox from "./histogram/HistogramBox";
import {useEffect} from "react";

const dimensions = {
    width: 500,
    height: 250,
    margin: {
        top: 10,
        right: 40,
        bottom: 60,
        left: 40
    }
}

const Selection = () => {
    const dispatch = useDispatch()

    const name = useSelector(state => state.savings.current.name)

    useEffect(() => {
        if (name === "") dispatch(initNewCurrent())
    })

    return (
        <div className="App" style={{overflow: "hidden"}}>
            <Sidebar/>
            <div id="Map">
                <Map/>
                <div id="Histogram">
                    <HistogramBox
                        dimensions={dimensions}
                    />
                </div>
            </div>
        </div>
    );
}

export default Selection;
