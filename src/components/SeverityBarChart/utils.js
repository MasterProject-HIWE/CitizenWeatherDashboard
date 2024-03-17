import { rollup } from "d3";

export function transformSeverityData(data) {
  const result = rollup(
    data,
    (group) => group.length, // Count the occurrences
    (d) => d.severity // Group by severity
  );

  const resultArray = Array.from(result, ([severity, count]) => [
    severity,
    count,
  ]).sort((a, b) => a[0] - b[0]);

  return [["severity", "severityCount"], ...resultArray];
}
