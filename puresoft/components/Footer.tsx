"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Users, MessageSquare } from "lucide-react";

const Footer = () => {
  return (
    <footer style={{ background: 'var(--blue-dark)', color: 'white', padding: '5rem 0 2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4rem', marginBottom: '4rem' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.05em' }}>
              PURESOFT
            </h3>
            <p style={{ color: 'white', opacity: 0.6, fontSize: '0.95rem', marginBottom: '2rem' }}>
              Leading the digital frontier in Abuja, Nigeria. We craft elite software and ICT solutions for the global stage.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Globe size={20} style={{ opacity: 0.6, cursor: 'pointer' }} />
              <Users size={20} style={{ opacity: 0.6, cursor: 'pointer' }} />
              <MessageSquare size={20} style={{ opacity: 0.6, cursor: 'pointer' }} />
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>Solutions</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: 0.6 }}>
              <li><Link href="#">Software Development</Link></li>
              <li><Link href="#">Web Development</Link></li>
              <li><Link href="#">E-Commerce</Link></li>
              <li><Link href="#">ICT Consulting</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: 0.6 }}>
              <li><Link href="#">About Us</Link></li>
              <li><Link href="#">Our Portfolio</Link></li>
              <li><Link href="#">Training</Link></li>
              <li><Link href="#">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>Get in Touch</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.6, fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', gap: '0.75rem' }}><MapPin size={18} /> Shoprite Building, Airport Road, Abuja</li>
              <li style={{ display: 'flex', gap: '0.75rem' }}><Phone size={18} /> +234 706 687 4738</li>
              <li style={{ display: 'flex', gap: '0.75rem' }}><Mail size={18} /> info@puresoft.com.ng</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', opacity: 0.4, fontSize: '0.8rem' }}>
          <p>© 2026 PureSoft Technologies. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @media (max-width: 1024px) {
          div { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          div { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
