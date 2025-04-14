import debounce from "lodash.debounce"; // Install lodash for debounce
import React, {useEffect, useState, useCallback, useMemo} from "react";
import {showAlert} from "../Redux/slices/alertSlice";
import {Link, useLocation} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import Loading from "./Loading";

const SearchPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const mode = useSelector((state) => state.theme.mode);
  const [matchedProperties, setMatchedProperties] = useState([]);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  // Extract search query
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q") || "";

  // Fetch properties (debounced)
  const fetchProperties = useCallback(
    debounce(async (query) => {
      if (!query.trim()) return setMatchedProperties([]);

      setLoading(true);
      try {
        const res = await fetch(`${host}/api/user/search?q=${query}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (data.success) {
          setMatchedProperties(data.properties);
        } else {
          dispatch(showAlert({message: data.message, type: "error"}));
        }
      } catch (error) {
        dispatch(
          showAlert({message: "Error fetching properties", type: "error"})
        );
      } finally {
        setLoading(false);
      }
    }, 500), // Debounce delay
    [host, dispatch]
  );

  useEffect(() => {
    fetchProperties(searchQuery);
  }, [searchQuery, fetchProperties]);

  const textTheme = useMemo(
    () => (mode === "light" ? "text-black" : "text-white"),
    [mode]
  );

  const overlayColor = useMemo(
    () =>
      mode === "light" ? "bg-white bg-opacity-40" : "bg-gray-900 bg-opacity-50",
    [mode]
  );

  const buttonClass = useMemo(
    () => "bg-indigo-600 hover:bg-indigo-700 text-white",
    []
  );
  return (
    <div className="container mx-auto px-4 py-14">
      <h2 className="text-2xl font-bold mb-6">
        Search Results for &quot;{searchQuery}&quot;
      </h2>

      {loading ? (
        <Loading />
      ) : matchedProperties.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {matchedProperties.map((property) => (
            <div
              key={property._id}
              className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 bg-white dark:bg-gray-800"
            >
              <div className="relative h-48 md:h-56 lg:h-64 w-full">
                <img
                  src={property.imageUrls[0]}
                  alt={property.title}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>

              <div className={`p-4 ${overlayColor}`}>
                <h3 className={`text-xl font-semibold mb-1 ${textTheme}`}>
                  {property.title}
                </h3>
                <span className={`text-sm mb-1 block ${textTheme}`}>
                  {property.type}
                </span>

                <div className={`text-lg font-bold mb-2 ${textTheme}`}>
                  ${property.regularPrice.toLocaleString()}
                </div>

                <p className={`text-sm mb-2 ${textTheme}`}>
                  {property.city}, {property.state}
                </p>

                <p className={`text-sm mb-3 line-clamp-3 ${textTheme}`}>
                  {property.description}
                </p>

                <Link
                  to={`/property/${property._id}`}
                  className={`block w-full text-center py-2 px-4 rounded-lg ${buttonClass} transition duration-300`}
                >
                  Show More
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-300">
          No matching properties found.
        </p>
      )}
    </div>
  );
};

export default SearchPage;
