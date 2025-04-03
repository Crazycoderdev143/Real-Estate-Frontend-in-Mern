import defaultProImg from "../../public/images/userpic.jpg";
import {showAlert} from "../../Redux/slices/alertSlice";
import React, {useState, useRef, useCallback, useMemo} from "react";
import {useSelector, useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import Loading from "../../Components/Loading";
import Cookies from "js-cookie";

const AddNewUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const proImgUploader = useRef();
  const [file, setFile] = useState();
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState();
  const mode = useSelector((state) => state.theme.mode);
  const {isLoggedIn} = useSelector((state) => state.user);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  if (!isLoggedIn || !Cookies.get("access_token")) navigate("/login");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.size > 2 * 1024 * 1024) {
      setMessage("File size should be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result);
    reader.readAsDataURL(selectedFile);
    setFile(selectedFile);
  };

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value.trim(),
    }));
  }, []);

  const validateForm = () => {
    if (!formData?.username || !formData?.email || !formData?.password) {
      setMessage("All fields are required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      formDataObj.append(key, value)
    );
    if (file) formDataObj.append("profileImage", file);

    try {
      const res = await fetch(`${host}/api/admin/add-new-user`, {
        method: "POST",
        credentials: "include",
        body: formDataObj,
      });
      const data = await res.json();

      if (data?.success) {
        dispatch(showAlert({message: data?.message, type: "success"}));
        navigate(`/admin/user/${data?.user?._id}`);
      } else {
        dispatch(showAlert({message: data?.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const themeClass = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      input:
        mode === "light"
          ? "border-gray-300"
          : "border-gray-600 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500",
      card: mode === "light" ? "bg-white" : "bg-gray-800",
    }),
    [mode]
  );

  return (
    <div
      className={`min-h-screen flex items-start justify-center py-8 -mt-12 app ${themeClass.container}`}
    >
      {loading ? (
        <Loading />
      ) : (
        <div
          className={`p-6 w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-lg shadow-lg app ${themeClass.card}`}
        >
          <h1 className="text-xl md:text-xl font-semibold text-center my-3">
            Add New User
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
              src={profileImage ? profileImage : defaultProImg}
              alt="User"
              className="rounded-full h-24 w-24 object-cover cursor-pointer self-center border-4 border-gray-300"
              onClick={() => proImgUploader.current.click()}
            />
            <input
              type="text"
              placeholder="Username"
              className={`border p-2 rounded-lg w-full app ${themeClass.input}`}
              name="username"
              value={formData?.username || ""}
              onChange={handleChange}
              required
            />
            <input
              type="phone"
              placeholder="Mobile no."
              className={`border p-2 rounded-lg w-full app ${themeClass.input}`}
              name="phone"
              value={formData?.phone || ""}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className={`border p-2 rounded-lg w-full app ${themeClass.input}`}
              name="email"
              value={formData?.email || ""}
              onChange={handleChange}
              required
            />
            <select
              name="role"
              className={`border p-2 rounded-lg w-full app ${themeClass.input}`}
              value={formData?.role || ""}
              onChange={handleChange}
              required
            >
              <option>Select Role</option>
              <option value="User">User</option>
              <option value="Agent">Agent</option>
              <option value="Admin">Admin</option>
            </select>
            <input
              type="password"
              placeholder="Password"
              className={`border p-2 rounded-lg w-full app ${themeClass.input}`}
              name="password"
              value={formData?.password || ""}
              onChange={handleChange}
              required
            />
            <button
              disabled={
                !formData?.username ||
                !formData?.email ||
                !formData?.password ||
                (formData?.phone && formData?.phone.length < 10)
              }
              type="submit"
              className="p-3 rounded-lg uppercase w-full text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-80"
            >
              {loading ? "Loading..." : "Save User"}
            </button>
            {message && (
              <div className="text-red-500 text-center mt-2">{message}</div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default AddNewUser;
