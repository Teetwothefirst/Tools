"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Terminal, 
  Layout, 
  Server, 
  ShieldCheck, 
  Zap, 
  ArrowRight
} from "lucide-react";

const services = [
  {
    title: "Software Solutions",
    description: "Custom ERP, Healthcare EHR, and bespoke business systems designed for Nigeria's unique market needs.",
    icon: <Terminal size={32} />,
    span: "col-span-4",
    color: "var(--gradient-vibrant)",
    textColor: "white"
  },
  {
    title: "Web Services",
    description: "High-performance websites and e-commerce platforms.",
    icon: <Layout size={32} />,
    span: "col-span-4",
    color: "var(--glass-bg)",
    textColor: "inherit"
  },
  {
    title: "ICT Infrastructure",
    description: "Networking, Surveillance, and Technical Consulting.",
    icon: <Server size={32} />,
    span: "col-span-4",
    color: "var(--glass-bg)",
    textColor: "inherit"
  },
  {
    title: "Security & Monitoring",
    description: "State-of-the-art surveillance and digital security protocols.",
    icon: <ShieldCheck size={32} />,
    span: "col-span-4",
    color: "var(--glass-bg)",
    textColor: "inherit"
  },
  {
    title: "Digital Marketing",
    description: "SEO, PPC, and strategic social media growth.",
    icon: <Zap size={32} />,
    span: "col-span-4",
    color: "var(--glass-bg)",
    textColor: "inherit"
  }
];

const ServiceGrid = () => {
  return (
    <section id="expertise" style={{ padding: 'var(--section-padding)', background: 'var(--background)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ color: 'var(--blue-accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem' }}
          >
            Elite Solutions
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginTop: '1.25rem', marginBottom: '1.75rem', fontWeight: 800 }}
          >
            Engineering for the <span className="gradient-text">Future</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            style={{ maxWidth: '700px', margin: '0 auto', opacity: 0.7, fontSize: '1.2rem' }}
          >
            We deploy advanced software engineering and robust ICT infrastructure 
            at scale, driving operational excellence for leading organizations.
          </motion.p>
        </div>

        <div className="bento-grid">
          {services.map((service, index) => {
            const spanClass = index < 3 ? "col-span-4" : "col-span-6";
            
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className={`glass ${spanClass}`}
                style={{ 
                  padding: '3.5rem 2.75rem', 
                  borderRadius: 'var(--radius-xl)', 
                  background: service.textColor === 'white' ? service.color : 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  color: service.textColor === 'white' ? 'white' : 'var(--foreground)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '340px'
                }}
              >
                <div>
                  <div style={{ 
                    marginBottom: '2.5rem', 
                    color: service.textColor === 'white' ? 'white' : 'var(--blue-primary)',
                    background: service.textColor === 'white' ? 'rgba(255,255,255,0.2)' : 'var(--blue-light)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                  }}>
                    {service.icon}
                  </div>
                  <h3 style={{ fontSize: '1.65rem', marginBottom: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{service.title}</h3>
                  <p style={{ opacity: 0.7, fontSize: '1.05rem', lineHeight: '1.7' }}>{service.description}</p>
                </div>
                
                <div style={{ marginTop: '3rem' }}>
                  <motion.span 
                    whileHover={{ x: 8 }}
                    style={{ fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', color: service.textColor === 'white' ? 'white' : 'var(--blue-primary)' }}
                  >
                    Explore Service <ArrowRight size={18} />
                  </motion.span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .bento-grid { gap: 2rem; }
      `}</style>
    </section>
  );
};

export default ServiceGrid;
