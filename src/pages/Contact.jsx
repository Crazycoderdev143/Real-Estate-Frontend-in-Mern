import React, {useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {showAlert} from "../Redux/slices/alertSlice";
import Loading from "../Components/Loading";

const Contact = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  const initial = {email: "", name: "", phone: "", message: ""};
  const [formData, setFormData] = useState(initial);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const {name, email, phone} = formData;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      dispatch(
        showAlert({message: "All fields are required.", type: "warning"})
      );
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      dispatch(
        showAlert({
          message: "Please enter a valid email address.",
          type: "warning",
        })
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`${host}/api/user/contact`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      dispatch(
        showAlert({
          message: data?.message,
          type: data.success ? "success" : "error",
        })
      );
      if (data.success) setFormData(initial);
    } catch (error) {
      dispatch(
        showAlert({
          message: error?.message || "Something went wrong.",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value.trimStart()});
  };

  // Dynamic classes based on mode
  const themeClasses = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      card: mode === "light" ? "bg-white text-black" : "bg-gray-700 text-white",
      input:
        mode === "light"
          ? "border-gray-300"
          : "border-gray-600 bg-gray-800 text-white",
    }),
    [mode]
  );
  return (
    <div
      className={`p-5 max-w-4xl mx-auto pt-10 app ${themeClasses.container}`}
    >
      <header className="text-center my-6">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="text-lg mt-2">
          Have questions or need assistance? We'd love to hear from you.
        </p>
      </header>

      {/* Contact Information */}
      <section
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 text-center app ${themeClasses.container}`}
      >
        <div className={`${themeClasses.card} app p-6 rounded-lg shadow-md`}>
          <h3 className="text-xl font-semibold mb-3">Our Office</h3>
          <p>123 Real Estate Lane, Suite 100</p>
          <p>City, State, 12345</p>
        </div>
        <div className={`${themeClasses.card} app p-6 rounded-lg shadow-md`}>
          <h3 className="text-xl font-semibold mb-3">Contact Info</h3>
          <p>
            <strong>Phone:</strong> +1 (123) 456-7890
          </p>
          <p>
            <strong>Email:</strong> contact@realestate.com
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className={`mt-10 ${themeClasses.container} app`}>
        <h2 className="text-2xl font-semibold text-center mb-6">Find Us</h2>
        <div
          className={`w-full h-64 ${themeClasses.card} app rounded-lg shadow-md flex items-center justify-center`}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.8354345098487!2d-122.41941548468315!3d37.77492977975862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c7d03cbff%3A0x75524b31d8e098c4!2s123%20Real%20Estate%20Ln%2C%20San%20Francisco%2C%20CA%2094122%2C%20USA!5e0!3m2!1sen!2s!4v1634620702659!5m2!1sen!2s"
            className="w-full h-64 border-0 rounded-lg"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* Contact Form */}
      {loading ? (
        <Loading />
      ) : (
        <section
          className={`${themeClasses.container} app p-6 rounded-lg shadow-md mt-10`}
        >
          <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2"
          >
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Your Name"
              className={`border p-3 rounded-lg app ${themeClasses.input}`}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              placeholder="Your Mobile No."
              className={`border p-3 rounded-lg app ${themeClasses.input}`}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Your Email"
              className={`border p-3 rounded-lg app ${themeClasses.input}`}
              onChange={handleChange}
              required
            />
            <textarea
              placeholder="Your Message"
              rows="4"
              name="message"
              value={formData.message}
              className={`border p-3 rounded-lg app ${themeClasses.input}`}
              minLength={20}
              onChange={handleChange}
              required
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default Contact;
