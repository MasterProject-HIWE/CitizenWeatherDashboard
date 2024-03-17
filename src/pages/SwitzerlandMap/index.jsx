import React, { useMemo } from "react";
import SwitzerlandChoropleth from "../../components/SwissLeafletChoropleth";
import data from "../../components/SwitzerlandChoropleth/severity-data.json";
import Sidebar from "../../components/SwitzerlandChoropleth/Sidebar";
import { useSelector } from "react-redux";
import { convertAndFilterData } from "./utils";
import SeverityBarChart from "../../components/SeverityBarChart";

const SwitzerlandMap = () => {
  const [startTime, endTime] = useSelector(
    (state) => state.savings.current.timeRange
  );

  const filteredData = useMemo(() => {
    return convertAndFilterData(data, startTime, endTime);
  }, [startTime, endTime]);

  return (
    <div className="App" style={{ overflow: "hidden" }}>
      <Sidebar />
      <div id="Map">
        <SwitzerlandChoropleth data={filteredData} />
        <div style={{height:"40vh"}}>
          <SeverityBarChart data={data} />
        </div>
      </div>
    </div>
  );
};

export default SwitzerlandMap;
