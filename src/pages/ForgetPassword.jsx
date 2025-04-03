import React, {useEffect, useState, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {showAlert} from "../Redux/slices/alertSlice";
import {Link, useNavigate} from "react-router-dom";
import Loading from "../Components/Loading";
import Cookies from "js-cookie";

const ForgetPassword = () => {
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";
  const [formData, setFormData] = useState({usernameOrEmail: ""});
  const {isLoggedIn} = useSelector((state) => state.user);
  const mode = useSelector((state) => state.theme.mode);
  const access_token = Cookies.get("access_token");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redirect logged-in users away from this page
  useEffect(() => {
    if (isLoggedIn && access_token) navigate("/");
  }, [isLoggedIn, access_token, navigate]);

  // Function to validate email format
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate input
    if (!formData.usernameOrEmail) {
      dispatch(
        showAlert({message: "Username or Email is required.", type: "error"})
      );
      setLoading(false);
      return;
    }
    if (
      !isValidEmail(formData.usernameOrEmail) &&
      !/^[a-zA-Z0-9_]+$/.test(formData.usernameOrEmail)
    ) {
      dispatch(
        showAlert({message: "Invalid email or username format.", type: "error"})
      );
      setLoading(false);
      return;
    }

    try {
      // Send API request to initiate password reset
      const res = await fetch(`${host}/api/user/forget-password`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      // Show success or error message
      dispatch(
        showAlert({
          message: data?.message,
          type: data.success ? "success" : "error",
        })
      );

      // Clear form on success
      if (data.success) setFormData({usernameOrEmail: ""});
    } catch (error) {
      console.error("Error requesting password reset:", error);
      dispatch(
        showAlert({
          message: "Something went wrong. Please try again later.",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // Dynamic classes based on mode
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
      className={`min-h-screen flex items-center justify-center px-4 ${themeClasses.container}`}
    >
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Header Section */}
            <h1 className="text-2xl text-center font-semibold mb-6">
              Reset Your Password
            </h1>
            <p className="text-center mb-4">
              If you don’t have an account,{" "}
              <Link
                to="/registration"
                className="text-blue-600 underline"
              >
                Click here
              </Link>
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input
                type="text"
                name="usernameOrEmail"
                placeholder="Username or Email"
                className={`w-full border p-3 rounded-lg ${themeClasses.input}`}
                value={formData.usernameOrEmail}
                required
                onChange={handleChange}
              />

              <button
                className={`w-full p-3 rounded-lg uppercase ${themeClasses.button} disabled:opacity-70`}
                disabled={!formData.usernameOrEmail || loading}
              >
                {loading ? "Processing..." : "Request Reset"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
