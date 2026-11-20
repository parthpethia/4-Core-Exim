import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
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
import OAuthRedirectBridge from './components/OAuthRedirectBridge';

// Lazy-loaded heavy pages (code splitting)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

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
      {/* Must run before AuthProvider so ?code= on / is moved to /auth/callback
          without consuming the PKCE verifier twice */}
      <OAuthRedirectBridge />
      <AuthProvider>
      <CompanyProvider>
        <ScrollToTop />
        
        {/* Global B2B Catalog App Container */}
        <ErrorBoundary>
        <div className="flex flex-col min-h-screen bg-brand-gray-50 text-brand-gray-800">
          
          {/* Sticky Header Navigation */}
          <Header />
          
          {/* Page Render Viewport */}
          <main className="flex-grow">
            <Suspense fallback={
              <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand-green-200 border-t-brand-green-600 rounded-full animate-spin" />
              </div>
            }>
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
            </Suspense>
          </main>
          
          {/* Corporate footer */}
          <Footer />
          
        </div>
        </ErrorBoundary>
      </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
