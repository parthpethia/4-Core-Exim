import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiPhoneCall, FiMail, FiMenu, FiX } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import companyData from '../data/company.json';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products & Categories', path: '/catalog' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-brand-gray-200/80 py-2.5' 
          : 'bg-white border-b border-brand-gray-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link to="/" className="flex flex-col select-none group" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-6 bg-brand-red-500 rounded-full inline-block group-hover:scale-y-110 transition-transform duration-200"></span>
              <span className="text-2xl font-extrabold text-brand-gray-900 tracking-tight">
                4Core <span className="text-brand-red-500">Exim</span>
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gray-700 mt-0.5 pl-4 block">
              {companyData.subtitle}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-brand-red-500 bg-brand-red-50/70'
                      : 'text-brand-gray-700 hover:text-brand-red-500 hover:bg-brand-gray-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Call To Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href={`tel:${companyData.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-brand-gray-200 hover:border-brand-red-500 hover:text-brand-red-500 text-brand-gray-800 rounded-lg text-xs font-bold transition-all shadow-sm bg-white"
              title="Call Sales Office"
            >
              <FiPhoneCall className="text-sm shrink-0" />
              <span>Call Now</span>
            </a>
            
            <a
              href={`mailto:${companyData.email}`}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-brand-gray-200 hover:border-brand-red-500 hover:text-brand-red-500 text-brand-gray-800 rounded-lg text-xs font-bold transition-all shadow-sm bg-white"
              title="Send an Email"
            >
              <FiMail className="text-sm shrink-0" />
              <span>Email Us</span>
            </a>

            <a
              href={`https://wa.me/${companyData.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg"
              title="Chat on WhatsApp"
            >
              <FaWhatsapp className="text-sm shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Hamburger Mobile Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-gray-900 focus:outline-none p-1 rounded hover:bg-brand-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-brand-gray-200 shadow-lg absolute w-full top-full left-0 z-40 transition-all duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-3 rounded-lg text-base font-semibold ${
                    isActive
                      ? 'text-brand-red-500 bg-brand-red-50'
                      : 'text-brand-gray-700 hover:text-brand-red-500 hover:bg-brand-gray-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            
            <div className="pt-4 border-t border-brand-gray-100 grid grid-cols-3 gap-2">
              <a
                href={`tel:${companyData.phone.replace(/\s+/g, '')}`}
                className="flex flex-col items-center justify-center py-2.5 bg-brand-gray-50 hover:bg-brand-gray-100 border border-brand-gray-200 text-brand-gray-800 rounded-lg text-[10px] font-bold"
              >
                <FiPhoneCall className="text-base text-brand-red-500 mb-1" />
                <span>Call Now</span>
              </a>
              <a
                href={`mailto:${companyData.email}`}
                className="flex flex-col items-center justify-center py-2.5 bg-brand-gray-50 hover:bg-brand-gray-100 border border-brand-gray-200 text-brand-gray-800 rounded-lg text-[10px] font-bold"
              >
                <FiMail className="text-base text-brand-red-500 mb-1" />
                <span>Email Us</span>
              </a>
              <a
                href={`https://wa.me/${companyData.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-2.5 bg-green-50 hover:bg-green-100 border border-green-100 text-green-700 rounded-lg text-[10px] font-bold"
              >
                <FaWhatsapp className="text-base text-green-600 mb-1" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
