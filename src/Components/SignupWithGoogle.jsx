import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth";
import {app} from "../services/firebase";
import {useNavigate} from "react-router-dom";
import {useState, useCallback} from "react";
import Cookies from "js-cookie";
import {useDispatch, useSelector} from "react-redux";
import {login, logout} from "../Redux/slices/userSlice";
import {showAlert} from "../Redux/slices/alertSlice";

// Constants (Declared outside the component for efficiency)
const HOST = import.meta.env.VITE_HOST || "http://localhost:8000";

const setCookie = (name, value, days) => {
  Cookies.set(name, value, {expires: days, path: "/", secure: true});
};

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {isLoggedIn} = useSelector((state) => state.user);

  const registerUser = async (user) => {
    const randomSuffix = Math.floor(Math.random() * 1000 + 1);
    try {
      const response = await fetch(`${HOST}/api/user/registration`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          username: `${user.displayName}_${randomSuffix}`,
          email: user.email,
          password: user.uid, // Use a safer identifier instead of a secret key
          profileImage: user.photoURL,
          role: "User",
        }),
      });

      return response.json();
    } catch (error) {
      console.error("Error during registration:", error);
      throw new Error("Failed to register user.");
    }
  };

  const handleGoogleClick = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const data = await registerUser(user);

      if (data.success) {
        if (data.access_token) {
          setCookie("access_token", data.access_token, 7);
          localStorage.setItem("access_token", data.access_token);
        }
        dispatch(login(data.user_info));
        navigate("/");
      } else {
        dispatch(logout());
        dispatch(showAlert({message: data?.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-sm mx-auto py-2">
      <button
        className="bg-red-700 text-white p-3 rounded-lg w-full hover:opacity-95 transition disabled:opacity-75"
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>
    </div>
  );
};

export default OAuth;
