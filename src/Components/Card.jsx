import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";

const Card = ({property}) => {
  const mode = useSelector((state) => state.theme.mode);

  // ✅ Memoize theme classes to prevent unnecessary calculations
  const cardTheme = useMemo(
    () => (mode === "light" ? "bg-white text-black" : "bg-gray-700 text-white"),
    [mode]
  );

  const buttonClass = useMemo(
    () =>
      mode === "dark"
        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
        : "bg-indigo-600 hover:bg-indigo-700 text-white",
    [mode]
  );

  return (
    <div
      className={`w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg border border-gray-700 shadow-lg overflow-hidden ${cardTheme} transform hover:scale-105 transition-transform duration-300`}
    >
      <img
        src={property.imageUrls[0]}
        alt="Property img"
        className="w-full h-56 object-cover"
        loading="lazy" // ✅ Improves performance (lazy loading)
      />
      <div className="p-4">
        <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center justify-between">
          <span>{property.title}</span>
          <span className="text-sm md:text-base">{property.type}</span>
        </h2>
        <div className="text-lg md:text-2xl font-semibold">
          ${property.regularPrice}
          {/* ✅ Improves readability */}
        </div>
        <p className="text-sm md:text-lg mb-2">
          {property.city}, {property.state}
        </p>
        <p className="text-sm md:text-lg mb-2 line-clamp-3">
          {property.description}
        </p>
        <div className="flex justify-between items-center mb-3">
          <Link
            to={`/property/${property._id}`}
            className={`py-2 px-6 rounded-lg ${buttonClass} transition duration-300 text-center w-full md:w-auto`}
          >
            Show More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
