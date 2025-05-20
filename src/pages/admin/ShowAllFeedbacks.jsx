import {showAlert} from "../../Redux/slices/alertSlice";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import React, {useEffect, useState, useMemo} from "react";
import NotFound from "../../Components/NotFound";
import Loading from "../../Components/Loading";
import * as Icons from "react-icons/fa";


const ShowAllFeedbacks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const access_token = localStorage.getItem("access_token");
  const mode = useSelector((state) => state.theme.mode);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);

  useEffect(() => {
    if (!isLoggedIn || !access_token) {
      navigate("/login");
      return;
    }
    fetchFeedbacks();
  }, [isLoggedIn, access_token]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${host}/api/admin/feedbacks`, {
        method: "GET",
        headers: {authorization: access_token},
      });
      const data = await res.json();

      if (data.success) {
        setFeedbacks(data.feedbacks);
      } else {
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      console.error("Error fetching feedbacks: ", error);
      dispatch(showAlert({message: error.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletefeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this Feedback?"))
      return;
    setLoading(true);
    try {
      const res = await fetch(
        `${host}/api/admin/delete-feedback/${feedbackId}`,
        {
          method: "DELETE",
          headers: {authorization: access_token},
        }
      );
      const data = await res.json();

      if (data.success) {
        setFeedbacks((prev) =>
          prev.filter((feedback) => feedback?._id !== feedbackId)
        );
        dispatch(showAlert({message: data.message, type: "success"}));
      } else {
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      console.error("Error deleting feedback: ", error);
      dispatch(showAlert({message: error.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const sortedfeedbacks = useMemo(() => {
    return [...feedbacks].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [feedbacks]);

  const themeClass = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-white text-black" : "bg-gray-800 text-white",
      text: mode === "light" ? "text-gray-700" : "text-gray-300",
      starActive: "text-yellow-400",
      starInactive: "text-gray-300",
    }),
    [mode]
  );
  return (
    <div
      className={`${themeClass.container} 
        flex flex-col items-center min-h-screen -mt-12 p-4`}
    >
      {loading ? (
        <Loading />
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-center mb-4">
            Feedback List
          </h1>
          <div className="w-full max-w-4xl">
            <div className="hidden md:flex justify-between text-lg font-semibold p-2 rounded-lg">
              <div className="w-1/4">Username</div>
              <div className="w-1/4">Rating</div>
              <div className="w-1/4">Content</div>
              <div className="w-1/4">Date</div>
            </div>
            {feedbacks.length > 0 ? (
              sortedfeedbacks.map((feedback) => (
                <div
                  key={feedback?._id}
                  className="flex flex-col md:flex-row items-center justify-between rounded-lg p-3 my-2 shadow-md w-full hover:bg-gray-500 transition"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between rounded-lg w-full">
                    <div className="w-full md:w-1/4 text-center md:text-left">
                      {feedback?.username || "Unknown"}
                    </div>
                    <div className="w-full md:w-1/4 text-center flex">
                      {feedback?.rating
                        ? [...Array(5)].map((_, i) => (
                            <Icons.FaStar
                              key={i}
                              className={
                                i < feedback?.rating
                                  ? themeClass.starActive
                                  : themeClass.starInactive
                              }
                            />
                          ))
                        : "No Rating"}
                    </div>
                    <div className="w-full md:w-1/4 text-center truncate">
                      {feedback?.comment?.length > 15
                        ? feedback?.comment.slice(0, 15) + "..."
                        : feedback?.comment || "No Content"}
                    </div>
                    <div className="w-full md:w-1/4 text-center">
                      {new Date(feedback?.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {access_token && currentUser?.role === "Admin" && (
                    <button
                      onClick={() => handleDeletefeedback(feedback?._id)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-700 transition mt-2 md:mt-0"
                    >
                      <Icons.FaTrash size={20} /> Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <NotFound message="No feedbacks found." />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ShowAllFeedbacks;
