import debounce from "lodash.debounce"; // Install lodash for debounce
import React, {useEffect, useState, useCallback} from "react";
import {showAlert} from "../Redux/slices/alertSlice";
import {useLocation} from "react-router-dom";
import {useDispatch} from "react-redux";
import Loading from "./Loading";
import Card from "./Card";

const SearchPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        Search Results for &quot;{searchQuery}&quot;
      </h2>
      {loading ? (
        <Loading />
      ) : matchedProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {matchedProperties.map((property) => (
            <Card
              key={property._id}
              property={property}
            />
          ))}
        </div>
      ) : (
        <p>No matching properties found.</p>
      )}
    </div>
  );
};

export default SearchPage;
