import React, {useEffect, useMemo, useState, useCallback} from "react";
import {showAlert} from "../../Redux/slices/alertSlice";
import coverImg from "../../public/images/userpic.jpg";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import NotFound from "../../Components/NotFound";
import Loading from "../../Components/Loading";
import * as Icons from "react-icons/fa";
import Cookies from "js-cookie";

// Filter options: map these to actual filter values (use category or other properties)
const filterOptions = [
  {name: "Buy", value: "buy"},
  {name: "Sell", value: "sell"},
  {name: "Rent", value: "rent"},
  {name: "Offer", value: "offer"},
  {name: "Furnished", value: "furnished"},
  {name: "Parking Spot", value: "parking"},
  {name: "Clear Filter", value: ""},
];

const ShowAllProperty = () => {
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mode = useSelector((state) => state.theme.mode);
  const access_token = Cookies.get("access_token");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || !access_token) {
      navigate("/login");
      return;
    }

    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${host}/api/${currentUser?.role.toLowerCase()}/properties`,
          {
            method: "GET",
            headers: {authorization: access_token},
          }
        );
        const data = await res.json();
        if (data.success) {
          setProperties(data.properties);
          dispatch(showAlert({message: data?.message, type: "success"}));
        } else {
          dispatch(showAlert({message: data?.message, type: "error"}));
        }
      } catch (error) {
        dispatch(showAlert({message: error?.message, type: "error"}));
        console.log("Error fetching Properties: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;
    setLoading(true);
    try {
      const res = await fetch(
        `${host}/api/admin/delete-Property/${propertyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: access_token,
          },
          body: JSON.stringify({userRef}),
        }
      );
      const data = await res.json();
      if (data.success) {
        setProperties((prev) => prev.filter((p) => p._id !== propertyId));
        dispatch(showAlert({message: data?.message, type: "success"}));
      } else {
        dispatch(showAlert({message: data?.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
      console.log("Error deleting Property: ", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProperties = useCallback(() => {
    return properties.filter((property) => {
      const propertyCategories = [
        property.sell && "sell",
        property.buy && "buy",
        property.offer && "offer",
        property.rent && "rent",
        property.furnished && "furnished",
        property.parking && "parking",
      ].filter(Boolean);
      return filter.every((f) => propertyCategories.includes(f));
    });
  }, [properties, filter]);

  const filteredProperties = useMemo(getFilteredProperties, [
    getFilteredProperties,
  ]);

  const handleFilterChange = (value) => {
    setFilter((prevFilter) =>
      value === ""
        ? []
        : prevFilter.includes(value)
        ? prevFilter.filter((f) => f !== value)
        : [...prevFilter, value]
    );
  };

  const themeClass = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      filter: mode === "light" ? "bg-blue-100 border-blue-400" : "",
      hover: mode === "light" ? "hover:bg-gray-300" : "hover:bg-gray-800",
    }),
    [mode]
  );

  return (
    <>
      <div className={`min-h-screen p-4 -my-12 app ${themeClass.container}`}>
        {loading ? (
          <Loading />
        ) : (
          <>
            <h1 className="text-xl md:text-1xl font-semibold text-center mb-2">
              Property List
            </h1>
            <div className="flex flex-wrap justify-between items-center mb-2">
              <label
                className={`flex items-center gap-2 text-lg ${themeClass.filter}`}
              >
                <Icons.FaFilter className="text-blue-400" />
                <button
                  className="bg-transparent border p-1 rounded-lg"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  Select Filters
                </button>
                {isDropdownOpen && (
                  <div
                    className={`absolute app ${themeClass.container} border rounded-lg shadow-md w-36 mt-2 p-2 mx-36 -my-40`}
                  >
                    {filterOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={filter.includes(option.value)}
                          onChange={() => handleFilterChange(option.value)}
                          className={`mr-2 app ${
                            option.value == "" ? "hidden" : ""
                          }`}
                        />
                        {option.name}
                      </label>
                    ))}
                  </div>
                )}
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-500 text-white text-sm md:text-lg">
                    <th className="p-2">#</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Discount Price</th>
                    {access_token && currentUser?.role === "Admin" && (
                      <th className="p-2">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((property, i) => (
                      <tr
                        key={property._id}
                        className="border text-center text-sm md:text-base"
                      >
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2 flex items-center gap-2">
                          <img
                            className="w-10 h-10 rounded object-cover"
                            src={property.imageUrls?.[0] || coverImg}
                            alt="Property"
                          />
                          <Link
                            to={`/admin/property/${property._id}`}
                            className="px-2"
                          >
                            {property.title || "Property Name"}
                          </Link>
                        </td>
                        <td className="p-2">
                          {property.regularPrice
                            ? `$ ${property.regularPrice}`
                            : "N/A"}
                        </td>
                        <td className="p-2">
                          {property.discountPrice
                            ? `$ ${property.discountPrice}`
                            : "N/A"}
                        </td>
                        {access_token && currentUser?.role === "Admin" && (
                          <td className="p-2 flex gap-3 justify-center">
                            <Link
                              to={`/admin/update-property/${property._id}`}
                              className="text-blue-500"
                            >
                              <Icons.FaEdit size={24} />
                            </Link>
                            <button
                              onClick={() => handleDelete(property._id)}
                              className="text-red-500"
                            >
                              <Icons.FaTrash size={20} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          access_token && currentUser?.role === "Admin"
                            ? "5"
                            : "4"
                        }
                        className="text-center text-red-600 p-4"
                      >
                        <NotFound message="No Properties Found" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ShowAllProperty;
