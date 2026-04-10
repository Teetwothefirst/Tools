"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";

/**
 * Navbar Component
 * Features:
 * - Theme-aware styling (light/dark)
 * - Glassmorphism on scroll
 * - Responsive mobile menu
 * - Smooth anchor navigation
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Theme initialization and sync
    const savedTheme = document.documentElement.getAttribute('data-theme') as "light" | "dark";
    setTheme(savedTheme || "dark");

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Dispatch a custom event for other components if needed
    window.dispatchEvent(new Event('theme-change'));
  };

  const navLinks = [
    { name: "Software", href: "#expertise" },
    { name: "Web Solutions", href: "#expertise" },
    { name: "ICT", href: "#expertise" },
    { name: "Pricing", href: "#contact" },
    { name: "Contact", href: "#contact" },
  ];

  const themeIcon = theme === "light" ? <Moon size={18} /> : <Sun size={18} />;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
      style={{ 
        borderBottom: isScrolled ? '1px solid var(--card-border)' : 'none',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none'
      }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--blue-primary)', letterSpacing: '-0.06em', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          PURESOFT
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-desktop">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="nav-link"
            >
              {link.name}
            </Link>
          ))}
          
          <div style={{ width: '1px', height: '20px', background: 'var(--card-border)', opacity: 0.5 }}></div>

          <button 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="theme-toggle"
          >
            {theme ? themeIcon : <div style={{ width: 18, height: 18 }} />}
          </button>

          <Link href="#contact" className="button-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', textDecoration: 'none' }}>
            Book a Demo
          </Link>
        </div>

        {/* Mobile Toggle & Theme Toggle */}
        <div className="navbar-mobile-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={toggleTheme}
            aria-label="Toggle Theme Mobile"
            className="theme-toggle"
          >
            {theme ? themeIcon : <div style={{ width: 18, height: 18 }} />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--foreground)', padding: '0.5rem', display: 'flex', cursor: 'pointer' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mobile-menu"
        >
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-nav-link"
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="#contact" 
            className="button-primary" 
            style={{ justifyContent: 'center', marginTop: '1rem', textDecoration: 'none' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Book a Demo
          </Link>
        </motion.div>
      )}

      <style jsx>{`
        .navbar-desktop { display: flex; gap: 2.25rem; align-items: center; }
        .navbar-mobile-controls { display: none; }
        
        .nav-link { 
          font-size: 0.9rem; 
          font-weight: 600; 
          color: var(--foreground); 
          opacity: 0.75;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .nav-link:hover { 
          color: var(--blue-accent); 
          opacity: 1; 
        }
        
        .theme-toggle { 
          background: var(--card-bg); 
          color: var(--foreground); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          padding: 0.65rem; 
          border-radius: 50%; 
          border: 1px solid var(--card-border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .theme-toggle:hover { transform: scale(1.1); background: var(--blue-light); color: var(--blue-primary); }

        .mobile-menu {
          position: absolute; 
          top: calc(100% + 1rem); 
          left: 1rem; 
          right: 1rem; 
          background: var(--card-bg); 
          padding: 2rem;
          display: flex; 
          flex-direction: column; 
          gap: 1.5rem;
          border-radius: 1.5rem;
          border: 1px solid var(--card-border);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          backdrop-filter: blur(20px);
        }
        .mobile-nav-link { 
          font-size: 1.1rem; 
          font-weight: 600; 
          color: var(--foreground); 
          text-decoration: none; 
          transition: all 0.3s ease;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--card-border);
        }
        .mobile-nav-link:last-of-type { border-bottom: none; }
        .mobile-nav-link:hover { color: var(--blue-accent); }

        @media (max-width: 900px) {
          .navbar-desktop { display: none; }
          .navbar-mobile-controls { display: flex; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
