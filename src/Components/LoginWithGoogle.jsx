import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth";
import {app} from "../services/firebase";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import Cookies from "js-cookie";
import {useDispatch} from "react-redux";
import {showAlert} from "../Redux/slices/alertSlice";
import {login, logout} from "../Redux/slices/userSlice";

const OAuth = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const host = import.meta.env.VITE_HOST;
  const secretKey = import.meta.env.VITE_SECRET_KEY;

  const authenticateUser = async (email, accessToken) => {
    try {
      const res = await fetch(`${host}/api/user/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include", // Secure cookie handling
        body: JSON.stringify({email, accessToken}),
      });
      return await res.json();
    } catch (error) {
      return {success: false, message: error.message};
    }
  };

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const data = await authenticateUser(user.email, user.accessToken);

      if (data.success) {
        Cookies.set("access_token", data.access_token, {
          secure: true,
          sameSite: "Strict",
        });
        dispatch(login(data.user_info));
        navigate("/");
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
