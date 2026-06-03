import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { 
  Briefcase, 
  Sparkles, 
  LayoutDashboard, 
  Calendar, 
  Upload, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  MousePointerClick,
  Clock
} from "lucide-react";

export const metadata = {
  title: "JobTracker - AI-Powered Job Search Board & Resume Builder",
  description: "Organize your job search, extract descriptions with AI, set follow-up reminders, and build/export professional CVs to PDF.",
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-600/10">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 tracking-tight">
              JobTracker
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                >
                  <span>Go to Board</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/50 hover:border-slate-600 transition-all"
                >
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 sm:pt-28 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Resume & Tracker</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Take Control of Your <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-rose-400">
              Job Search Journey
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A beautiful, visual tool to organize applications, auto-extract details using AI, schedule Google Calendar reminders, and instantly download a professional PDF CV based on your target jobs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02]"
            >
              <span>{isLoggedIn ? "Go to Dashboard" : "Start Tracking For Free"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold rounded-2xl border border-slate-700/60 transition-all hover:scale-[1.02]"
            >
              Learn More
            </a>
          </div>

          {/* Interactive CSS Mockup */}
          <div className="relative max-w-5xl mx-auto rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 shadow-2xl shadow-indigo-500/5">
            <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-800/80">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-500 font-mono ml-2">JobTracker Visual Board</span>
            </div>

            {/* Simulated Board columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
              {/* Col 1 */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/50">
                <h4 className="text-xs font-bold text-slate-400 flex justify-between items-center mb-3">
                  <span>Saved</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400">2</span>
                </h4>
                <div className="space-y-2.5">
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-slate-400 font-medium">Google</span>
                      <span className="text-[9px] px-1.5 py-0.25 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">High</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">Senior UX Designer</p>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-slate-400 font-medium">Stripe</span>
                      <span className="text-[9px] px-1.5 py-0.25 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">Medium</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">Frontend Architect</p>
                  </div>
                </div>
              </div>

              {/* Col 2 */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/50">
                <h4 className="text-xs font-bold text-slate-400 flex justify-between items-center mb-3">
                  <span>Applied</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-950 text-[10px] text-indigo-400">1</span>
                </h4>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-slate-400 font-medium">Airbnb</span>
                    <span className="text-[9px] px-1.5 py-0.25 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">Low</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">Software Engineer</p>
                  <p className="text-[10px] text-slate-500 mt-2 truncate">Mail: careers@airbnb.com</p>
                </div>
              </div>

              {/* Col 3 */}
              <div className="bg-indigo-900/10 p-3.5 rounded-xl border border-indigo-500/20 shadow-inner">
                <h4 className="text-xs font-bold text-indigo-300 flex justify-between items-center mb-3">
                  <span>Interviewing</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-[10px] text-indigo-300">1</span>
                </h4>
                <div className="bg-slate-950/90 p-3 rounded-lg border border-indigo-500/30 ring-1 ring-indigo-500/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-indigo-400 font-bold">Netflix</span>
                    <span className="text-[9px] px-1.5 py-0.25 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">High</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">Staff AI Specialist</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                    <p className="text-[10px] text-indigo-400/90 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Offer Date: 10/06/2026</span>
                    </p>
                    <p className="text-[9px] text-slate-400 italic">Remaining: 7 days until end</p>
                  </div>
                </div>
              </div>

              {/* Col 4 */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/50">
                <h4 className="text-xs font-bold text-slate-400 flex justify-between items-center mb-3">
                  <span>Offer</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400">1</span>
                </h4>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-slate-400 font-medium">Vercel</span>
                    <span className="text-[9px] px-1.5 py-0.25 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">High</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">Lead Next.js Advocate</p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-2">$185k - $210k/yr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-slate-800/50 bg-slate-950/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Everything you need to land your next job
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              We've built all the tools into a single workflow. No more spreadsheets, chaotic notes, or mismatched documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition-all hover:translate-y-[-2px]">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">AI Summarize & Skills</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Paste long, complex job descriptions. Our AI automatically extracts crucial responsibilities, summarizes the role, and highlights top required skills.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition-all hover:translate-y-[-2px]">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Visual Kanban Pipeline</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Drag-and-drop cards as you progress from Saved, to Applied, Interviewing, Offer, and Rejected. Set priority tags and keep contacts aligned.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition-all hover:translate-y-[-2px]">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">CV PDF Builder</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Select your successful target jobs, compile details directly into a clean A4 resume, and download a professional, printer-friendly PDF.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition-all hover:translate-y-[-2px]">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Google Calendar Sync</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate calendar invite links instantly for application follow-ups, interview dates, and offer acceptances, keeping you on schedule.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition-all hover:translate-y-[-2px]">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Excel Batch Import</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Already tracking jobs in a spreadsheet? Drop your CSV or XLSX file and import all applications instantly with zero manual inputs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition-all hover:translate-y-[-2px]">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Dynamic Date Calculations</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Monitor days elapsed since receiving offer letters, and track active duration limits based on contract employment end dates directly on cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800/80 relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Simplify your job hunt today
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm sm:text-base">
            Join thousands of applicants who visualised their way into top roles at Stripe, Google, Netflix, and Vercel.
          </p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01]"
          >
            <span>{isLoggedIn ? "Go to Dashboard" : "Get Started Now"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 text-slate-500 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600/30 p-1.5 rounded-lg">
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-slate-400">JobTracker</span>
          </div>
          <p>© {new Date().getFullYear()} JobTracker. Built for high-performance applicants.</p>
        </div>
      </footer>
    </div>
  );
}
