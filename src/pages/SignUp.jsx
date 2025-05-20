// import React, {useState} from "react";
// import {Link, useNavigate} from "react-router-dom";

// const Signup = (props) => {
//   const [credential, setCredential] = useState({
//     name: "",
//     dob: "",
//     number: "",
//     email: "",
//     password: "",
//     conPassword: "",
//   });
//   let navigate = useNavigate();
//   const host = "http://localhost:5000";

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // API call for creating currentUser
//       const response = await fetch(`${host}/api/auth/createuser`, {
//         method: "POST",
//         headers: {"Content-type": "application/json"},
//         body: JSON.stringify({
//           name: credential.name,
//           dob: credential.dob,
//           number: credential.number,
//           email: credential.email,
//           password: credential.password,
//         }),
//       });
//       const json = await response.json();
//       if (json.success && json.authToken) {
//         localStorage.setItem("token", json.authToken);
//         navigate("/");
//         props.showAlert("Account created successfully!", "success");
//       } else {
//         props.showAlert(
//           "This email is already in use. Please try a different one.",
//           "danger"
//         );
//       }
//     } catch (error) {
//       console.error("Error during sign up: ", error);
//     }
//     setCredential({
//       name: "",
//       dob: "",
//       number: "",
//       email: "",
//       password: "",
//       conPassword: "",
//     });
//   };

//   const onChange = (e) => {
//     setCredential({...credential, [e.target.name]: e.target.value});
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
//         <h2 className="text-2xl font-bold text-center text-gray-700">
//           Create an Account
//         </h2>
//         <form
//           onSubmit={handleSubmit}
//           className="space-y-4"
//         >
//           {/* Full Name */}
//           <div>
//             <label
//               htmlFor="name"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Full Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={credential.name}
//               onChange={onChange}
//               minLength={3}
//               required
//               className="w-full px-4 py-2 mt-1 text-sm text-gray-900 border rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
//               placeholder="Enter your full name"
//             />
//           </div>

//           {/* Contact Number */}
//           <div>
//             <label
//               htmlFor="number"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Contact Number
//             </label>
//             <input
//               type="tel"
//               id="number"
//               name="number"
//               value={credential.number}
//               onChange={onChange}
//               minLength={8}
//               required
//               className="w-full px-4 py-2 mt-1 text-sm text-gray-900 border rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
//               placeholder="Enter your contact number"
//             />
//           </div>

//           {/* Email */}
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Email Address
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={credential.email}
//               onChange={onChange}
//               minLength={8}
//               required
//               className="w-full px-4 py-2 mt-1 text-sm text-gray-900 border rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
//               placeholder="Enter your email"
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={credential.password}
//               onChange={onChange}
//               minLength={8}
//               required
//               className="w-full px-4 py-2 mt-1 text-sm text-gray-900 border rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
//               placeholder="Create a password"
//             />
//           </div>

