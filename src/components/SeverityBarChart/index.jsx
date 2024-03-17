import { BarChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  ToolboxComponent,
  DataZoomComponent,
} from "echarts/components";
import { getInstanceByDom, init, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useRef, useEffect } from "react";
import { transformSeverityData } from "./utils";

use([
  CanvasRenderer,
  BarChart,
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
]);

function SeverityBarChart({ theme, data }) {
  const chartRef = useRef(null);
  const transformedData = transformSeverityData(data);

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
  }, [theme]); // Whenever theme changes we need to dispose the chart to render a fresh one with appropriate styling

  useEffect(() => {
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      const option = {
        title: {
          text: "Severity Bar Chart",
        },
        dataZoom: [{ type: "inside" }],
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
          trigger: "item", // Show tooltip only on hovering over a specific item
        },
        xAxis: {
          type: "category",
          name: "Severity",
          position: "bottom",
          nameLocation: "middle",
          nameGap: 30,
        },
        yAxis: {
          type: "value",
          name: "Severity frequency",
          position: "left",
          nameLocation: "middle",
          nameGap: 40,
        },
        series: {
          name: "Severity barChart",
          type: "bar",
          datasetIndex: 0,
          barWidth: "100%",
        },
        dataset: {
          source: transformedData,
        },
      };
      chart?.setOption(option, true);
    }
  }, [theme, transformedData]); // Whenever theme changes we need to dispose the chart to render a fresh one with appropriate styling

  return (
    <div
      ref={chartRef}
      style={{
        height: "100%",
        width: "100%",
        borderWidth: "1px",
        borderStyle: "solid",
        margin: "2px",
      }}
    />
  );
}

export default SeverityBarChart;
