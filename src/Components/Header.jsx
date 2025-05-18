import {fetchCartProperties, clearCart} from "../Redux/slices/cartSlice";
import {useState, useCallback, useEffect, useMemo} from "react";
import {clearCsrfToken} from "../Redux/slices/csrfTokenSlice";
import defaultProImg from "../public/images/userpic.jpg";
import {toggleTheme} from "../Redux/slices/themeSlice";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import {logout} from "../Redux/slices/userSlice";
import * as Icons from "react-icons/fa";
import Cookies from "js-cookie";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const access_token = localStorage.getItem("access_token");
  const [searchTerm, setSearchTerm] = useState("");
  const {cart} = useSelector((state) => state.cart);
  const mode = useSelector((state) => state.theme.mode);
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);

  useEffect(() => {
    document.body.className =
      mode === "light"
        ? "bg-gray-100 text-black app"
        : "bg-gray-900 text-white app";
  }, [mode]);

  useEffect(() => {
    if (isLoggedIn && access_token) dispatch(fetchCartProperties(currentUser));
  }, [isLoggedIn, access_token, currentUser, dispatch]);

  const logOut = useCallback(() => {
    // Redux state cleanup
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearCsrfToken());

    Cookies.remove("access_token", {path: "/"});
    Cookies.remove("_csrf", {path: "/"});
    localStorage.removeItem("access_token");
    navigate("/login"); // Redirect to login
  }, [dispatch, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  const containerClass = useMemo(
    () =>
      mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-cyan-500",
    [mode]
  );
  const isAdminOrAgent = useMemo(
    () => ["Admin", "Agent"].includes(currentUser?.role),
    [currentUser]
  );

  return (
    <header className={`fixed w-full z-50 shadow-md app ${containerClass}`}>
      <nav className="max-w-7xl mx-auto flex justify-between items-center p-2">
        <Link
          to="/"
          className="text-2xl font-bold"
        >
          <span className="text-slate-600">Sdky</span>
          <span className="text-cyan-500">Estate</span>
        </Link>
        <form
          onSubmit={handleSearch}
          className="py-1 px-3 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <input
            type="text"
            placeholder="Search here..."
            className="bg-transparent focus:outline-none flex-1 sm:min-w-64 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            <Icons.FaSearch className="text-blue-600 ml-2" />
          </button>
        </form>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden"
        >
          {menuOpen ? <Icons.FaTimes size={24} /> : <Icons.FaBars size={24} />}
        </button>
        <ul className="hidden sm:flex items-center gap-6">
          <li
            onClick={() => dispatch(toggleTheme())}
            className="cursor-pointer"
          >
            {mode === "light" ? (
              <Icons.FaMoon
                size={24}
                className="text-cyan-400"
              />
            ) : (
              <Icons.FaSun
                size={24}
                className="text-yellow-400"
              />
            )}
          </li>
          <Link
            to="/"
            className="text-cyan-500 hover:underline flex items-center gap-1"
          >
            <Icons.FaHome size={20} /> Home
          </Link>
          {access_token && isAdminOrAgent && (
            <Link
              to={currentUser.role.toLowerCase()}
              className="text-cyan-500 hover:underline"
            >
              Dashboard
            </Link>
          )}
          {isLoggedIn && currentUser?.role !== "Admin" && (
            <Link
              to="/cart"
              className="flex gap-1"
            >
              <Icons.FaCartArrowDown
                size={28}
                className="text-cyan-500"
              />
              {cart.length > 0 && cart.length}
            </Link>
          )}
          {access_token && isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link to="/profile">
                <img
                  src={currentUser?.profileImage || defaultProImg}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>
              <button onClick={logOut}>
                <Icons.FaPowerOff
                  size={28}
                  className="text-red-600 hover:text-red-700"
                />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/registration"
                className="text-cyan-500 hover:underline"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="text-cyan-500 hover:underline"
              >
                Login
              </Link>
            </div>
          )}
        </ul>
      </nav>
      {menuOpen && (
        <div
          className={`sm:hidden absolute top-16 left-0 w-full app ${containerClass} p-4 flex flex-col items-center gap-4`}
        >
          <div
            onClick={() => dispatch(toggleTheme())}
            className="cursor-pointer"
          >
            {mode === "light" ? (
              <Icons.FaMoon
                size={24}
                className="text-cyan-400"
              />
            ) : (
              <Icons.FaSun
                size={24}
                className="text-yellow-400"
              />
            )}
          </div>
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="hover:underline flex gap-1 items-center"
          >
            <Icons.FaHome size={20} /> Home
          </Link>
          {access_token && isAdminOrAgent && (
            <Link
              to={currentUser.role.toLowerCase()}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          {access_token && isLoggedIn && currentUser?.role !== "Admin" && (
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex gap-1"
            >
              {cart.length > 0 && cart.length}{" "}
              <Icons.FaCartArrowDown size={24} /> Cart
            </Link>
          )}
          {access_token && isLoggedIn ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex gap-2 items-center"
              >
                <img
                  src={currentUser?.profileImage || defaultProImg}
                  alt="Profile"
                  className="w-8 rounded-full object-cover"
                />{" "}
                Profile
              </Link>
              <button
                onClick={logOut}
                className="flex gap-2 text-red-500"
              >
                <Icons.FaPowerOff size={24} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/registration"
                onClick={() => setMenuOpen(false)}
              >
                Sign up
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
