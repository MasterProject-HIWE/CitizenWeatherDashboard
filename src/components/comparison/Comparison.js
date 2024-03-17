import React from "react";
import {useSelector} from "react-redux";
import Map from "./Map";
import GeneralButtons from "./GeneralButtons";
import HistogramBox from "./histogram/HistogramBox";
import "../../static/style/comparison.css"

const dimensions = {
    width: 500,
    height: 200,
    margin: {
        top: 10,
        right: 40,
        bottom: 60,
        left: 40
    }
}

const Comparison = () => {

    const events = useSelector(state => state.comparison.events)

    return (
        <div>
            <div id="Map">
                <Map/>
                <div id="ComparisonHistogram">
                    <div style={{border: '1.5px solid var(--border-bg-color)'}}></div>
                    <div className={"HistogramList scroll-shadows"}>
                        <div>
                            {events.map(e => (
                                <HistogramBox
                                    key={e.info.id}
                                    id={e.info.id}
                                    dimensions={dimensions}
                                />
                            ))}
                        </div>
                    </div>
                    <GeneralButtons/>
                </div>
            </div>
        </div>
    )
}

export default Comparison;
