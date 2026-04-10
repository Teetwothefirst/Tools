"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Box, Shield, Globe } from "lucide-react";

const Hero = () => {
  return (
    <section 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        paddingTop: '120px',
        paddingBottom: '80px',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--background)'
      }}
    >
      {/* Background Decor */}
      <div 
        style={{ 
          position: 'absolute', top: '-10%', right: '-5%', 
          width: '600px', height: '600px', 
          background: 'radial-gradient(circle, var(--blue-secondary) 0%, transparent 70%)',
          opacity: 0.08, zIndex: -1, borderRadius: '50%'
        }} 
      />
      <div 
        style={{ 
          position: 'absolute', bottom: '10%', left: '-5%', 
          width: '400px', height: '400px', 
          background: 'radial-gradient(circle, var(--blue-accent) 0%, transparent 70%)',
          opacity: 0.04, zIndex: -1, borderRadius: '50%'
        }} 
      />

      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ 
              display: 'inline-block', padding: '0.6rem 1.25rem', 
              background: 'var(--blue-light)', color: 'var(--blue-primary)',
              borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 700,
              marginBottom: '2rem',
              boxShadow: '0 4px 12px rgba(0, 59, 115, 0.1)'
            }}
          >
            Digital Transformation Redefined
          </motion.span>
          
          <h1 style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', marginBottom: '2rem', lineHeight: 1 }}>
            We Build <span className="gradient-text">Future-Ready</span> Technology.
          </h1>
          
          <p style={{ maxWidth: '600px', marginBottom: '3rem', fontSize: '1.25rem', color: 'var(--foreground)', opacity: 0.7 }}>
            PureSoft Technologies delivers elite software engineering, immersive web solutions, and robust ICT infrastructure 
            designed to scale your business into the next decade.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="button-primary" style={{ padding: '1.1rem 2.25rem', fontSize: '1.1rem' }}>
              Explore Our Solutions <ArrowRight size={20} />
            </button>
            <button style={{ 
              background: 'transparent', border: '1px solid var(--card-border)',
              padding: '1.1rem 2.25rem', borderRadius: '2rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: 'var(--foreground)'
            }}>
              View Portfolio
            </button>
          </div>
        </motion.div>

        {/* Visual Element (Right Side) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ position: 'relative' }}
          className="hero-grid-container"
        >
          <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass" 
              style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <Box className="gradient-text" size={40} style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 800 }}>Software</h3>
              <p style={{ fontSize: '0.95rem', opacity: 0.6 }}>Bespoke ERP & CRM systems tailored for operational excellence.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass" 
              style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', marginTop: '3rem', background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <Globe className="gradient-text" size={40} style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 800 }}>Web</h3>
              <p style={{ fontSize: '0.95rem', opacity: 0.6 }}>Immersive digital experiences that captivate and convert.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass" 
              style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <Shield className="gradient-text" size={40} style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 800 }}>ICT</h3>
              <p style={{ fontSize: '0.95rem', opacity: 0.6 }}>Secure networking and infrastructure support.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass" 
              style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', marginTop: '3rem', background: 'var(--gradient-deep)', color: 'white' }}
            >
              <div style={{ color: 'white' }}>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>99%</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.9, color: 'white' }}>Client satisfaction across Nigeria.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .container { grid-template-columns: 1fr !important; text-align: center; gap: 5rem; padding-bottom: 4rem; }
          p { margin: 2rem auto !important; }
          .hero-grid-container { max-width: 600px; margin: 0 auto; }
        }
        @media (max-width: 640px) {
          .bento-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .glass { margin-top: 0 !important; }
        }
      `}</style>
    </section>
  );
};


export default Hero;
