import React, {useEffect, useRef, useState, useCallback, useMemo} from "react";
import defaultProImg from "../../public/images/userpic.jpg";
import {showAlert} from "../../Redux/slices/alertSlice";
import {useSelector, useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import Loading from "../../Components/Loading";
import Cookies from "js-cookie";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const SendNotification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const access_token = Cookies.get("access_token");
  const mode = useSelector((state) => state.theme.mode);
  const {isLoggedIn} = useSelector((state) => state.user);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  const [formData, setFormData] = useState({
    url: "",
    type: "",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!isLoggedIn || !access_token) navigate("/login");
  }, [isLoggedIn, access_token, navigate]);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  const validateForm = () => {
    if (Object.values(formData).some((field) => !field)) {
      setErrorMessage("All fields are required.");
      return false;
    }
    return true;
  };

  const handleFileChange = useCallback(
    (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
        dispatch(
          showAlert({
            message: "File size should be less than 2MB",
            type: "error",
          })
        );
        return;
      }
      setFile(selectedFile);
    },
    [dispatch]
  );

  const handleChange = (e) => {
    setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
  };

  const sendNotificationRequest = async () => {
    const notification = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      notification.append(key, value)
    );
    if (file) notification.append("notificationImage", file);

    const res = await fetch(`${host}/api/admin/send-notification`, {
      method: "POST",
      headers: {authorization: access_token},
      body: notification,
    });

    return res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await sendNotificationRequest();
      dispatch(
        showAlert({
          message: data?.message,
          type: data?.success ? "success" : "error",
        })
      );
      if (data?.success)
        setFormData({type: "", title: "", message: "", url: ""});
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const themeClass = useMemo(() => ({
    container:
      mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
    input:
      mode === "light"
        ? "border-gray-300"
        : "border-gray-600 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500",
    card: mode === "light" ? "bg-white" : "bg-gray-800",
  }));

  return (
    <div
      className={`min-h-screen flex items-start justify-center py-4 -mt-12 app ${themeClass.container}`}
    >
      {loading ? (
        <Loading />
      ) : (
        <div
          className={`p-5 pt-3 w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-lg shadow-lg app ${themeClass.card}`}
        >
          <h1 className="text-xl md:text-xl font-semibold text-center my-2">
            Send Notification
          </h1>
          <form
            className="flex flex-col gap-2"
            onSubmit={handleSubmit}
          >
            <input
              type="file"
              hidden
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <img
              src={preview || defaultProImg}
              alt="notification preview"
              className="rounded-full h-24 w-24 object-cover cursor-pointer self-center border-4 border-gray-300"
              onClick={() => fileInputRef.current.click()}
            />

            <select
              name="type"
              className={`border p-2 rounded-lg w-full app ${themeClass.input}`}
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Notification Type</option>
              {[
                "New Listing Alert!",
                "Price Drop!",
                "Visit This Weekend!",
                "Exclusive Launch Offer!",
                "New Rental Alert!",
                "Market Update!",
                "Good News!",
              ].map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>

            {["title", "message", "url"].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={`Notification ${field}`}
                className={`border p-2 rounded-lg w-full app ${themeClass.input}`}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
              />
            ))}

            <button
              disabled={!formData.title || !formData.message || !formData.type}
              type="submit"
              className="p-3 rounded-lg uppercase w-full text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-80"
            >
              {loading ? "Loading..." : "Send Notification"}
            </button>

            {errorMessage && (
              <div className="text-red-500 text-center mt-2">
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default SendNotification;
