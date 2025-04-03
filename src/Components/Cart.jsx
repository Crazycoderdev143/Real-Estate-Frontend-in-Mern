import React, {useEffect, useState, useCallback, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import Loading from "./Loading";
import * as Icons from "react-icons/fa";
import {removeFromCart} from "../Redux/slices/cartSlice";
import {showAlert} from "../Redux/slices/alertSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const access_token = Cookies.get("access_token"); // Retrieve JWT token from cookies
  const mode = useSelector((state) => state.theme.mode); // Get theme mode (light/dark) from Redux state
  const {isLoggedIn, currentUser} = useSelector((state) => state.user); // Get user authentication state
  const host = import.meta.env.VITE_HOST || "http://localhost:8000"; // Backend API host URL

  const [cartProperties, setCartProperties] = useState([]); // Store cart properties
  const [loading, setLoading] = useState(false); // Manage loading state

  // Fetch cart properties from API
  const fetchCartProperties = useCallback(async () => {
    if (!isLoggedIn || !access_token || !currentUser) return navigate("/login"); // Redirect if not logged in

    try {
      setLoading(true); // Set loading before API call
      const res = await fetch(
        `${host}/api/${currentUser?.role.toLowerCase()}/cartitems/${
          currentUser?._id
        }`,
        {method: "GET", headers: {authorization: access_token}}
      );
      const data = await res.json();

      if (data.success) {
        setCartProperties(data.cartItems); // Update state with cart items
      } else {
        dispatch(showAlert({message: data?.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
    } finally {
      setLoading(false); // Reset loading state
    }
  }, [currentUser, access_token, host, isLoggedIn, dispatch, navigate]);

  useEffect(() => {
    fetchCartProperties();
  }, [fetchCartProperties]); // Fetch cart items on mount

  // Remove an item from the cart
  const removeItemfromCart = async (propertyId) => {
    if (
      !window.confirm(
        "Are you sure you want to Remove this Property from cart?"
      )
    )
      return;
    setLoading(true); // Set loading before API call
    try {
      const res = await fetch(
        `${host}/api/${currentUser?.role.toLowerCase()}/remove-property/${
          currentUser?._id
        }`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: access_token,
          },
          body: JSON.stringify({propertyId}),
        }
      );
      const data = await res.json();

      if (data.success) {
        dispatch(removeFromCart(propertyId)); // Remove item from Redux store
        setCartProperties(
          cartProperties.filter((property) => property._id !== propertyId)
        ); // Update UI
        dispatch(showAlert({message: data?.message, type: "success"}));
      } else {
        dispatch(showAlert({message: data?.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error?.message, type: "error"}));
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Determine theme styles dynamically using useMemo (optimized for performance)
  const themeClass = useMemo(
    () =>
      mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
    [mode]
  );
  const hover = useMemo(
    () => (mode === "light" ? "hover:bg-gray-300" : "hover:bg-gray-800"),
    [mode]
  );

  return (
    <div
      className={`${themeClass} app min-h-screen -my-28 px-4 sm:px-6 lg:px-8`}
    >
      {loading ? (
        <div className="my-28 pt-36 flex justify-center items-center">
          <Loading />
        </div>
      ) : (
        <div className="container mx-auto mt-28 pt-12">
          {/* Page Title */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-6">
            Property List
          </h1>

          {/* Table Headers (Only visible on medium and larger screens) */}
          <div className="hidden md:flex justify-around items-center text-lg font-semibold p-3 rounded-lg">
            <div className="flex justify-between w-full md:w-3/4 gap-10">
              <div>Name</div>
              <div className="text-center">Price</div>
              <div className="text-center">Discount Price</div>
            </div>
          </div>

          {/* Display Cart Items */}
          {cartProperties.length > 0 ? (
            cartProperties.map((property, i) => (
              <div
                key={property._id}
                className="w-full border-b py-4"
              >
                <div
                  className={`flex flex-col md:flex-row items-center justify-between gap-4 md:gap-10 p-3 rounded-lg app ${hover} group`}
                >
                  {/* Property Details with Link */}
                  <Link
                    to={`/property/${property.propertyId}`}
                    className="flex items-center gap-4 w-full md:w-3/4"
                  >
                    <span className="font-semibold">{i + 1}.</span>
                    {/* Property Image */}
                    <img
                      className="w-16 h-16 rounded-lg object-cover transition-transform transform hover:scale-125"
                      src={property?.coverImg || "/default-image.jpg"}
                      alt="CoverImg"
                      loading="lazy"
                    />
                    <div className="flex flex-col md:flex-row justify-between w-full gap-4">
                      <div className="text-lg sm:text-xl font-medium">
                        {property.title || "Property Name"}
                      </div>
                      <div className="text-md sm:text-lg">
                        ${property.regularPrice || "N/A"}
                      </div>
                      <div className="text-md sm:text-lg text-green-500">
                        ${property.discountPrice || "N/A"}
                      </div>
                    </div>
                  </Link>

                  {/* Remove Item Button */}
                  <div
                    className="flex gap-2 items-center cursor-pointer text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItemfromCart(property._id)}
                  >
                    <Icons.FaTrash size={20} />{" "}
                    <span className="hidden md:block font-semibold">
                      Remove
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-red-600 text-center my-12 text-lg sm:text-xl">
              You have not added any properties in your cart!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
