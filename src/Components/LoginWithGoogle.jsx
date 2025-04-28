import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth";
import {app, auth} from "../services/firebase";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import Cookies from "js-cookie";
import {useDispatch} from "react-redux";
import {showAlert} from "../Redux/slices/alertSlice";
import {login, logout} from "../Redux/slices/userSlice";

const setSecureCookie = (name, value, days) => {
  Cookies.set(name, value, {
    expires: days,
    path: "/",
    secure: true, // Only works on HTTPS
    sameSite: "Strict", // Protects against CSRF
  });
};
const host = import.meta.env.VITE_HOST || "http://localhost:8000";

const OAuth = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const authenticateUser = async (usernameOrEmail, password) => {
    try {
      const res = await fetch(`${host}/api/user/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({usernameOrEmail, password}),
      });
      return await res.json();
    } catch (error) {
      return {success: false, message: error.message};
    }
  };

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const data = await authenticateUser(user.email, user.uid);

      console.log("object", data);
      if (data.success && data.access_token) {
        setSecureCookie("access_token", data.access_token, 7);
        localStorage.setItem("access_token", data.access_token);
        dispatch(login(data.user_info));
        navigate("/");
      } else {
        dispatch(logout());
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: "Something went wrong!", type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-sm mx-auto py-4">
      <button
        className="bg-red-700 text-white p-3 rounded-lg w-full hover:opacity-95 transition disabled:opacity-75"
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Logging in..." : "Login with Google"}
      </button>
    </div>
  );
};

export default OAuth;
