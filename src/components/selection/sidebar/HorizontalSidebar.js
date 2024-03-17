// import {useState} from "react";
import CategorySelector from "./CategorySelector";
import "../../../static/style/sidebar.css"

const Sidebar = () => {

    return (
        <div id="SidebarAll" style={sidebarStyle}>
            <aside id="SidebarContainer" style={containerStyle}>
                <div id="TopContainer">
                </div>
                <div className="Sidebar scroll-shadows">
                    <div id="filter">
                        <CategorySelector/>
                    </div>
                </div>
            </aside>
        </div>
    )
}

export default HorizontalSidebar;

