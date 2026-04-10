"use client";

import React from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" style={{ padding: 'var(--section-padding)', position: 'relative', background: 'var(--background)' }}>
      <div className="container glass" style={{ padding: '5rem 4rem', borderRadius: 'var(--radius-xl)', background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '6rem', alignItems: 'center' }}>
          <div>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ color: 'var(--blue-accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem' }}
            >
              Consultation
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              style={{ fontSize: 'clamp(2.25rem, 8vw, 3.5rem)', marginTop: '1.25rem', marginBottom: '1.75rem', fontWeight: 800, lineHeight: '1.15' }}
            >
              Start Your <span className="gradient-text">Transformation</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              style={{ marginBottom: '3rem', opacity: 0.7, fontSize: '1.15rem' }}
            >
              Partner with Abuja's leading technology architects. Let's discuss how our elite software 
              and ICT solutions can scale your organization to the next level.
            </motion.p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="glass" 
                style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '1.25rem', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <MessageCircle size={26} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Expert Consultations</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.6, fontWeight: 500 }}>Speak directly with our technical leads.</p>
                </div>
              </motion.div>
            </div>
          </div>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
              <div style={{ position: 'relative' }}>
                <label htmlFor="name" className="sr-only">Your Name</label>
                <input id="name" type="text" placeholder="Your Name" style={inputStyle} required />
              </div>
              <div style={{ position: 'relative' }}>
                <label htmlFor="email" className="sr-only">Email Address</label>
                <input id="email" type="email" placeholder="Email Address" style={inputStyle} required />
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <label htmlFor="subject" className="sr-only">Subject</label>
              <input id="subject" type="text" placeholder="Subject" style={inputStyle} required />
            </div>
            <div style={{ position: 'relative' }}>
              <label htmlFor="message" className="sr-only">Message</label>
              <textarea id="message" placeholder="Tell us about your project infrastructure needs..." style={{ ...inputStyle, minHeight: '180px', resize: 'vertical' }} required></textarea>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className="button-primary"
              type="submit"
              style={{ width: '100%', justifyContent: 'center', padding: '1.4rem', fontSize: '1.1rem' }}
            >
              Send Secure Message <Send size={22} />
            </motion.button>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        @media (max-width: 1024px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
          .container { padding: 3.5rem 2.5rem !important; }
          .input-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .container { padding: 2.5rem 1.5rem !important; }
        }
      `}</style>
    </section>
  );
};

const inputStyle = {
  background: 'var(--input-bg)',
  border: '1px solid var(--card-border)',
  color: 'var(--foreground)',
  padding: '1.4rem',
  borderRadius: '1.25rem',
  width: '100%',
  fontFamily: 'inherit',
  fontSize: '1.05rem',
  outline: 'none',
  transition: 'all 0.3s var(--transition-smooth)'
};



export default Contact;
