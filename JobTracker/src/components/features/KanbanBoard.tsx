"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Job, JobStatus } from '@/types/job';
import { JobCard } from './JobCard';
import { JobModal } from './JobModal';
import { CvBuilderModal } from './CvBuilderModal';
import {
  Plus, Upload, Briefcase, LogOut, FileText, LayoutDashboard,
  Kanban, Grid3X3, Calendar as CalendarIcon, Sun, Moon,
  ChevronLeft, ChevronRight, Search, Filter, TrendingUp,
  CheckCircle2, Clock, XCircle, BookmarkCheck, Star
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/client';

import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { useToast } from '@/components/ui/Toast';

type ViewType = 'overview' | 'kanban' | 'grid' | 'calendar' | 'cv';

const COLUMNS: { id: JobStatus; title: string; color: string; darkColor: string }[] = [
  { id: 'Saved',        title: 'Saved',        color: 'bg-slate-100 text-slate-600', darkColor: 'bg-slate-800/50 text-slate-400' },
  { id: 'Applied',      title: 'Applied',      color: 'bg-blue-100 text-blue-700',   darkColor: 'bg-blue-950/40 text-blue-400'  },
  { id: 'Interviewing', title: 'Interviewing', color: 'bg-violet-100 text-violet-700', darkColor: 'bg-violet-950/40 text-violet-400' },
  { id: 'Offer',        title: 'Offer',        color: 'bg-emerald-100 text-emerald-700', darkColor: 'bg-emerald-950/40 text-emerald-400' },
  { id: 'Rejected',     title: 'Rejected',     color: 'bg-rose-100 text-rose-700',   darkColor: 'bg-rose-950/40 text-rose-400'  },
];

const STATUS_ICONS: Record<JobStatus, typeof Briefcase> = {
  Saved: BookmarkCheck,
  Applied: TrendingUp,
  Interviewing: Clock,
  Offer: Star,
  Rejected: XCircle,
};

const STATUS_STAT_COLORS: Record<JobStatus, { bg: string; text: string; border: string; icon: string }> = {
  Saved:        { bg: 'bg-slate-50 dark:bg-slate-800/30',      text: 'text-slate-700 dark:text-slate-300',    border: 'border-slate-200 dark:border-slate-700',    icon: 'text-slate-500 dark:text-slate-400' },
  Applied:      { bg: 'bg-blue-50 dark:bg-blue-950/20',         text: 'text-blue-700 dark:text-blue-300',      border: 'border-blue-200 dark:border-blue-900',      icon: 'text-blue-500 dark:text-blue-400'   },
  Interviewing: { bg: 'bg-violet-50 dark:bg-violet-950/20',     text: 'text-violet-700 dark:text-violet-300',  border: 'border-violet-200 dark:border-violet-900',  icon: 'text-violet-500 dark:text-violet-400' },
  Offer:        { bg: 'bg-emerald-50 dark:bg-emerald-950/20',   text: 'text-emerald-700 dark:text-emerald-300',border: 'border-emerald-200 dark:border-emerald-900', icon: 'text-emerald-500 dark:text-emerald-400' },
  Rejected:     { bg: 'bg-rose-50 dark:bg-rose-950/20',         text: 'text-rose-700 dark:text-rose-300',      border: 'border-rose-200 dark:border-rose-900',      icon: 'text-rose-500 dark:text-rose-400'   },
};

const CATEGORY_PALETTE: Record<string, { bar: string }> = {
  Engineering: { bar: 'bg-blue-500' },
  Design:      { bar: 'bg-purple-500' },
  Product:     { bar: 'bg-teal-500' },
  Marketing:   { bar: 'bg-pink-500' },
  Sales:       { bar: 'bg-orange-500' },
  HR:          { bar: 'bg-indigo-500' },
  Other:       { bar: 'bg-slate-400' },
};

function StatCard({ label, value, icon: Icon, colors }: {
  label: string; value: number; icon: any;
  colors: { bg: string; text: string; border: string; icon: string };
}) {
  return (
    <div className={`${colors.bg} ${colors.border} border rounded-2xl p-5 flex items-center space-x-4 transition-all hover:scale-[1.02]`}>
      <div className={`p-3 rounded-xl bg-white/60 dark:bg-black/20 ${colors.icon}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={`text-3xl font-extrabold ${colors.text}`}>{value}</p>
        <p className={`text-xs font-semibold uppercase tracking-wider mt-0.5 ${colors.text} opacity-70`}>{label}</p>
      </div>
    </div>
  );
}

export function KanbanBoard({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCvBuilderOpen, setIsCvBuilderOpen] = useState(false);
  const [view, setView] = useState<ViewType>('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchJobs();
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('date_added', { ascending: false });

      if (error) throw error;
      if (data) {
        const mappedJobs: Job[] = data.map((dbJob: any) => ({
          id: dbJob.id,
          company: dbJob.company,
          title: dbJob.title,
          status: dbJob.status as JobStatus,
          priority: dbJob.priority as any,
          dateAdded: dbJob.date_added,
          notes: dbJob.notes || undefined,
          description: dbJob.description || undefined,
          contacts: dbJob.contacts || undefined,
          mailUsed: dbJob.mail_used || undefined,
          payAmount: dbJob.pay_amount || undefined,
          jobLink: dbJob.job_link || undefined,
          offerReceivedDate: dbJob.offer_received_date || undefined,
          employmentEndDate: dbJob.employment_end_date || undefined,
          category: dbJob.category || undefined,
        }));
        setJobs(mappedJobs);
      }
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to load jobs', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const jobIndex = jobs.findIndex(j => j.id === draggableId);
    if (jobIndex === -1) return;
    const newStatus = destination.droppableId as JobStatus;
    const updatedJob = { ...jobs[jobIndex], status: newStatus };
    const newJobs = [...jobs];
    newJobs.splice(jobIndex, 1);
    newJobs.push(updatedJob);
    setJobs(newJobs);
    try {
      const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', draggableId);
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      toast('Failed to move job', 'error');
      // Revert optimistic update
      setJobs(jobs);
    }
  };

  const handleAddJob = () => {
    const newJob: Job = {
      id: uuidv4(),
      company: '',
      title: '',
      status: 'Saved',
      priority: 'Medium',
      dateAdded: new Date().toISOString(),
      category: 'Other',
    };
    setSelectedJob(newJob);
  };

  const handleUpdateJob = async (updatedJob: Job) => {
    const exists = jobs.some(j => j.id === updatedJob.id);
    const dbJob = {
      id: updatedJob.id,
      user_id: userId,
      company: updatedJob.company,
      title: updatedJob.title,
      status: updatedJob.status,
      priority: updatedJob.priority,
      notes: updatedJob.notes,
      description: updatedJob.description,
      contacts: updatedJob.contacts,
      date_added: updatedJob.dateAdded,
      mail_used: updatedJob.mailUsed,
      pay_amount: updatedJob.payAmount,
      job_link: updatedJob.jobLink,
      offer_received_date: updatedJob.offerReceivedDate,
      employment_end_date: updatedJob.employmentEndDate,
      category: updatedJob.category || 'Other',
    };
    try {
      if (exists) {
        setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
        const { error } = await supabase.from('jobs').update(dbJob).eq('id', updatedJob.id);
        if (error) throw error;
        toast('Job updated successfully!', 'success');
      } else {
        setJobs(prev => [...prev, updatedJob]);
        const { error } = await supabase.from('jobs').insert([dbJob]);
        if (error) throw error;
        toast('Job added successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to save job', 'error');
      fetchJobs(); // Reload state
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setSelectedJob(null);
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;
      toast('Job deleted', 'success');
    } catch (err: any) {
      console.error(err);
      toast('Failed to delete job', 'error');
      fetchJobs();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      const importedJobs: Job[] = data.map((row: any) => ({
        id: uuidv4(),
        company: row.Company || 'Unknown Company',
        title: row.Title || 'Unknown Title',
        status: ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'].includes(row.Status) ? row.Status : 'Saved',
        priority: ['Low', 'Medium', 'High'].includes(row.Priority) ? row.Priority : 'Medium',
        dateAdded: row.DateAdded ? new Date(row.DateAdded).toISOString() : new Date().toISOString(),
        notes: row.Notes || '',
        description: row.Description || '',
        contacts: row.Contacts || '',
        mailUsed: row.MailUsed || '',
        payAmount: row.PayAmount || '',
        jobLink: row.JobLink || '',
        offerReceivedDate: row.OfferReceivedDate || '',
        employmentEndDate: row.EmploymentEndDate || '',
        category: row.Category || 'Other',
      }));
      setJobs(prev => [...prev, ...importedJobs]);
      const dbJobs = importedJobs.map(j => ({
        id: j.id, user_id: userId, company: j.company, title: j.title,
        status: j.status, priority: j.priority, notes: j.notes, description: j.description,
        contacts: j.contacts, date_added: j.dateAdded, mail_used: j.mailUsed,
        pay_amount: j.payAmount, job_link: j.jobLink, offer_received_date: j.offerReceivedDate,
        employment_end_date: j.employmentEndDate, category: j.category || 'Other',
      }));
      try {
        const { error } = await supabase.from('jobs').insert(dbJobs);
        if (error) throw error;
        toast(`Imported ${importedJobs.length} jobs successfully!`, 'success');
      } catch (err: any) {
        console.error(err);
        toast('Failed to import jobs to database', 'error');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Stats ───
  const stats = useMemo(() => {
    const byStatus: Record<JobStatus, number> = { Saved: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 };
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    for (const j of jobs) {
      byStatus[j.status] = (byStatus[j.status] || 0) + 1;
      const cat = j.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      byPriority[j.priority] = (byPriority[j.priority] || 0) + 1;
    }
    const successRate = jobs.length > 0 ? Math.round(((byStatus.Offer + byStatus.Interviewing) / jobs.length) * 100) : 0;
    return { byStatus, byCategory, byPriority, successRate, total: jobs.length };
  }, [jobs]);

  // ─── Filtered jobs for Grid ───
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || j.company.toLowerCase().includes(q) || j.title.toLowerCase().includes(q) || (j.category || '').toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'All' || j.status === filterStatus;
      const matchesCat = filterCategory === 'All' || j.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [jobs, searchQuery, filterStatus, filterCategory]);

  // ─── Calendar logic ───
  const calendarDays = useMemo(() => {
    const start = startOfMonth(calendarDate);
    const end = endOfMonth(calendarDate);
    const days = eachDayOfInterval({ start, end });
    const startPad = getDay(start); // 0=Sun
    return { days, startPad };
  }, [calendarDate]);

  const jobsByDate = useMemo(() => {
    const map: Record<string, Job[]> = {};
    for (const j of jobs) {
      const dates = [j.dateAdded, j.offerReceivedDate, j.employmentEndDate].filter(Boolean) as string[];
      for (const d of dates) {
        const key = format(new Date(d), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        if (!map[key].includes(j)) map[key].push(j);
      }
    }
    return map;
  }, [jobs]);

  // All unique categories
  const allCategories = useMemo(() => {
    const cats = new Set(jobs.map(j => j.category || 'Other'));
    return ['All', ...Array.from(cats)];
  }, [jobs]);

  const navItems: { id: ViewType; label: string; icon: any }[] = [
    { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
    { id: 'kanban',    label: 'Kanban',    icon: Kanban },
    { id: 'grid',      label: 'Grid',      icon: Grid3X3 },
    { id: 'calendar',  label: 'Calendar',  icon: CalendarIcon },
    { id: 'cv',        label: 'CV Builder',icon: FileText },
  ];

  if (!isClient) return null;

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 overflow-hidden font-sans`}>

      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col py-5 px-3 shadow-sm z-20">
        {/* Logo */}
        <div className="flex items-center space-x-2.5 px-3 mb-8">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-600/20">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 tracking-tight">
            JobTracker
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  if (item.id === 'cv') setIsCvBuilderOpen(true);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setDarkMode(d => !d)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top header bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white capitalize">
              {view === 'overview' ? 'Dashboard Overview' : view === 'cv' ? 'CV Builder' : `${view.charAt(0).toUpperCase() + view.slice(1)} View`}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{jobs.length} application{jobs.length !== 1 ? 's' : ''} total</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={handleAddJob}
              className="flex items-center space-x-1.5 px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Job</span>
            </button>
          </div>
        </header>

        {/* ── Views ── */}
        <div className="flex-1 overflow-auto">

          {/* ═══ OVERVIEW ═══ */}
          {view === 'overview' && (
            <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">

              {/* Status stat cards */}
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Applications by Status</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {COLUMNS.map(col => {
                    const Icon = STATUS_ICONS[col.id];
                    const colors = STATUS_STAT_COLORS[col.id];
                    return (
                      <StatCard key={col.id} label={col.title} value={stats.byStatus[col.id]} icon={Icon} colors={colors} />
                    );
                  })}
                </div>
              </div>

              {/* Summary row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">Total Applications</p>
                  <p className="text-5xl font-extrabold">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">Success Rate</p>
                  <p className="text-5xl font-extrabold">{stats.successRate}%</p>
                  <p className="text-xs text-emerald-200 mt-1">Interviewing + Offers</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Priority Breakdown</p>
                  <div className="space-y-2">
                    {(['High', 'Medium', 'Low'] as const).map(p => {
                      const count = stats.byPriority[p] || 0;
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      const bar = p === 'High' ? 'bg-rose-500' : p === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500';
                      const text = p === 'High' ? 'text-rose-600 dark:text-rose-400' : p === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
                      return (
                        <div key={p} className="flex items-center gap-2">
                          <span className={`text-xs font-semibold w-14 ${text}`}>{p}</span>
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                            <div className={`${bar} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 w-5 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Category breakdown */}
              {Object.keys(stats.byCategory).length > 0 && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Applications by Category</h2>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <div className="space-y-3">
                      {Object.entries(stats.byCategory)
                        .sort((a, b) => b[1] - a[1])
                        .map(([cat, count]) => {
                          const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                          const palette = CATEGORY_PALETTE[cat] || CATEGORY_PALETTE.Other;
                          return (
                            <div key={cat} className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-24 truncate">{cat}</span>
                              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                                <div className={`${palette.bar} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-6 text-right">{count}</span>
                              <span className="text-xs text-slate-400 dark:text-slate-600 w-8 text-right">{pct}%</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent activity */}
              {jobs.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Recent Applications</h2>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                    {[...jobs].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 5).map(job => {
                      const sc = STATUS_STAT_COLORS[job.status];
                      return (
                        <div key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{job.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{job.company} · {job.category || 'Other'}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                              {job.status}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-600">
                              {format(new Date(job.dateAdded), 'MMM d')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {jobs.length === 0 && (
                <div className="text-center py-20 text-slate-400 dark:text-slate-600">
                  <Briefcase className="w-14 h-14 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold">No applications yet</p>
                  <p className="text-sm mt-1">Click <strong>Add Job</strong> or import from Excel to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ KANBAN ═══ */}
          {view === 'kanban' && (
            <div className="p-4 sm:p-6 h-full overflow-x-auto">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex space-x-4 min-w-max h-[calc(100vh-140px)] pb-4 items-start">
                  {COLUMNS.map(col => {
                    let colJobs = jobs.filter(j => j.status === col.id);
                    if (col.id === 'Interviewing' || col.id === 'Offer') {
                      colJobs = [...colJobs].sort((a, b) => {
                        const hasDatesA = !!(a.offerReceivedDate || a.employmentEndDate);
                        const hasDatesB = !!(b.offerReceivedDate || b.employmentEndDate);
                        if (hasDatesA && !hasDatesB) return -1;
                        if (!hasDatesA && hasDatesB) return 1;
                        if (a.offerReceivedDate && b.offerReceivedDate) {
                          return new Date(b.offerReceivedDate).getTime() - new Date(a.offerReceivedDate).getTime();
                        }
                        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
                      });
                    } else {
                      colJobs = [...colJobs].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
                    }

                    return (
                      <div key={col.id} className="w-72 sm:w-80 flex flex-col bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl p-3 sm:p-4 border border-slate-200/60 dark:border-slate-800/60 h-full shadow-sm">
                        <div className="flex justify-between items-center mb-3 px-1">
                          <h2 className="font-bold text-slate-700 dark:text-slate-300 tracking-tight flex items-center text-sm sm:text-base">
                            {col.title}
                            <span className="ml-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                              {colJobs.length}
                            </span>
                          </h2>
                        </div>
                        <Droppable droppableId={col.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex-1 overflow-y-auto min-h-[120px] rounded-xl p-1 transition-colors
                                ${snapshot.isDraggingOver ? 'bg-indigo-100/80 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-300 dark:border-indigo-700' : ''}`}
                            >
                              {colJobs.map((job, index) => (
                                <Draggable key={job.id} draggableId={job.id} index={index}>
                                  {(provided, snapshot) => (
                                    <JobCard
                                      job={job}
                                      onClick={setSelectedJob}
                                      innerRef={provided.innerRef}
                                      draggableProps={provided.draggableProps}
                                      dragHandleProps={provided.dragHandleProps}
                                      isDragging={snapshot.isDragging}
                                    />
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

          {/* ═══ GRID ═══ */}
          {view === 'grid' && (
            <div className="p-6 space-y-5 max-w-7xl mx-auto w-full">
              {/* Search and filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by company, title or category..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as JobStatus | 'All')}
                  className="px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {allCategories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                </select>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 px-1">
                  <Filter className="w-4 h-4 mr-1.5" />
                  {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-20 text-slate-400 dark:text-slate-600">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No jobs match your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredJobs.map(job => (
                    <div key={job.id} onClick={() => setSelectedJob(job)} className="cursor-pointer">
                      <JobCard
                        job={job}
                        onClick={setSelectedJob}
                        isDragging={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ CALENDAR ═══ */}
          {view === 'calendar' && (
            <div className="p-6 space-y-5 max-w-5xl mx-auto w-full">
              {/* Calendar nav */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {format(calendarDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCalendarDate(d => subMonths(d, 1))}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>
                  <button
                    onClick={() => setCalendarDate(new Date())}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCalendarDate(d => addMonths(d, 1))}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Start padding */}
                {Array.from({ length: calendarDays.startPad }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-24 rounded-xl" />
                ))}
                {/* Days */}
                {calendarDays.days.map(day => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayJobs = jobsByDate[key] || [];
                  const todayFlag = isToday(day);
                  return (
                    <div
                      key={key}
                      className={`h-24 rounded-xl border p-1.5 flex flex-col transition-all
                        ${todayFlag
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20 dark:border-indigo-700'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'}
                      `}
                    >
                      <span className={`text-xs font-bold self-end mb-1
                        ${todayFlag ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-500'}`}>
                        {format(day, 'd')}
                      </span>
                      <div className="flex-1 overflow-hidden space-y-0.5">
                        {dayJobs.slice(0, 2).map(j => {
                          const sc = STATUS_STAT_COLORS[j.status];
                          return (
                            <div
                              key={j.id}
                              onClick={() => setSelectedJob(j)}
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md truncate cursor-pointer border ${sc.bg} ${sc.text} ${sc.border} hover:opacity-80 transition-opacity`}
                              title={`${j.title} @ ${j.company}`}
                            >
                              {j.company}
                            </div>
                          );
                        })}
                        {dayJobs.length > 2 && (
                          <div className="text-[9px] text-slate-400 dark:text-slate-600 pl-1">
                            +{dayJobs.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 pt-2">
                {COLUMNS.map(c => {
                  const sc = STATUS_STAT_COLORS[c.id];
                  return (
                    <span key={c.id} className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${sc.bg} ${sc.text} ${sc.border}`}>
                      {c.title}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ CV (delegated to the modal) ═══ */}
          {view === 'cv' && !isCvBuilderOpen && (
            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
              <div className="text-center">
                <FileText className="w-14 h-14 mx-auto mb-4 opacity-30" />
                <p className="font-semibold text-lg">CV Builder</p>
                <button
                  onClick={() => setIsCvBuilderOpen(true)}
                  className="mt-4 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-indigo-500 transition-all"
                >
                  Open CV Builder
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Modals ── */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={handleUpdateJob}
          onDelete={handleDeleteJob}
        />
      )}

      {isCvBuilderOpen && (
        <CvBuilderModal
          jobs={jobs}
          onClose={() => { setIsCvBuilderOpen(false); if (view === 'cv') setView('overview'); }}
        />
      )}
    </div>
  );
}
