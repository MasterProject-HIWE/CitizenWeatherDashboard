import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import centrality_measures from "../centrality_measures.json";

const UserGraphBar = ({ className, style, setValue }) => {

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    function getMinMax(centrality_measures) {
        const values = centrality_measures.map(item => item["degree"]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { min, max };
    }

    const centralityMax = getMinMax(centrality_measures)["max"]
    const centralityMin = getMinMax(centrality_measures)["min"]


    return (
        <div className={className} style={style}>
            <Box sx={{ height: 220 }}>
                <Slider
                    onChange={handleChange}
                    valueLabelDisplay="auto"
                    orientation="vertical"
                    defaultValue={0.255} step={0.001} marks min={0.005} max={0.5}
                    sx={{
                        background: 'linear-gradient(180deg, rgba(241,223,45,1) 0%, rgba(181,221,43,1) 10%, rgba(135,211,73,1) 20%, rgba(106,204,92,1) 30%, rgba(50,181,122,1) 40%, rgba(40,126,143,1) 50%, rgba(50,99,142,1) 60%, rgba(66,67,132,1) 70%, rgba(73,28,111,1) 80%, rgba(71,3,87,1) 100%)',
                        padding: '0 4px !important',
                        width: 0,
                        border: '1px solid #5b6f2a',
                        borderRadius: 12,
                        "& .MuiSlider-thumb": {
                            height: 18,
                            width: 18,
                            backgroundColor: '#FFF',
                            border: '2px solid #52af77',
                        },
                    }}
                />
            </Box>
        </div>
    );
};

export default UserGraphBar;
