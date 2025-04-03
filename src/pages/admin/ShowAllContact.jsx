import {showAlert} from "../../Redux/slices/alertSlice";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import React, {useEffect, useState, useMemo} from "react";
import NotFound from "../../Components/NotFound";
import Loading from "../../Components/Loading";
import * as Icons from "react-icons/fa";
import Cookies from "js-cookie";

const ShowAllContact = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const access_token = Cookies.get("access_token") || "";
  const mode = useSelector((state) => state.theme.mode);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const currentUser = useSelector((state) => state.user.currentUser);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  useEffect(() => {
    if (!isLoggedIn || !access_token) {
      navigate("/login");
      return;
    }
    fetchContacts();
  }, [isLoggedIn, access_token]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${host}/api/${currentUser?.role.toLowerCase()}/contacts`,
        {
          method: "GET",
          headers: {authorization: access_token},
        }
      );
      const data = await res.json();

      if (data.success) {
        setContacts(data.contacts);
        dispatch(showAlert({message: data.message, type: "success"}));
      } else {
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      console.error("Error fetching contacts: ", error);
      dispatch(showAlert({message: error.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
       if (!window.confirm("Are you sure you want to delete this Contact?"))
         return;
    setLoading(true);
    try {
      const res = await fetch(`${host}/api/admin/delete-contact/${contactId}`, {
        method: "DELETE",
        headers: {authorization: access_token},
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) =>
          prev.filter((contact) => contact._id !== contactId)
        );
        dispatch(showAlert({message: data.message, type: "success"}));
      } else {
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      console.error("Error deleting contact: ", error);
      dispatch(showAlert({message: error.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const sortedContacts = useMemo(() => {
    return [...contacts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [contacts]);

  return (
    <div
      className={`${
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white"
      } 
        flex flex-col items-center min-h-screen -mt-12 p-4`}
    >
      {loading ? (
        <Loading />
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-center mb-4">
            Contact List
          </h1>
          <div className="w-full max-w-4xl">
            <div className="hidden md:flex justify-between text-lg font-semibold p-2 rounded-lg">
              <div className="w-1/4">Name</div>
              <div className="w-1/4">Mobile No.</div>
              <div className="w-1/4">Email</div>
              <div className="w-1/4">Date</div>
            </div>
            {contacts.length > 0 ? (
              sortedContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex flex-col md:flex-row items-center justify-between rounded-lg p-3 my-2 shadow-md w-full hover:bg-gray-500 transition"
                >
                  <Link
                    to={`/${currentUser?.role.toLowerCase()}/contact/${
                      contact._id
                    }`}
                    className="flex flex-col md:flex-row items-center justify-between rounded-lg w-full"
                  >
                    <div className="w-full md:w-1/4 text-center md:text-left">
                      {contact.name || "Unknown"}
                    </div>
                    <div className="w-full md:w-1/4 text-center">
                      {contact.phone || "No phone"}
                    </div>
                    <div className="w-full md:w-1/4 text-center truncate">
                      {contact.email || "No Email"}
                    </div>
                    <div className="w-full md:w-1/4 text-center">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </Link>
                  {access_token && currentUser?.role === "Admin" && (
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-700 transition mt-2 md:mt-0"
                    >
                      <Icons.FaTrash size={20} /> Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <NotFound message="No contacts found." />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ShowAllContact;
