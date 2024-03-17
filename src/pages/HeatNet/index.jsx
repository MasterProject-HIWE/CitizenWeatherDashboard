import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import SwitzerlandChoropleth from "../../components/HeatNet";
import data from "../../components/SwitzerlandChoropleth/severity-data.json";
import { useSelector } from "react-redux";
import { convertAndFilterData } from "./utils";
import CategorySelectorHorizontal from "../../components/selection/sidebar/CategorySelectorHorizontal";
import "../../static/style/sidebar.css"
import RightSideBar from "./RightSideBar/RightSideBar";

const CustomAEButton = styled(Button)({
  boxShadow: 'none',
  textTransform: 'none',
  width: 148,
  fontSize: 14,
  padding: '8px 12px',
  marginBottom: '8px',
  marginRight: '8px',
  border: '1px solid',
  lineHeight: 1.5,
  backgroundColor: 'transparent',
  borderColor: '#FFF',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  '&:hover': {
    backgroundColor: '#2F4356',
    borderColor: '#2F4356',
    boxShadow: 'none',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  '&:focus': {
    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
  },
});

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
          <Link to="/netmap">
            <CustomAEButton variant="contained">Network Map</CustomAEButton>
          </Link>
          <Link to="/heatmap">
            <CustomAEButton variant="contained">Heat Map</CustomAEButton>
          </Link>
        </div>
        <div className="ae-main-map-body">
          <CategorySelectorHorizontal />
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