"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Job, JobStatus } from "@/types/job";
import { JobCard } from "./JobCard";
import { JobModal } from "./JobModal";
import { CvBuilderModal } from "./CvBuilderModal";
import {
  Plus, Upload, Briefcase, LogOut, FileText, LayoutDashboard,
  Kanban, Grid3X3, Calendar as CalendarIcon, Sun, Moon,
  ChevronLeft, ChevronRight, Search, Filter, TrendingUp,
  CheckCircle2, Clock, XCircle, BookmarkCheck, Star, Menu,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isToday, addMonths, subMonths,
} from "date-fns";
import { useToast } from "@/components/ui/Toast";

type ViewType = "overview" | "board" | "cv";
type BoardTab = "kanban" | "grid" | "calendar";

const COLUMNS: { id: JobStatus; title: string }[] = [
  { id: "Saved",        title: "Saved"        },
  { id: "Applied",      title: "Applied"      },
  { id: "Interviewing", title: "Interviewing" },
  { id: "Offer",        title: "Offer"        },
  { id: "Rejected",     title: "Rejected"     },
];

const STATUS_ICONS: Record<JobStatus, any> = {
  Saved:        BookmarkCheck,
  Applied:      TrendingUp,
  Interviewing: Clock,
  Offer:        Star,
  Rejected:     XCircle,
};

const STATUS_VARS: Record<JobStatus, { bg: string; text: string; border: string }> = {
  Saved:        { bg: "var(--status-saved-bg)",        text: "var(--status-saved-text)",        border: "var(--status-saved-border)"        },
  Applied:      { bg: "var(--status-applied-bg)",      text: "var(--status-applied-text)",      border: "var(--status-applied-border)"      },
  Interviewing: { bg: "var(--status-interviewing-bg)", text: "var(--status-interviewing-text)", border: "var(--status-interviewing-border)" },
  Offer:        { bg: "var(--status-offer-bg)",        text: "var(--status-offer-text)",        border: "var(--status-offer-border)"        },
  Rejected:     { bg: "var(--status-rejected-bg)",     text: "var(--status-rejected-text)",     border: "var(--status-rejected-border)"     },
};

const CATEGORY_BAR: Record<string, string> = {
  Engineering: "var(--status-applied-text)",
  Design:      "var(--status-interviewing-text)",
  Product:     "#0D9488",
  Marketing:   "#DB2777",
  Sales:       "#EA580C",
  HR:          "var(--accent-text)",
  Other:       "var(--text-tertiary)",
};

