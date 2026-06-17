// "use client"

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Briefcase,
  Sparkles,
  LayoutDashboard,
  Calendar,
  Upload,
  FileText,
  ArrowRight,
  MousePointerClick,
  Clock,
} from "lucide-react";

export const metadata = {
  title: "JobTracker — Organised Job Search, Effortlessly",
  description:
    "Organise your job search, extract descriptions with AI, set follow-up reminders, and build professional CVs to PDF.",
};

const features = [
  {
    icon: Sparkles,
    title: "AI Summarise & Skills",
    body: "Paste any job description. AI extracts responsibilities, summarises the role, and surfaces required skills.",
  },
  {
    icon: LayoutDashboard,
    title: "Visual Kanban Pipeline",
    body: "Drag cards through Saved, Applied, Interviewing, Offer, and Rejected. Set priority and track contacts.",
  },
  {
    icon: FileText,
    title: "CV / PDF Builder",
    body: "Select your accepted offers, compile into a clean A4 document, and download as PDF, HTML, TXT, or JSON.",
  },
  {
    icon: Calendar,
    title: "Google Calendar Sync",
    body: "Generate calendar links for follow-ups, interviews, and offer acceptances — one click away.",
  },
  {
    icon: Upload,
    title: "Excel Batch Import",
    body: "Already tracking in a spreadsheet? Drop a CSV or XLSX and import all applications instantly.",
  },
  {
    icon: MousePointerClick,
    title: "Dynamic Date Tracking",
    body: "Monitor days elapsed since offer letters and contract end dates, surfaced directly on every card.",
  },
];

