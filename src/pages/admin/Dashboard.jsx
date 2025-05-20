import {showAlert} from "../../Redux/slices/alertSlice";
import {useSelector, useDispatch} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import React, {useEffect, useMemo, useState} from "react";
import Loading from "../../Components/Loading";


const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState({
    users: [],
    contacts: [],
    comments: [],
    feedbacks: [],
    properties: [],
  });
  const [loading, setLoading] = useState(false);

  const access_token = localStorage.getItem("access_token");
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);
  const mode = useSelector((state) => state.theme.mode);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  useEffect(() => {
    if (!isLoggedIn || !access_token) {
      navigate("/login");
      return;
    }
    fetchDashboardData(currentUser?.role);
  }, [isLoggedIn, access_token, currentUser?.role]);

  const fetchDashboardData = async (role) => {
    setLoading(true);
    try {
      let apiEndpoints = [];
      if (role === "Admin") {
        apiEndpoints = [
          {key: "properties", url: `${host}/api/user`},
          {key: "users", url: `${host}/api/admin/users`},
          {key: "contacts", url: `${host}/api/admin/contacts`},
          {key: "comments", url: `${host}/api/admin/comments`},
          {key: "feedbacks", url: `${host}/api/admin/feedbacks`},
        ];
      } else if (role === "Agent") {
        apiEndpoints = [
          {key: "properties", url: `${host}/api/user`},
          {key: "contacts", url: `${host}/api/agent/contacts`},
        ];
      }

      const responses = await Promise.all(
        apiEndpoints.map((endpoint) =>
          fetch(endpoint.url, {
            method: "GET",
            headers: {authorization: access_token},
          }).then((res) => res.json())
        )
      );

      const newData = {};
      responses.forEach((res, index) => {
        newData[apiEndpoints[index].key] = res.success
          ? res[apiEndpoints[index].key] || []
          : [];
      });

      setData(newData);
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const themeClasses = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      card: mode === "light" ? "bg-white text-black" : "bg-gray-700 text-white",
    }),
    [mode]
  );

  const DashboardCard = ({to, title, value, color}) => (
    <Link
      to={to}
      className={`p-6 rounded-lg shadow-lg text-center app ${themeClasses.card}`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </Link>
  );

  return (
    <div
      className={`flex flex-col items-center p-6 -mt-12 min-h-screen app ${themeClasses.container}`}
    >
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {access_token && currentUser?.role === "Admin" && (
            <>
              <DashboardCard
                to="/admin/user-list"
                title="Total Users"
                value={data.users.length}
                color="text-blue-600"
              />
              <DashboardCard
                to="/admin/active-session"
                title="Active Sessions"
                value="350"
                color="text-green-600"
              />
            </>
          )}
          {(currentUser?.role === "Admin" || currentUser?.role === "Agent") && (
            <>
              <DashboardCard
                to={`/${currentUser?.role.toLowerCase()}/contact-list`}
                title="Contacts"
                value={data.contacts.length}
                color="text-red-600"
              />
              <DashboardCard
                to={`/${currentUser?.role.toLowerCase()}/property-list`}
                title="Total Properties"
                value={data.properties.length}
                color="text-blue-600"
              />
            </>
          )}
          {access_token && currentUser?.role === "Admin" && (
            <>
              <DashboardCard
                to="/admin/feedback-list"
                title="Total Feedbacks"
                value={data.feedbacks.length}
                color="text-green-600"
              />
              <DashboardCard
                to="/admin/comment-list"
                title="Comments"
                value={data.comments.length}
                color="text-red-600"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
