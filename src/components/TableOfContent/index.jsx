import React, { useEffect, useState } from 'react';
import TableOfDetails from './tableofdetails.json';
import { useButtonContext } from '../ButtonContext/ButtonContext';
import { useUserContext } from '../UserContext/UserContext';
import { useKantonContext } from '../KantonContext/KantonContext';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const WeatherDataTable = () => {
    const [ filteredData, setFilteredData] = useState(TableOfDetails);
    const { selectedButton } = useButtonContext();
    const { selectedUserName } = useUserContext();
    const { selectedKantonName } = useKantonContext();
    const [ tableData, setTableData ] = useState({columnDefs:[],rowData:[]});


    useEffect(()=>{
        const ndata = {
            columnDefs: [
             {headerName: 'UserName', field: 'username',width:100},
             {headerName: 'Municipality', field: 'municipality',filter: true,width:100},
             {headerName: 'Cantons', field: 'cantons',width:100},
             {headerName: 'Severity', field: 'severity' ,filter: "agSetColumnFilter",width:100},        
             {headerName: 'Start Time', field: 'starttime' ,filter: "agSetColumnFilter",width:100},        
             {headerName: 'End Time', field: 'endtime' , filter: "agSetColumnFilter",width:100},           
             {headerName: 'Post', field: 'posts' , filter: "agSetColumnFilter",width:100},           
         ],
         rowData:filteredData}        
        setTableData(ndata);
    },[filteredData,setTableData]);

    useEffect(() => {
        if (selectedButton === 'Total' && selectedUserName === 'noUser') {
            // Show all rows when selectedButton is 'Total' and selectedUserName is 'noUser'
            setFilteredData(TableOfDetails);
        } else if (selectedButton === 'Total') {
            // Filter rows based on selectedUserName when selectedButton is 'Total'
            const newData = TableOfDetails.filter(item => item.username === selectedUserName);
            setFilteredData(newData);
        } else if (selectedUserName === 'noUser') {
            // Filter rows based on selectedButton when selectedUserName is 'noUser'
            const newData = TableOfDetails.filter(item => item.category === selectedButton && item.category !== 0);
            setFilteredData(newData);
        } else {
            // Filter rows based on both selectedButton and selectedUserName
            const newData = TableOfDetails.filter(item => item.username === selectedUserName && item.category === selectedButton && item.category !== 0);
            setFilteredData(newData);
        }
    }, [selectedButton, selectedUserName]);

    useEffect(()=>{
        console.log(selectedKantonName);
        if (selectedKantonName){
            const newData = TableOfDetails.filter(item => item.cantons.toUpperCase() === selectedKantonName.toUpperCase());
            setFilteredData(newData);
        }    
    },[selectedKantonName]);

    return (
        <>
            <div style={{padding: '4px'}}>
                <h1 className='cell-header'>User data</h1>
                <div id="table-of-details" style={{overflow:"hidden !important",backgroundColor:"#fff",width:"400px", height:"500px"}}>
                  <div className="ag-theme-alpine" style={{overflow:"hidden", width:"100%", height: "100%" }}>
                     <AgGridReact  headerClass="header" gridOptions={{ rowHeight: 15,headerHeight: 30,suppressResize: true }} style={{ width:"100%", height: "100%" }} rowData={tableData.rowData} columnDefs={tableData.columnDefs} suppressMenuHide ={true}/>
                  </div>
 >              </div>                
            </div>
        </>
    );
};

export default WeatherDataTable;
