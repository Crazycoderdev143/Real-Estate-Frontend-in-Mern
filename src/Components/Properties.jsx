import React, {useEffect, useState, useMemo} from "react";
import {showAlert} from "../Redux/slices/alertSlice";
import {useDispatch, useSelector} from "react-redux";
import PropTypes from "prop-types";

const locationOptions = ["New York", "Los Angeles", "San Francisco", "Chicago"];
const bedroomOptions = [1, 2, 3, 4, 5];

const Properties = ({onSearch}) => {
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";
  const dispatch = useDispatch();

  const mode = useSelector((state) => state.theme.mode);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  // Memoized classes to avoid unnecessary re-renders
  const containerTheme = useMemo(
    () =>
      mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
    [mode]
  );

  const cardTheme = useMemo(
    () => (mode === "light" ? "bg-white text-black" : "bg-gray-800 text-white"),
    [mode]
  );

  const buttonClass = useMemo(
    () =>
      mode === "dark"
        ? "bg-gray-700 hover:bg-cyan-500"
        : "bg-blue-600 hover:bg-cyan-500",
    [mode]
  );

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${host}/api/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (data.success) {
          setProperties(data.Properties);
          setFilteredProperties(data.Properties);
        } else {
          dispatch(showAlert({message: data?.message, type: "error"}));
        }
      } catch (error) {
        dispatch(showAlert({message: error.message, type: "error"}));
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []); // Removed [host] as it's static

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({location, minPrice, maxPrice, bedrooms});
    } else {
      console.error("onSearch function not provided");
    }
  };

  return (
    <div className={`min-h-screen pt-12 p-2 sm:p-6 sm:pt-14 ${containerTheme}`}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Search Properties
        </h1>
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          onSubmit={handleSearch}
        >
          <select
            className={`${cardTheme} p-3 rounded w-full`}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Select Location</option>
            {locationOptions.map((loc, index) => (
              <option
                key={index}
                value={loc}
              >
                {loc}
              </option>
            ))}
          </select>

          <input
            className={`${cardTheme} p-3 rounded w-full`}
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />

          <input
            className={`${cardTheme} p-3 rounded w-full`}
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <select
            className={`${cardTheme} p-3 rounded w-full`}
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          >
            <option value="">Select Bedrooms</option>
            {bedroomOptions.map((bedroom, index) => (
              <option
                key={index}
                value={bedroom}
              >
                {bedroom} Bedroom{bedroom > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className={`col-span-1 sm:col-span-2 p-3 w-full sm:w-auto ${buttonClass} text-white font-bold rounded`}
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

// PropTypes for better maintainability and debugging
Properties.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default Properties;