const mockColumns = [
  {
    title: "Saved",
    count: 2,
    cards: [
      { company: "Google", role: "Senior UX Designer", tag: "High", tagColor: "var(--priority-high-text)", tagBg: "var(--priority-high-bg)" },
      { company: "Stripe", role: "Frontend Architect", tag: "Medium", tagColor: "var(--priority-medium-text)", tagBg: "var(--priority-medium-bg)" },
    ],
  },
  {
    title: "Applied",
    count: 1,
    cards: [
      { company: "Airbnb", role: "Software Engineer", tag: "Low", tagColor: "var(--priority-low-text)", tagBg: "var(--priority-low-bg)" },
    ],
  },
  {
    title: "Interviewing",
    count: 1,
    highlight: true,
    cards: [
      { company: "Netflix", role: "Staff AI Specialist", tag: "High", tagColor: "var(--priority-high-text)", tagBg: "var(--priority-high-bg)", sub: "Interview: 03/07/2026" },
    ],
  },
  {
    title: "Offer",
    count: 1,
    cards: [
      { company: "Vercel", role: "Lead Next.js Advocate", tag: "High", tagColor: "var(--priority-high-text)", tagBg: "var(--priority-high-bg)", pay: "$185k – $210k/yr" },
    ],
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Nav ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "var(--bg-raised)",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Briefcase size={14} color="#fff" />
            </div>
            <span
              style={{
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              JobTracker
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    padding: "6px 12px",
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-primary"
                  style={{ textDecoration: "none", fontSize: "0.8125rem" }}
                >
                  <span>Go to Board</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    padding: "6px 12px",
                  }}
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="btn-primary"
                  style={{ textDecoration: "none", fontSize: "0.8125rem" }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        style={{
          padding: "96px 24px 80px",
          textAlign: "center",
          maxWidth: 760,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 4,
            border: "0.5px solid var(--accent-border)",
            backgroundColor: "var(--accent-subtle)",
            color: "var(--accent-text)",
            fontSize: "0.75rem",
            fontWeight: 500,
            marginBottom: 28,
          }}
        >
          <Sparkles size={12} />
          AI-powered job tracker
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            marginBottom: 20,
          }}
        >
          Take control of your
          <br />
          <span style={{ color: "var(--accent-text)" }}>job search journey</span>
        </h1>

        <p
          style={{
            fontSize: "1.0625rem",
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            maxWidth: 520,
            margin: "0 auto 40px",
          }}
        >
          A focused tool to organise applications, extract details with AI, schedule Google Calendar reminders, and export a professional CV.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="btn-primary"
            style={{ textDecoration: "none", padding: "10px 20px", fontSize: "0.9375rem" }}
          >
            <span>{isLoggedIn ? "Go to Dashboard" : "Start tracking — free"}</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="#features"
            className="btn-ghost"
            style={{ textDecoration: "none", padding: "10px 20px", fontSize: "0.9375rem" }}
          >
            See features
          </a>
        </div>
      </section>

      {/* ── Board preview ── */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto 100px",
          padding: "0 24px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "0.5px solid var(--border)",
            borderRadius: 10,
            backgroundColor: "var(--bg-raised)",
            overflow: "hidden",
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "0.5px solid var(--border)",
              backgroundColor: "var(--bg-subtle)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--danger-border)" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--warn-border)" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--success-border)" }} />
            <span
              style={{
                marginLeft: 10,
                fontSize: "0.6875rem",
                color: "var(--text-tertiary)",
                fontWeight: 400,
              }}
            >
              JobTracker — Kanban Board
            </span>
          </div>

          {/* Mock columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
              backgroundColor: "var(--border)",
              padding: 0,
            }}
          >
            {mockColumns.map((col) => (
              <div
                key={col.title}
                style={{
                  backgroundColor: col.highlight ? "var(--accent-subtle)" : "var(--bg-subtle)",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: col.highlight ? "var(--accent-text)" : "var(--text-secondary)",
                    }}
                  >
                    {col.title}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      padding: "1px 6px",
                      borderRadius: 4,
                      border: "0.5px solid var(--border)",
                      backgroundColor: "var(--bg-raised)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {col.count}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.cards.map((card, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "var(--bg-raised)",
                        border: "0.5px solid var(--border)",
                        borderRadius: 6,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", fontWeight: 400 }}>
                          {card.company}
                        </span>
                        <span
                          className="chip"
                          style={{
                            backgroundColor: card.tagBg,
                            color: card.tagColor,
                            borderColor: card.tagBg,
                          }}
                        >
                          {card.tag}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
                        {card.role}
                      </p>
                      {"pay" in card && card.pay && (
                        <p
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--status-offer-text)",
                            marginTop: 6,
                            fontWeight: 500,
                          }}
                        >
                          {card.pay}
                        </p>
                      )}
                      {"sub" in card && card.sub && (
                        <p
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--accent-text)",
                            marginTop: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Clock size={10} />
                          {card.sub}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        style={{
          borderTop: "0.5px solid var(--border)",
          padding: "80px 24px",
          backgroundColor: "var(--bg-raised)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ maxWidth: 520, marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                marginBottom: 12,
              }}
            >
              Everything you need to land your next role
            </h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.65, fontSize: "0.9375rem" }}>
              All the tools in one focused workflow. No spreadsheets, no chaotic notes.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 1,
              border: "0.5px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-[var(--bg)] hover:bg-[var(--bg-subtle)] transition-colors duration-150"
                style={{
                  padding: 28,
                  border: "0.5px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    border: "0.5px solid var(--border)",
                    backgroundColor: "var(--bg-raised)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    color: "var(--accent-text)",
                  }}
                >
                  <Icon size={17} />
                </div>
                <h3
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    marginBottom: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          borderTop: "0.5px solid var(--border)",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              marginBottom: 12,
            }}
          >
            Simplify your job hunt today
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9375rem",
              lineHeight: 1.65,
              marginBottom: 32,
            }}
          >
            Join applicants who organised their way into roles at Google, Stripe, Vercel, and Netflix.
          </p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="btn-primary"
            style={{ textDecoration: "none", padding: "10px 24px", fontSize: "0.9375rem" }}
          >
            <span>{isLoggedIn ? "Go to Dashboard" : "Get started — free"}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "0.5px solid var(--border)",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                backgroundColor: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Briefcase size={11} color="#fff" />
            </div>
            <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)" }}>JobTracker</span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", margin: 0 }}>
            © {new Date().getFullYear()} JobTracker. Built for focused applicants.
          </p>
        </div>
      </footer>
    </div>
  );
}
