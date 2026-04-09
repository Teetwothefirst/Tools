"use client";

import React from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <section style={{ padding: 'var(--section-padding)', position: 'relative' }}>
      <div className="container glass" style={{ padding: '4rem', borderRadius: '3rem', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Start Your <span className="gradient-text">Transformation</span></h2>
            <p style={{ marginBottom: '2.5rem', opacity: 0.7 }}>
              Ready to scale? Let's discuss your next project. Our team is ready to deliver world-class 
              technical expertise directly to your doorstep.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-primary)' }}>
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem' }}>Live Consultations</h4>
                  <p style={{ fontSize: '0.85rem' }}>Speak directly with our technical leads.</p>
                </div>
              </div>
            </div>
          </div>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <input type="text" placeholder="Your Name" style={inputStyle} />
              <input type="email" placeholder="Email Address" style={inputStyle} />
            </div>
            <input type="text" placeholder="Subject" style={inputStyle} />
            <textarea placeholder="Tell us about your project..." style={{ ...inputStyle, minHeight: '150px' }}></textarea>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="button-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '1.25rem', fontSize: '1.1rem' }}
            >
              Send Message <Send size={20} />
            </motion.button>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        @media (max-width: 1024px) {
          div { grid-template-columns: 1fr !important; }
          .container { padding: 2.5rem !important; }
        }
      `}</style>
    </section>
  );
};

const inputStyle = {
  background: 'rgba(0,0,0,0.03)',
  border: '1px solid var(--glass-border)',
  padding: '1.25rem',
  borderRadius: '1rem',
  width: '100%',
  fontFamily: 'inherit',
  fontSize: '1rem',
  outline: 'none',
  transition: 'all 0.3s ease'
};

export default Contact;