//           {/* Confirm Password */}
//           <div>
//             <label
//               htmlFor="conPassword"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Confirm Password
//               <span
//                 className={`ml-2 text-xs ${
//                   credential.password === credential.conPassword ||
//                   credential.conPassword === ""
//                     ? "text-gray-500"
//                     : "text-red-500"
//                 }`}
//               >
//                 {credential.password === credential.conPassword ||
//                 credential.conPassword === ""
//                   ? ""
//                   : "Passwords do not match"}
//               </span>
//             </label>
//             <input
//               type="password"
//               id="conPassword"
//               name="conPassword"
//               value={credential.conPassword}
//               onChange={onChange}
//               minLength={8}
//               required
//               className="w-full px-4 py-2 mt-1 text-sm text-gray-900 border rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
//               placeholder="Re-enter your password"
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             disabled={
//               credential.email.length < 8 ||
//               credential.password.length < 8 ||
//               credential.password !== credential.conPassword
//             }
//             type="submit"
//             className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
//           >
//             Sign Up
//           </button>
//         </form>
//         <div className="text-sm text-center text-gray-600">
//           Already have an account?
//           <Link
//             to="/login"
//             className="text-blue-500 hover:underline"
//           >
//             Log In
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;

// import React, {useState} from "react";

// const SignupPage = () => {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     termsAccepted: false,
//   });

//   const handleChange = (e) => {
//     const {name, value, type, checked} = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Form submitted:", formData);
//     // Add your form submission logic here
//   };

//   return (
//     <div className="flex h-screen bg-gray-900 text-white">
//       {/* Left Section */}
//       <div className="w-1/2 flex flex-col justify-center items-center bg-gradient-to-b from-purple-700 via-purple-900 to-black">
//         <div className="text-center">
//           <h1 className="text-4xl font-bold mb-6">TRAVO</h1>
//           <p className="text-xl font-medium">
//             Creating Memories, <br /> Capturing Moments
//           </p>
//         </div>
//       </div>

//       {/* Right Section */}
//       <div className="w-1/2 flex flex-col justify-center px-12">
//         <div className="max-w-md mx-auto">
//           <h2 className="text-3xl font-bold mb-4">Create an account</h2>
//           <p className="text-gray-400 mb-6">
//             Already have an account?{" "}
//             <a
//               href="#"
//               className="text-purple-400"
//             >
//               Log in
//             </a>
//           </p>

//           <form
//             onSubmit={handleSubmit}
//             className="space-y-6"
//           >
//             <div className="flex gap-4">
//               <input
//                 type="text"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 placeholder="First Name"
//                 className="w-1/2 p-3 bg-gray-800 rounded-lg focus:ring focus:ring-purple-500"
//               />
//               <input
//                 type="text"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//                 placeholder="Last Name"
//                 className="w-1/2 p-3 bg-gray-800 rounded-lg focus:ring focus:ring-purple-500"
//               />
//             </div>

//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Email"
//               className="w-full p-3 bg-gray-800 rounded-lg focus:ring focus:ring-purple-500"
//             />

//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter your password"
//               className="w-full p-3 bg-gray-800 rounded-lg focus:ring focus:ring-purple-500"
//             />

//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 name="termsAccepted"
//                 checked={formData.termsAccepted}
//                 onChange={handleChange}
//                 className="mr-2"
//               />
//               <label className="text-sm text-gray-400">
//                 I agree to all
//                 <a
//                   href="#"
//                   className="text-purple-400"
//                 >
//                   Terms & Conditions
//                 </a>
//               </label>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg font-medium"
//             >
//               Create account
//             </button>
//           </form>

//           <div className="mt-6 text-center text-gray-400">Or register with</div>

//           <div className="mt-4 flex justify-center gap-4">
//             <button className="flex items-center px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
//               <img
//                 src="/google-icon.svg"
//                 alt="Google"
//                 className="w-5 h-5 mr-2"
//               />
//               Sign in with Google
//             </button>
//             <button className="flex items-center px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
//               <img
//                 src="/apple-icon.svg"
//                 alt="Apple"
//                 className="w-5 h-5 mr-2"
//               />
//               Sign in with Apple
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;

import SignupWithGoogle from "../Components/SignupWithGoogle";
import React, {useEffect, useState, useMemo} from "react";
import {login, logout} from "../Redux/slices/userSlice";
import {useDispatch, useSelector} from "react-redux";
import {showAlert} from "../Redux/slices/alertSlice";
import {Link, useNavigate} from "react-router-dom";
import Loading from "../Components/Loading";


const SignUp = () => {
  const initial = {username: "", email: "", password: "", phone: "", otp: ""};
  const [formData, setFormData] = useState({role: "User"});
  const dispatch = useDispatch();
  const navigate = useNavigate(); // To navigate after successful signup
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const access_token = localStorage.getItem("access_token");
  const mode = useSelector((state) => state.theme.mode);
  const {isLoggedIn} = useSelector((state) => state.user);
  const host = import.meta.env.VITE_HOST || "http://localhost:8000"; // Environment variable

  useEffect(() => {
    if (isLoggedIn && access_token) {
      navigate("/");
      return;
    }
  }, [isLoggedIn, access_token]);

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      setMessage("All fields are required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage("Please enter a valid email address.");
      return false;
    }
    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return false;
    }
    return true;
  };


  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${host}/api/user/gen-otp`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        dispatch(showAlert({message: data.message, type: "success"}));
        setOtpSent(true);
      } else {
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      dispatch(showAlert({message: "Something went wrong!", type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!validateForm()) return;

      const res = await fetch(`${host}/api/user/verify-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }
        dispatch(login(data.user_info));
        navigate("/"); // Redirect to Home page after successful login
        setFormData(initial);
      } else {
        dispatch(logout());
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: "Something went wrong!", type: "error"}));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
  };

  const themeClasses = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      button:
        mode === "dark"
          ? "bg-gray-700 hover:bg-cyan-500 text-white"
          : "bg-blue-600 hover:bg-cyan-500 text-white",
      input:
        mode === "light"
          ? "border-gray-300"
          : "border-gray-600 bg-gray-800 text-white",
    }),
    [mode]
  );

  return (
    <div className={`p-4 max-w-lg mx-auto pt-16 ${themeClasses.container}`}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <h1 className="text-2xl text-center font-semibold my-3">
            Create an account
          </h1>
          <h5 className="text-center my-2">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 underline"
            >
              Click here
            </Link>
          </h5>
          <form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`p-2 border rounded-lg app ${themeClasses.input}`}
              onChange={handleChange}
              required
            />
            <input
              type="phone"
              name="phone"
              placeholder="Mobile No."
              className={`p-2 border rounded-lg app ${themeClasses.input}`}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`p-2 border rounded-lg app ${themeClasses.input}`}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`p-2 border rounded-lg app ${themeClasses.input}`}
              onChange={handleChange}
              required
            />
            {otpSent && (
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                className={`p-2 border rounded-lg app ${themeClasses.input}`}
                onChange={handleChange}
                required
              />
            )}
            <button
              type="button"
              onClick={sendOtp}
              className={`app ${themeClasses.button} p-3 rounded-lg disabled:opacity-50`}
              disabled={otpSent}
            >
              Send OTP
            </button>
            {otpSent && (
              <button
                type="submit"
                className="bg-green-600 text-white p-3 rounded-lg"
              >
                Submit
              </button>
            )}
            <SignupWithGoogle />
            {message && (
              <div className="text-red-600 text-center mt-2">{message}</div>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default SignUp;
