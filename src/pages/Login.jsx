import LoginWithGoogle from "../Components/LoginWithGoogle";
import {useEffect, useMemo, useState} from "react";
import {login, logout} from "../Redux/slices/userSlice";
import {showAlert} from "../Redux/slices/alertSlice";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import Loading from "../Components/Loading";

const API_HOST = import.meta.env.VITE_HOST || "http://localhost:8000";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({usernameOrEmail: "", password: ""});

  // const csrfToken = useSelector((state) => state.csrfToken.token);
  const access_token = localStorage.getItem("access_token");
  const {isLoggedIn} = useSelector((state) => state.user);
  const mode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    if (isLoggedIn && access_token) navigate("/");
  }, [isLoggedIn, access_token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.usernameOrEmail.trim() || !formData.password.trim()) {
        dispatch(
          showAlert({
            message: "Username/Email and password are required.",
            type: "error",
          })
        );
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_HOST}/api/user/login`, {
        method: "POST",
        credentials: "include", // Needed to send cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmail: formData.usernameOrEmail.trim(),
          password: formData.password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      if (data.success && data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        dispatch(login(data.user_info));
        navigate("/");
        setFormData({usernameOrEmail: "", password: ""});
      } else {
        dispatch(logout());
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // Theme-based styling classes

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
      className={`min-h-screen flex items-center justify-center p-4 app ${themeClasses.container}`}
    >
      <div className="w-full max-w-md p-6 rounded-lg shadow-md">
        {loading ? (
          <Loading />
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-4">
              Welcome Back!
            </h1>
            <p className="text-center mb-4">
              Don’t have an account?
              <Link
                to="/registration"
                className="text-blue-500 hover:underline ml-1"
              >
                Sign up
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
                className={`w-full p-3 border rounded-lg app ${themeClasses.input}`}
                value={formData.usernameOrEmail}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`w-full p-3 border rounded-lg app ${themeClasses.input}`}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                className={`w-full p-3 font-bold rounded-lg disabled:opacity-50 app ${themeClasses.button}`}
                disabled={!formData.usernameOrEmail || !formData.password}
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>
            <LoginWithGoogle />
            <p className="text-center mt-4">
              Forgot your password?
              <Link
                to="/forget-password"
                className="text-blue-500 hover:underline ml-1"
              >
                Reset here
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
