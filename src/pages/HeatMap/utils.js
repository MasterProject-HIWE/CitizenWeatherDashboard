export function convertAndFilterData(data, startTimeMs, endTimeMs) {
  const filteredData = data.filter((item) => {
    const itemStartTime = new Date(item.starttime).getTime();
    const itemEndTime = new Date(item.endtime).getTime();
    return (
      itemStartTime >= startTimeMs &&
      itemStartTime <= endTimeMs &&
      itemEndTime >= startTimeMs &&
      itemEndTime <= endTimeMs
    );
  });
  return filteredData;
}
