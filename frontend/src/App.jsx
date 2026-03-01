import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CityToCityPage from './pages/CityToCityPage';
import ChauffeurHailingPage from './pages/ChauffeurHailingPage';
import AirportTransferPage from './pages/AirportTransferPage';
import HourlyHirePage from './pages/HourlyHirePage';
import BecomeChauffeurPage from './pages/BecomeChauffeurPage';
import ChauffeurLoginPage from './pages/ChauffeurLoginPage';
import SearchResults from './pages/SearchResults';
import PickupInfoPage from './pages/PickupInfoPage';
import PaymentPage from './pages/PaymentPage';
import CheckoutPage from './pages/CheckoutPage';
import BusinessOverviewPage from './pages/BusinessOverviewPage';
import CorporateTravelPage from './pages/CorporateTravelPage';
import TravelAgenciesPage from './pages/TravelAgenciesPage';
import StrategicPartnershipsPage from './pages/StrategicPartnershipsPage';
import EventsPage from './pages/EventsPage';
import LimousineServicesPage from './pages/LimousineServicesPage';
import ChauffeurServicesPage from './pages/ChauffeurServicesPage';
import ServicesPage from './pages/ServicesPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CustomerDashboard from './pages/CustomerDashboard';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboardTest from './pages/AdminDashboardTest';
import ChauffeurDashboard from './pages/ChauffeurDashboard';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Dashboard routes without MainLayout (no header/footer) */}
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/test" element={<AdminDashboardTest />} />
        <Route path="chauffeur-dashboard" element={<ChauffeurDashboard />} />
        
        {/* Regular routes with MainLayout (includes header/footer) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/city-to-city" element={<CityToCityPage />} />
            <Route path="/services/chauffeur-hailing" element={<ChauffeurHailingPage />} />
            <Route path="/services/airport-transfers" element={<AirportTransferPage />} />
            <Route path="/services/hourly-hire" element={<HourlyHirePage />} />
            <Route path="/services/chauffeur-services" element={<ChauffeurServicesPage />} />
            <Route path="/services/limousine-services" element={<LimousineServicesPage />} />
          <Route path="become-chauffeur" element={<BecomeChauffeurPage />} />
          <Route path="chauffeur-login" element={<ChauffeurLoginPage />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="pickup-info" element={<PickupInfoPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />
            <Route path="/business/overview" element={<BusinessOverviewPage />} />
            <Route path="/business/corporate-accounts" element={<CorporateTravelPage />} />
            <Route path="/business/travel-agencies" element={<TravelAgenciesPage />} />
            <Route path="/business/strategic-partnerships" element={<StrategicPartnershipsPage />} />
            <Route path="/business/events" element={<EventsPage />} />
          <Route path="chauffeur/*" element={<ChauffeurDashboard />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="chauffeur-forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="chauffeur-reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