// ─── Stat card ───
function StatCard({ label, value, icon: Icon, status }: { label: string; value: number; icon: any; status: JobStatus }) {
  const vars = STATUS_VARS[status];
  return (
    <div style={{ backgroundColor: vars.bg, border: `0.5px solid ${vars.border}`, borderRadius: 8, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: "var(--bg-raised)", border: `0.5px solid ${vars.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: vars.text, flexShrink: 0 }}>
        <Icon size={16} />
      </div>
      <div>
        <p style={{ fontSize: "1.5rem", fontWeight: 500, color: vars.text, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: vars.text, opacity: 0.7, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      </div>
    </div>
  );
}

export function KanbanBoard({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCvBuilderOpen, setIsCvBuilderOpen] = useState(false);
  const [view, setView] = useState<ViewType>("overview");
  const [boardTab, setBoardTab] = useState<BoardTab>("kanban");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<JobStatus | "All">("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchJobs();
    // Restore dark mode from localStorage, fall back to system preference
    const stored = localStorage.getItem("jt-dark-mode");
    if (stored !== null) {
      setDarkMode(stored === "true");
    } else {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("jt-dark-mode", String(darkMode));
  }, [darkMode]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase.from("jobs").select("*").order("date_added", { ascending: false });
      if (error) throw error;
      if (data) {
        const mapped: Job[] = data.map((d: any) => ({
          id: d.id, company: d.company, title: d.title,
          status: d.status as JobStatus, priority: d.priority,
          dateAdded: d.date_added, notes: d.notes || undefined,
          description: d.description || undefined, contacts: d.contacts || undefined,
          mailUsed: d.mail_used || undefined, payAmount: d.pay_amount || undefined,
          jobLink: d.job_link || undefined, offerReceivedDate: d.offer_received_date || undefined,
          employmentEndDate: d.employment_end_date || undefined, category: d.category || undefined,
        }));
        setJobs(mapped);
      }
    } catch (err: any) {
      toast(err.message || "Failed to load jobs", "error");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const jobIndex = jobs.findIndex((j) => j.id === draggableId);
    if (jobIndex === -1) return;
    const newStatus = destination.droppableId as JobStatus;
    const updatedJob = { ...jobs[jobIndex], status: newStatus };
    const newJobs = [...jobs];
    newJobs.splice(jobIndex, 1);
    newJobs.push(updatedJob);
    setJobs(newJobs);
    try {
      const { error } = await supabase.from("jobs").update({ status: newStatus }).eq("id", draggableId);
      if (error) throw error;
    } catch {
      toast("Failed to move job", "error");
      setJobs(jobs);
    }
  };

  const handleAddJob = () => {
    setSelectedJob({ id: uuidv4(), company: "", title: "", status: "Saved", priority: "Medium", dateAdded: new Date().toISOString(), category: "Other" });
  };

  const handleUpdateJob = async (updatedJob: Job) => {
    const exists = jobs.some((j) => j.id === updatedJob.id);
    const dbJob = {
      id: updatedJob.id, user_id: userId,
      company: updatedJob.company, title: updatedJob.title,
      status: updatedJob.status, priority: updatedJob.priority,
      notes: updatedJob.notes, description: updatedJob.description,
      contacts: updatedJob.contacts, date_added: updatedJob.dateAdded,
      mail_used: updatedJob.mailUsed, pay_amount: updatedJob.payAmount,
      job_link: updatedJob.jobLink, offer_received_date: updatedJob.offerReceivedDate,
      employment_end_date: updatedJob.employmentEndDate, category: updatedJob.category || "Other",
    };
    try {
      if (exists) {
        setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
        const { error } = await supabase.from("jobs").update(dbJob).eq("id", updatedJob.id);
        if (error) throw error;
        toast("Job updated!", "success");
      } else {
        setJobs((prev) => [...prev, updatedJob]);
        const { error } = await supabase.from("jobs").insert([dbJob]);
        if (error) throw error;
        toast("Job added!", "success");
      }
    } catch (err: any) {
      toast(err.message || "Failed to save job", "error");
      fetchJobs();
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setSelectedJob(null);
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      if (error) throw error;
      toast("Job deleted", "success");
    } catch {
      toast("Failed to delete job", "error");
      fetchJobs();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      const importedJobs: Job[] = (data as any[]).map((row) => ({
        id: uuidv4(), company: row.Company || "Unknown Company", title: row.Title || "Unknown Title",
        status: ["Saved","Applied","Interviewing","Offer","Rejected"].includes(row.Status) ? row.Status : "Saved",
        priority: ["Low","Medium","High"].includes(row.Priority) ? row.Priority : "Medium",
        dateAdded: row.DateAdded ? new Date(row.DateAdded).toISOString() : new Date().toISOString(),
        notes: row.Notes || "", description: row.Description || "", contacts: row.Contacts || "",
        mailUsed: row.MailUsed || "", payAmount: row.PayAmount || "", jobLink: row.JobLink || "",
        offerReceivedDate: row.OfferReceivedDate || "", employmentEndDate: row.EmploymentEndDate || "",
        category: row.Category || "Other",
      }));
      setJobs((prev) => [...prev, ...importedJobs]);
      const dbJobs = importedJobs.map((j) => ({
        id: j.id, user_id: userId, company: j.company, title: j.title,
        status: j.status, priority: j.priority, notes: j.notes, description: j.description,
        contacts: j.contacts, date_added: j.dateAdded, mail_used: j.mailUsed,
        pay_amount: j.payAmount, job_link: j.jobLink, offer_received_date: j.offerReceivedDate,
        employment_end_date: j.employmentEndDate, category: j.category || "Other",
      }));
      try {
        const { error } = await supabase.from("jobs").insert(dbJobs);
        if (error) throw error;
        toast(`Imported ${importedJobs.length} jobs`, "success");
      } catch {
        toast("Failed to import jobs to database", "error");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Computed values ───
  const stats = useMemo(() => {
    const byStatus: Record<JobStatus, number> = { Saved: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 };
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    for (const j of jobs) {
      byStatus[j.status] = (byStatus[j.status] || 0) + 1;
      const cat = j.category || "Other";
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      byPriority[j.priority] = (byPriority[j.priority] || 0) + 1;
    }
    const successRate = jobs.length > 0 ? Math.round(((byStatus.Offer + byStatus.Interviewing) / jobs.length) * 100) : 0;
    return { byStatus, byCategory, byPriority, successRate, total: jobs.length };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || j.company.toLowerCase().includes(q) || j.title.toLowerCase().includes(q) || (j.category || "").toLowerCase().includes(q);
      const matchesStatus = filterStatus === "All" || j.status === filterStatus;
      const matchesCat = filterCategory === "All" || j.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [jobs, searchQuery, filterStatus, filterCategory]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(calendarDate);
    const end = endOfMonth(calendarDate);
    return { days: eachDayOfInterval({ start, end }), startPad: getDay(start) };
  }, [calendarDate]);

  const jobsByDate = useMemo(() => {
    const map: Record<string, Job[]> = {};
    for (const j of jobs) {
      const dates = [j.dateAdded, j.offerReceivedDate, j.employmentEndDate].filter(Boolean) as string[];
      for (const d of dates) {
        const key = format(new Date(d), "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        if (!map[key].includes(j)) map[key].push(j);
      }
    }
    return map;
  }, [jobs]);

  const allCategories = useMemo(() => {
    const cats = new Set(jobs.map((j) => j.category || "Other"));
    return ["All", ...Array.from(cats)];
  }, [jobs]);

  const navItems: { id: ViewType; label: string; icon: any }[] = [
    { id: "overview", label: "Overview",   icon: LayoutDashboard },
    { id: "board",    label: "Board",      icon: Kanban          },
    { id: "cv",       label: "CV Builder", icon: FileText        },
  ];

  const boardTabItems: { id: BoardTab; label: string; icon: any }[] = [
    { id: "kanban",   label: "Kanban",   icon: Kanban       },
    { id: "grid",     label: "Grid",     icon: Grid3X3      },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
  ];

  const viewTitle =
    view === "overview" ? "Overview" :
    view === "board" && boardTab === "kanban"   ? "Kanban board" :
    view === "board" && boardTab === "grid"     ? "Grid view" :
    view === "board" && boardTab === "calendar" ? "Calendar" : "CV Builder";

  if (!isClient) return null;

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--bg)", color: "var(--text-primary)", overflow: "hidden" }}>

      {/* ── Mobile sidebar backdrop ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 29 }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`jt-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 28 }}>
          <div style={{ width: 26, height: 26, borderRadius: 5, backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Briefcase size={13} color="#fff" />
          </div>
          <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>JobTracker</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setView(item.id); if (item.id === "cv") setIsCvBuilderOpen(true); setSidebarOpen(false); }}
                className={`nav-item${active ? " active" : ""}`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 2 }}>
          <button onClick={() => setDarkMode((d) => !d)} className="nav-item">
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ color: "var(--danger-text)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--danger-bg)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Top header */}
        <header style={{ backgroundColor: "var(--bg-raised)", borderBottom: "0.5px solid var(--border)", padding: "0 16px 0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Hamburger – visible on mobile */}
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{viewTitle}</h1>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 1 }}>
                {jobs.length} application{jobs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="btn-ghost" style={{ padding: "7px 12px", fontSize: "0.8125rem" }}>
              <Upload size={14} />
              <span className="btn-label">Import</span>
            </button>
            <button onClick={handleAddJob} className="btn-primary" style={{ padding: "7px 14px", fontSize: "0.8125rem" }}>
              <Plus size={14} />
              <span className="btn-label">Add job</span>
            </button>
          </div>
        </header>

        {/* Content area */}
        <div style={{ flex: 1, overflow: "auto" }}>

          {/* ═══ OVERVIEW ═══ */}
          {view === "overview" && (
            <div style={{ padding: 28, maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 28 }}>

              {/* Status stat cards */}
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                  Applications by status
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                  {COLUMNS.map((col) => {
                    const Icon = STATUS_ICONS[col.id];
                    return <StatCard key={col.id} label={col.title} value={stats.byStatus[col.id]} icon={Icon} status={col.id} />;
                  })}
                </div>
              </div>

              {/* Summary row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                {/* Total */}
                <div style={{ border: "0.5px solid var(--border)", borderRadius: 8, padding: 20, backgroundColor: "var(--bg-raised)" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Total applications</p>
                  <p style={{ fontSize: "2.5rem", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1 }}>{stats.total}</p>
                </div>
                {/* Success rate */}
                <div style={{ border: "0.5px solid var(--status-offer-border)", borderRadius: 8, padding: 20, backgroundColor: "var(--status-offer-bg)" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--status-offer-text)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Success rate</p>
                  <p style={{ fontSize: "2.5rem", fontWeight: 500, color: "var(--status-offer-text)", lineHeight: 1 }}>{stats.successRate}%</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--status-offer-text)", opacity: 0.7, marginTop: 4 }}>Interviewing + Offers</p>
                </div>
                {/* Priority breakdown */}
                <div style={{ border: "0.5px solid var(--border)", borderRadius: 8, padding: 20, backgroundColor: "var(--bg-raised)" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Priority breakdown</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(["High", "Medium", "Low"] as const).map((p) => {
                      const count = stats.byPriority[p] || 0;
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      const color = p === "High" ? "var(--priority-high-text)" : p === "Medium" ? "var(--priority-medium-text)" : "var(--priority-low-text)";
                      return (
                        <div key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 500, color, width: 48 }}>{p}</span>
                          <div style={{ flex: 1, backgroundColor: "var(--bg-inset)", borderRadius: 2, height: 4 }}>
                            <div style={{ width: `${pct}%`, height: 4, borderRadius: 2, backgroundColor: color, transition: "width 400ms ease" }} />
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", width: 20, textAlign: "right" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Category breakdown */}
              {Object.keys(stats.byCategory).length > 0 && (
                <div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Applications by category</p>
                  <div style={{ backgroundColor: "var(--bg-raised)", border: "0.5px solid var(--border)", borderRadius: 8, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      const barColor = CATEGORY_BAR[cat] || CATEGORY_BAR.Other;
                      return (
                        <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: "0.8125rem", color: "var(--text-primary)", width: 96, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat}</span>
                          <div style={{ flex: 1, backgroundColor: "var(--bg-inset)", borderRadius: 2, height: 5 }}>
                            <div style={{ width: `${pct}%`, height: 5, borderRadius: 2, backgroundColor: barColor, transition: "width 400ms ease" }} />
                          </div>
                          <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)", width: 24, textAlign: "right" }}>{count}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", width: 32, textAlign: "right" }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent applications */}
              {jobs.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Recent applications</p>
                  <div style={{ backgroundColor: "var(--bg-raised)", border: "0.5px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                    {[...jobs]
                      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                      .slice(0, 5)
                      .map((job, i, arr) => {
                        const sv = STATUS_VARS[job.status];
                        return (
                          <div
                            key={job.id}
                            onClick={() => setSelectedJob(job)}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", cursor: "pointer", borderBottom: i < arr.length - 1 ? "0.5px solid var(--border)" : "none", transition: "background-color 120ms ease" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-subtle)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                          >
                            <div>
                              <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>{job.title}</p>
                              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>{job.company} · {job.category || "Other"}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                              <span className="chip" style={{ backgroundColor: sv.bg, color: sv.text, borderColor: sv.border }}>{job.status}</span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{format(new Date(job.dateAdded), "MMM d")}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {jobs.length === 0 && (
                <div style={{ textAlign: "center", padding: "64px 0", color: "var(--text-tertiary)" }}>
                  <Briefcase size={40} style={{ margin: "0 auto 16px", opacity: 0.25 }} />
                  <p style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: 6 }}>No applications yet</p>
                  <p style={{ fontSize: "0.875rem" }}>Click <strong>Add job</strong> or import from Excel to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ BOARD ═══ */}
          {view === "board" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

              {/* Sub-tab bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "8px 16px", borderBottom: "0.5px solid var(--border)", backgroundColor: "var(--bg-raised)", flexShrink: 0 }}>
                {boardTabItems.map((tab) => {
                  const Icon = tab.icon;
                  const active = boardTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setBoardTab(tab.id)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: active ? 500 : 400, color: active ? "var(--accent-text)" : "var(--text-secondary)", backgroundColor: active ? "var(--accent-subtle)" : "transparent", transition: "all 120ms ease" }}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Sub-view content */}
              <div style={{ flex: 1, overflow: "auto" }}>

                {/* ─── Kanban ─── */}
                {boardTab === "kanban" && (
                  <div style={{ padding: "20px", height: "100%", overflowX: "auto" }}>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <div style={{ display: "flex", gap: 12, minWidth: "max-content", height: "calc(100vh - 200px)", paddingBottom: 16, alignItems: "flex-start" }}>
                        {COLUMNS.map((col) => {
                          let colJobs = jobs.filter((j) => j.status === col.id);
                          if (col.id === "Interviewing" || col.id === "Offer") {
                            colJobs = [...colJobs].sort((a, b) => {
                              const ha = !!(a.offerReceivedDate || a.employmentEndDate);
                              const hb = !!(b.offerReceivedDate || b.employmentEndDate);
                              if (ha && !hb) return -1;
                              if (!ha && hb) return 1;
                              if (a.offerReceivedDate && b.offerReceivedDate) {
                                return new Date(b.offerReceivedDate).getTime() - new Date(a.offerReceivedDate).getTime();
                              }
                              return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
                            });
                          } else {
                            colJobs = [...colJobs].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
                          }
                          const sv = STATUS_VARS[col.id];
                          return (
                            <div key={col.id} style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", backgroundColor: "var(--bg-subtle)", border: "0.5px solid var(--border)", borderRadius: 8, padding: 12, height: "100%" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottom: "0.5px solid var(--border)" }}>
                                <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: sv.text }}>{col.title}</span>
                                <span className="chip" style={{ backgroundColor: sv.bg, color: sv.text, borderColor: sv.border }}>{colJobs.length}</span>
                              </div>
                              <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{ flex: 1, overflowY: "auto", minHeight: 80, borderRadius: 4, transition: "background-color 120ms ease", backgroundColor: snapshot.isDraggingOver ? "var(--accent-subtle)" : "transparent", border: snapshot.isDraggingOver ? "0.5px dashed var(--accent-border)" : "0.5px solid transparent", padding: 2 }}
                                  >
                                    {colJobs.map((job, index) => (
                                      <Draggable key={job.id} draggableId={job.id} index={index}>
                                        {(provided, snapshot) => (
                                          <JobCard job={job} onClick={setSelectedJob} innerRef={provided.innerRef} draggableProps={provided.draggableProps} dragHandleProps={provided.dragHandleProps} isDragging={snapshot.isDragging} />
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          );
                        })}
                      </div>
                    </DragDropContext>
                  </div>
                )}

                {/* ─── Grid ─── */}
                {boardTab === "grid" && (
                  <div style={{ padding: 28, maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ position: "relative", flex: "1 1 220px" }}>
                        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }} />
                        <input
                          type="text"
                          placeholder="Search company, title, category…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ width: "100%", padding: "8px 12px 8px 32px", border: "0.5px solid var(--border-strong)", borderRadius: 6, backgroundColor: "var(--bg-raised)", color: "var(--text-primary)", fontSize: "0.875rem", outline: "none" }}
                          onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                          onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                        />
                      </div>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as JobStatus | "All")} style={{ padding: "8px 12px", border: "0.5px solid var(--border-strong)", borderRadius: 6, backgroundColor: "var(--bg-raised)", color: "var(--text-primary)", fontSize: "0.875rem", outline: "none", cursor: "pointer" }} onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }} onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}>
                        <option value="All">All statuses</option>
                        {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: "8px 12px", border: "0.5px solid var(--border-strong)", borderRadius: 6, backgroundColor: "var(--bg-raised)", color: "var(--text-primary)", fontSize: "0.875rem", outline: "none", cursor: "pointer" }} onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }} onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}>
                        {allCategories.map((c) => <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>)}
                      </select>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-tertiary)", fontSize: "0.8125rem" }}>
                        <Filter size={13} />
                        {filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    {filteredJobs.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "64px 0", color: "var(--text-tertiary)" }}>
                        <Search size={32} style={{ margin: "0 auto 12px", opacity: 0.25 }} />
                        <p style={{ fontWeight: 500 }}>No jobs match your filters</p>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(256px, 1fr))", gap: 8 }}>
                        {filteredJobs.map((job) => (
                          <div key={job.id} style={{ cursor: "pointer" }}>
                            <JobCard job={job} onClick={setSelectedJob} isDragging={false} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Calendar ─── */}
                {boardTab === "calendar" && (
                  <div style={{ padding: 28, maxWidth: 960, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Month nav */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{format(calendarDate, "MMMM yyyy")}</h2>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => setCalendarDate((d) => subMonths(d, 1))} className="btn-ghost" style={{ padding: 8 }}><ChevronLeft size={14} /></button>
                        <button onClick={() => setCalendarDate(new Date())} className="btn-ghost" style={{ padding: "6px 12px", fontSize: "0.75rem" }}>Today</button>
                        <button onClick={() => setCalendarDate((d) => addMonths(d, 1))} className="btn-ghost" style={{ padding: 8 }}><ChevronRight size={14} /></button>
                      </div>
                    </div>
                    {/* Day headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 0" }}>{d}</div>
                      ))}
                    </div>
                    {/* Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                      {Array.from({ length: calendarDays.startPad }).map((_, i) => <div key={`pad-${i}`} style={{ height: 88 }} />)}
                      {calendarDays.days.map((day) => {
                        const key = format(day, "yyyy-MM-dd");
                        const dayJobs = jobsByDate[key] || [];
                        const todayFlag = isToday(day);
                        return (
                          <div
                            key={key}
                            style={{ height: 88, borderRadius: 6, border: todayFlag ? "0.5px solid var(--accent-border)" : "0.5px solid var(--border)", backgroundColor: todayFlag ? "var(--accent-subtle)" : "var(--bg-raised)", padding: "6px 8px", display: "flex", flexDirection: "column", transition: "border-color 120ms ease" }}
                            onMouseEnter={(e) => { if (!todayFlag) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                            onMouseLeave={(e) => { if (!todayFlag) (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                          >
                            <span style={{ fontSize: "0.6875rem", fontWeight: todayFlag ? 500 : 400, color: todayFlag ? "var(--accent-text)" : "var(--text-tertiary)", alignSelf: "flex-end" }}>{format(day, "d")}</span>
                            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
                              {dayJobs.slice(0, 2).map((j) => {
                                const sv = STATUS_VARS[j.status];
                                return (
                                  <div key={j.id} onClick={() => setSelectedJob(j)}
                                    style={{ fontSize: "0.625rem", fontWeight: 500, padding: "2px 5px", borderRadius: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer", backgroundColor: sv.bg, color: sv.text, border: `0.5px solid ${sv.border}` }}
                                    title={`${j.title} @ ${j.company}`}
                                  >{j.company}</div>
                                );
                              })}
                              {dayJobs.length > 2 && <span style={{ fontSize: "0.5625rem", color: "var(--text-tertiary)", paddingLeft: 2 }}>+{dayJobs.length - 2} more</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Legend */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {COLUMNS.map((c) => { const sv = STATUS_VARS[c.id]; return <span key={c.id} className="chip" style={{ backgroundColor: sv.bg, color: sv.text, borderColor: sv.border, padding: "4px 10px" }}>{c.title}</span>; })}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ═══ CV placeholder ═══ */}
          {view === "cv" && !isCvBuilderOpen && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-tertiary)" }}>
              <div style={{ textAlign: "center" }}>
                <FileText size={36} style={{ margin: "0 auto 16px", opacity: 0.25 }} />
                <p style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: 12 }}>CV Builder</p>
                <button onClick={() => setIsCvBuilderOpen(true)} className="btn-primary">Open CV Builder</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Modals ── */}
      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} onUpdate={handleUpdateJob} onDelete={handleDeleteJob} />
      )}

      {isCvBuilderOpen && (
        <CvBuilderModal jobs={jobs} onClose={() => { setIsCvBuilderOpen(false); if (view === "cv") setView("overview"); }} />
      )}
    </div>
  );
}
