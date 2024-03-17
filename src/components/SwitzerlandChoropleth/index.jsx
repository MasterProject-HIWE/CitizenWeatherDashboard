import { MapChart } from "echarts/charts";
import {
  TitleComponent,
  VisualMapComponent,
  GeoComponent,
  ToolboxComponent,
  TooltipComponent,
} from "echarts/components";
import { init, use, registerMap, getInstanceByDom } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useRef, useEffect, useState } from "react";
import SwitzerlandCantonsGeoJSON from "./SwitzerlandCantonsGeoJSON.json";

// Adopted from Echarts. Ref: https://echarts.apache.org/examples/en/editor.html?c=dynamic-data2&lang=ts
use([
  TitleComponent,
  ToolboxComponent,
  VisualMapComponent,
  GeoComponent,
  MapChart,
  TooltipComponent,
  CanvasRenderer, // If you only need to use the canvas rendering mode, the bundle will not include the SVGRenderer module, which is not needed.
]);

export function mapCantonsToKenNames(data) {
  const dictionary = data
    .map((ele) => ({
      name: `${ele.cantons}`,
      value: Number.parseFloat(ele.severity.toString()),
    }))
    .reduce((acc, curr) => {
      const sum = (acc[curr.name]?.sum ?? 0) + curr.value;
      const length = (acc[curr.name]?.length ?? 0) + 1;
      return { ...acc, [curr.name]: { sum, length } };
    }, {});
  return Object.entries(dictionary).map(([key, value]) => {
    return { name: key, value: value.sum / value.length };
  });
}

registerMap("SwitzerlandChoropleth", SwitzerlandCantonsGeoJSON);

function SwitzerlandChoropleth({ title, theme, data }) {
  const chartRef = useRef(null);
  const [transformedData, setTransformedData] = useState([
    { name: "", value: NaN },
  ]);

  useEffect(() => {
    const convertedData = mapCantonsToKenNames(data);
    setTransformedData(convertedData);
  }, [data]);

  useEffect(() => {
    let chart;
    let observer;

    // Initialize chart
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
      observer = new ResizeObserver(() => {
        chart?.resize();
      });
      observer.observe(chartRef.current);
    }
    return () => {
      chart?.dispose();
      observer?.disconnect();
    };
  }, [theme]);

  useEffect(() => {
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      const option = {
        title: {
          text: title,
          left: "center",
        },
        toolbox: {
          show: true,
          left: "right",
          top: "top",
          feature: {
            saveAsImage: {},
            restore: {
              show: true,
              title: "Reset zoom",
            },
          },
        },
        tooltip: {
          trigger: "item",
          showDelay: 0,
          transitionDuration: 0.2,
        },
        visualMap: {
          type: "continuous",
          left: "right",
          min: 0,
          max: 5,
          inRange: {
            color: ["#ccff66", "#ffff00", "#ff9900", "#ff0000", "#800000"],
          },
          text: ["High", "Low"],
          calculable: true,
          realtime: false,
        },
        series: [
          {
            name: "SwitzerlandChoropleth",
            label: {
              show: true,
            },
            type: "map",
            data: transformedData,
            map: "SwitzerlandChoropleth", // Should be same as the map registered with 'registerMap'
            roam: true, // Ref: https://echarts.apache.org/en/option.html#series-map.roam
            /**
             * Associates individual map polygons to the key defined.
             * Ref: https://echarts.apache.org/en/option.html#series-map.nameProperty
             */
            nameProperty: "kan_name",
            tooltip: {
              valueFormatter: (value) => {
                let output = "";
                if (Array.isArray(value)) {
                  output = "";
                } else {
                  output =
                    typeof value === "number"
                      ? value.toFixed(3)
                      : value.toString();
                }
                return output;
              },
            },
          },
        ],
      };
      chart?.setOption(option, true);
    }
  }, [title, theme, transformedData]);

  return (
    <div
      ref={chartRef}
      style={{
        height: "100%",
        width: "100%",
        border: "1px solid black",
      }}
    />
  );
}

export default SwitzerlandChoropleth;
