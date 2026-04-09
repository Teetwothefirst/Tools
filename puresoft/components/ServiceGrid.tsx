"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Terminal, 
  Layout, 
  Server, 
  ShieldCheck, 
  Zap, 
  Users 
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
    <section style={{ padding: 'var(--section-padding)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Our Expertise</h2>
          <p style={{ maxWidth: '700px', margin: '0 auto' }}>
            We provide a comprehensive suite of digital services designed to handle entire business operations 
            securely and efficiently.
          </p>
        </div>

        <div className="bento-grid" style={{ gridAutoRows: 'minmax(250px, auto)' }}>
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`glass ${service.span}`}
              style={{ 
                padding: '2.5rem', 
                borderRadius: '2rem', 
                background: service.color,
                color: service.textColor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ marginBottom: '1.5rem', color: service.textColor === 'white' ? 'white' : 'var(--blue-primary)' }}>
                  {service.icon}
                </div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'inherit' }}>{service.title}</h3>
                <p style={{ opacity: 0.8, color: 'inherit' }}>{service.description}</p>
              </div>
              
              <div style={{ marginTop: '2rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Learn More <span style={{ opacity: 0.5 }}>→</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .col-span-8 { grid-column: span 8; }
        .col-span-4 { grid-column: span 4; }
        
        @media (max-width: 1024px) {
          .col-span-8, .col-span-4 { grid-column: span 6; }
        }
        
        @media (max-width: 640px) {
          .col-span-8, .col-span-4 { grid-column: span 1; }
        }
      `}</style>
    </section>
  );
};

export default ServiceGrid;
