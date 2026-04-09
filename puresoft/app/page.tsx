import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServiceGrid from "@/components/ServiceGrid";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ServiceGrid />
      
      {/* Social Proof / Stats Section */}
      <section style={{ padding: '4rem 0', borderTop: '1px solid var(--blue-light)', borderBottom: '1px solid var(--blue-light)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem' }}>
          {[
            { label: "Founded", value: "2018" },
            { label: "Completed Projects", value: "150+" },
            { label: "Happy Clients", value: "80+" },
            { label: "Expert Engineers", value: "25+" }
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--blue-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.6, fontWeight: 600 }}>{stat.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      <Contact />
      <Footer />
    </main>
  );
}
