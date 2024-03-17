import React, { useEffect, useState } from 'react';
import TableOfDetails from './tableofdetails.json';
import { useButtonContext } from '../ButtonContext/ButtonContext';
import { useUserContext } from '../UserContext/UserContext';

const WeatherDataTable = () => {
    const [filteredData, setFilteredData] = useState(TableOfDetails);
    const { selectedButton } = useButtonContext();
    const { selectedUserName } = useUserContext();

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

    return (
        <>
            <div style={{padding: '4px'}}>
                <h1 className='cell-header'>User data</h1>
                <table id="table-of-details">
                    <thead>
                        <tr style={{ position: 'sticky', top: 0 }}>
                            {/* <th>SL</th> */}
                            <th>Username</th>
                            {/* <th>Cantons</th> */}
                            <th>Municipality</th>
                            <th>Severity</th>
                            {/* <th>Timestamp</th> */}
                            <th>Starttime</th>
                            <th>Endtime</th>
                            <th>Post</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.sl}>
                                {/* <td>{item.sl}</td> */}
                                <td>{item.username}</td>
                                {/* <td>{item.cantons}</td> */}
                                <td>{item.municipality}</td>
                                <td>{item.severity}</td>
                                {/* <td>{item.timestamp}</td> */}
                                <td>{item.starttime}</td>
                                <td>{item.endtime}</td>
                                <td className="truncate-text" style={{ textAlign: 'left', }}>{item.posts}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default WeatherDataTable;
