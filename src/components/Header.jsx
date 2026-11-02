import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiPhone, FiMenu, FiX, FiShield, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/useAuth';

export default function Header() {
  const { company: companyData } = useCompany();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    setIsOpen(false);
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products & Index', path: '/catalog' },
    { name: 'Quality & Compliance', path: '/compliance' },
    { name: 'About Exporters', path: '/about' },
    { name: 'Trade Office', path: '/contact' },
  ];

  const userDisplayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account';

  return (
    <header 
      className={`sticky top-0 z-40 bg-white border-b border-brand-gray-200 transition-shadow duration-200 ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      {/* Top Notification / Trade Dispatch Bar */}
      <div className="bg-brand-gray-900 text-brand-gray-300 text-[11px] py-1.5 px-4 hidden md:block border-b border-brand-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-white">4Core Exim International Trade Desk</span>
            <span className="text-brand-gray-500">|</span>
            <span>WHO-GMP Sourced Batch Export from Mumbai & Nagpur, India</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Hours: {companyData?.businessHours || 'Mon - Sat: 11:00 AM - 8:00 PM (IST)'}</span>
            <span className="text-brand-gray-500">|</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <FiShield className="text-xs" /> CDSCO Export Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex flex-col select-none" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <div className="bg-brand-red-600 text-white font-bold text-sm px-2 py-0.5 rounded">
                4CORE
              </div>
              <span className="text-xl font-extrabold text-brand-gray-900 tracking-tight">
                Exim
              </span>
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-gray-500 mt-0.5">
              By Thakkar Medico Traders
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'text-brand-red-600 bg-brand-red-50'
                      : 'text-brand-gray-700 hover:text-brand-gray-950 hover:bg-brand-gray-100'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Direct Contact & Auth CTAs */}
          <div className="hidden sm:flex items-center gap-2">
            <a
              href={`tel:${(companyData?.phone || '+91 93253 03018').replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-gray-300 hover:border-brand-gray-400 text-brand-gray-800 rounded text-xs font-semibold transition-colors bg-white"
              title="Call Trade Desk"
            >
              <FiPhone className="text-brand-red-600 text-xs" />
              <span>{companyData?.phone || '+91 93253 03018'}</span>
            </a>
            
            <a
              href={`https://wa.me/${(companyData?.whatsapp || '+919325303018').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold transition-colors shadow-sm"
              title="WhatsApp Trade Desk"
            >
              <FaWhatsapp className="text-xs" />
              <span>WhatsApp</span>
            </a>

            <Link
              to="/catalog"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-red-600 hover:bg-brand-red-700 text-white rounded text-xs font-bold transition-colors shadow-sm"
            >
              RFQ Catalog
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gray-900 hover:bg-black text-white rounded text-xs font-bold transition-colors shadow-sm border border-brand-gray-700"
                title="Trade Desk Admin Console"
              >
                <FiShield className="text-brand-red-500 text-xs" />
                <span>Admin Console</span>
              </Link>
            )}

            {/* Authentication Action / Profile Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-gray-900 rounded text-xs font-bold transition-colors cursor-pointer border border-brand-gray-300"
                  aria-label="User menu"
                >
                  <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-brand-red-600' : 'bg-blue-600'}`} />
                  <span className="max-w-[100px] truncate">{userDisplayName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    isAdmin ? 'bg-brand-red-100 text-brand-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isAdmin ? 'Admin' : 'Client'}
                  </span>
                  <FiChevronDown className="text-xs text-brand-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-brand-gray-150">
                      <span className="block text-[11px] text-brand-gray-500">Signed in as</span>
                      <span className="block text-xs font-bold text-brand-gray-900 truncate font-mono">
                        {user.email}
                      </span>
                    </div>

                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-brand-gray-800 hover:bg-brand-gray-50 font-bold"
                      >
                        <FiShield className="text-brand-red-600" />
                        <span>Trade Desk Admin Console</span>
                      </Link>
                    ) : null}

                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-brand-gray-800 hover:bg-brand-gray-50 font-semibold"
                    >
                      <FiUser className="text-brand-gray-600" />
                      <span>Client Dashboard</span>
                    </Link>

                    <div className="border-t border-brand-gray-150 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                    >
                      <FiLogOut />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-gray-300 hover:border-brand-gray-400 text-brand-gray-900 rounded text-xs font-bold transition-colors bg-brand-gray-50 hover:bg-brand-gray-100"
              >
                <FiUser className="text-brand-red-600 text-xs" />
                <span>Sign In</span>
              </Link>
            )}

          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            {!user ? (
              <Link
                to="/login"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-brand-red-600 border border-brand-red-200 bg-brand-red-50 rounded"
              >
                <FiUser className="text-xs" />
                <span>Sign In</span>
              </Link>
            ) : (
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded ${
                  isAdmin ? 'bg-brand-red-100 text-brand-red-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                <span>{isAdmin ? 'Admin' : 'Portal'}</span>
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-gray-900 p-2 rounded hover:bg-brand-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-brand-gray-200 absolute w-full top-full left-0 z-30 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            
            {/* Authenticated user mobile identity banner */}
            {user && (
              <div className="mb-3 p-3 bg-brand-gray-50 rounded-lg border border-brand-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-gray-900 truncate">
                    {user.email}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    isAdmin ? 'bg-brand-red-100 text-brand-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isAdmin ? 'Admin' : 'Client'}
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link
                    to={isAdmin ? "/admin" : "/dashboard"}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-1.5 bg-brand-red-600 text-white rounded text-xs font-bold"
                  >
                    {isAdmin ? "Admin Console" : "Client Portal"}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 border border-brand-gray-300 text-brand-gray-700 rounded text-xs font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded text-sm font-semibold ${
                    isActive
                      ? 'text-brand-red-600 bg-brand-red-50'
                      : 'text-brand-gray-700 hover:text-brand-gray-950 hover:bg-brand-gray-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            
            <div className="pt-4 border-t border-brand-gray-200 grid grid-cols-2 gap-2">
              <a
                href={`tel:${(companyData?.phone || '+91 93253 03018').replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-2 border border-brand-gray-300 text-brand-gray-800 rounded text-xs font-bold"
              >
                <FiPhone className="text-brand-red-600" />
                <span>Call Trade Office</span>
              </a>
              <a
                href={`https://wa.me/${(companyData?.whatsapp || '+919325303018').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 bg-emerald-700 text-white rounded text-xs font-bold"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
            </div>

            {!user && (
              <div className="pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-red-600 text-white rounded text-xs font-bold"
                >
                  <FiUser />
                  <span>Sign In / Importer & Admin Portal</span>
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
}
