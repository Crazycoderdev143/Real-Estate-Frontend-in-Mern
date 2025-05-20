import {showAlert} from "../../Redux/slices/alertSlice";
import coverImg from "../../public/images/userpic.jpg";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import NotFound from "../../Components/NotFound";
import React, {useEffect, useMemo, useState} from "react";
import Loading from "../../Components/Loading";
import * as Icons from "react-icons/fa";


const ShowAllUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const access_token = localStorage.getItem("access_token");
  const [filterRole, setFilterRole] = useState("All");
  const mode = useSelector((state) => state.theme.mode);
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000"; // Environment variable

  useEffect(() => {
    if (!isLoggedIn || !access_token) {
      navigate("/login");
      return;
    }
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${host}/api/admin/users`, {
          method: "GET",
          headers: {authorization: access_token},
        });
        const data = await res.json();

        if (data.success) {
          setUsers(data.users); // assuming response contains a 'propertys' key
        } else {
          dispatch(showAlert({message: data?.message, type: "error"}));
        }
      } catch (error) {
        dispatch(showAlert({message: error?.message, type: "error"}));
        console.log("Error fetching users: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isLoggedIn, access_token]); // Empty dependency array to run only once on mount

  // Optimized Filtering using useMemo
  const filteredUsers = useMemo(() => {
    return filterRole === "All"
      ? users
      : users.filter((user) => user.role === filterRole);
  }, [users, filterRole]);

  const handleDeleteUser = async (userId) => {
    if (currentUser?.role !== "Admin") {
      dispatch(showAlert({message: "Unauthorized action!", type: "error"}));
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${host}/api/admin/delete-user/${userId}`, {
        method: "DELETE",
        headers: {authorization: access_token},
      });
      const data = await res.json();

      if (data.success) {
        setUsers((prev) => prev.filter((user) => user._id !== userId));
        dispatch(showAlert({message: data?.message, type: "success"}));
      } else {
        dispatch(showAlert({message: data?.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
      console.log("Error deleting user: ", error);
    } finally {
      setLoading(false);
    }
  };

  const themeClass = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      filter:
        mode === "light"
          ? "bg-blue-100 border-blue-400"
          : "bg-gray-900 text-white",
    }),
    [mode]
  );

  return (
    <div className={`min-h-screen p-4 -my-12 app ${themeClass.container}`}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <h1 className="text-xl md:text-2xl font-semibold text-center">
            User List
          </h1>

          {/* Filter Dropdown */}
          <div className="flex flex-wrap justify-between items-center mb-2">
            <label className="flex items-center gap-2 text-lg">
              <Icons.FaFilter className="text-blue-400" />
              <select
                className="bg-transparent border p-1 rounded-lg"
                onChange={(e) => setFilterRole(e.target.value)}
                value={filterRole}
              >
                {["All", "Admin", "Agent", "User"].map((role) => (
                  <option
                    key={role}
                    className={`${themeClass.filter}`}
                    value={role}
                  >
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-500 text-white text-sm md:text-lg">
                  <th className="p-2">#</th>
                  <th className="p-2">Username</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, i) => (
                    <tr
                      key={user?._id}
                      className="border text-xs sm:text-sm md:text-base text-center"
                    >
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">
                        <Link
                          className="flex items-center gap-2"
                          to={`/admin/user/${user?._id}`}
                        >
                          <img
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                            src={user?.profileImage || coverImg}
                            alt="User"
                          />
                          <span className="whitespace-nowrap">
                            {user?.username || "No Username"}
                          </span>
                        </Link>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {user?.email || "No Email"}
                      </td>
                      <td className="p-2">{user?.role || "No Role"}</td>
                      <td className="my-4 flex gap-2 sm:gap-3 justify-center">
                        <Link
                          to={`/admin/update-user/${user?._id}`}
                          className="text-blue-500"
                        >
                          <Icons.FaEdit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user?._id)}
                          className="text-red-500"
                        >
                          <Icons.FaTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center text-red-600 p-4"
                    >
                      <NotFound message="No Users Found" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ShowAllUser;
