import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

const ProtectedVendorRoute = ({ children }: { children: ReactElement }) => {
  // Check both the lowercase "vendorid" (for strict compatibility with instructions) 
  // and camelCase "vendorId" (which the LoginPage writes to localStorage).
  const vendorId = localStorage.getItem("vendorid") || localStorage.getItem("vendorId");

  if (!vendorId) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedVendorRoute;
