import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState, useCallback, useMemo} from "react";
import {useSelector} from "react-redux";
import NotFound from "./NotFound";
import Loading from "./Loading";

import { showAlert } from "../Redux/slices/alertSlice";

const ContactInfo = () => {
  const {contactId} = useParams(); // Get contact ID from URL
  const navigate = useNavigate();
  const access_token = localStorage.getItem("access_token"); // Retrieve JWT token
  const mode = useSelector((state) => state.theme.mode); // Get theme mode (light/dark)
  const {isLoggedIn, currentUser} = useSelector((state) => state.user); // Get user authentication state
  const host = import.meta.env.VITE_HOST || "http://localhost:8000"; // API host URL

  const [contact, setContact] = useState(null); // Store contact details
  const [message, setMessage] = useState(null); // Store success/error messages
  const [loading, setLoading] = useState(false); // Manage loading state

  // Fetch contact details from API
  const fetchContact = useCallback(async () => {
    if (!isLoggedIn || !access_token || !currentUser) return navigate("/login"); // Redirect if not authenticated

    setLoading(true);
    try {
      const response = await fetch(
        `${host}/api/${currentUser?.role.toLowerCase()}/contact/${contactId}`,
        {method: "GET", headers: {authorization: access_token}}
      );
      const data = await response.json();

      if (data.success) {
        setContact(data.contact); // Update contact state
        setMessage(data.message);
      } else {
        setMessage(data.message || "Failed to fetch contact details.");
      }
    } catch (error) {
      dispatch(showAlert({message: "Something went wrong!", type: "error"}));
    } finally {
      setLoading(false);
    }
  }, [contactId, isLoggedIn, access_token, host, currentUser, navigate]);

  useEffect(() => {
    if (contactId) fetchContact();
  }, [fetchContact]); // Fetch contact details when component mounts or ID changes

  // Memoized styles for performance optimization
  const containerClass = useMemo(
    () =>
      mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
    [mode]
  );
  const inputClass = useMemo(
    () =>
      mode === "light"
        ? "border-gray-300"
        : "border-gray-600 bg-gray-800 text-white",
    [mode]
  );

  return (
    <div
      className={`px-4 top-0 min-h-screen flex justify-center items-center -my-28 app ${containerClass}`}
    >
      {loading ? (
        <Loading />
      ) : contact ? (
        <div
          className={`w-full max-w-lg ${containerClass} app shadow-lg rounded-lg p-2 pt-2`}
        >
          {/* Page Title */}
          <h1 className="text-xl text-center font-semibold mb-2">
            Contact Info
          </h1>

          {/* Contact Form */}
          <form className="space-y-2">
            {[
              {label: "Name", value: contact?.name || "N/A"},
              {label: "Email", value: contact?.email || "N/A"},
              {label: "Phone", value: contact?.phone || "N/A"},
              {
                label: "Created At",
                value: contact?.createdAt
                  ? new Date(contact.createdAt).toLocaleString()
                  : "N/A",
              },
            ].map((field, index) => (
              <div
                key={index}
                className="flex flex-col"
              >
                <label className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  {field.label}
                </label>
                <input
                  type="text"
                  className={`border p-1 rounded-lg ${inputClass} app`}
                  value={field.value}
                  disabled
                />
              </div>
            ))}

            {/* Message Field */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-300">
                Message
              </label>
              <textarea
                className={`border p-2 min-h-32 rounded-lg ${inputClass} app`}
                value={contact?.message || "No message provided."}
                disabled
              />
            </div>
          </form>
        </div>
      ) : (
        message && (
          <div className="text-red-600 text-center">
            <NotFound message={"property"} />
            {message}
          </div>
        )
      )}
    </div>
  );
};

export default ContactInfo;
