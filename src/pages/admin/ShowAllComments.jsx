import {showAlert} from "../../Redux/slices/alertSlice";
import {useSelector, useDispatch} from "react-redux";
import React, {useEffect, useMemo, useState} from "react";
import Loading from "../../Components/Loading";
import {useNavigate} from "react-router-dom";


const ShowAllComments = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const access_token = localStorage.getItem("access_token");
  const mode = useSelector((state) => state.theme.mode);
  const {isLoggedIn} = useSelector((state) => state.user);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${host}/api/admin/comments`, {
        method: "GET",
        headers: {authorization: access_token},
      });
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
      } else {
        dispatch(showAlert({message: data?.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !access_token) {
      navigate("/login");
      return;
    }
    fetchComments();
  }, [isLoggedIn, access_token]);

  const sortDates = (comments) => {
    return [...comments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const themeClass = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      card: mode === "light" ? "bg-white text-black" : "bg-gray-800 text-white",
      borderColor: mode === "light" ? "border-gray-300" : "border-gray-700",
    }),
    [mode]
  );

  return (
    <div className={`h-svh ${themeClass.container} pt-6 -my-12`}>
      <div className="max-w-4xl mx-8">
        <h3 className="text-2xl font-semibold mb-6 text-center">
          All Comments
        </h3>

        {loading ? (
          <div className="text-center -my-12">
            <Loading />
          </div>
        ) : comments.length > 0 ? (
          <div className="max-h-[470px] overflow-y-scroll custom-scrollbar">
            {sortDates(comments).map((comment) => (
              <div
                key={comment?._id}
                className={`flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4 mb-2 p-1 border rounded-lg shadow-md ${themeClass.card} ${themeClass.borderColor}`}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2">
                  <img
                    src={comment?.user?.avatar || "/default-avatar.jpg"}
                    alt={`${comment?.user?.name}'s avatar`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col w-full space-y-2 sm:mt-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <h4 className="text-lg font-medium">
                      {comment?.user?.name}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {new Date(comment?.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-md">{comment.content}</p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <button className="text-sm text-blue-500 hover:underline">
                        Like
                      </button>
                      <button className="text-sm text-blue-500 hover:underline">
                        Reply
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">
                      {comment.likes} Likes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

export default ShowAllComments;
