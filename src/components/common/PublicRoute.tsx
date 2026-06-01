import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
    const isLogged = localStorage.getItem("vendorId") || localStorage.getItem("userId") || localStorage.getItem("userid");

    if (isLogged) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
