import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layouts & Dashboard
import Layout from "./components/layouts/Layout";
import MainLayout from "./components/layouts/MainLayout";

// Public / Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import VendorRegistrationForm from "./pages/auth/VendorRegistration/VendorRegistrationForm";

// Protected Route
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";

// Vendor Venue Pages
import AddVenue from "./pages/vendor/AddVenue";
import VenueList from "./pages/vendor/AddVenue/VenueList";
import EditVenue from "./pages/vendor/EditVenues/EditVenue";

import Bookings from "./pages/vendor/Bookings";
import CalendarPage from "./pages/vendor/CalendarPage";
import PaymentHistory from "./pages/vendor/PaymentHistory";

import { SubscriptionProvider } from "./context/SubscriptionContext";
import { VendorProvider } from "./context/VendorContext";
import SubscriptionDashboard from "./pages/vendor/SubscriptionDashboard";
import PlansManagement from "./pages/admin/PlansManagement";
import VendorReviews from "./pages/vendor/VendorReviews";
import VendorComplaints from "./pages/vendor/VendorComplaints";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminComplaints from "./pages/admin/AdminComplaints";
import TermsPage from "./pages/vendor/Terms";


// Wrapper to provide Subscription context to nested routes via Outlet
const SubscriptionLayout = () => (
  <VendorProvider>
    <SubscriptionProvider>
      <Outlet />
    </SubscriptionProvider>
  </VendorProvider>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Auth Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<VendorRegistrationForm />} />
        </Route>
        
        {/* Protected Vendor Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Wrap all protected routes with SubscriptionProvider so we can globally check access */}
          <Route element={<SubscriptionLayout />}>
            {/* Vendor Dashboard */}
            <Route path="/dashboard" element={<MainLayout />} />

            {/* Vendor Venue Management (Wrapped in Layout for Sidebar/Navbar) */}
            <Route path="/venue" element={<Layout><VenueList /></Layout>} />
            <Route path="/venue/add" element={<Layout><AddVenue /></Layout>} />
            <Route path="/venue/edit/:id" element={<Layout><EditVenue /></Layout>} />
            <Route path="/booking" element={<Layout><Bookings /></Layout>} />
            <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />

            {/* Subscription & Billing */}
            <Route path="/billing" element={<Layout><SubscriptionDashboard /></Layout>} />

            {/* Payment History (existing - all types) */}
            <Route path="/payments" element={<Layout><PaymentHistory /></Layout>} />

            {/* Terms & Conditions */}
            <Route path="/terms" element={<Layout><TermsPage /></Layout>} />


            {/* Vendor Reviews */}
            <Route path="/reviews" element={<Layout><VendorReviews /></Layout>} />

            {/* Vendor Complaints */}
            <Route path="/complaints" element={<Layout><VendorComplaints /></Layout>} />

            {/* Admin Routes */}
            <Route path="/admin/plans" element={<Layout><PlansManagement /></Layout>} />
            <Route path="/admin/reviews" element={<Layout><AdminReviews /></Layout>} />
            <Route path="/admin/complaints" element={<Layout><AdminComplaints /></Layout>} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}