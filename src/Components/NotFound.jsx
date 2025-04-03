import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";

const NotFound = ({message = "Page", code = 404}) => {
  const mode = useSelector((state) => state.theme.mode);
  const themeClass = useMemo(
    () =>
      mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
    [mode]
  );

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-4 text-center ${themeClass}`}
      aria-label={`${code} Not Found`}
    >
      <h1 className="text-6xl sm:text-9xl font-bold text-indigo-500">{code}</h1>
      <h2 className="text-2xl sm:text-4xl font-semibold mt-4">
        {message} Not Found
      </h2>
      <p className="text-gray-600 mt-2">
        Sorry, the {message.toLowerCase()} you are looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 w-full sm:w-auto bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all"
      >
        Go Home
      </Link>
    </div>
  );
};

// PropTypes for better type safety
NotFound.propTypes = {
  message: PropTypes.string,
  code: PropTypes.number,
};

export default NotFound;
