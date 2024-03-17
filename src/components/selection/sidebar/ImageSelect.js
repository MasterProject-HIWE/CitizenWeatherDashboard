import {useDispatch, useSelector} from "react-redux";
import {changeFilter, setCurrent} from "../../shared/features/SavingsSlice";
import {RadioGroup} from "@mui/material";
import {
    StyledFormControl,
    StyledFormControlLabel,
    StyledRadio
} from "../../../static/style/muiStyling";

export default function ImageSelect() {
    const dispatch = useDispatch()

    const images = useSelector(state => state.savings.current.images)

    const handleChange = (event) => {
        const val = event.target.value
        dispatch(setCurrent({name: "images", value: val}))
        switch (val) {
            case "with":
                dispatch(changeFilter([{type: "add", filter: [{"imageUrl": {'$ne': null}}, {"timesReportedForImage": {'$lt': 1}}]}, {type: "remove", filter: ["$or"]}]))
                break
            case "without":
                dispatch(changeFilter([{type: "add", filter: [{"$or": [{"properties.imageUrl": null}, {"properties.timesReportedForImage": {'$gt': 1}}]}]}, {type: "remove", filter: ["timesReportedForImage", "imageUrl"]}]))
                break
            default:
                dispatch(changeFilter([{type: "remove", filter: ["imageUrl", "timesReportedForImage", "$or"]}]))
        }
    }

    return (
        <div>
            <p>Containing Images</p>
            <StyledFormControl>
                <RadioGroup
                    aria-labelledby="image-group-label"
                    value={images}
                    onChange={handleChange}
                    name="image-group"
                >
                    <StyledFormControlLabel
                        value="all"
                        control={<StyledRadio />}
                        label="With & without pictures" />
                    <StyledFormControlLabel
                        value="with"
                        control={<StyledRadio />}
                        label="With pictures" />
                    <StyledFormControlLabel
                        value="without"
                        control={<StyledRadio />}
                        label="Without pictures" />
                </RadioGroup>
            </StyledFormControl>
        </div>
    )
}
