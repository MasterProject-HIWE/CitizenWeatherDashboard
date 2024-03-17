import React from "react";
import './App.css';
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Selection from "./components/selection/Selection";
import Comparison from "./components/comparison/Comparison";
import "./static/style/styles.css";
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import SwitzerlandMap from "./pages/SwitzerlandMap"
import HeatMap from "./pages/HeatMap"
import NetMap from "./pages/NetMap"
import HeatNet from "./pages/HeatNet"
import NetworkMap from "./pages/NetworkMap"
import ConbinedMap from "../src/pages/ConbinedMap/ConbinedMap"

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
})

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/selection" element={<Selection />} />
                <Route path="/comparison" element={<Comparison />} />
                <Route path="/hiwe" element={<SwitzerlandMap />} />
                <Route path="/heatmap" element={<HeatMap />} />
                <Route path="/netmap" element={<NetworkMap />} />
                <Route path="/heatnet" element={<HeatNet />} />
                <Route path="/networkmap" element={<NetMap />} />
                <Route path="/CWdashboard" element={<ConbinedMap />} />
                <Route path="/" element={<Navigate replace to="CWdashboard" />} />
            </Routes>
        </Router>
    );
}
