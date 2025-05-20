import defaultProImg from "../../public/images/userpic.jpg";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {showAlert} from "../../Redux/slices/alertSlice";
import {useDispatch, useSelector} from "react-redux";
import NotFound from "../../Components/NotFound";
import Loading from "../../Components/Loading";
import DOMPurify from "dompurify";


const UpdateUser = () => {
  const {userId} = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const proImgUploader = useRef();
  const [file, setFile] = useState();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const access_token = localStorage.getItem("access_token");
  const [profileImage, setProfileImage] = useState();
  const mode = useSelector((state) => state.theme.mode);
  const {isLoggedIn} = useSelector((state) => state.user);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: DOMPurify.sanitize(value)});
  };

  useEffect(() => {
    if (!isLoggedIn || !access_token) {
      navigate("/login");
      return;
    }
  }, [userId, isLoggedIn, access_token]);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  }, [file]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${host}/api/admin/user/${userId}`, {
          method: "GET",
          headers: {authorization: access_token},
        });
        const data = await res.json();
        if (data.success) setFormData(data.user);
        else throw new Error(data.message);
      } catch (error) {
        dispatch(showAlert({message: error.message, type: "error"}));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, access_token]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile.type.startsWith("image/")) {
      return dispatch(showAlert({message: "Invalid file type", type: "error"}));
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      return dispatch(showAlert({message: "File must be <5MB", type: "error"}));
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach((key) =>
        formDataObj.append(key, formData[key])
      );
      if (file) formDataObj.append("profileImage", file);
      const res = await fetch(`${host}/api/admin/update-user/${userId}`, {
        method: "PUT",
        headers: {authorization: access_token},
        body: formDataObj,
      });
      const data = await res.json();
      if (data.success) {
        dispatch(showAlert({message: data.message, type: "success"}));
        navigate(`/admin/user/${userId}`);
      } else dispatch(showAlert({message: error.message, type: "error"}));
    } catch (error) {
      dispatch(showAlert({message: error.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  // Dynamic classes based on mode
  const themeclass = useMemo(
    () => ({
      container: mode === "light" ? "bg-gray-100" : "bg-gray-900 text-white",
      input:
        mode === "dark"
          ? "bg-gray-700 text-white border-gray-600"
          : "bg-white text-black border-gray-300",
      button:
        mode === "dark"
          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
          : "bg-indigo-600 hover:bg-indigo-700 text-white",
    }),
    [mode]
  );

  return (
    <>
      <div
        className={`min-h-screen overflow-y-auto app -my-14 ${themeclass.container} px-4 sm:px-6 lg:px-8`}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loading />
          </div>
        ) : formData ? (
          <div className="max-w-2xl mx-auto p-6 shadow-md rounded-lg w-full">
            <h1 className="text-xl text-center font-semibold pb-2">
              Update User Details
            </h1>
            <form
              className="flex flex-col gap-2"
              onSubmit={handleSubmit}
            >
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                hidden
                ref={proImgUploader}
                onChange={handleFileChange}
              />
              <img
                src={
                  profileImage
                    ? profileImage
                    : formData?.profileImage || defaultProImg
                }
                alt="DP"
                className="rounded-full h-24 w-24 object-cover cursor-pointer mx-auto"
                onClick={() => proImgUploader.current.click()}
              />
              <input
                type="text"
                placeholder="Username"
                className={`border p-1 rounded-lg ${themeclass.input} w-full`}
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                className={`border p-1 rounded-lg ${themeclass.input} w-full`}
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className={`border p-1 rounded-lg ${themeclass.input} w-full`}
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
              <select
                name="role"
                className={`border p-1 rounded-lg ${themeclass.input} w-full`}
                value={formData.role || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="User">User</option>
                <option value="Agent">Agent</option>
                <option value="Admin">Admin</option>
              </select>
              <input
                type="password"
                placeholder="Password (leave blank to keep current)"
                className={`border p-1 rounded-lg ${themeclass.input} w-full`}
                name="newPassword"
                value={formData?.newPassword || ""}
                onChange={handleChange}
              />
              <button
                disabled={
                  loading ||
                  !formData.email ||
                  !formData.username ||
                  formData.phone.length < 10 ||
                  formData.username.length < 4
                }
                type="submit"
                className={`p-2 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 ${themeclass.button} w-full`}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </form>
          </div>
        ) : (
          message && (
            <div className="text-red-600 text-center mt-2">
              <NotFound message="User" />
              {message}
            </div>
          )
        )}
      </div>
    </>
  );
};

export default UpdateUser;
