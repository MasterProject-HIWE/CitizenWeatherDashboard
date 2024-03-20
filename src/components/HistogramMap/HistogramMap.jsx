import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import HistogramData from './linechart_month_data.json';
import HistogramDataWeek from './linechart_week_data.json';
import UserHistogramData from './userhistogramdata.json';
import { useButtonContext } from '../ButtonContext/ButtonContext';
import { useUserContext } from '../UserContext/UserContext';

const aggregateDataByMonth = (data) => {
  const aggregatedData = {};

  data.forEach((entry) => {
    const month = entry.timestamp.split('/')[0];
    if (!aggregatedData[month]) {
      aggregatedData[month] = { timestamp: `${month}/${entry.timestamp.split('/')[1]}/${entry.timestamp.split('/')[2]}`, Total: 0, Cloudiness: 0, Lightning: 0, Icy_Conditions: 0, Hail: 0, Fog: 0, Rain: 0, Snow: 0, Snow_Cover: 0, Tornado: 0, Wind: 0 };
    }

    Object.keys(aggregatedData[month]).forEach((condition) => {
      if (condition !== 'timestamp') {
        aggregatedData[month][condition] = Math.max(aggregatedData[month][condition], entry[condition]);
      }
    });
  });

  return Object.values(aggregatedData);
};

const aggregateUserDataByMonth = (data) => {
  const aggregatedData = {};

  data.forEach((entry) => {
    const month = entry.timestamp.split('/')[0];
    if (!aggregatedData[month]) {
      aggregatedData[month] = { timestamp: `${month}/${entry.timestamp.split('/')[2]}`, Total: 0, Cloudiness: 0, Lightning: 0, Icy_Conditions: 0, Hail: 0, Fog: 0, Rain: 0, Snow: 0, Snow_Cover: 0, Tornado: 0, Wind: 0 };
    }

    aggregatedData[month].Total += entry.freq;

    if (entry.category in aggregatedData[month]) {
      aggregatedData[month][entry.category] += entry.freq;
    }
  });

  return Object.values(aggregatedData);
};

let zoomcontrol  = null;
let g = {};
let svg = {};
let lines = {};
let dots = {};
let xScale = {};
let yScale = {};
let xAxis = {};
let yAxis = {};
let Height = {};
let marginbottom = {};
let margintop = {};
let glines = {};
let ctype = "month";
let xaxisholder = {};
let yaxisholder = {};
let linecolor = {};

const drawChart = (svg, data, totalWidth, height, marginLeft, marginRight, marginTop, marginBottom, selectedButton, lineDotColor,type) => {
  linecolor[type] = lineDotColor;
  xScale[type] = d3.scaleBand()
    .domain(data.map(d => d.timestamp))
    .range([marginLeft, totalWidth - marginRight])
    .padding(0);
  const maxdata = d3.max(data, d => d[selectedButton]);
  yScale[type] = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[selectedButton]) + parseInt(maxdata * .5)])
    .range([height - marginBottom, marginTop]);

  svg.attr("width", totalWidth)
    .attr("height", height);


  svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr('x', 40)
    .attr('y', 23)
    .attr("width", totalWidth - marginLeft - marginRight)
    .attr("height", height - marginBottom - marginTop)    

  svg.select("defs").append("svg:clipPath")
    .attr("id", "clipx")
    .append("svg:rect")
    .attr('x', 40)
    .attr('y', height-50)
    .attr("width", totalWidth - marginLeft - marginRight)
    .attr("height", 50)     

  g[type] = svg.append("g")
  xaxisholder[type] = g[type].append("g").attr("clip-path","url(#clipx)").append("g")
  .attr("class", "x-axis")
  xAxis[type] = xaxisholder[type]
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(xScale[type]).tickSizeOuter(0))
    .selectAll("text")
    .style("font-size", "6px");
  yaxisholder[type] = g[type].append("g")
  .attr("class", "y-axis")
  yAxis[type] = yaxisholder[type]
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(yScale[type]))
    .call(g => g.select(".domain").remove())
    .selectAll("text")
    .style("font-size", "6px");

  const line = d3.line()
    .x(d => xScale[type](d.timestamp) + xScale[type].bandwidth() / 2)
    .y(d => yScale[type](d[selectedButton]));

  g[type] = g[type].append("g");
  let gline = g[type].append("g").attr("clip-path","url(#clip)")
  gline.append("g").attr("id","grid")
   .selectAll(".horizontal-line")
    .data(yScale[type].ticks())
    .enter().append("line")
    .attr("class", "horizontal-line")
    .attr("x1", marginLeft)
    .attr("y1", d => yScale[type](d))
    .attr("x2", totalWidth - marginRight)
    .attr("y2", d => yScale[type](d))
    .attr("stroke", "#aaa")
    .attr("stroke-width", 0.4)
    .attr("stroke-dasharray", "3,3");    

  glines[type] = gline.append("g");  
  lines[type] = glines[type].append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", lineDotColor)
    .attr("stroke-width", 1.5)
    .attr("d", line);

  dots[type] = glines[type].selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", d => xScale[type](d.timestamp) + xScale[type].bandwidth() / 2)
    .attr("cy", d => yScale[type](d[selectedButton]))
    .attr("r", 4)
    .style("fill", lineDotColor);

  zoomcontrol = d3.zoom()
    .scaleExtent([1, 5])   
    .on("zoom", zoomed);  

  g[type] = gline.append("rect")
    .attr("width", totalWidth - marginLeft - marginRight)
    .attr("height", height - marginTop - marginBottom)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
    .call(zoomcontrol)
    .on("mouseover",()=>{
      setType(type)
    });

 // svg.call(zoomcontrol);  
};

