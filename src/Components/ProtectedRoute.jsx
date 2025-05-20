import {Navigate, useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {useEffect} from "react";


const ProtectedRoute = ({children, allowedRole}) => {
  const {isLoggedIn, currentUser} = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
    }
  }, []);

  if (!isLoggedIn) return <Navigate to="/login" />;
  if (allowedRole && !allowedRole.includes(currentUser.role))
    return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
