import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/Layout/MainLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Farmer Pages
import FarmerDashboard from './pages/Farmer/Dashboard';
import AddProduct from './pages/Farmer/AddProduct';

// Buyer Pages
import ProduceMarket from './pages/Buyer/Market';
import Cart from './pages/Buyer/Cart';
import Orders from './pages/Buyer/Orders';

// Courier Pages
import CourierDashboard from './pages/Courier/Dashboard';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';

// Common Pages
import PricingTool from './pages/Common/PricingTool';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/market" />} />
          <Route path="market" element={<ProduceMarket />} />
          <Route path="pricing-tool" element={<PricingTool />} />
          
          {/* Farmer Routes */}
          <Route path="farmer/dashboard" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </ProtectedRoute>
          } />
          <Route path="farmer/add-product" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <AddProduct />
            </ProtectedRoute>
          } />

          {/* Buyer Routes */}
          <Route path="cart" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <Orders />
            </ProtectedRoute>
          } />

          {/* Courier Routes */}
          <Route path="courier/dashboard" element={
            <ProtectedRoute allowedRoles={['courier']}>
              <CourierDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
