import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";

const Card = ({property}) => {
  const mode = useSelector((state) => state.theme.mode);

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
    <div
      className={`w-1/4 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 relative`}
      style={{
        backgroundImage: `url(${property.imageUrls[0]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for contrast */}
      <div className={`p-4 h-full w-full ${overlayColor}`}>
        <h2
          className={`text-xl md:text-2xl font-bold mb-2 flex items-center justify-between ${textTheme}`}
        >
          <span>{property.title}</span>
          <span className="text-sm md:text-base">{property.type}</span>
        </h2>
        <div className={`text-lg md:text-2xl font-semibold ${textTheme}`}>
          ${property.regularPrice}
        </div>
        <p className={`text-sm md:text-lg mb-2 ${textTheme}`}>
          {property.city}, {property.state}
        </p>
        <p className={`text-sm md:text-lg mb-2 line-clamp-3 min-h-20 ${textTheme}`}>
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
