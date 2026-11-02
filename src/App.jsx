import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Compliance from './pages/Compliance';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

/**
 * ScrollToTop utility component.
 * Automatically scroll window to top coordinates when active path changes.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <CompanyProvider>
        {/* Scroll manager for navigation changes */}
        <ScrollToTop />
        
        {/* Global B2B Catalog App Container */}
        <div className="flex flex-col min-h-screen bg-brand-gray-50 text-brand-gray-800">
          
          {/* Sticky Header Navigation */}
          <Header />
          
          {/* Page Render Viewport */}
          <main className="flex-grow">
            <Routes>
              {/* Public Marketing & Catalog Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/about" element={<About />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Authentication & OAuth Flow Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected Client Portal */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Trade Desk Admin Portal */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback path redirects to Home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          
          {/* Corporate footer */}
          <Footer />
          
        </div>
      </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
