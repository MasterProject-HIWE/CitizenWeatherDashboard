import React from 'react'
import centrality_measures from "../centrality_measures.json";
import UniqueDegree from "../components/UniqueDegree";

const MinMaxMap = (value) => {
    const minMaxDegree = getMinMax("degree");

    function getMinMax(attribute) {
        const values = centrality_measures.map(item => item[attribute]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { min, max };
    }

    
    const dataArray = JSON.parse(UniqueDegree(centrality_measures));
    
    const itemCount = dataArray.length;

    return (
        1 + (itemCount - 1) * ((value - minMaxDegree.min) / (minMaxDegree.max - minMaxDegree.min))
    )
}

export default MinMaxMap