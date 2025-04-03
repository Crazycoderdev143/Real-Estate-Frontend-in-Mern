import React, {useEffect, useRef, useState, useMemo, useCallback} from "react";
import defaultProImg from "../public/images/userpic.jpg";
import {showAlert} from "../Redux/slices/alertSlice";
import {useDispatch, useSelector} from "react-redux";
import {login} from "../Redux/slices/userSlice";
import {useNavigate} from "react-router-dom";
import NotFound from "./NotFound";
import Loading from "./Loading";
import Cookies from "js-cookie";

// Constants (Declared outside the component for efficiency)
const HOST = import.meta.env.VITE_HOST || "http://localhost:8000";

const setCookie = (name, value, days) => {
  Cookies.set(name, value, {expires: days, path: "/", secure: true});
};

const UpdateProfile = () => {
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);
  const mode = useSelector((state) => state.theme.mode);
  const access_token = Cookies.get("access_token");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userId = currentUser?._id;
  const proImgUploader = useRef();

  // State Management
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(
    currentUser?.profileImage || defaultProImg
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    password: "",
  });

  // Update Form Fields
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // Handle Profile Image Preview
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  }, [selectedFile]);

  // Redirect Unauthorized Users
  useEffect(() => {
    if (!isLoggedIn || !access_token) {
      navigate("/login");
    }
  }, [isLoggedIn, access_token, navigate]);

  // API Call: Update Profile
  const updateUserProfile = async () => {
    const formDataObj = new FormData();
    formDataObj.append("username", formData.username);
    formDataObj.append("phone", formData.phone);
    formDataObj.append("email", formData.email);
    if (selectedFile) formDataObj.append("profileImage", selectedFile);
    if (formData.password) formDataObj.append("password", formData.password);

    try {
      const res = await fetch(
        `${HOST}/api/${(currentUser?.role).toLowerCase()}/updateprofile/${userId}`,
        {
          method: "PUT",
          headers: {authorization: access_token},
          body: formDataObj,
        }
      );
      return res.json();
    } catch (error) {
      console.error("Profile update error:", error);
      throw new Error("Failed to update profile.");
    }
  };

  // Handle Form Submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        const data = await updateUserProfile();

        if (data.success) {
          if (data.access_token) {
            setCookie("access_token", data.access_token, 7);
            localStorage.setItem("access_token", data.access_token);
          }
          dispatch(login(data.user_info));
          dispatch(showAlert({message: data?.message, type: "success"}));
          navigate("/profile");
        } else {
          dispatch(showAlert({message: data?.message, type: "error"}));
        }
      } catch (error) {
        dispatch(showAlert({message: error.message, type: "error"}));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate, formData, selectedFile]
  );

  // Handle File Selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Memoized classes to avoid unnecessary re-renders
  const containerTheme = useMemo(
    () =>
      mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
    [mode]
  );
  const inputTheme = useMemo(
    () =>
      mode === "light"
        ? "border-gray-300"
        : "border-gray-600 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500",
    [mode]
  );

  return (
    <>
      {loading ? (
        <div className="pt-20">
          <Loading />
        </div>
      ) : currentUser ? (
        <div
          className={`w-full max-w-xl mx-auto p-4 sm:p-6 md:p-8 pt-12 app ${containerTheme}`}
        >
          <h1 className="text-xl sm:text-2xl text-center font-semibold my-4">
            Edit Your Profile
          </h1>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <input
              type="file"
              hidden
              ref={proImgUploader}
              accept="image/*"
              onChange={handleFileChange}
            />
            <img
              src={profileImage}
              alt="Profile"
              className="rounded-full h-24 w-24 sm:h-28 sm:w-28 object-cover cursor-pointer self-center mt-2"
              onClick={() => proImgUploader.current.click()}
            />
            <input
              type="text"
              placeholder="Username"
              className={`border p-3 rounded-lg app ${inputTheme}`}
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="phone"
              placeholder="Mobile No."
              className={`border p-3 rounded-lg app ${inputTheme}`}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className={`border p-3 rounded-lg app ${inputTheme}`}
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="New Password (optional)"
              className={`border p-3 rounded-lg app ${inputTheme}`}
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 transition duration-200"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
      ) : (
        <NotFound message="User not found" />
      )}
    </>
  );
};

export default UpdateProfile;
