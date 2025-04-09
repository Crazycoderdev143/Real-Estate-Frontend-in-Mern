import Cookies from "js-cookie";
import Loading from "./Loading";
import NotFound from "./NotFound";
import {IoIosSend} from "react-icons/io";
import {addToCart} from "../Redux/slices/cartSlice";
import {useDispatch, useSelector} from "react-redux";
import {showAlert} from "../Redux/slices/alertSlice";
import React, {useEffect, useMemo, useState} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";

const PropertyInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {propertyId} = useParams();
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState({content: ""});
  const [message, setMessage] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState(null);
  const access_token = Cookies.get("access_token");
  const mode = useSelector((state) => state.theme.mode);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${host}/api/user/property/comment/${propertyId}`,
        {
          method: "GET",
          headers: {authorization: access_token},
        }
      );
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${host}/api/user/property/${propertyId}`, {
          method: "GET",
          headers: {authorization: access_token},
        });
        const data = await res.json();

        if (data.success) {
          setProperty(data.property);
          localStorage.setItem(`viewed`, "true");
        } else {
          dispatch(showAlert({message: data?.message, type: "error"}));
        }
      } catch (error) {
        dispatch(showAlert({message: error?.message, type: "error"}));
        console.error("Error fetching Property: ", error);
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) {
      fetchProperty();
      fetchComments();
    }
  }, [propertyId, host]);

  useEffect(() => {
    if (property && property?.imageUrls.length > 0) {
      const interval = setInterval(() => {
        setCurrent((prev) =>
          prev === property?.imageUrls.length - 1 ? 0 : prev + 1
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [property]);

  const nextSlide = () => {
    if (property) {
      setCurrent((prev) =>
        prev === property?.imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevSlide = () => {
    if (property) {
      setCurrent((prev) =>
        prev === 0 ? property?.imageUrls.length - 1 : prev - 1
      );
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !access_token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(
        `${host}/api/user/property/comment/${currentUser?._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: access_token,
          },
          body: JSON.stringify({
            ...formData,
            propertyId: property?._id,
            userName: currentUser?.username,
            userAvatar: currentUser?.profileImage,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.comment]);
      } else {
        dispatch(showAlert({message: data?.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
    }
    setFormData({content: ""});
  };

  const addItemToCart = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !access_token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(
        `${host}/api/${currentUser?.role.toLowerCase()}/addtocart/${
          currentUser?._id
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: access_token,
          },
          body: JSON.stringify({
            propertyId: property?._id,
            propertyName: property?.title,
            coverImg: property?.imageUrls[0],
            regularPrice: property?.regularPrice,
            discountPrice: property?.discountPrice,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        dispatch(addToCart());
        dispatch(showAlert({message: data?.message, type: "success"}));
      } else {
        dispatch(showAlert({message: data?.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // Memoized classes to avoid unnecessary re-renders
  const containerTheme = useMemo(
    () =>
      mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
    [mode]
  );
  const cardTheme = useMemo(
    () => (mode === "light" ? "bg-white text-black" : "bg-gray-800 text-white"),
    [mode]
  );
  const inputTheme = useMemo(
    () =>
      mode === "light"
        ? "border-gray-300"
        : "border-gray-600 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500",
    [mode]
  );

  return (
    <>
      <div className={`max-w-6xl min-h-lvh mx-auto p-16 app ${containerTheme}`}>
        {loading ? (
          <div className="my-28">
            <Loading />
          </div>
        ) : property ? (
          <>
            <h1 className="text-center font-bold text-2xl">Property Info</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
              <div className="relative max-w-full h-full overflow-hidden">
                <div
                  className="flex transition-transform duration-500"
                  style={{transform: `translateX(-${current * 100}%)`}}
                >
                  {property?.imageUrls.map((img, index) => (
                    <div
                      key={index}
                      className="min-w-full h-64"
                    >
                      <img
                        src={img}
                        alt={`Slide ${index}`}
                        className="w-full min-h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {/* Previous Button */}
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 p-3 text-white"
                >
                  &#10094;
                </button>
                {/* Next Button */}
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 p-3 text-white"
                >
                  &#10095;
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold flex">
                  <div>{property?.title} </div>
                  <div className="ml-8">{property?.type} </div>
                </h1>
                <div>Sqft : {property?.dimensions.sqft}</div>
                <div>
                  Location : {property?.city}, {property?.state}
                </div>
                <p className={`${containerTheme} app`}>
                  {property?.description}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-semibold text-blue-500">
                    ${property?.regularPrice}
                  </span>
                  {property?.discountPrice && (
                    <span className="text-lg text-red-500 line-through">
                      ${property?.discountPrice}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <div>Bedrooms : {property?.bedrooms}</div>
                  <div className="mr-16">Bathrooms : {property?.bathrooms}</div>
                </div>
                <div className="flex justify-between items-center font-semibold">
                  {property?.sell && <div>Sell</div>}
                  {property?.rent && <div>Rent</div>}
                  {property?.buy && <div>Buy</div>}
                  {property?.offer && <div>Offer</div>}
                  {property?.parking && <div>Parking</div>}
                  {property?.furnished && <div>Furnished</div>}
                </div>
                <div>
                  Created Date and Time :{" "}
                  {new Date(property.createdAt).toLocaleString()}
                </div>
                {currentUser?.role !== "Admin" && (
                  <Link
                    to={!isLoggedIn ? "/login" : ""}
                    onClick={addItemToCart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all text-center"
                  >
                    Add to Cart
                  </Link>
                )}
                {currentUser?.role === "Admin" ? (
                  <Link
                    to={`/admin/update-Property/${propertyId}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all text-center"
                  >
                    Update Property
                  </Link>
                ) : (
                  <Link
                    to={
                      !isLoggedIn
                        ? "/login"
                        : `/user/buy-responce/${propertyId}`
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all text-center"
                  >
                    Buy Now
                  </Link>
                )}
              </div>
            </div>
            <div
              className={`flex justify-center items-center flex-col p-2 gap-3 border rounded-lg overflow-hidden shadow-lg app ${containerTheme}`}
            >
              <h1 className="text-center font-bold text-xl">Owner Details</h1>
              <div className="grid grid-cols-3">
                <div>
                  <div>Name</div>
                  <div>{property?.owner?.name}</div>
                </div>
                <div>
                  <div>Mobile</div>
                  <div>{property?.owner?.phone}</div>
                </div>
                <div>
                  <div>Email</div>
                  <div>{property?.owner?.email}</div>
                </div>
              </div>
            </div>
            <div className="my-8">
              <h2 className="text-3xl font-semibold mb-4">Comments</h2>

              {/* Comment Form */}
              <form
                onSubmit={handleComment}
                className="flex flex-col gap-2 mb-6"
              >
                <div
                  className={`flex items-center gap-3 border rounded-lg overflow-hidden shadow-lg app ${containerTheme}`}
                >
                  <input
                    type="text"
                    name="content"
                    value={formData?.content}
                    placeholder="Leave a comment..."
                    className={`p-3 w-full text-lg placeholder-gray-400 rounded-lg focus:outline-none app ${inputTheme}`}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="submit"
                    className={`p-3  app ${containerTheme}`}
                  >
                    <IoIosSend
                      size={25}
                      color="text-gray-700"
                    />
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div>
                <h3 className="text-2xl font-semibold mb-4">All Comments</h3>
                {comments?.length > 0 ? (
                  comments?.map((comment) => (
                    <div
                      key={comment?._id}
                      className={`flex items-start space-x-4 mb-2 px-4 p-1 border rounded-lg shadow-sm transition-transform transform hover:scale-105 ${cardTheme}`}
                    >
                      {/* User Avatar */}
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                        <img
                          src={comment?.user?.avatar || "/default-avatar.jpg"}
                          alt={`${comment?.user?.name}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Comment Content */}
                      <div className="flex flex-col space-y-2 w-full">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium">
                            {comment.user.name}
                          </h4>
                          <span className="text-sm text-gray-500">
                            <div>
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
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
                          </span>
                        </div>
                        <p className="text-lg text-gray-500">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-lg text-gray-500">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          message && (
            <div className="text-red-600 text-center my-28">
              <NotFound message={"Property"} />
              {message}
            </div>
          )
        )}
      </div>
    </>
  );
};

export default PropertyInfo;
