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
        paddingTop: '100px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Decor */}
      <div 
        style={{ 
          position: 'absolute', top: '-10%', right: '-5%', 
          width: '600px', height: '600px', 
          background: 'radial-gradient(circle, var(--blue-secondary) 0%, transparent 70%)',
          opacity: 0.1, zIndex: -1, borderRadius: '50%'
        }} 
      />
      <div 
        style={{ 
          position: 'absolute', bottom: '10%', left: '-5%', 
          width: '400px', height: '400px', 
          background: 'radial-gradient(circle, var(--blue-accent) 0%, transparent 70%)',
          opacity: 0.05, zIndex: -1, borderRadius: '50%'
        }} 
      />

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
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
              display: 'inline-block', padding: '0.5rem 1rem', 
              background: 'var(--blue-light)', color: 'var(--blue-primary)',
              borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600,
              marginBottom: '1.5rem'
            }}
          >
            Digital Transformation Redefined
          </motion.span>
          
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '2rem' }}>
            We Build <span className="gradient-text">Future-Ready</span> Technology.
          </h1>
          
          <p style={{ maxWidth: '600px', marginBottom: '3rem', fontSize: '1.25rem' }}>
            PureSoft Technologies delivers elite software engineering, immersive web solutions, and robust ICT infrastructure 
            designed to scale your business into the next decade.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button className="button-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Explore Our Solutions <ArrowRight size={20} />
            </button>
            <button style={{ 
              background: 'transparent', border: '1px solid var(--glass-border)',
              padding: '1rem 2rem', borderRadius: '2rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              View Portfolio
            </button>
          </div>
        </motion.div>

        {/* Visual Element (Right Side) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ position: 'relative' }}
        >
          <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass" 
              style={{ padding: '2rem', borderRadius: '1.5rem' }}
            >
              <Box className="gradient-text" size={40} style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Software</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Bespoke ERP & CRM systems tailored for operational excellence.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass" 
              style={{ padding: '2rem', borderRadius: '1.5rem', marginTop: '2rem' }}
            >
              <Globe className="gradient-text" size={40} style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Web</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Immersive digital experiences that captivate and convert.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass" 
              style={{ padding: '2rem', borderRadius: '1.5rem' }}
            >
              <Shield className="gradient-text" size={40} style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>ICT</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Secure networking and infrastructure support.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass" 
              style={{ padding: '2rem', borderRadius: '1.5rem', marginTop: '2rem', background: 'var(--gradient-deep)' }}
            >
              <div style={{ color: 'white' }}>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>99%</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Client satisfaction across Nigeria.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .container { grid-template-columns: 1fr !important; text-align: center; gap: 4rem; }
          p { margin: 2rem auto !important; }
          div { justify-content: center; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
