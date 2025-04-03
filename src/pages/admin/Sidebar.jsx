import React, {useState, useMemo, useCallback} from "react";
import {NavLink} from "react-router-dom";
import {useSelector} from "react-redux";
import {
  FaTachometerAlt,
  FaUsers,
  FaProductHunt,
  FaCog,
  FaChartLine,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const mode = useSelector((state) => state.theme.mode);
  const {currentUser} = useSelector((state) => state.user);

  const sidebarClass = useMemo(
    () => (mode === "dark" ? "bg-gray-800" : "bg-blue-800"),
    [mode]
  );
  const hoverClass = useMemo(
    () => (mode === "dark" ? "hover:bg-gray-700" : "hover:bg-blue-700"),
    [mode]
  );

  // Memoized navigation items to improve performance
  const navItems = useMemo(
    () => [
      {path: "/admin", icon: FaTachometerAlt, label: "Dashboard"},
      {path: "/admin/user-list", icon: FaUsers, label: "Users"},
      {path: "/admin/property-list", icon: FaProductHunt, label: "Properties"},
      {path: "/admin/settings", icon: FaCog, label: "Settings"},
      {path: "/admin/reports", icon: FaChartLine, label: "Reports"},
    ],
    []
  );

  // Memoized function to handle sidebar toggle
  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white p-3 fixed top-14 z-50 bg-blue-600 rounded-full shadow-lg"
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform my-12 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 app ${sidebarClass} text-white p-4 h-screen shadow-lg z-40 md:relative md:flex md:flex-col`}
      >
        <h2 className="text-xl font-semibold mb-6 text-center md:text-left">
          {currentUser?.role || "User"} Dashboard
        </h2>

        {/* Navigation List */}
        <ul className="space-y-4">
          {navItems.map(({path, icon: Icon, label}) => (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center p-2 rounded app ${hoverClass} transition duration-200`}
            >
              <Icon className="mr-3" />
              {label}
            </NavLink>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
