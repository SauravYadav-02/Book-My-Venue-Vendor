import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts & Dashboard
import Layout from "./components/layouts/Layout";
import MainLayout from "./components/layouts/MainLayout";

// Public / Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import VendorRegistrationForm from "./pages/auth/VendorRegistration/VendorRegistrationForm";

// Protected Route
import ProtectedRoute from "./components/common/ProtectedRoute";

// Vendor Venue Pages
import AddVenue from "./pages/vendor/AddVenue";
import VenueList from "./pages/vendor/AddVenue/VenueList";
import EditVenue from "./pages/vendor/EditVenues/EditVenue";

import Bookings from "./pages/vendor/Bookings";
import CalendarPage from "./pages/vendor/CalendarPage";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<VendorRegistrationForm />} />
        
        {/* Protected Vendor Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Vendor Dashboard */}
          <Route path="/dashboard" element={<MainLayout />} />

          {/* Vendor Venue Management (Wrapped in Layout for Sidebar/Navbar) */}
          <Route path="/venue" element={<Layout><VenueList /></Layout>} />
          <Route path="/venue/add" element={<Layout><AddVenue /></Layout>} />
          <Route path="/venue/edit/:id" element={<Layout><EditVenue /></Layout>} />
          <Route path="/booking" element={<Layout><Bookings /></Layout>} />
          <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}