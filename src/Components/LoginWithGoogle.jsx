import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth";
import {app, auth} from "../services/firebase";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {showAlert} from "../Redux/slices/alertSlice";
import {login, logout} from "../Redux/slices/userSlice";

const host = import.meta.env.VITE_HOST || "http://localhost:8000";

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // const csrfToken = useSelector((state) => state.csrfToken.token);

  const authenticateUser = async (usernameOrEmail, password) => {
    try {
      const res = await fetch(`${host}/api/user/login`, {
        method: "POST",
        credentials: "include", // Needed to send cookies
        headers: {
          "Content-Type": "application/json",
        },
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

      if (data.success && data.access_token) {
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
