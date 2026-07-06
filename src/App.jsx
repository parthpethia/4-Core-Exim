import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import Contact from './pages/Contact';

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
      {/* Scroll manager for navigation changes */}
      <ScrollToTop />
      
      {/* Global B2B Catalog App Container */}
      <div className="flex flex-col min-h-screen bg-brand-gray-50 selection:bg-brand-red-500 selection:text-white">
        
        {/* Sticky Header Navigation */}
        <Header />
        
        {/* Page Render Viewport */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* Fallback path redirects to Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        
        {/* Corporate footer */}
        <Footer />
        
      </div>
    </BrowserRouter>
  );
}
