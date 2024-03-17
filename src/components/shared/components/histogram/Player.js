import {useDispatch, useSelector} from "react-redux";
import {moveToStep, pause, playFromStart, resume, stop} from "../../features/PlayerSlice";
import {ImageButton} from "../../../../static/style/muiStyling";
import Pause from "../../../../static/images/pause.png";
import Play from "../../../../static/images/play.png";
import Rewind from "../../../../static/images/rewind.png";
import Stop from "../../../../static/images/stop.png";

const Player = ({isComparison}) => {
    const dispatch = useDispatch()

    const [isPlaying,
        isPrepared
    ] = useSelector(state => {
        const player = state.player
        return [player.timerId !== null,
            player.isPrepared]
    })

    const rewindPlayer = () => isPlaying ? dispatch(playFromStart(isComparison)) : dispatch(moveToStep(0))

    const playPlayer = () => isPrepared ? dispatch(resume()) : dispatch(playFromStart(isComparison))

    const pausePlayer = () => dispatch(pause())

    const stopPlayer = () => dispatch(stop())

    return (
        <div>
            <ImageButton disabled={!isPrepared} onClick={rewindPlayer}><img src={Rewind} width={18} alt={"rewind"}/></ImageButton>
            {!isPlaying && <ImageButton onClick={playPlayer}><img src={Play} width={18} alt={"play"}/></ImageButton>}
            {isPlaying && <ImageButton onClick={pausePlayer}><img src={Pause} width={18} alt={"pause"}/></ImageButton>}
            <ImageButton onClick={stopPlayer}><img src={Stop} width={18} alt={"stop"}/></ImageButton>
        </div>
    )
}

export default Player;
