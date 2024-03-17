import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import { changeFilter, setCurrent } from "../../shared/features/SavingsSlice";
import { getIcon } from "../../shared/functions/WeatherIcons";
import { styled } from "@mui/material/styles";
import { Chip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { StyledSlider, StyledTooltip } from "../../../static/style/muiStyling";
// import { Tooltip } from 'react-tooltip'
import weather_categories from "../../../static/data/weather_categories.json"

const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "no-wrap",
    gap: "4px",
    marginBottom: "18px",
    position: "absolute",
    marginTop: "22px",
    marginLeft: "22px",
    zIndex: "99",
    '& .MuiToggleButtonGroup-grouped': {
        '&:not(:first-of-type)': {
            // border: "var(--border-bg-color) solid 2px",
            borderRadius: "4px",
            "&.Mui-selected": {
                // border: "var(--border-bg-color) solid 2px !important",
                color: "black"
            },
        },
        '&:first-of-type': {
            // border: "var(--border-bg-color) solid 2px",
            borderRadius: "4px",
            marginLeft: "0",
            "&.Mui-selected": {
                // border: "var(--border-bg-color) solid 2px",
                color: "black"
            },
        },
    },
})

const StyledToggleButton = styled(ToggleButton)({
    // border: "none",
    borderTop: "3px solid #FFFF00",
    width: "32px",
    height: "28px",
    margin: "0px",
    padding: "4px",
    color: "black",
    fontSize: "0.74em",
    lineHeight: "18px",
    backgroundColor: "#1C2834",
    boxShadow: "4px 4px 22px 0px rgb(0,0,0,0.5)",
    "&.Mui-selected": {
        backgroundColor: "#46596B",
        color: "black"
    },
    "&.Mui-selected:hover": {
        backgroundColor: "#2F4356",
        boxShadow: "1px 1px var(--shadow-bg-color)"
    },
    "&:hover": {
        backgroundColor: "#2F4356",
        boxShadow: "1px 1px var(--border-bg-color)"
    }
})

const StyledRangeSlider = styled(StyledSlider)({
    width: "90%",
    "& .MuiSlider-rail": {
        width: "103.7%",
        left: "-1%"
    },
    "& .MuiSlider-mark": {
        height: "6px",
        width: "6px",
        borderRadius: "3px"
    },
    "& .MuiSlider-markLabel": {
        fontSize: "0.75rem",
        width: "min-content",
        whiteSpace: "inherit",
        textAlign: "center",
        minWidth: "60px"
    }
})

const StyledManyRangeSlider = styled(StyledRangeSlider)({
    marginTop: "15px",
    "& .MuiSlider-markLabel": {
        '&[data-index="1"]': {
            bottom: "30px",
            top: "auto"
        },
        '&[data-index="3"]': {
            bottom: "30px",
            top: "auto"
        },
        '&[data-index="5"]': {
            bottom: "30px",
            top: "auto"
        },
        '&[data-index="7"]': {
            bottom: "30px",
            top: "auto"
        },
    }
})

