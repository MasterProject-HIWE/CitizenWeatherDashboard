import {useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {getCategoryName, getIntensityName, getIntensityValue} from "../../functions/WeatherCategories";
import {StyledPopup} from "../../../../static/style/muiStyling";

const arrangeIntensityInfo = (array) => {
    const groupByCategory = array.reduce((group, el) => {
        const {category} = el
        group[category] = group[category] ?? []
        group[category].push(el)
        return group
    }, {})
    return Object.entries(groupByCategory).map(e => {
        const groupByIntensity = e[1].reduce((group, el) => {
            const {auspraegung} = el
            group[auspraegung] = group[auspraegung] ?? []
            group[auspraegung].push(el)
            return group
        }, {})
        let intensities = Object.entries(groupByIntensity).map(i => {
            return {intensity: i[0], intensityId: getIntensityValue(e[0], i[0]), count: i[1].length}
        })
        intensities.sort((a, b) => a.intensityId-b.intensityId)
        const totalCount = intensities.map(e => e.count).reduce((a, b) => {return a + b}, 0)
        return {category: e[0], count: totalCount, intensities: intensities}
    })
}

export const MultiMarkerPopup = ({data, isCluster, position}) => {

    const [focusedIntensityInfo, setFocusedIntensityInfo] = useState([])
    const [unfocusedIntensityInfo, setUnfocusedIntensityInfo] = useState([])

    useEffect(() => {
        if (isCluster === undefined) {
            setFocusedIntensityInfo(arrangeIntensityInfo(data.focused))
            setUnfocusedIntensityInfo(arrangeIntensityInfo(data.unfocused))
        } else {
            setFocusedIntensityInfo(arrangeIntensityInfo(data))
            setUnfocusedIntensityInfo([])
        }
    }, [isCluster, data])

    return <StyledPopup position={position}>
        <div className={"multiPopup"}>
        {focusedIntensityInfo.map(c => (
            <React.Fragment key={c.category}>
                <p>{getCategoryName(c.category)}: </p>
                <div>
                    {c.intensities.map(i => <p key={i.intensity}>{getIntensityName(c.category, i.intensity)}:</p>)}
                </div>
                <div style={{alignItems: "flex-end"}}>
                    {c.intensities.map(i => <p key={i.intensity}>{i.count}</p>)}
                </div>
            </React.Fragment>
        ))}
        {unfocusedIntensityInfo.map(c => (
            <React.Fragment key={c.category}>
                <p style={{opacity: "0.5"}}>{getCategoryName(c.category)}: </p>
                <div style={{opacity: "0.5"}}>
                    {c.intensities.map(i => <p key={i.intensity}>{getIntensityName(c.category, i.intensity)}:</p>)}
                </div>
                <div style={{alignItems: "flex-end", opacity: "0.5"}}>
                    {c.intensities.map(i => <p key={i.intensity}>{i.count}</p>)}
                </div>
            </React.Fragment>
        ))}
        </div>
    </StyledPopup>
}

export const MultiMarkerEventPopup = ({data, isCluster, position}) => {
    const events = useSelector(state => state.comparison.events)

    let focusedIntensityInfo, unfocusedIntensityInfo, popupInfo

    if (isCluster === undefined) {
        const groupByEventFocused = data.focused.reduce((group, el) => {
            const {eventId} = el
            group[eventId] = group[eventId] ?? []
            group[eventId].push(el)
            return group
        }, {})
        const groupByEventUnfocused = data.unfocused.reduce((group, el) => {
            const {eventId} = el
            group[eventId] = group[eventId] ?? []
            group[eventId].push(el)
            return group
        }, {})

        popupInfo = events.filter(e => groupByEventFocused[e.info.id]!==undefined || groupByEventUnfocused[e.info.id]!==undefined)
            .map(e => {
                const id = e.info.id
                focusedIntensityInfo = groupByEventFocused[id]!==undefined ? arrangeIntensityInfo(groupByEventFocused[id]): []
                unfocusedIntensityInfo = groupByEventUnfocused[id]!==undefined ? arrangeIntensityInfo(groupByEventUnfocused[id]): []
                return [e.info.color, e.info.name, focusedIntensityInfo, unfocusedIntensityInfo]
            })
    } else {
        const groupByEvent = data.reduce((group, el) => {
            const {eventId} = el
            group[eventId] = group[eventId] ?? []
            group[eventId].push(el)
            return group
        }, {})

        popupInfo = events.map(e => e.info.id).filter(e => groupByEvent[e]!==undefined)
            .map(e => {
                focusedIntensityInfo = groupByEvent[e]!==undefined ? arrangeIntensityInfo(groupByEvent[e]): []
                unfocusedIntensityInfo = []
                return [e.info.color, e.info.name, focusedIntensityInfo, unfocusedIntensityInfo]
            })
    }

    return <StyledPopup position={position} sx={{width: "auto"}}>
        <div className={"multiEventPopup"}>
        {popupInfo.map(e => (
            <React.Fragment key={e[1]}>
                {e[2].map(c => (
                    <React.Fragment key={c.category}>
                        <div style={{flexDirection: "row"}}>
                            <span className={'dot'} style={{backgroundColor: e[0]}}/>
                            <p>{e[1]}: </p>
                        </div>
                        <p>{getCategoryName(c.category)} ({c.count}): </p>
                        <div>
                            {c.intensities.map(i => <p key={i.intensity}>{getIntensityName(c.category, i.intensity)} ({i.count})</p>)}
                        </div>
                    </React.Fragment>
                ))}
                {e[3].map(c => (
                    <React.Fragment key={c.category}>
                        <p style={{opacity: "0.5"}}>{getCategoryName(c.category)}: </p>
                        <div style={{opacity: "0.5"}}>
                            {c.intensities.map(i => <p key={i.intensity}>{getIntensityName(c.category, i.intensity)}:</p>)}
                        </div >
                        <div style={{alignItems: "flex-end", opacity: "0.5"}}>
                            {c.intensities.map(i => <p key={i.intensity}>{i.count}</p>)}
                        </div>
                    </React.Fragment>
                ))}
            </React.Fragment>
        ))}
        </div>
    </StyledPopup>
}
