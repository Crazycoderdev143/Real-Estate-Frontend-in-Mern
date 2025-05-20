import React, {useState, useEffect, useMemo} from "react";
import {showAlert} from "../Redux/slices/alertSlice";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate, useParams} from "react-router-dom";
import Loading from "../Components/Loading";


const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {resetToken} = useParams();
  const [loading, setLoading] = useState(false);
  const access_token = localStorage.getItem("access_token");
  const mode = useSelector((state) => state.theme.mode);
  const {isLoggedIn} = useSelector((state) => state.user);
  const [formData, setFormData] = useState({newPassword: ""});
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  useEffect(() => {
    if (isLoggedIn && access_token) navigate("/");
  }, [isLoggedIn, access_token, navigate]);

  const handleInputChange = (e) => {
    setFormData({newPassword: e.target.value});
  };

  const resetUserPassword = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${host}/api/user/reset-password/${resetToken}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      dispatch(
        showAlert({
          message: data?.message ?? "Something went wrong.",
          type: data.success ? "success" : "error",
        })
      );

      if (data.success) {
        setFormData({newPassword: ""});
        navigate("/login");
      }
    } catch (error) {
      dispatch(showAlert({message: "Something went wrong!", type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword.length < 8) {
      dispatch(
        showAlert({
          message: "Password must be at least 8 characters.",
          type: "error",
        })
      );
      return;
    }
    resetUserPassword();
  };
  const themeClasses = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      button:
        mode === "dark"
          ? "bg-gray-700 hover:bg-cyan-500 text-white"
          : "bg-blue-600 hover:bg-cyan-500 text-white",
      input:
        mode === "light"
          ? "border-gray-300"
          : "border-gray-600 bg-gray-800 text-white",
    }),
    [mode]
  );

  return (
    <div
      className={`p-4 max-w-md mx-auto min-h-screen flex flex-col justify-center items-center ${themeClasses.container}`}
    >
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full">
          <h1 className="text-2xl text-center font-semibold mb-5">
            Reset your password
          </h1>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-full"
          >
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              className={`border p-3 rounded-lg w-full ${themeClasses.input}`}
              value={formData.newPassword}
              required
              onChange={handleInputChange}
            />
            <button
              className={`p-3 rounded-lg w-full uppercase transition-all ${themeClasses.button} hover:opacity-90 disabled:opacity-50`}
              disabled={loading || formData.newPassword.length < 8}
            >
              {loading ? "Loading..." : "Reset Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
