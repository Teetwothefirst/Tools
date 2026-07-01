"use client";

import { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import { X, Printer, CheckSquare, Square, FileText, User, Mail, Phone, Globe, Briefcase, ChevronDown, Download, Sparkles } from 'lucide-react';

import { format } from 'date-fns';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

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
  const [personalInfo, setPersonalInfo] = useLocalStorageState<PersonalInfo>('jobtracker-cv-info', {
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
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filter jobs to only include jobs with 'Offer' status
  const offerJobs = jobs.filter(j => j.status === 'Offer');

  // Automatically select all offer jobs by default
  useEffect(() => {
    setSelectedJobIds(offerJobs.map(j => j.id));
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

  const selectedJobs = offerJobs.filter(j => selectedJobIds.includes(j.id));

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSkillsList = () => {
    return personalInfo.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const handleExport = (formatType: 'txt' | 'html' | 'json' | 'md' | 'doc') => {
    setShowExportMenu(false);
    
    if (formatType === 'json') {
      const exportData = {
        personalInfo,
        skills: getSkillsList(),
        experience: selectedJobs.map(job => ({
          title: job.title,
          company: job.company,
          dates: formatJobDates(job),
          description: getJobBullets(job)
        }))
      };
      const content = JSON.stringify(exportData, null, 2);
      downloadFile(content, `${personalInfo.name.replace(/\s+/g, '_')}_CV.json`, 'application/json');
    } 
    else if (formatType === 'txt') {
      let content = `${personalInfo.name.toUpperCase()}\n`;
      content += `${personalInfo.title}\n`;
      content += `${personalInfo.email} | ${personalInfo.phone}\n`;
      if (personalInfo.website) content += `Portfolio: ${personalInfo.website}\n`;
      if (personalInfo.linkedin) content += `LinkedIn: ${personalInfo.linkedin}\n`;
      content += `\n========================================\n\n`;
      
      if (personalInfo.summary) {
        content += `PROFESSIONAL SUMMARY\n`;
        content += `--------------------\n`;
        content += `${personalInfo.summary}\n\n`;
      }
      
      if (personalInfo.skills) {
        content += `CORE SKILLS\n`;
        content += `-----------\n`;
        content += `${getSkillsList().join(', ')}\n\n`;
      }
      
      if (selectedJobs.length > 0) {
        content += `WORK EXPERIENCE\n`;
        content += `---------------\n`;
        selectedJobs.forEach(job => {
          content += `${job.title} at ${job.company}\n`;
          content += `${formatJobDates(job)}\n`;
          const points = getJobBullets(job);
          points.slice(0, 4).forEach(pt => {
            content += `- ${pt}\n`;
          });
          content += `\n`;
        });
      }
      
      downloadFile(content, `${personalInfo.name.replace(/\s+/g, '_')}_CV.txt`, 'text/plain');
    }
    else if (formatType === 'html') {
      const skillsHtml = getSkillsList().map(s => `<span class="skill-tag">${s}</span>`).join('\n');
      const experienceHtml = selectedJobs.map(job => {
        const points = getJobBullets(job).slice(0, 4).map(pt => `<li>${pt}</li>`).join('\n');
        return `
          <div class="job">
            <div class="job-header">
              <span class="job-title">${job.title}</span>
              <span class="job-dates">${formatJobDates(job)}</span>
            </div>
            <div class="job-company">${job.company}</div>
            <ul class="job-points">
              ${points}
            </ul>
          </div>
        `;
      }).join('\n');

      const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo.name} - CV</title>
  <style>
    body {
      font-family: Georgia, serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1 {
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
      font-size: 28px;
    }
    .title {
      text-align: center;
      font-family: sans-serif;
      text-transform: uppercase;
      font-weight: bold;
      color: #4f46e5;
      font-size: 13px;
      letter-spacing: 1.5px;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .contact {
      text-align: center;
      font-family: sans-serif;
      font-size: 11px;
      color: #666;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
    }
    .contact a {
      color: #666;
      text-decoration: none;
    }
    .section-title {
      font-family: sans-serif;
      text-transform: uppercase;
      font-weight: bold;
      font-size: 12px;
      letter-spacing: 1px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
      margin-top: 25px;
      margin-bottom: 10px;
    }
    .skill-tag {
      background: #f3f4f6;
      color: #1f2937;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      display: inline-block;
      margin-right: 5px;
      margin-bottom: 5px;
      font-family: sans-serif;
    }
    .job {
      margin-bottom: 20px;
    }
    .job-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 12px;
    }
    .job-company {
      font-style: italic;
      font-size: 12px;
      color: #444;
    }
    .job-dates {
      font-family: sans-serif;
      font-size: 11px;
      color: #666;
    }
    .job-points {
      margin-top: 5px;
      padding-left: 20px;
      font-size: 12px;
      color: #555;
    }
    .job-points li {
      margin-bottom: 3px;
    }
  </style>
</head>
<body>
  <h1>${personalInfo.name}</h1>
  <div class="title">${personalInfo.title}</div>
  <div class="contact">
    \${personalInfo.email ? \`<span>Email: \${personalInfo.email}</span>\` : ''}
    \${personalInfo.phone ? \`<span> | Phone: \${personalInfo.phone}</span>\` : ''}
    \${personalInfo.website ? \`<span> | Portfolio: <a href="\${personalInfo.website}">\${personalInfo.website.replace(/^https?:\\/\\//, '')}</a></span>\` : ''}
    \${personalInfo.linkedin ? \`<span> | LinkedIn: \${personalInfo.linkedin}</span>\` : ''}
  </div>

  \${personalInfo.summary ? \`
    <div class="section-title">Professional Summary</div>
    <p style="font-size: 12px; color: #444;">\${personalInfo.summary}</p>
  \` : ''}

  \${personalInfo.skills ? \`
    <div class="section-title">Core Skills</div>
    <div style="margin-top: 5px;">
      \${skillsHtml}
    </div>
  \` : ''}

  <div class="section-title">Work Experience</div>
  \${experienceHtml || '<p style="font-style: italic; font-size: 11px; color: #888;">No work experience selected.</p>'}
</body>
</html>`;
      
      downloadFile(content, `${personalInfo.name.replace(/\s+/g, '_')}_CV.html`, 'text/html');
    }
    else if (formatType === 'md') {
      let content = `# ${personalInfo.name}\n`;
      content += `**${personalInfo.title}**  \n`;
      content += `${personalInfo.email}${personalInfo.phone ? ` | ${personalInfo.phone}` : ''}\n`;
      if (personalInfo.website) content += `Portfolio: ${personalInfo.website}  \n`;
      if (personalInfo.linkedin) content += `LinkedIn: ${personalInfo.linkedin}  \n`;
      content += `\n---\n\n`;
      if (personalInfo.summary) {
        content += `## Professional Summary\n\n${personalInfo.summary}\n\n`;
      }
      if (personalInfo.skills) {
        content += `## Core Skills\n\n${getSkillsList().join(' · ')}\n\n`;
      }
      if (selectedJobs.length > 0) {
        content += `## Work Experience\n\n`;
        selectedJobs.forEach(job => {
          content += `### ${job.title} — ${job.company}\n`;
          content += `*${formatJobDates(job)}*\n\n`;
          getJobBullets(job).forEach(pt => {
            content += `- ${pt}\n`;
          });
          content += `\n`;
        });
      }
      downloadFile(content, `${personalInfo.name.replace(/\s+/g, '_')}_CV.md`, 'text/markdown');
    }
    else if (formatType === 'doc') {
      // RTF-based .doc for broad Word compatibility
      const skillLine = getSkillsList().join(', ');
      let rtf = `{\\rtf1\\ansi\\deff0\n`;
      rtf += `{\\fonttbl{\\f0 Times New Roman;}{\\f1 Arial;}}\n`;
      rtf += `{\\colortbl ;\\red67\\green56\\blue202;}\n`;
      rtf += `\\f0\\fs28\\b ${personalInfo.name}\\b0\\fs20\\par\n`;
      rtf += `\\f1\\fs18\\cf1\\b ${personalInfo.title}\\cf0\\b0\\par\n`;
      rtf += `\\fs16 ${personalInfo.email}${personalInfo.phone ? ` | ${personalInfo.phone}` : ''}\\par\n`;
      if (personalInfo.website) rtf += `Portfolio: ${personalInfo.website}\\par\n`;
      if (personalInfo.linkedin) rtf += `LinkedIn: ${personalInfo.linkedin}\\par\n`;
      rtf += `\\par\\line\n`;
      if (personalInfo.summary) {
        rtf += `\\b PROFESSIONAL SUMMARY\\b0\\par\n${personalInfo.summary}\\par\n\\par\n`;
      }
      if (skillLine) {
        rtf += `\\b CORE SKILLS\\b0\\par\n${skillLine}\\par\n\\par\n`;
      }
      if (selectedJobs.length > 0) {
        rtf += `\\b WORK EXPERIENCE\\b0\\par\n\\par\n`;
        selectedJobs.forEach(job => {
          rtf += `\\b ${job.title} at ${job.company}\\b0\\par\n`;
          rtf += `\\i ${formatJobDates(job)}\\i0\\par\n`;
          getJobBullets(job).forEach(pt => {
            rtf += `\\bullet  ${pt}\\par\n`;
          });
          rtf += `\\par\n`;
        });
      }
      rtf += `}`;
      downloadFile(rtf, `${personalInfo.name.replace(/\s+/g, '_')}_CV.doc`, 'application/msword');
    }
  };

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

  // Helper to extract AI ATS bullets or fallback to description
  const getJobBullets = (job: Job) => {
    if (job.notes && job.notes.includes('--- AI Analysis ---')) {
      const parts = job.notes.split('--- AI Analysis ---');
      const aiPart = parts[1];
      const summaryMatch = aiPart.match(/Summary:\n([\s\S]*?)(?=\n\nTop Skills:|$)/);
      if (summaryMatch && summaryMatch[1]) {
        return summaryMatch[1]
          .split('\n')
          .map(line => line.trim().replace(/^- /, '').replace(/^• /, ''))
          .filter(line => line.length > 0);
      }
    }
    if (!job.description) return [];
    return job.description
      .split('--- AI Analysis ---')[0]
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .filter(p => !/^notes?:/i.test(p))
      .slice(0, 4);
  };



  return (
    <div id="cv-builder-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-6 py-4 border-b border-slate-850 bg-slate-950/50 no-print gap-4">
          <div className="flex items-center space-x-2.5 pr-8 md:pr-0">
            <div className="p-2 bg-accent/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-200 tracking-tight">A4 CV Builder</h2>
              <p className="text-xs text-slate-400">Select your accepted offers, compile into a clean A4 document</p>
            </div>
          </div>
          
          {/* Mobile close button (absolute top right) */}
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button 
              onClick={handlePrint} 
              disabled={selectedJobs.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            {/* Export As... Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={selectedJobs.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export As...</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button 
                      onClick={() => handleExport('txt')} 
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      Plain Text (.txt)
                    </button>
                    <button 
                      onClick={() => handleExport('md')} 
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      Markdown (.md)
                    </button>
                    <button 
                      onClick={() => handleExport('doc')} 
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      MS Word (.doc)
                    </button>
                    <button 
                      onClick={() => handleExport('html')} 
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      Standalone HTML (.html)
                    </button>
                    <button 
                      onClick={() => handleExport('json')} 
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      Structured JSON (.json)
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Desktop close button */}
            <button 
              onClick={onClose}
              className="hidden md:block p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
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
              {offerJobs.length === 0 ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                  <p className="text-xs text-amber-400 font-semibold">No offer/working jobs found.</p>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Only jobs you have received offers for are available in the CV builder. Go to the Kanban board or Grid view and change a job's status to <strong>Offer</strong> to include it.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {offerJobs.map(job => {
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
          <div id="cv-preview-container" className="hidden md:block w-1/2 p-6 bg-slate-950 overflow-y-auto flex justify-center items-start">
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
                        const points = getJobBullets(job);
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
                            {getJobBullets(job).length > 0 && (
                              <ul className="list-none space-y-2 mt-2">
                                {getJobBullets(job).map((pt, i) => (
                                  <li key={i} className="text-[11px] text-slate-300 leading-relaxed pl-3 relative">
                                    <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-slate-500" />
                                    {pt}
                                  </li>
                                ))}
                              </ul>
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