const setType = (type) =>{
  ctype = type;
}

const zoomed = (event) =>{
  let t = event.transform;
  var newY = event.transform.rescaleY(yScale[ctype]);  
  yaxisholder[ctype].call(d3.axisLeft(newY));
  glines[ctype].attr("transform", t);
  yaxisholder[ctype].selectAll("text")     
  .style("font-size", "6px"); 
  xaxisholder[ctype].attr("transform", d3.zoomIdentity.translate(t.x, Height[ctype]-marginbottom[ctype]).scale(t.k));
  xaxisholder[ctype].selectAll("text")
    .attr("transform",d3.zoomIdentity.scale(1/t.k))
    .selectAll("text")
    .style("font-size", "6px");
  xaxisholder[ctype].selectAll("line")
    .attr("transform",d3.zoomIdentity.scale(1/t.k)) 
    .attr("stroke-width",1/t.k)
}



const HistogramMap = () => {
  const { selectedButton } = useButtonContext();
  const { selectedUserName } = useUserContext();

  const chartRefMonth = useRef();
  const chartRefWeek = useRef();
  const [selectedCondition, setSelectedCondition] = useState('Total');
  const [aggregatedData, setAggregatedData] = useState([]);
  const [aggregatedDataWeek, setAggregatedDataWeek] = useState([]);


  useEffect(() => {
    if (selectedUserName === 'noUser') {
      setAggregatedData(aggregateDataByMonth(HistogramData));
    } else {
      const filteredHistogramData = UserHistogramData.filter((entry) => entry.username === selectedUserName);
      setAggregatedData(aggregateUserDataByMonth(filteredHistogramData));
    }
    setAggregatedDataWeek(aggregateDataByMonth(HistogramDataWeek));
  }, [selectedUserName, selectedButton]);



  useEffect(() => {
    if (!aggregatedData.length) return;

    const totalWidth = 520 - 60;
    const height = 132;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;
    Height["month"] = height;
    margintop["month"] = marginTop;
    marginbottom["month"] = marginBottom;    
    svg["month"] = d3.select(chartRefMonth.current);
    svg["month"].selectAll('*').remove();

    drawChart(svg["month"], aggregatedData, totalWidth, height, marginLeft, marginRight, marginTop, marginBottom, selectedButton, "#679EC5","month");
  }, [aggregatedData, selectedButton, selectedUserName]);

  const resetChart = () =>{
    let dtype = "month";
    glines[dtype].attr("transform", d3.zoomIdentity);
    yaxisholder[dtype].call(d3.axisLeft(yScale[ctype])); 
    yaxisholder[dtype].selectAll("text")     
    .style("font-size", "6px");     
    xaxisholder[dtype].attr("transform", d3.zoomIdentity.translate(0, Height[ctype]-marginbottom[ctype]).scale(1));
    xaxisholder[dtype].selectAll("text")
      .attr("transform",d3.zoomIdentity.scale(1))
      .selectAll("text")
      .style("font-size", "6px");
    xaxisholder[dtype].selectAll("line")
      .attr("transform",d3.zoomIdentity.scale(1)) 
      .attr("stroke-width",1)    
    dtype = "week";
    glines[dtype].attr("transform", d3.zoomIdentity);
    yaxisholder[dtype].call(d3.axisLeft(yScale[ctype])); 
    yaxisholder[dtype].selectAll("text")     
    .style("font-size", "6px");     
    xaxisholder[dtype].attr("transform", d3.zoomIdentity.translate(0, Height[ctype]-marginbottom[ctype]).scale(1));
    xaxisholder[dtype].selectAll("text")
      .attr("transform",d3.zoomIdentity.scale(1))
      .selectAll("text")
      .style("font-size", "6px");
    xaxisholder[dtype].selectAll("line")
      .attr("transform",d3.zoomIdentity.scale(1)) 
      .attr("stroke-width",1)        
  }

  useEffect(() => {
    if (!aggregatedDataWeek.length) return;


    const totalWidth = 520 - 60;
    const height = 132;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;
    Height["week"] = height;
    margintop["week"] = marginTop;
    marginbottom["week"] = marginBottom;    
    svg["week"] = d3.select(chartRefWeek.current);
    svg["week"].selectAll('*').remove();

    drawChart(svg["week"], aggregatedDataWeek, totalWidth, height, marginLeft, marginRight, marginTop, marginBottom, selectedButton, "#FCB65E","week");
  }, [aggregatedDataWeek, selectedButton, selectedUserName]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
       <div style={{ top: 8, left: 8, zIndex: 99999 }}>
         <button style = {{fontSize:"8px"}} onClick={() => resetChart()}>Reset</button>
       </div>   
       <div style = {{display:"flex"}}>   
          <div style = {{paddingLeft:"10px",width:"50px",fontSize:"12px",fontWeight:"bolder",textAlign:"center",marginTop:"auto",marginBottom:"auto",color:`${linecolor["month"]}`}}>Monthly Analysis</div><svg ref={chartRefMonth}></svg>
       </div>   
       <div style = {{display:"flex"}}>
          <div style = {{paddingLeft:"10px",width:"50px",fontSize:"12px",fontWeight:"bolder",textAlign:"center",marginTop:"auto",marginBottom:"auto",color:`${linecolor["week"]}`}}>Weekly Analysis</div><svg ref={chartRefWeek}></svg>
       </div>   
    </div>
  );
};

export default HistogramMap;