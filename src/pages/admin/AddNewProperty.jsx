import React, {useEffect, useState, useMemo, useCallback} from "react";
import {showAlert} from "../../Redux/slices/alertSlice";
import {useSelector, useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";

// Utility function for validation (improves maintainability)
const validateForm = (formData, dispatch) => {
  if (
    !formData.title.trim() ||
    !formData.city.trim() ||
    !formData.state.trim() ||
    !formData.country.trim()
  ) {
    dispatch(
      showAlert({message: "All required fields must be filled.", type: "error"})
    );
    return false;
  }
  if (!/^\d{10}$/.test(formData.phone)) {
    dispatch(showAlert({message: "Invalid phone number.", type: "error"}));
    return false;
  }
  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
    // Stricter email validation
    dispatch(showAlert({message: "Invalid email format.", type: "error"}));
    return false;
  }
  return true;
};

const AddNewProperty = () => {
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const host = import.meta.env.VITE_HOST || "http://localhost:8000";
  const access_token = useMemo(() => Cookies.get("access_token"), []);
  const userRef = currentUser?._id;

  const MAX_IMAGES = 6;
  const [formData, setFormData] = useState({
    title: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    email: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !access_token) navigate("/login");
  }, [isLoggedIn, access_token, navigate]);

  // 🖼️ Image Upload Handling (Optimized)
  const handleImageUpload = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (files.length + images.length > MAX_IMAGES) {
        dispatch(
          showAlert({
            message: `Max ${MAX_IMAGES} images allowed.`,
            type: "error",
          })
        );
        return;
      }

      const validFiles = files.filter((file) => {
        if (!file.type.startsWith("image/")) {
          dispatch(showAlert({message: "Only images allowed.", type: "error"}));
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          dispatch(
            showAlert({message: "Image size must be under 5MB.", type: "error"})
          );
          return false;
        }
        return true;
      });

      const newImages = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
    },
    [images, dispatch]
  );

  // 📝 Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData, dispatch)) return;

    setLoading(true);

    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        formDataObj.append(key, value)
      );
      images.forEach((img) => formDataObj.append("propertyImages", img.file));

      const res = await fetch(`${host}/api/admin/add-new-property/${userRef}`, {
        method: "POST",
        headers: {authorization: access_token},
        body: formDataObj,
      });

      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.message || "Something went wrong.");

      dispatch(showAlert({message: data.message, type: "success"}));
      setFormData({userRef});
      setImages([]);
      navigate(`/property/${data?.property?._id}`);
    } catch (error) {
      dispatch(showAlert({message: error.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  // ❌ Remove Image (Optimized)
  const removeImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // 📩 Handle Input Changes (Optimized)
  const handleChange = useCallback((e) => {
    const {name, value, type, checked} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const themeClass = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      input:
        mode === "light"
          ? "border-gray-300"
          : "border-gray-600 bg-gray-800 text-white focus:ring-blue-500",
    }),
    [mode]
  );

  return (
    <div
      className={`px-4 sm:px-10 py-2 -mt-12 min-w-full min-h-screen app ${themeClass.container}`}
    >
      <h1 className="text-xl font-semibold text-center mb-2">
        Add New Property
      </h1>
      <form
        className="flex flex-col sm:flex-row"
        onSubmit={handleSubmit}
      >
        {/* Left Form Section */}
        <div className="flex flex-col gap-2 flex-1 p-2 rounded-lg shadow-md">
          {[
            "title",
            "description",
            "city",
            "state",
            "country",
            "name",
            "phone",
            "email",
          ].map((field) => (
            <input
              key={field}
              type={field === "phone" ? "tel" : "text"}
              name={field}
              placeholder={field.replace(/([A-Z])/g, " $1")}
              className={`p-1 border rounded-lg focus:ring-2 app ${themeClass.input}`}
              onChange={handleChange}
              required
            />
          ))}

          <input
            type="number"
            name="sqft"
            placeholder="Dimensions in Sqft"
            className={`p-2 border rounded-lg focus:ring-2 app ${themeClass.input}`}
            onChange={handleChange}
            required
          />

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            {["offer", "rent", "sell", "buy", "furnished", "parking"].map(
              (field) => (
                <Checkbox
                  key={field}
                  name={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  className={`p-2 border rounded-lg app ${themeClass.input}`}
                  onChange={handleChange}
                  disabled={
                    field === "sell"
                      ? formData.buy
                      : field === "buy"
                      ? formData.sell
                      : false
                  }
                />
              )
            )}
          </div>

          {/* Bedroom & Bathroom Inputs */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            {["bedrooms", "bathrooms"].map((field) => (
              <input
                key={field}
                type="number"
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className={`p-2 border rounded-lg w-full sm:w-1/2 focus:ring-2 app ${themeClass.input}`}
                onChange={handleChange}
                min="1"
                required
              />
            ))}
          </div>
        </div>

        {/* Right Form Section */}
        <div className="flex flex-col gap-2 flex-1 p-3 rounded-lg shadow-md">
          <div className="flex items-center gap-1">
            <input
              type="number"
              name="regularPrice"
              placeholder="Price"
              className={` px-4 py-1 border rounded-lg focus:ring-2 app ${themeClass.input}`}
              onChange={handleChange}
              required
            />
            {formData.rent && <div className="text-xs">(Rs/Month)</div>}
          </div>

          <div className="flex items-center gap-1 my-1">
            <input
              type="number"
              name="discountPrice"
              placeholder="Discount Price"
              className={` px-4 py-1 border rounded-lg focus:ring-2 app ${themeClass.input}`}
              onChange={handleChange}
            />
            {formData.rent && <div className="text-xs">(Rs/Month)</div>}
          </div>

          {/* Property Type Dropdown */}
          <select
            name="type"
            className={`p-2 border rounded-lg app ${themeClass.input}`}
            onChange={handleChange}
            required
          >
            <option>Select Type</option>
            {["Apartment", "Home", "Hostel", "Villa", "Plot"].map((type) => (
              <option
                key={type}
                value={type.toLowerCase()}
              >
                {type}
              </option>
            ))}
          </select>

          {/* Image Upload */}
          <p className="text-sm">Images (Max: 6)</p>
          <input
            type="file"
            name="propertyImages"
            multiple
            accept="image/*"
            className={`p-2 border rounded-lg focus:ring-2 app ${themeClass.input}`}
            onChange={handleImageUpload}
          />

          {/* Image Previews */}
          <ImagePreviews
            images={images}
            removeImage={removeImage}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "Adding... Property" : "Add Property"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable Checkbox Component
const Checkbox = ({name, label, onChange, disabled}) => (
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      name={name}
      onChange={onChange}
      disabled={disabled}
    />
    {label}
  </label>
);

// Reusable Image Preview Component
const ImagePreviews = ({images, removeImage}) =>
  images.length > 0 && (
    <div className="grid grid-cols-3 gap-4">
      {images.map((img, index) => (
        <div
          key={index}
          className="relative group"
        >
          <img
            src={img.preview}
            alt="Preview"
            className="w-full h-24 object-cover rounded-md"
          />
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );

export default AddNewProperty;
