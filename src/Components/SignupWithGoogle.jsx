import {useGoogleLogin} from "@react-oauth/google";
import {useNavigate} from "react-router-dom";
import {useState, useCallback} from "react";
import Cookies from "js-cookie";
import {useDispatch, useSelector} from "react-redux";
import {login, logout} from "../Redux/slices/userSlice";
import {showAlert} from "../Redux/slices/alertSlice";

// Constants (Declared outside the component for efficiency)
const HOST = import.meta.env.VITE_HOST || "http://localhost:8000";
const setSecureCookie = (name, value, days) => {
  Cookies.set(name, value, {
    expires: days,
    path: "/",
    secure: true, // Only works on HTTPS
    sameSite: "Strict", // Protects against CSRF
  });
};

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {isLoggedIn} = useSelector((state) => state.user);

  const responseGoogle = async (authResult) => {
    try {
      if (authResult.code) {
        const csrfRes = await fetch(`${HOST}/api/user/csrf-token`, {
          credentials: "include", // VERY IMPORTANT
        });
        const {csrfToken} = await csrfRes.json();

        const response = await fetch(
          `${HOST}/api/user/registrationwithgoogle`,
          {
            method: "POST",
            credentials: "include", // Needed to send cookies
            headers: {
              "Content-Type": "application/json",
              "CSRF-Token": csrfToken, // Attach the CSRF token
            },
            body: JSON.stringify({tokenId: authResult.code}),
          }
        );
        const data = await response.json();
        console.log("data", data);
        if (data.success && data.access_token) {
          setSecureCookie("access_token", data.access_token, 7);
          localStorage.setItem("access_token", data.access_token);
          dispatch(login(data.user_info));
          navigate("/");
        } else {
          dispatch(logout());
          dispatch(showAlert({message: data?.message, type: "error"}));
        }
      }
    } catch (error) {
      dispatch(showAlert({message: "Something went wrong!", type: "error"}));
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };
  const signupWithGoogle = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });
  return (
    <>
      <div>
        <button
          className="bg-red-700 text-white p-3 rounded-lg w-full hover:opacity-95 transition disabled:opacity-75"
          type="button"
          onClick={signupWithGoogle}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </>
  );
};

export default OAuth;
