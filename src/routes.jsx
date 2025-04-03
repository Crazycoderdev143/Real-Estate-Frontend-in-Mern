import {lazy} from "react";
import AdminLayout from "./layouts/AdminLayout";
import AgentLayout from "./layouts/AgentLayout";
import ProtectedRoute from "./Components/ProtectedRoute";

// 📌 Lazy-loaded Components
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const About = lazy(() => import("./pages/About"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Cart = lazy(() => import("./Components/Cart"));
const Profile = lazy(() => import("./pages/Profile"));
const Contact = lazy(() => import("./pages/Contact"));
const Properties = lazy(() => import("./Components/Properties"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ForgetPassword = lazy(() => import("./pages/ForgetPassword"));
const PropertyInfo = lazy(() => import("./Components/PropertyInfo"));
const UpdateProfile = lazy(() => import("./Components/UpdateProfile"));

// Admin Pages
const UserInfo = lazy(() => import("./Components/UserInfo"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AddNewUser = lazy(() => import("./pages/admin/AddNewUser"));
const UpdateUser = lazy(() => import("./pages/admin/UpdateUser"));
const ContactInfo = lazy(() => import("./Components/ContactInfo"));
const ShowAllUser = lazy(() => import("./pages/admin/ShowAllUser"));
const UpdateProperty = lazy(() => import("./pages/admin/UpdateProperty"));
const ShowAllContact = lazy(() => import("./pages/admin/ShowAllContact"));
const ShowAllProperty = lazy(() => import("./pages/admin/ShowAllProperty"));
const ShowAllComments = lazy(() => import("./pages/admin/ShowAllComments"));
const ShowAllFeedbacks = lazy(() => import("./pages/admin/ShowAllFeedbacks"));
const SendNotification = lazy(() => import("./pages/admin/SendNotification"));

// Agent Pages
const AddNewProperty = lazy(() => import("./pages/admin/AddNewProperty"));

export const publicRoutes = [
  {path: "/", element: <Home />},
  {path: "/about", element: <About />},
  {path: "/login", element: <Login />},
  {path: "/contact", element: <Contact />},
  {path: "/registration", element: <SignUp />},
  {path: "/properties", element: <Properties />},
  {path: "/forget-password", element: <ForgetPassword />},
  {path: "/property/:propertyId", element: <PropertyInfo />},
  {path: "/reset-password/:resetToken", element: <ResetPassword />},
];

export const sharedRoutes = [
  {path: "/cart", element: <Cart />, roles: ["User", "Agent", "Admin"]},
  {path: "/profile", element: <Profile />, roles: ["User", "Agent", "Admin"]},
  {
    path: "/profile/updateprofile",
    element: <UpdateProfile />,
    roles: ["User", "Agent", "Admin"],
  },
];

export const agentRoutes = [
  {path: "/agent", element: <Dashboard />, role: "Agent"},
  {path: "/agent/contact-list", element: <ShowAllContact />, role: "Agent"},
  {path: "/agent/property-list", element: <ShowAllProperty />, role: "Agent"},
  {path: "/agent/add-new-property", element: <AddNewProperty />, role: "Agent"},
].map((route) => ({
  ...route,
  element: (
    <ProtectedRoute allowedRole={["Agent"]}>
      <AgentLayout>{route.element}</AgentLayout>
    </ProtectedRoute>
  ),
}));

export const adminRoutes = [
  {path: "/admin", element: <Dashboard />, role: "Admin"},
  {path: "/admin/user-list", element: <ShowAllUser />, role: "Admin"},
  {path: "/admin/user/:userId", element: <UserInfo />, role: "Admin"},
  {path: "/admin/add-new-user", element: <AddNewUser />, role: "Admin"},
  {path: "/admin/contact-list", element: <ShowAllContact />, role: "Admin"},
  {path: "/admin/comment-list", element: <ShowAllComments />, role: "Admin"},
  {path: "/admin/property-list", element: <ShowAllProperty />, role: "Admin"},
  {path: "/admin/update-user/:userId", element: <UpdateUser />, role: "Admin"},
  {path: "/admin/feedback-list", element: <ShowAllFeedbacks />, role: "Admin"},
  {path: "/admin/contact/:contactId", element: <ContactInfo />, role: "Admin"},
  {path: "/admin/add-new-property", element: <AddNewProperty />, role: "Admin"},
  {
    path: "/admin/send-notification",
    element: <SendNotification />,
    role: "Admin",
  },
  {
    path: "/admin/update-property/:propertyId",
    element: <UpdateProperty />,
    role: "Admin",
  },
].map((route) => ({
  ...route,
  element: (
    <ProtectedRoute allowedRole={["Admin"]}>
      <AdminLayout>{route.element}</AdminLayout>
    </ProtectedRoute>
  ),
}));
