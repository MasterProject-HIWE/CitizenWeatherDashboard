import React, { useMemo } from "react";
import SwitzerlandChoropleth from "../../components/HeatMapRepN";
import data from "../../components/SwitzerlandChoropleth/severity-data.json";
// import HorizontalSidebar from "../../components/selection/sidebar/HorizontalSidebar";
import { useSelector } from "react-redux";
import { convertAndFilterData } from "./utils";
import CategorySelectorHorizontal from "../../components/selection/sidebar/CategorySelectorHorizontal";
import "../../static/style/sidebar.css"
import RightSideBar from "./RightSideBar/RightSideBar";

const SwitzerlandMap = () => {
  const [startTime, endTime] = useSelector(
    (state) => state.savings.current.timeRange
  );

  const filteredData = useMemo(() => {
    return convertAndFilterData(data, startTime, endTime);
  }, [startTime, endTime]);

  return (
    <div className="App" style={{ overflow: "hidden" }}>
      <div id="ae-main-temp">
        <div className="ae-main-header">
        </div>
        <div className="ae-main-map-body">
            <CategorySelectorHorizontal/>
          <div id="Map">
            <SwitzerlandChoropleth data={filteredData} />
          </div>
          <RightSideBar />
        </div>
      </div>
      {/* <Sidebar /> */}
    </div>
  );
};

export default SwitzerlandMap;