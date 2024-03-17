import { useState } from "react";
import TimePicker from "../selection/sidebar/TimePicker";
import EndButtons from "../selection/sidebar/EndButtons";
import Settings from "../shared/components/Settings";
import "../../static/style/sidebar.css";

const Sidebar = () => {
  const [containerStyle, setContainerStyle] = useState({});
  const [sidebarStyle, setSidebarStyle] = useState({});

  const navStatus = () =>
    document.getElementById("hamburger").classList.contains("hamburger-active")
      ? navClose()
      : navOpen();

  const navClose = () => {
    setContainerStyle({ opacity: "0" });
    setTimeout(function () {
      document.getElementById("hamburger").classList.remove("hamburger-active");
      setSidebarStyle({ width: "63px" });
    }, 300);
  };

  const navOpen = () => {
    document.getElementById("hamburger").classList.add("hamburger-active");
    setSidebarStyle({ width: "320px" });
    setTimeout(() => setContainerStyle({ opacity: "1" }), 500);
  };

  return (
    <div id="SidebarAll" style={sidebarStyle}>
      <aside id="SidebarContainer" style={containerStyle}>
        <div id="TopContainer">
          <Settings />
        </div>
        <div className="Sidebar scroll-shadows">
          <div id="filter">
            <h2>Filter options</h2>
            <TimePicker />
          </div>
        </div>
        <EndButtons />
      </aside>
      <div
        id="hamburger"
        className="hamburger-icon-container hamburger-active position-absolute"
        onClick={navStatus}
      >
        <span className="hamburger-icon"></span>
      </div>
    </div>
  );
};

export default Sidebar;
