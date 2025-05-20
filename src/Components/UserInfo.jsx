import {Link, useNavigate, useParams} from "react-router-dom";
import defaultProImg from "../public/images/userpic.jpg";
import React, {useEffect, useState, useMemo} from "react";
import {showAlert} from "../Redux/slices/alertSlice";
import {useDispatch, useSelector} from "react-redux";
import NotFound from "./NotFound";
import Loading from "./Loading";


const UserInfo = () => {
  const {userId} = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const access_token = localStorage.getItem("access_token");
  const mode = useSelector((state) => state.theme.mode);
  const {isLoggedIn} = useSelector((state) => state.user);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  useEffect(() => {
    if (!isLoggedIn || !access_token) return navigate("/login");

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${host}/api/admin/user/${userId}`, {
          method: "GET",
          headers: {authorization: access_token},
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          dispatch(showAlert({message: data.message, type: "error"}));
        }
      } catch (error) {
        dispatch(showAlert({message: "Error fetching user", type: "error"}));
      } finally {
        setLoading(false);
      }
    };

    userId && fetchUser();
  }, [userId, isLoggedIn, access_token, dispatch, navigate, host]);

  const themeClasses = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      input:
        mode === "light"
          ? "border-gray-300"
          : "border-gray-600 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500",
      card: mode === "light" ? "bg-white text-black" : "bg-gray-800 text-white",
    }),
    [mode]
  );
  return (
    <div className={`min-h-screen ${themeClasses.container} py-2 -my-12`}>
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <Loading />
          </div>
        ) : user ? (
          <>
            <h1 className="text-xl sm:text-2xl text-center font-semibold mb-2">
              User Info
            </h1>
            <div className="flex flex-col gap-2 mx-2 md:mx-16">
              <img
                src={user?.profileImage ? user?.profileImage : defaultProImg}
                alt="Profile"
                className="rounded-full h-24 w-24 sm:h-28 sm:w-28 object-cover self-center mt-2"
                loading="lazy"
              />
              {["username", "phone", "email", "role"].map((field) => (
                <input
                  key={field}
                  type="text"
                  className={`border p-2 rounded-lg h-10 ${themeClasses.input}`}
                  value={user?.[field]}
                  disabled
                />
              ))}
            </div>
            <div className="flex justify-center mt-3">
              <Link to={`/admin/update-user/${userId}`}>
                <button className="bg-slate-800 text-white p-2 px-4 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
                  Update User
                </button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-red-600 text-center my-28">
            <NotFound message="User" />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
