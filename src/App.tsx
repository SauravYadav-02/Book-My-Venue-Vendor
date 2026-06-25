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
import ProtectedVendorRoute from "./components/layouts/ProtectedVendorRoute";

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
import ManageVenues from "./pages/admin/ManageVenues";
import VendorReviews from "./pages/vendor/VendorReviews";
import VendorComplaints from "./pages/vendor/VendorComplaints";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminReports from "./pages/admin/AdminReports";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBlogs from "./pages/admin/AdminBlogs";
import VendorReports from "./pages/vendor/VendorReports";
import TermsPage from "./pages/vendor/Terms";
import PricingPage from "./pages/vendor/PricingPage";
import Blogs from "./pages/vendor/Blogs";

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
            <Route path="/dashboard" element={<ProtectedVendorRoute><MainLayout /></ProtectedVendorRoute>} />

            {/* Vendor Venue Management (Wrapped in Layout for Sidebar/Navbar) */}
            <Route path="/venue" element={<ProtectedVendorRoute><Layout><VenueList /></Layout></ProtectedVendorRoute>} />
            <Route path="/venue/add" element={<ProtectedVendorRoute><Layout><AddVenue /></Layout></ProtectedVendorRoute>} />
            <Route path="/venue/edit/:id" element={<ProtectedVendorRoute><Layout><EditVenue /></Layout></ProtectedVendorRoute>} />
            <Route path="/booking" element={<ProtectedVendorRoute><Layout><Bookings /></Layout></ProtectedVendorRoute>} />
            <Route path="/calendar" element={<ProtectedVendorRoute><Layout><CalendarPage /></Layout></ProtectedVendorRoute>} />

            {/* Subscription & Billing */}
            <Route path="/billing" element={<ProtectedVendorRoute><Layout><SubscriptionDashboard /></Layout></ProtectedVendorRoute>} />
            <Route path="/vendor/pricing" element={<ProtectedVendorRoute><Layout><PricingPage /></Layout></ProtectedVendorRoute>} />

            {/* Payment History (existing - all types) */}
            <Route path="/payments" element={<ProtectedVendorRoute><Layout><PaymentHistory /></Layout></ProtectedVendorRoute>} />

            {/* Terms & Conditions */}
            <Route path="/terms" element={<ProtectedVendorRoute><Layout><TermsPage /></Layout></ProtectedVendorRoute>} />

            {/* Blogs */}
            <Route path="/blogs" element={<ProtectedVendorRoute><Layout><Blogs /></Layout></ProtectedVendorRoute>} />


            {/* Vendor Reviews */}
            <Route path="/reviews" element={<ProtectedVendorRoute><Layout><VendorReviews /></Layout></ProtectedVendorRoute>} />

            {/* Vendor Complaints */}
            <Route path="/complaints" element={<ProtectedVendorRoute><Layout><VendorComplaints /></Layout></ProtectedVendorRoute>} />

            {/* Vendor Reports */}
            <Route path="/reports" element={<ProtectedVendorRoute><Layout><VendorReports /></Layout></ProtectedVendorRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/venues" element={<ProtectedVendorRoute><Layout><ManageVenues /></Layout></ProtectedVendorRoute>} />
            <Route path="/admin/plans" element={<ProtectedVendorRoute><Layout><PlansManagement /></Layout></ProtectedVendorRoute>} />
            <Route path="/admin/reviews" element={<ProtectedVendorRoute><Layout><AdminReviews /></Layout></ProtectedVendorRoute>} />
            <Route path="/admin/complaints" element={<ProtectedVendorRoute><Layout><AdminComplaints /></Layout></ProtectedVendorRoute>} />
            <Route path="/admin/reports" element={<ProtectedVendorRoute><Layout><AdminReports /></Layout></ProtectedVendorRoute>} />
            <Route path="/admin/bookings" element={<ProtectedVendorRoute><Layout><AdminBookings /></Layout></ProtectedVendorRoute>} />
            <Route path="/admin/blogs" element={<ProtectedVendorRoute><Layout><AdminBlogs /></Layout></ProtectedVendorRoute>} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}