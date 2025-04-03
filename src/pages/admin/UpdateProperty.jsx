import {showAlert} from "../../Redux/slices/alertSlice";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useMemo, useState} from "react";
import NotFound from "../../Components/NotFound";
import Loading from "../../Components/Loading";
import Cookies from "js-cookie";

const UpdateProperty = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {propertyId} = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const access_token = Cookies.get("access_token");
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);
  const userRef = currentUser?._id; // Simulating user reference (Replace dynamically)
  const [formData, setFormData] = useState({userRef});
  const host = import.meta.env.VITE_HOST || "http://localhost:8000"; // Environment variable
  const mode = useSelector((state) => state.theme.mode); // Get the current mode (light or dark)

  useEffect(() => {
    if (!isLoggedIn || !access_token) {
      navigate("/login");
      return;
    }

    if (!propertyId) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${host}/api/admin/property/${propertyId}`, {
          method: "GET",
          headers: {authorization: access_token},
        });

        const data = await res.json();

        if (!data.success) {
          dispatch(showAlert({message: data?.message, type: "error"}));
          return;
        }
        // Convert existing images into preview format
        const existingImages = data.property?.imageUrls.map((imgUrl) => ({
          file: null,
          preview: imgUrl,
        }));

        setFormData((prevFormData) => ({
          ...prevFormData, // Keep any existing data
          ...data.property, // Spread main property fields
          sqft: data.property?.dimensions?.sqft || "",
          name: data.property?.owner?.name || "",
          email: data.property?.owner?.email || "",
          phone: data.property?.owner?.phone || "",
        }));
        setImages(existingImages);
      } catch (error) {
        dispatch(showAlert({message: error.message, type: "error"}));
        console.error("Failed to fetch property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]); // Only depends on `propertyId`

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      dispatch(
        showAlert({message: "Maximum of 6 images allowed.", type: "error"})
      );
      return;
    }

    const newImages = files.map((file) => {
      const preview = URL.createObjectURL(file);
      return {file, preview};
    });

    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => {
      const newImages = prevImages.filter((_, i) => i !== index);

      // Cleanup unused object URLs
      if (!newImages[index]?.preview.startsWith("http")) {
        URL.revokeObjectURL(prevImages[index].preview);
      }

      return newImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataObj = new FormData();

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          formDataObj.append(key, JSON.stringify(value)); // ✅ Convert objects to JSON strings
        } else {
          formDataObj.append(key, value);
        }
      });

      // Append images
      images.forEach((img) =>
        formDataObj.append("propertyImages", img.file || img.preview)
      );
      const res = await fetch(
        `${host}/api/admin/update-property/${propertyId}`,
        {
          method: "PUT",
          headers: {authorization: access_token}, // Keep Authorization Secure
          body: formDataObj,
        }
      );

      const data = await res.json();
      if (data.success) {
        dispatch(showAlert({message: data.message, type: "success"}));
        navigate(`/property/${propertyId}`);
      } else {
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const {name, type, checked, value} = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const themeClass = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      input:
        mode === "light"
          ? "border-gray-300"
          : "border-gray-600 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500",
      button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    }),
    [mode]
  );

  return (
    <>
      <div
        className={`p-3 min-w-svh min-h-full -my-28 app ${themeClass.container}`}
      >
        {loading ? (
          <div className="my-28">
            <Loading />
          </div>
        ) : formData ? (
          <>
            <h1 className="text-2xl font-semibold text-center mt-12">
              Update property
            </h1>
            <form
              className="flex flex-col sm:flex-row"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-2 flex-1 w-full sm:w-1/2 p-3">
                {[
                  {name: "title", placeholder: "Name"},
                  {
                    name: "description",
                    placeholder: "Description",
                    type: "textarea",
                  },
                  {name: "city", placeholder: "City"},
                  {name: "state", placeholder: "State"},
                  {name: "country", placeholder: "Country"},
                  {
                    name: "dimensions.sqft",
                    placeholder: "Dimensions in Sqft",
                    type: "number",
                  },
                  {name: "owner.name", placeholder: "Owner Name"},
                  {
                    name: "owner.phone",
                    placeholder: "Owner Mobile No.",
                    type: "phone",
                  },
                  {
                    name: "owner.email",
                    placeholder: "Owner Email",
                    type: "email",
                  },
                ].map(({name, placeholder, type = "text"}) => (
                  <input
                    key={name}
                    type={type}
                    name={name}
                    value={
                      name
                        .split(".")
                        .reduce((obj, key) => obj?.[key], formData) || ""
                    }
                    placeholder={placeholder}
                    className={`border p-1 rounded-lg focus:ring-2 app ${themeClass.input}`}
                    onChange={handleChange}
                    required
                  />
                ))}
                <div className="flex gap-2 flex-wrap">
                  {["offer", "rent", "sell", "buy", "furnished", "parking"].map(
                    (field) => (
                      <label
                        key={field}
                        className="flex gap-1"
                      >
                        <input
                          type="checkbox"
                          name={field}
                          checked={formData?.[field] || false}
                          disabled={
                            ["sell", "buy"].includes(field) &&
                            formData?.[field === "sell" ? "buy" : "sell"]
                          }
                          onChange={handleChange}
                        />
                        <span>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </span>
                      </label>
                    )
                  )}
                </div>
                <div className="flex gap-2">
                  {["bedrooms", "bathrooms"].map((field) => (
                    <label
                      key={field}
                      className="flex items-center gap-1"
                    >
                      <input
                        type="number"
                        name={field}
                        value={formData?.[field] || ""}
                        className={`border rounded-lg w-16 no-spinner px-4 py-1 focus:ring-2 app ${themeClass.input}`}
                        onChange={handleChange}
                        min="1"
                      />
                      <span>
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col flex-1 my-2 gap-1">
                {["regularPrice", "discountPrice"].map((field) => (
                  <label
                    key={field}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="number"
                      name={field}
                      value={formData?.[field] || ""}
                      className={`no-spinner border rounded-lg px-4 py-1 focus:ring-2 app ${themeClass.input}`}
                      onChange={handleChange}
                    />
                    <div>
                      {field.replace("Price", " Price")}
                      {formData?.rent && (
                        <div className="text-xs">(Rs/Month)</div>
                      )}
                    </div>
                  </label>
                ))}
                <select
                  name="type"
                  value={formData?.type || ""}
                  className={`border p-1 rounded-lg focus:ring-2 app ${themeClass.input}`}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="home">Home</option>
                </select>
                <p>
                  Images: The first image will be the cover page of this
                  property (Max-6)
                </p>
                <input
                  name="propertyImages"
                  type="file"
                  multiple
                  accept="image/*"
                  required={images.length === 0}
                  onChange={handleImageUpload}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg"
                />
                {images.length > 0 && (
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className="relative group"
                      >
                        <img
                          src={img.preview || ""}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="submit"
                  className={`w-full app ${themeClass.button} py-2 px-4 rounded-md`}
                >
                  Update property
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-red-600 text-center my-28">
            <NotFound message={"property"} />
            {message}
          </div>
        )}
      </div>
    </>
  );
};

export default UpdateProperty;
