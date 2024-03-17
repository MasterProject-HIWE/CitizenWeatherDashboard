import React from 'react'
import HistogramMap from '../../components/HistogramMap/HistogramMap'
import BarChart from '../../components/BarChart/BarChart'

const index = () => {
  return (
    <div className="App map-boxes map-boxes-heatmap app-cell-histogram" style={{ overflow: "hidden", width: "77%"}}>
      <h1 className='cell-header'>Frequency over Months</h1>
      <div id="ae-main-temp" style={{ height: '154px !important', backgroundColor: "#F5F5F5"  }}>
        <div className="ae-main-header">
        </div>
        <div className="ae-main-map-body">
          <div id="Map" className="map_full">
            <HistogramMap />
            {/* <BarChart /> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default index