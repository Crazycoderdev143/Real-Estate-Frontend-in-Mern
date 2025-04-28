import {useMemo, useState} from "react";
import {FaStar} from "react-icons/fa";
import {useSelector, useDispatch} from "react-redux";
import {showAlert} from "../Redux/slices/alertSlice";

const FeedbackPopup = () => {
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";
  const mode = useSelector((state) => state.theme.mode);
  const [showPopup, setShowPopup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(null);
  const [rating, setRating] = useState(0);
  const username = currentUser?.username;
  const userId = currentUser?._id;
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${host}/api/user/feedback`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({rating, comment, userId, username}),
      });
      const data = await res.json();

      if (data.success) {
        setShowPopup(false);
        localStorage.setItem("sentFeedback", "true");
        dispatch(showAlert({message: data.message, type: "success"}));
      } else {
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: "Something went wrong!", type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const themeClass = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-white text-black" : "bg-gray-800 text-white",
      input:
        mode === "light"
          ? "border-gray-300 bg-white text-black"
          : "border-gray-600 bg-gray-700 text-white",
      buttonPrimary:
        mode === "light"
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-blue-500 text-white hover:bg-blue-600",
      buttonSecondary:
        mode === "light"
          ? "bg-gray-400 text-white hover:bg-gray-500"
          : "bg-gray-600 text-white hover:bg-gray-700",
      text: mode === "light" ? "text-gray-700" : "text-gray-300",
      starActive: "text-yellow-400",
      starInactive: "text-gray-300",
    }),
    [mode]
  );

  return (
    isLoggedIn &&
    showPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
        <div
          className={`p-6 rounded-lg shadow-lg max-w-sm w-full md:max-w-md lg:max-w-lg ${themeClass.container}`}
        >
          <h2 className="text-xl font-semibold mb-4 text-center">
            Give Your Feedback
          </h2>
          <p className={`mb-4 text-center ${themeClass.text}`}>
            We'd love your feedback! How was your experience?
          </p>

          {/* Star Rating */}
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <FaStar
                  key={index}
                  className={`cursor-pointer text-2xl transition ${
                    starValue <= (hover || rating)
                      ? themeClass.starActive
                      : themeClass.starInactive
                  }`}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHover(starValue)}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </div>

          {/* Text Input for Feedback */}
          <textarea
            className={`w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClass.input}`}
            placeholder="Tell us more about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <button
              className={`px-4 py-2 rounded-md transition ${themeClass.buttonSecondary}`}
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
            <button
              className={`px-4 py-2 rounded-md transition ${
                rating && comment.trim()
                  ? themeClass.buttonPrimary
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              onClick={handleSubmit}
              disabled={!rating || !comment.trim()}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default FeedbackPopup;
