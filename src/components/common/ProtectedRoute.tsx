import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const isLogged = localStorage.getItem("vendorId") || localStorage.getItem("userId") || localStorage.getItem("userid") || localStorage.getItem("adminId");

    if (!isLogged) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
