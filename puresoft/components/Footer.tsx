"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Users, MessageSquare } from "lucide-react";

const Footer = () => {
  return (
    <footer style={{ background: 'var(--footer-bg)', color: 'var(--footer-text)', padding: '6rem 0 3rem', transition: 'all 0.4s var(--transition-smooth)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4rem', marginBottom: '5rem' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--blue-primary)', marginBottom: '1.5rem', letterSpacing: '-0.05em' }}>
              PURESOFT
            </h3>
            <p style={{ color: 'inherit', opacity: 0.7, fontSize: '1rem', marginBottom: '2.5rem', lineHeight: '1.7' }}>
              Leading the digital frontier in Abuja, Nigeria. We craft elite software and ICT solutions for the global stage.
            </p>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <Globe size={22} style={{ opacity: 0.7, cursor: 'pointer' }} />
              <Users size={22} style={{ opacity: 0.7, cursor: 'pointer' }} />
              <MessageSquare size={22} style={{ opacity: 0.7, cursor: 'pointer' }} />
            </div>
          </div>

          <div>
            <h4 style={{ color: 'inherit', marginBottom: '1.75rem', fontWeight: 800, fontSize: '1.1rem' }}>Solutions</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.7, fontSize: '0.95rem' }}>
              <li><Link href="#expertise" className="footer-link">Software Development</Link></li>
              <li><Link href="#expertise" className="footer-link">Web Development</Link></li>
              <li><Link href="#expertise" className="footer-link">E-Commerce</Link></li>
              <li><Link href="#expertise" className="footer-link">ICT Consulting</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'inherit', marginBottom: '1.75rem', fontWeight: 800, fontSize: '1.1rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.7, fontSize: '0.95rem' }}>
              <li><Link href="#" className="footer-link">About Us</Link></li>
              <li><Link href="#" className="footer-link">Our Portfolio</Link></li>
              <li><Link href="#" className="footer-link">Training</Link></li>
              <li><Link href="#contact" className="footer-link">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'inherit', marginBottom: '1.75rem', fontWeight: 700 }}>Get in Touch</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: 0.7, fontSize: '0.95rem' }}>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}><MapPin size={22} style={{ flexShrink: 0 }} /> Shoprite Building, Airport Road, Abuja</li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><Phone size={20} /> +234 706 687 4738</li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><Mail size={20} /> info@puresoft.com.ng</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '2.5rem', display: 'flex', justifyContent: 'space-between', opacity: 0.6, fontSize: '0.85rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <p>© 2026 PureSoft Technologies. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <Link href="#" style={{ color: 'var(--nav-link)', textDecoration: 'none', transition: 'color 0.3s ease' }} className="footer-bottom-link">Privacy Policy</Link>
            <Link href="#" style={{ color: 'var(--nav-link)', textDecoration: 'none', transition: 'color 0.3s ease' }} className="footer-bottom-link">Terms of Service</Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .footer-link {
          color: var(--nav-link);
          opacity: 0.8;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .footer-link:hover {
          color: var(--blue-accent);
          opacity: 1;
          padding-left: 2px;
        }
        .footer-bottom-link:hover {
          color: var(--blue-accent) !important;
        }
        @media (max-width: 1024px) {
          footer > .container > div:first-child { grid-template-columns: repeat(2, 1fr) !important; gap: 3rem !important; }
        }
        @media (max-width: 640px) {
          footer > .container > div:first-child { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </footer>
  );
};


export default Footer;
