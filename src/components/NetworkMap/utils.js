import { groupBy } from "lodash";
import geoJSON from "../SwitzerlandChoropleth/SwitzerlandCantonsGeoJSON.json";
import { scaleOrdinal } from "d3-scale";

const colors = ["#ccff66", "#ffff00", "#ff9900", "#ff0000", "#800000"]

export function transformGeoJSON(severityData) {
    const severityDictionary = groupBy(severityData, ({ name }) => name);
    const updatedGeoJSON = geoJSON.features.map((ele) => ({
        ...ele,
        properties: {
            ...ele.properties,
            severity: severityDictionary[ele.properties.kan_name]?.[0], // severity data is reduced to create a dictionary where key is canton name, so there will only be 1 item in the grouped list
        },
    }));
    return updatedGeoJSON;
}

export function colorGenerator(max, min) {
    const generator = scaleOrdinal().domain([min, max]).range(colors);
    return generator
}
