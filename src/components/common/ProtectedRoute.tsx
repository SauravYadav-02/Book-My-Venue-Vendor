import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const vendorId = localStorage.getItem("vendorId");

    if (!vendorId) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
