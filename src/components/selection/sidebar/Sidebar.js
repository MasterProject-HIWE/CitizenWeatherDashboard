import {useState} from "react";
import FilterCopy from "./FilterCopy";
import TimePicker from "./TimePicker";
import CategorySelector from "./CategorySelector";
import AreaSelector from "./AreaSelector";
import NameSelector from "./NameSelector";
import ColorSelector from "./ColorSelector";
import EndButtons from "./EndButtons";
import ImageSelect from "./ImageSelect";
import Settings from "../../shared/components/Settings";
import "../../../static/style/sidebar.css"

const Sidebar = () => {
    const [containerStyle, setContainerStyle] = useState({})
    const [sidebarStyle, setSidebarStyle] = useState({})

    const navStatus = () => (document.getElementById("hamburger").classList.contains('hamburger-active')) ? navClose() : navOpen()

    const navClose = () => {
        setContainerStyle({opacity: "0"})
        setTimeout(function () {
            document.getElementById("hamburger").classList.remove('hamburger-active')
            setSidebarStyle({width: "63px"})
        }, 300);
    }

    const navOpen = () => {
        document.getElementById("hamburger").classList.add('hamburger-active')
        setSidebarStyle({width: "320px"})
        setTimeout(() => setContainerStyle({opacity: "1"}), 500)
    }

    return (
        <div id="SidebarAll" style={sidebarStyle}>
            <aside id="SidebarContainer" style={containerStyle}>
                <div id="TopContainer">
                    <Settings/>
                </div>
                <div className="Sidebar scroll-shadows">
                    <div id="filter">
                        <h2>Filter options</h2>
                        <FilterCopy/>
                        <CategorySelector/>
                        <TimePicker/>
                        <ImageSelect/>
                        <AreaSelector/>
                        <h2>Styling Options</h2>
                        <NameSelector/>
                        <ColorSelector/>
                    </div>
                </div>
                <EndButtons/>
            </aside>
            <div id="hamburger" className="hamburger-icon-container hamburger-active position-absolute" onClick={navStatus}>
                <span className="hamburger-icon"></span>
            </div>
        </div>
    )
}

export default Sidebar;