const CategorySelectorHorizontal = () => {
    const dispatch = useDispatch()

    const [categories,
        intensities
    ] = useSelector(state => {
        const current = state.savings.current
        console.log(current.category)
        return [current.category,
        current.intensity
        ]
    })

    // console.log(categories)

    const isSelected = (value) => {
        return categories.includes(value)
    }


    const handleChange = (event, categoryList) => {
        if (categoryList.length < categories.length) {
            const removedElement = $(categories).not(categoryList).get()[0]
            const entryIndex = intensities.length > 0 ? intensities.findIndex(e => e.category === removedElement) : -1
            if (entryIndex !== -1) {
                let locIntensities = [...intensities]
                locIntensities.splice(entryIndex, 1)
                dispatch(setCurrent({ name: "intensity", value: locIntensities }))
                locIntensities.length === 0 ? dispatch(changeFilter([{ type: "add", filter: [{ "category": { '$in': categoryList } }] }, { type: "remove", filter: ["auspraegung"] }])) :
                    dispatch(changeFilter([{ type: "add", filter: [{ "auspraegung": { '$in': configureFilter(locIntensities) } }, { "category": { '$in': categoryList } }] }]))
            } else {
                dispatch(changeFilter([{ type: "add", filter: [{ "category": { '$in': categoryList } }] }]))
            }
        } else {
            dispatch(changeFilter([{ type: "add", filter: [{ "category": { '$in': categoryList } }] }]))
        }
        dispatch(setCurrent({ name: "category", value: categoryList }))
    }

    const getIntensityValue = (category, max) => {
        const intensityEntry = intensities.length > 0 ?
            intensities.find(e => e.category === category) : undefined
        if (intensityEntry !== undefined) {
            return intensityEntry.value
        } else {
            return [0, max]
        }
    }

    const configureFilter = (list) => {
        return list.map(le => {
            return weather_categories
                .find(e => e.category === le.category).intensity
                .slice(le.value[0], le.value[1] + 1)
                .map(e => e.name)
        }).flat()
    }

    const handleSliderChange = (event, max) => {
        const cat = event.name
        const val = event.value
        const entryIndex = intensities.length > 0 ? intensities.findIndex(e => e.category === cat) : -1

        if ((entryIndex === -1 && !(val[0] === 0 && val[1] === max)) ||
            (entryIndex !== -1 && !(val[0] === intensities[entryIndex].value[0] && val[1] === intensities[entryIndex].value[1]))) {
            let locIntensities = [...intensities]
            if (entryIndex !== -1) locIntensities.splice(entryIndex, 1)
            if (!(val[0] === 0 && val[1] === max)) locIntensities.push({ category: cat, value: val })
            dispatch(setCurrent({ name: "intensity", value: locIntensities }))
            locIntensities.length === 0 ? dispatch(changeFilter([{ type: "remove", filter: ["auspraegung"] }])) :
                dispatch(changeFilter([{ type: "add", filter: [{ "auspraegung": { '$in': configureFilter(locIntensities) } }] }]))
        }
    }

    const getSlider = () => {
        // return categories.map(category => {
        //     const categoryInfos = weather_categories.find(e2 => e2.category === category)

        //     const maxValue = categoryInfos.intensity.length - 1

        //     const bottomMargin = ["HAGEL", "REGEN", "SCHNEEDECKE"].includes(categoryInfos.category) ?
        //         { marginBottom: "20px" } : { marginBottom: "35px" }

        //     if (maxValue < 5) {
        //         const marks = categoryInfos.intensity.map(e => {
        //             return {
        //                 value: e.value,
        //                 label:
        //                     <StyledTooltip title={e.enLong}>
        //                         <p className={"tooltipbase"}>{e.en}</p>
        //                     </StyledTooltip>
        //             }
        //         })

        //         return <div className="categorySlider" key={categoryInfos.category}>
        //             <p>{categoryInfos.intensity_Name.en} ({categoryInfos.en})</p>
        //             <StyledRangeSlider
        //                 valueLabelDisplay="off"
        //                 name={categoryInfos.category}
        //                 step={1}
        //                 marks={marks}
        //                 min={0}
        //                 max={maxValue}
        //                 sx={bottomMargin}
        //                 value={getIntensityValue(categoryInfos.category, maxValue)}
        //                 onChange={e => handleSliderChange(e.target, maxValue)}
        //             />
        //         </div>
        //     } else {
        //         const marks = categoryInfos.intensity.map(e => {
        //             if (e.value % 2 === 0) {
        //                 return {
        //                     value: e.value,
        //                     label:
        //                         <StyledTooltip title={e.enLong}>
        //                             <p className={"tooltipbase"}>{e.en}</p>
        //                         </StyledTooltip>
        //                 }
        //             } else {
        //                 return {
        //                     value: e.value,
        //                     label:
        //                         <StyledTooltip title={e.enLong} placement="top">
        //                             <p className={"tooltipbase"}>{e.en}</p>
        //                         </StyledTooltip>
        //                 }
        //             }
        //         })

        //         return <div className="categorySlider" key={categoryInfos.category}>
        //             <p>{categoryInfos.intensity_Name.en} ({categoryInfos.en})</p>
        //             <StyledManyRangeSlider
        //                 valueLabelDisplay="off"
        //                 name={categoryInfos.category}
        //                 step={1}
        //                 marks={marks}
        //                 min={0}
        //                 max={maxValue}
        //                 sx={bottomMargin}
        //                 value={getIntensityValue(categoryInfos.category, maxValue)}
        //                 onChange={e => handleSliderChange(e.target, maxValue)}
        //             />
        //         </div>
        //     }
        // })
    }

    const getCategoryInfo = () => {
        return (
            <div className="hazardNamesOnClick">
                {categories.map(category => {
                    return (
                        <Chip style={{ fontSize: '28', color: 'white', border: '1px solid white', borderRadius: '4px' }} label={category} />
                    )
                })}
            </div>
        )
    }

    const getCategoryBorderColor = (category) => {
        switch (category) {
            case 'BLITZE':
                return '#FF9900';
            case 'WIND':
                return '#FF9900';
            case 'TORNADO':
                return 'gray';
            default:
                return '#CCFF66';
        }
    };

    const getCategoryTooltipTitle = (category) => {
        switch (category) {
            case 'BLITZE':
                return 'Blitze: Considerable danger';
            case 'WIND':
                return 'Wind: Considerable danger';
            case 'TORNADO':
                return 'Tornado: No danger level';
            default:
                return category + ': No or minor danger';
        }
    }

    return (
        <div>
            <StyledToggleButtonGroup
                color="primary"
                value={categories}
                onChange={handleChange}
            >
                {weather_categories
                    .sort((a, b) => {
                        const order = [];
                        return order.indexOf(a.category) - order.indexOf(b.category);
                    })
                    .map((e) => (
                        <StyledTooltip key={e.category} title={getCategoryTooltipTitle(`${e.en}`)} arrow placement="top">
                            <StyledToggleButton
                                key={e.category}
                                className="typeButton"
                                value={e.category}
                                style={{ borderTopColor: getCategoryBorderColor(e.category) }}
                                selected={isSelected(e.category)}
                            >
                                <img src={getIcon(e.category)} alt={e.en} />
                                {/* {e.en} */}
                            </StyledToggleButton>
                        </StyledTooltip>
                    ))},
            </StyledToggleButtonGroup>
            {getCategoryInfo()}
            {/* {getSlider()} */}
        </div>
    );
}

export default CategorySelectorHorizontal;
