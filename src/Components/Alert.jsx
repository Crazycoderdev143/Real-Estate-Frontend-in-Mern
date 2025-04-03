import React, {useEffect, useRef} from "react";
import {useSelector, useDispatch} from "react-redux";
import {hideAlert} from "../Redux/slices/alertSlice.js";
import {motion, AnimatePresence} from "framer-motion";

// ✅ Move styles outside the function (better performance)
const alertStyles = {
  success: "bg-green-100 text-green-800 border-green-400",
  error: "bg-red-100 text-red-800 border-red-400",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
  info: "bg-blue-100 text-blue-800 border-blue-400",
};

const Alert = () => {
  const dispatch = useDispatch();
  const {
    show = false,
    message = "",
    type = "info",
  } = useSelector((state) => state.alert);
  const timeoutRef = useRef(null); // ✅ Store timeout ID to prevent stacking

  useEffect(() => {
    if (show) {
      timeoutRef.current = setTimeout(() => {
        dispatch(hideAlert());
      }, 3000);

      return () => clearTimeout(timeoutRef.current);
    }
  }, [show, dispatch]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{y: -100, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{y: -100, opacity: 0}}
          transition={{duration: 0.5}}
          className="fixed inset-4 flex items-start justify-center z-50"
        >
          <div
            className={`flex p-3 border-l-4 rounded shadow-md ${alertStyles[type]}`}
            role="alert"
          >
            <div>{message}</div>
            <button
              onClick={() => dispatch(hideAlert())}
              className="ml-4 text-lg font-semibold text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              &times;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
