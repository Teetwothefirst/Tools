"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Sun, Moon } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Theme initialization
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const navLinks = [
    { name: "Software", href: "/software" },
    { name: "Web Solutions", href: "/web" },
    { name: "ICT", href: "/ict" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-primary)', letterSpacing: '-0.05em' }}>
          PURESOFT
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="desktop-only">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              style={{ fontSize: '0.9rem', fontWeight: 500, opacity: 0.7, transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              {link.name}
            </Link>
          ))}
          
          <button 
            onClick={toggleTheme}
            style={{ 
              background: 'transparent', color: 'var(--foreground)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0.5rem', borderRadius: '50%'
            }}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <Link href="/contact" className="button-primary" style={{ fontSize: '0.9rem' }}>
            Book a Demo <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile Toggle & Theme Toggle */}
        <div className="mobile-only" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={toggleTheme}
            style={{ background: 'none', color: 'var(--foreground)' }}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', color: 'var(--foreground)' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Simplified for now) */}
      {isMobileMenuOpen && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, 
          background: 'var(--background)', padding: '2rem',
          display: 'flex', flexDirection: 'column', gap: '1.5rem',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
              {link.name}
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .desktop-only { display: flex; }
        .mobile-only { display: none; }
        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-only { display: block; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
