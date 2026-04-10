"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServiceGrid from "@/components/ServiceGrid";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ServiceGrid />
      
      {/* Social Proof / Stats Section */}
      <section id="stats" style={{ padding: '6rem 0', background: 'var(--background)', position: 'relative', overflow: 'hidden' }}>
        <div 
          style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '100%', height: '100%', 
            background: 'radial-gradient(circle, var(--blue-light) 0%, transparent 80%)',
            opacity: 0.3, zIndex: -1 
          }} 
        />
        
        <div className="container">
          <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { label: "Founded", value: "2018", description: "Inception of Elite Tech" },
              { label: "Completed Projects", value: "150+", description: "Successful Deliveries" },
              { label: "Happy Clients", value: "80+", description: "Trusted Partnerships" },
              { label: "Expert Engineers", value: "25+", description: "Specialized Talent" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="glass"
                style={{ 
                  textAlign: 'center', 
                  padding: '3rem 2rem', 
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--blue-primary)', letterSpacing: '-0.05em' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.5, fontWeight: 500 }}>
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 1024px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 2rem !important; }
        }
        @media (max-width: 640px) {
          .bento-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        }
      `}</style>

      <Contact />
      <Footer />
    </main>
  );
}
