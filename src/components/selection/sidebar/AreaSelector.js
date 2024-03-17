import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {setCurrent, changeFilter} from "../../shared/features/SavingsSlice";
import locations from "../../../static/data/PLZO_CSV_WGS84.json";
import {Autocomplete, FormGroup, RadioGroup} from "@mui/material";
import {styled} from "@mui/material/styles";
import {
    StyledFormControl,
    StyledFormControlLabel,
    StyledRadio,
    StyledTextField
} from "../../../static/style/muiStyling";

const StyledAutocomplete = styled(Autocomplete)({
    width: "100%",
    '& .MuiAutocomplete-tag': {
        color: "black"
    },
    "& .Mui-disabled": {
        cursor: "pointer",
    }
})

const placeList = locations.map(entry => {
    if (entry["Kantonskürzel"] === "") {
        return {place: entry["Ortschaftsname"], canton: "FL"}
    } else {
        return {place: entry["Ortschaftsname"], canton: entry["Kantonskürzel"]}
    }
})
let placeOptions = []
placeList.filter((item) => {
    let i = placeOptions.findIndex(x => (x.place === item.place && x.canton === item.canton))
    if (i <= -1) placeOptions.push(item)
    return null
})
placeOptions.sort((a, b) => -b.canton.localeCompare(a.canton) || -b.place.localeCompare(a.place))

const cantonList = locations.map(entry => entry["Kantonskürzel"])
cantonList.push("FL")
const cantonOptions = [...new Set(cantonList)]
cantonOptions.sort()

const swissPlaces = locations
    .filter(e => e["Kantonskürzel"] !== "")
    .map(e => e["Ortschaftsname"])

export default function AreaSelector() {
    const dispatch = useDispatch()

    const [dimension,
        locElements
    ] = useSelector(state => {
        const area = state.savings.current.area
        return [area.dimension,
            area.entries
        ]
    })

    const [cantonValue, setCantonValue] = useState([])

    useEffect(() => {
        setCantonValue(dimension === "cantons" ? locElements : [])
    }, [dimension, locElements])

    const handleClick = (val) => {
        switch (val) {
            case "cantons":
                dispatch(setCurrent({name: "area", value: {dimension: val, entries: []}}))
                break
            case "places":
                dispatch(setCurrent({name: "area", value: {dimension: val, entries: []}}))
                break
            case "allSwitzerland":
                const filter = {"place":  {'$in': swissPlaces}}
                dispatch(changeFilter([{type: "add", filter: [filter]}]))
                dispatch(setCurrent({name: "area", value: {dimension: val, entries: []}}))
                break
            default:
                dispatch(changeFilter([{type: "remove", filter: ["place"]}]))
                dispatch(setCurrent({name: "area", value: {dimension: val, entries: []}}))
        }
    }

    const handleFieldClick = (val) => {
        if (dimension !== val) handleClick(val)
    }

    const handleRadioChange = (event) => handleClick(event.target.value)

    const handleTextChange = (val) => {
        switch (dimension) {
            case "cantons":
                const placeFilterList = val.map(canton => {
                    return locations
                        .filter(entry => {return entry["Kantonskürzel"] === canton})
                        .map(entry => {return entry["Ortschaftsname"]})
                }).flat()
                const cantonFilter = {"place":  {'$in': placeFilterList}}
                dispatch(changeFilter([{type: "add", filter: [cantonFilter]}]))
                dispatch(setCurrent({name: "area", value: {dimension: "cantons", entries: val}}))
                break
            case "places":
                const placeFilter = {"place":  {'$in': val.map(e => e.place)}}
                dispatch(changeFilter([{type: "add", filter: [placeFilter]}]))
                dispatch(setCurrent({name: "area", value: {dimension: "places", entries: val}}))
                break
            default:
        }
    }

    return (
        <div>
            <p>Area</p>
                <StyledFormControl>
                    <RadioGroup
                        aria-labelledby="area-group-label"
                        value={dimension}
                        onChange={handleRadioChange}
                        name="area-group"
                    >
                        <StyledFormControlLabel
                            value="all"
                            control={<StyledRadio />}
                            label="Everywhere" />
                        <StyledFormControlLabel
                            value="allSwitzerland"
                            control={<StyledRadio />}
                            label="All Switzerland" />
                        <FormGroup>
                            <StyledFormControlLabel
                                onClick={() => handleFieldClick("cantons")}
                                value="cantons"
                                control={<StyledRadio />}
                                label={
                                    <StyledAutocomplete
                                        disabled={dimension !== 'cantons'}
                                        multiple
                                        id="tags-outlined"
                                        options={cantonOptions}
                                        size="small"
                                        value={cantonValue}
                                        disableClearable
                                        renderInput={(params) => (
                                            <StyledTextField
                                                {...params}
                                                label="Cantons"
                                                placeholder="Add"
                                            />
                                        )}
                                        onChange={(event: any, newValue: string | null) => {
                                            handleTextChange(newValue);
                                        }}
                                    />
                                } />
                        </FormGroup>
                        <FormGroup>
                            <StyledFormControlLabel
                                onClick={() => handleFieldClick("places")}
                                value="places"
                                control={<StyledRadio />}
                                label={
                                    <StyledAutocomplete
                                        // todo: work with given value
                                        disabled={dimension !== 'places'}
                                        multiple
                                        id="tags-outlined"
                                        // value={placeValue}
                                        options={placeOptions}
                                        groupBy={(option) => option.canton}
                                        getOptionLabel={(option) => option.place}
                                        isOptionEqualToValue={(option, value) => option.place === value.place && option.canton === value.canton}
                                        size="small"
                                        disableClearable
                                        renderInput={(params) => (
                                            <StyledTextField
                                                {...params}
                                                label="Places"
                                                placeholder="Add"
                                            />
                                        )}
                                        onChange={(event: any, newValue: string | null) => {
                                            handleTextChange(newValue);
                                        }}
                                    />
                            } />
                        </FormGroup>
                    </RadioGroup>
                </StyledFormControl>
        </div>
    )
}
