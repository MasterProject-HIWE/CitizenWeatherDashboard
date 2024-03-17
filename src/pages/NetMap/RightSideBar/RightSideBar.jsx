import React from 'react'

const RightSideBar = () => {
    return (
        <div id="right-sidebar">
            <h2>Legend</h2>
            <h4>High chance of occurrence</h4>
            <div className="legend-danger-levels">
                <div className="legend-danger-level danger-level-five">
                    <div className="legend-danger-level-color-box"></div>
                    <p className="legend-danger-desc">5 Very high danger</p> 
                </div>
                <div className="legend-danger-level danger-level-four">
                    <div className="legend-danger-level-color-box"></div>
                    <p className="legend-danger-desc">4 High danger</p>
                </div>
                <div className="legend-danger-level danger-level-three">
                    <div className="legend-danger-level-color-box"></div>
                    <p className="legend-danger-desc">3 Considerable danger</p>
                </div>
                <div className="legend-danger-level danger-level-two">
                    <div className="legend-danger-level-color-box"></div>
                    <p className="legend-danger-desc">2 Moderate danger</p>
                </div>
                <div className="legend-danger-level danger-level-one">
                    <div className="legend-danger-level-color-box"></div>
                    <p className="legend-danger-desc">1 No or minor danger</p>
                </div>
                <div className="legend-danger-level danger-level-zero">
                    <div className="legend-danger-level-color-box"></div>
                    <p className="legend-danger-desc">No danger level</p>
                </div>
            </div>
        </div>
    )
}

export default RightSideBar