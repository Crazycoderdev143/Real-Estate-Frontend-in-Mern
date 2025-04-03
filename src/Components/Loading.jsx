import React from "react";
import {FaSpinner} from "react-icons/fa";
import {useSelector} from "react-redux";

const Loading = () => {
  const mode = useSelector((state) => state.theme.mode);
  return (
    <div
      className={`flex justify-center items-center flex-col min-h-screen ${
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white"
      }`}
      aria-label="Loading..."
      role="status"
    >
      <FaSpinner className="animate-spin text-8xl" />
      <p className="mt-2 text-lg font-semibold">Loading...</p>
    </div>
  );
};

export default Loading;
