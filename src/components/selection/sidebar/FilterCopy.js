import {useDispatch, useSelector} from "react-redux";
import {setCopy} from "../../shared/features/SavingsSlice";
import {LinkButton} from "../../../static/style/muiStyling";
import {useEffect, useState} from "react";

const FilterCopy = () => {
    const dispatch = useDispatch()

    const events = useSelector(state => state.comparison.events)

    const id = useSelector(state => state.savings.current.id)

    const [otherEvents, setOtherEvents] = useState([])

    useEffect(() => {
        setOtherEvents(events.filter(e => e.info.id !== id))
    }, [events, id])

    const copyFilters = (event) => dispatch(setCopy(event))

    if (otherEvents.length === 0) return null

    return <div className={"filterCopyContainer"}>
        <p>Copy filters from event:</p>
        {otherEvents.map(e => (
            <LinkButton
                key={e.info.id}
                onClick={() => copyFilters(e)}
            >
                {e.info.name}
            </LinkButton>
        ))}
    </div>
}

export default FilterCopy;
