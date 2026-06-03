"use client";

import { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import { X, Printer, CheckSquare, Square, FileText, User, Mail, Phone, Globe, Sparkles, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface CvBuilderModalProps {
  jobs: Job[];
  onClose: () => void;
}

interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  summary: string;
  skills: string;
}

export function CvBuilderModal({ jobs, onClose }: CvBuilderModalProps) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: 'Jane Doe',
    title: 'Senior Software Engineer',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 123-4567',
    website: 'https://janedoe.dev',
    linkedin: 'linkedin.com/in/janedoe',
    summary: 'Detail-oriented Senior Software Engineer with a proven track record of building performant, accessible web applications and leading cross-functional engineering teams. Experienced in React, Next.js, and cloud systems.',
    skills: 'React, Next.js, TypeScript, JavaScript, Node.js, GraphQL, PostgreSQL, TailwindCSS, Git, CI/CD, AWS'
  });

  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);

  // Automatically select jobs that have 'Offer' status as a starting point
  useEffect(() => {
    const offerJobs = jobs.filter(j => j.status === 'Offer').map(j => j.id);
    if (offerJobs.length > 0) {
      setSelectedJobIds(offerJobs);
    } else if (jobs.length > 0) {
      // Otherwise select the 2 most recent jobs
      setSelectedJobIds(jobs.slice(0, 2).map(j => j.id));
    }
  }, [jobs]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobIds(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedJobs = jobs.filter(j => selectedJobIds.includes(j.id));

  // Helper to format dates for work experience
  const formatJobDates = (job: Job) => {
    const formatDateStr = (dateStr?: string) => {
      if (!dateStr) return '';
      try {
        return format(new Date(dateStr), 'MMM yyyy');
      } catch {
        return dateStr;
      }
    };

    const start = formatDateStr(job.offerReceivedDate || job.dateAdded);
    const end = job.employmentEndDate ? formatDateStr(job.employmentEndDate) : 'Present';

    return `${start} - ${end}`;
  };

  // Helper to strip AI metadata from description if it exists
  const cleanDescription = (desc?: string) => {
    if (!desc) return [];
    // If it contains AI Analysis divider, split it
    const parts = desc.split('--- AI Analysis ---');
    const mainDesc = parts[0].trim();
    // Return paragraphs or bullet points
    return mainDesc.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  };

  const getSkillsList = () => {
    return personalInfo.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      {/* Print-specific style override */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #cv-print-area, #cv-print-area * {
            visibility: visible !important;
          }
          #cv-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-850 bg-slate-950/50 no-print">
          <div className="flex items-center space-x-2.5">
            <div className="bg-indigo-600/10 p-2 rounded-lg text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">A4 CV / Resume Builder</h2>
              <p className="text-xs text-slate-400">Convert your applications and job details into a polished resume.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              disabled={selectedJobs.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/10 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Inputs */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-6 border-r border-slate-850 bg-slate-900/40 no-print">
            
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center"><User className="w-4 h-4 mr-1.5" /> Personal Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    value={personalInfo.name}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Professional Title</label>
                  <input
                    name="title"
                    type="text"
                    value={personalInfo.title}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone</label>
                  <input
                    name="phone"
                    type="text"
                    value={personalInfo.phone}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Portfolio / Website</label>
                  <input
                    name="website"
                    type="url"
                    value={personalInfo.website}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">LinkedIn Profile</label>
                  <input
                    name="linkedin"
                    type="text"
                    value={personalInfo.linkedin}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Professional Summary</label>
                <textarea
                  name="summary"
                  rows={3}
                  value={personalInfo.summary}
                  onChange={handleInfoChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Skills (comma-separated)</label>
                <input
                  name="skills"
                  type="text"
                  value={personalInfo.skills}
                  onChange={handleInfoChange}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Job Experience Selector */}
            <div className="space-y-4 pt-4 border-t border-slate-850">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> Select Experience to Include</h3>
              {jobs.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No job applications added yet.</p>
              ) : (
                <div className="space-y-2">
                  {jobs.map(job => {
                    const isSelected = selectedJobIds.includes(job.id);
                    return (
                      <div 
                        key={job.id}
                        onClick={() => toggleJobSelection(job.id)}
                        className={`flex items-center space-x-3 p-3 bg-slate-950 border rounded-xl cursor-pointer hover:border-slate-700 transition-all
                          ${isSelected ? 'border-indigo-550/50 bg-indigo-500/[0.02]' : 'border-slate-850'}
                        `}
                      >
                        <button className="text-slate-400 hover:text-indigo-400 transition-colors">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-500" /> : <Square className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate">{job.title || 'Untitled Role'}</p>
                          <p className="text-[10px] text-slate-400 truncate">{job.company || 'Unknown Company'} • {job.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: CV Preview */}
          <div className="hidden md:block w-1/2 p-6 bg-slate-950 overflow-y-auto flex justify-center items-start">
            <div 
              id="cv-print-area"
              className="bg-white text-slate-900 p-8 shadow-2xl w-full max-w-[210mm] min-h-[297mm] font-serif border border-gray-100 flex flex-col"
              style={{ contentVisibility: 'auto' }}
            >
              {/* CV Header */}
              <div className="border-b-2 border-slate-900 pb-5 mb-5 text-center">
                <h1 className="text-3xl font-bold uppercase tracking-wide text-slate-900 mb-1">{personalInfo.name}</h1>
                <p className="text-xs font-sans font-bold uppercase tracking-wider text-indigo-700 mb-3">{personalInfo.title}</p>
                
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-sans text-slate-600">
                  {personalInfo.email && <span className="flex items-center"><Mail className="w-3 h-3 mr-1 text-slate-400" /> {personalInfo.email}</span>}
                  {personalInfo.phone && <span className="flex items-center"><Phone className="w-3 h-3 mr-1 text-slate-400" /> {personalInfo.phone}</span>}
                  {personalInfo.website && <span className="flex items-center"><Globe className="w-3 h-3 mr-1 text-slate-400" /> {personalInfo.website.replace(/^https?:\/\//, '')}</span>}
                  {personalInfo.linkedin && <span className="flex items-center"><LinkedinIcon className="w-3 h-3 mr-1 text-slate-400" /> {personalInfo.linkedin}</span>}
                </div>
              </div>

              {/* CV Body */}
              <div className="flex-1 space-y-5 text-xs leading-relaxed">
                
                {/* Summary Section */}
                {personalInfo.summary && (
                  <div>
                    <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-gray-200 pb-1 mb-2">Professional Summary</h3>
                    <p className="text-slate-700">{personalInfo.summary}</p>
                  </div>
                )}

                {/* Skills Section */}
                {personalInfo.skills && (
                  <div>
                    <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-gray-200 pb-1 mb-2">Core Skills</h3>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-slate-700 font-sans">
                      {getSkillsList().map((skill, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience Section */}
                <div>
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-gray-200 pb-1 mb-3">Work Experience</h3>
                  {selectedJobs.length === 0 ? (
                    <p className="text-slate-400 italic text-[11px] font-sans">Check experience cards on the left panel to display them here.</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedJobs.map(job => {
                        const points = cleanDescription(job.description);
                        return (
                          <div key={job.id} className="space-y-1.5">
                            <div className="flex justify-between items-baseline">
                              <h4 className="font-bold text-[11px] text-slate-900">{job.title || 'Job Title'}</h4>
                              <span className="font-sans text-[10px] text-slate-500 font-medium">{formatJobDates(job)}</span>
                            </div>
                            <div className="flex justify-between items-baseline text-slate-700 font-medium">
                              <span className="italic">{job.company || 'Company Name'}</span>
                            </div>

                            {/* Job description bullet points */}
                            {points.length > 0 && (
                              <ul className="list-disc pl-4 space-y-1 text-slate-600 mt-1">
                                {points.slice(0, 4).map((pt, i) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ul>
                            )}

                            {/* Optional notes/summary as extra item if present */}
                            {job.notes && !job.notes.includes('--- AI Analysis ---') && (
                              <p className="text-[10px] text-slate-500 italic mt-1 font-sans">
                                Note: {job.notes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* CV Footer */}
              <div className="border-t border-gray-150 pt-3 mt-auto text-center text-[9px] font-sans text-gray-400 flex justify-between">
                <span>Generated by JobTracker</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
