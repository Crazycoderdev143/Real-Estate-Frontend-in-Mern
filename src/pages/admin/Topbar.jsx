import React, {useState, useMemo, useCallback} from "react";
import {useSelector} from "react-redux";
import {NavLink} from "react-router-dom";
import {
  FaUserPlus,
  FaUsers,
  FaPlusCircle,
  FaList,
  FaBars,
  FaTimes,
  FaBell,
} from "react-icons/fa";

const Topbar = () => {
  const mode = useSelector((state) => state.theme.mode);
  const {currentUser} = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  const role = currentUser?.role?.toLowerCase() || "user"; // Avoid multiple calls

  const topbarClass = useMemo(
    () =>
      mode === "dark" ? "bg-gray-950 text-white" : "bg-white text-gray-800",
    [mode]
  );
  const hoverClass = useMemo(
    () => (mode === "dark" ? "hover:bg-gray-700" : "hover:bg-blue-200"),
    [mode]
  );

  // Memoized navigation items
  const navItems = useMemo(
    () => [
      {
        path: `/${role}/add-new-property`,
        icon: FaPlusCircle,
        label: "Add Property",
      },
      {path: `/${role}/property-list`, icon: FaList, label: "Properties"},
    ],
    [role]
  );

  const adminNavItems = useMemo(
    () =>
      role === "admin"
        ? [
            {
              path: "/admin/send-notification",
              icon: FaBell,
              label: "Send Notification",
            },
            {path: "/admin/add-new-user", icon: FaUserPlus, label: "Add User"},
            {path: "/admin/user-list", icon: FaUsers, label: "Users"},
          ]
        : [],
    [role]
  );

  return (
    <div
      className={`${topbarClass} app shadow-md py-4 px-4 flex justify-between items-center z-30 my-12 relative`}
    >
      <div className="text-lg font-semibold sm:pl-20 pl-8">
        {currentUser?.role || "User"} Panel
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden focus:outline-none"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-4">
        {[...adminNavItems, ...navItems].map(({path, icon: Icon, label}) => (
          <NavLink
            key={path}
            to={path}
            className={`flex items-center p-2 rounded-lg app ${hoverClass}`}
          >
            <Icon className="mr-1" /> {label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div
          className={`${topbarClass} absolute top-full left-0 w-full flex flex-col items-start p-4 space-y-2 shadow-md lg:hidden`}
        >
          {[...adminNavItems, ...navItems].map(({path, icon: Icon, label}) => (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center p-2 rounded-lg ${hoverClass} w-full`}
            >
              <Icon className="mr-1" /> {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default Topbar;
