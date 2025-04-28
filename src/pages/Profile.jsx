import React, {useEffect, useMemo, useState} from "react";
import defaultProImg from "../public/images/userpic.jpg";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import {logout} from "../Redux/slices/userSlice";
import NotFound from "../Components/NotFound";
import Loading from "../Components/Loading";
import * as Icons from "react-icons/fa";
import Cookies from "js-cookie";
import { showAlert } from "../Redux/slices/alertSlice";

const removeCookie = (name) => {
  Cookies.remove(name);
};

const Profile = () => {
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";
  const mode = useSelector((state) => state.theme.mode);
  const access_token = Cookies.get("access_token");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useMemo(
    () => isLoggedIn && access_token,
    [isLoggedIn, access_token]
  );
  const [state, setState] = useState({loading: false, message: null});

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated]);

  const logOut = () => {
    dispatch(logout());
    removeCookie("access_token");
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const deleteAccount = async () => {
    setState({loading: true, message: null});
    try {
      const res = await fetch(`${host}/api/user/deleteaccount`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: access_token,
        },
        body: JSON.stringify({userId: currentUser?._id}),
      });
      const data = await res.json();

      if (data.success) {
        dispatch(logout());
        removeCookie("access_token");
        localStorage.clear();
        navigate("/login");
      }
      setState({loading: false, message: data.message});
    } catch (error) {
      dispatch(showAlert({message: "Something went wrong!", type: "error"}));
    }
  };

  const themeClasses = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      input:
        mode === "light"
          ? "border-gray-300"
          : "border-gray-600 bg-gray-800 text-white",
    }),
    [mode]
  );

  return (
    <div
      className={`p-4 max-w-2xl mx-auto pt-12 app ${themeClasses.container} min-h-screen flex flex-col items-center`}
    >
      {state.loading ? (
        <Loading />
      ) : currentUser ? (
        <>
          <h1 className="text-3xl text-center font-semibold my-3">
            My Profile
          </h1>
          <form className="flex flex-col items-center w-full gap-2 p-2">
            <img
              src={currentUser?.profileImage || defaultProImg}
              alt="Profile"
              className="rounded-full h-28 w-28 object-cover border-4 border-gray-300 shadow-md"
            />
            <input
              type="text"
              placeholder="Username"
              className={`border p-2 rounded-lg w-full app ${themeClasses.input}`}
              defaultValue={currentUser?.username}
              disabled
            />
            <input
              type="phone"
              placeholder="Mobile No."
              className={`border p-2 rounded-lg w-full app ${themeClasses.input}`}
              defaultValue={currentUser?.phone}
              disabled
            />
            <input
              type="email"
              placeholder="Email"
              className={`border p-2 rounded-lg w-full app ${themeClasses.input}`}
              defaultValue={currentUser?.email}
              disabled
            />
            <input
              type="password"
              placeholder="Password"
              className={`border p-2 rounded-lg w-full app ${themeClasses.input}`}
              value="********"
              disabled
            />
            {state.message && (
              <div className="text-red-600 text-center mt-2">
                {state.message}
              </div>
            )}
          </form>
          <Link
            to="/profile/updateprofile"
            className="w-full"
          >
            <div className="bg-blue-600 text-white p-3 rounded-lg text-center uppercase hover:bg-blue-700 transition-all">
              Edit Profile
            </div>
          </Link>
          <div className="flex justify-between w-full mt-6 px-4">
            <button
              className="text-red-700 flex items-center gap-2 hover:text-red-800"
              onClick={deleteAccount}
            >
              <Icons.FaTrash size={16} /> Delete Account
            </button>
            <button
              className="text-red-700 flex items-center gap-2 hover:text-red-800"
              onClick={logOut}
            >
              <Icons.FaSignOutAlt size={16} /> Log Out
            </button>
          </div>
        </>
      ) : (
        <div className="text-red-600 text-center my-16">
          <NotFound message={"User not found"} />
          {state.message}
        </div>
      )}
    </div>
  );
};

export default Profile;
