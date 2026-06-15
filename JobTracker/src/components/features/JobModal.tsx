import { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import { X, Calendar as CalendarIcon, Save, Loader2, Sparkles, Trash2, PlusCircle } from 'lucide-react';
import { generateGoogleCalendarLink } from '@/lib/calendar';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
  onUpdate: (updatedJob: Job) => void;
  onDelete?: (jobId: string) => void;
}

export function JobModal({ job, onClose, onUpdate, onDelete }: JobModalProps) {
  const [editedJob, setEditedJob] = useState<Job | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showAiAutofill, setShowAiAutofill] = useState(false);
  const [autofillText, setAutofillText] = useState('');
  const [aiResult, setAiResult] = useState<{ summary: string[], skills: string[] } | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditedJob(job);
  }, [job]);

  if (!job || !editedJob) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedJob(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleExtractDetails = async () => {
    if (!autofillText.trim()) return;
    setIsExtracting(true);
    try {
      const data = await api.extractDetails(autofillText);

      const aiText = `\n\n--- AI Analysis ---\nSummary:\n${data.summary.map((s: string) => '- ' + s).join('\n')}\n\nTop Skills:\n${data.skills.join(', ')}`;

      setEditedJob(prev => prev ? {
        ...prev,
        company: data.company || prev.company,
        title: data.title || prev.title,
        priority: data.priority || prev.priority,
        payAmount: data.payAmount || prev.payAmount,
        contacts: data.contacts || prev.contacts,
        category: data.category || prev.category || 'Other',
        description: autofillText,
        notes: (prev.notes || '') + aiText,
      } : null);

      setShowAiAutofill(false);
      setAutofillText('');
      toast('Extracted job details successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Error extracting details. Please make sure the Gemini API key is configured.", 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    let finalJob = { ...editedJob };
    if (aiResult) {
      const aiText = `\n\n--- AI Analysis ---\nSummary:\n${aiResult.summary.map(s => '- ' + s).join('\n')}\n\nTop Skills:\n${aiResult.skills.join(', ')}`;
      finalJob.notes = (finalJob.notes || '') + aiText;
    }

    setTimeout(() => {
      onUpdate(finalJob as Job);
      setIsSaving(false);
      onClose();
    }, 400); // Simulate network delay for UX
  };

  const handleSummarize = async () => {
    if (!editedJob?.description) return;
    setIsSummarizing(true);
    try {
      const data = await api.summarizeJob(editedJob.description);
      setAiResult(data);
      toast('Job summarized successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Error summarizing job description.", 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAddCalendarEvent = async () => {
    setIsAddingEvent(true);
    try {
      // 1 hour event starting 7 days from now
      const start = new Date();
      start.setDate(start.getDate() + 7);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const res = await fetch('/api/calendar/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: `Follow up: ${editedJob.title} @ ${editedJob.company}`,
          description: `Remember to follow up on your job application.\n\nNotes:\n${editedJob.notes || 'None'}`,
          start: start.toISOString(),
          end: end.toISOString()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          // Not authenticated with Google
          window.location.href = '/api/calendar/auth';
          return;
        }
        throw new Error(data.error || 'Failed to add event');
      }

      toast('Added to Google Calendar!', 'success');
      if (data.eventLink) {
        window.open(data.eventLink, '_blank');
      }
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Error adding event to calendar', 'error');
    } finally {
      setIsAddingEvent(false);
    }
  };

  const calendarLink = generateGoogleCalendarLink(job);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editedJob.title || 'Add New Job'}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{editedJob.company || 'Enter details below'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Autofill Banner/Panel */}
        <div className="bg-gradient-to-r from-indigo-50/70 to-violet-50/70 dark:from-indigo-950/20 dark:to-violet-950/20 p-4 border-b border-indigo-100/50 dark:border-slate-850 flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-sm text-indigo-950 dark:text-indigo-300">Autofill form with AI</span>
            </div>
            <button
              onClick={() => setShowAiAutofill(!showAiAutofill)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline bg-transparent border-0 cursor-pointer"
            >
              {showAiAutofill ? 'Hide Text Area' : 'Paste Job Description'}
            </button>
          </div>
          
          {showAiAutofill && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <textarea
                placeholder="Paste the job description here..."
                rows={4}
                value={autofillText}
                onChange={(e) => setAutofillText(e.target.value)}
                className="w-full text-xs p-3 border border-indigo-200/60 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none font-sans"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleExtractDetails}
                  disabled={isExtracting || !autofillText.trim()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/10 transition-all disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Extract & Fill</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Company</label>
              <input 
                name="company"
                value={editedJob.company}
                onChange={handleChange}
                placeholder="e.g. Google"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Job Title</label>
              <input 
                name="title"
                value={editedJob.title}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status</label>
              <select
                name="status"
                value={editedJob.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
              >
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                name="priority"
                value={editedJob.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category</label>
              <select
                name="category"
                value={editedJob.category || 'Other'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Contacts</label>
            <input 
              name="contacts"
              placeholder="e.g., Jane Doe (Recruiter) - jane@example.com"
              value={editedJob.contacts || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Mail Used to Apply</label>
              <input 
                name="mailUsed"
                type="email"
                placeholder="e.g., personal@mail.com"
                value={editedJob.mailUsed || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Amount / Pay</label>
              <input 
                name="payAmount"
                type="text"
                placeholder="e.g., $120,000/yr"
                value={editedJob.payAmount || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Job Link</label>
              <input 
                name="jobLink"
                type="text"
                placeholder="e.g., https://careers.company.com/..."
                value={editedJob.jobLink || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Offer Letter Received Date</label>
              <input 
                name="offerReceivedDate"
                type="date"
                value={editedJob.offerReceivedDate || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Employment End Date</label>
              <input 
                name="employmentEndDate"
                type="date"
                value={editedJob.employmentEndDate || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Notes</label>
            <textarea 
              name="notes"
              rows={3}
              placeholder="Add your personal notes here..."
              value={editedJob.notes || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all resize-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Job Description</label>
              <button 
                onClick={handleSummarize}
                disabled={isSummarizing || !editedJob.description}
                className="text-xs flex items-center space-x-1 bg-indigo-550/10 text-indigo-650 hover:bg-indigo-500/20 px-2 py-1 rounded-md font-medium transition-colors disabled:opacity-50"
                title="AI Summary"
              >
                {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Summarize & Key Skills</span>
              </button>
            </div>
            <textarea 
              name="description"
              rows={6}
              placeholder="Paste the full job description here..."
              value={editedJob.description || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-all resize-none font-mono text-xs leading-normal"
            />
            
            {aiResult && (
              <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/40 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 text-sm mb-2 flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Analysis</h4>
                <div className="text-sm text-gray-700 dark:text-slate-300 space-y-3">
                  <div>
                    <strong className="block text-xs uppercase tracking-wider text-indigo-800/70 dark:text-indigo-400 mb-1">Role Summary</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-xs">
                      {aiResult.summary.map((point, i) => <li key={i}>{point}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong className="block text-xs uppercase tracking-wider text-indigo-800/70 dark:text-indigo-400 mb-1">Key Skills</strong>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {aiResult.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-950 text-indigo-750 dark:text-indigo-300 rounded-md text-xs font-medium shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 italic">This analysis will be automatically appended to your notes when you save.</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center space-x-2">
            <a 
              href={calendarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Manual Google Calendar Add"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Manual Add</span>
            </a>
            <span className="text-gray-300 dark:text-slate-700">|</span>
            <button 
              onClick={handleAddCalendarEvent}
              disabled={isAddingEvent}
              className="flex items-center space-x-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              {isAddingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Sync to Google Calendar</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            {onDelete && (
              <button 
                onClick={() => onDelete(editedJob.id)}
                className="px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
