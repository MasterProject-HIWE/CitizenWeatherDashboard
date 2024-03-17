import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {changeVisibility, deleteEvent} from "../../shared/features/ComparisonSlice";
import {setSelection} from "../../shared/features/SavingsSlice";
import {resetPlayer} from "../../shared/features/PlayerSlice";
import {getIcon} from "../../shared/functions/WeatherIcons";
import Histogram from "./Histogram";
import DeleteDialog from "./DeleteDialog";
import {styled} from "@mui/material/styles";
import {ImageButton, StyledButton} from "../../../static/style/muiStyling";
import Hide from "../../../static/images/hide.png";
import Show from "../../../static/images/show.png";
import Delete from "../../../static/images/delete.png";

const LocalStyledButton = styled(StyledButton)({
    width: "94px",
    marginTop: "0px",
    fontSize: "12px",
    padding: "3px 0px",
    "&:disabled": {
        border: "2px solid #8080807a"
    }
})

const HistogramBox = ({dimensions, id}) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [event,
        data,
        categories,
        name,
        color,
        hidden
    ] = useSelector(state => {
        const event = state.comparison.events.find(e => e.info.id === id)
        return [event,
            event.data,
            [...new Set(event.data.map(e => e.category))],
            event.info.name,
            event.info.color,
            event.hidden
        ]})

    const [openDelete, setOpen] = useState(false)

    const setVisibility = (hide) => {
        dispatch(changeVisibility(id, hide))
        dispatch(resetPlayer())
    }

    const editEvent = () => {
        dispatch(setSelection(event))
        dispatch(resetPlayer())
        navigate(`/selection`)
    }

    const deleteId = () => setOpen(true)

    const handleClose = (deleteConfirmed) => {
        setOpen(false)
        if (deleteConfirmed) {
            dispatch(deleteEvent(id))
            dispatch(resetPlayer())
        }
    }

    return (
            <div className={"histogramBox"}>
                <div className="histogramComparisonContent">
                    <div className={"histogramTop"}>
                        <div className={"histogramTitle"}>
                            {categories.map(e => (
                                <div key={e} className={"iconBox"} style={{backgroundColor: color}}>
                                    <img src={getIcon(e)} alt={e} width={18}/>
                                </div>
                            ))}
                            <p style={{marginTop: "0px"}}>{name} - Total reports: {data.length}</p>
                        </div>
                        <div className={"histogramComparisonButtons"}>
                            <LocalStyledButton onClick={editEvent} disabled={hidden}>Edit event</LocalStyledButton>
                            <div hidden={hidden}>
                                <ImageButton onClick={() => setVisibility(true)}>
                                    <img src={Hide} width={18} alt={"hide"}/>
                                </ImageButton>
                            </div >
                            <div hidden={!hidden}>
                                <ImageButton onClick={() => setVisibility(false)}>
                                    <img src={Show} width={18} alt={"show"}/>
                                </ImageButton>
                            </div>
                            <ImageButton onClick={deleteId}>
                                <img src={Delete} width={18} alt={"delete"}/>
                            </ImageButton>
                            <DeleteDialog
                                open={openDelete}
                                name={name}
                                onClose={handleClose}
                            />
                        </div>
                    </div>
                    {!hidden &&
                        <Histogram
                            id={id}
                            dimensions={dimensions}
                        />
                    }
                    {hidden &&
                        <div style={{height: "3px"}}/>
                    }
                </div>
            </div>
        )
}

export default HistogramBox;
