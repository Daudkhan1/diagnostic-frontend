import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../utils/storage";

const Protected = () => {
  return getToken() ? <Outlet /> : <Navigate to="/" />;
};

export default Protected;
