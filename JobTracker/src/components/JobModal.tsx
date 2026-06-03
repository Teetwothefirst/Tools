import { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import { X, Calendar as CalendarIcon, Save, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { generateGoogleCalendarLink } from '@/utils/calendar';

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
  const [aiResult, setAiResult] = useState<{ summary: string[], skills: string[] } | null>(null);

  useEffect(() => {
    setEditedJob(job);
  }, [job]);

  if (!job || !editedJob) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedJob(prev => prev ? { ...prev, [name]: value } : null);
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
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editedJob.description })
      });
      if (!res.ok) throw new Error('Failed to summarize');
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error(err);
      alert("Error summarizing job description.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const calendarLink = generateGoogleCalendarLink(job);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editedJob.title}</h2>
            <p className="text-sm text-gray-500 font-medium">{editedJob.company}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input 
                name="company"
                value={editedJob.company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input 
                name="title"
                value={editedJob.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={editedJob.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={editedJob.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contacts</label>
            <input 
              name="contacts"
              placeholder="e.g., Jane Doe (Recruiter) - jane@example.com"
              value={editedJob.contacts || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mail Used to Apply</label>
              <input 
                name="mailUsed"
                type="email"
                placeholder="e.g., personal@mail.com"
                value={editedJob.mailUsed || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount / Pay</label>
              <input 
                name="payAmount"
                type="text"
                placeholder="e.g., $120,000/yr"
                value={editedJob.payAmount || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Link</label>
              <input 
                name="jobLink"
                type="text"
                placeholder="e.g., https://careers.company.com/..."
                value={editedJob.jobLink || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Letter Received Date</label>
              <input 
                name="offerReceivedDate"
                type="date"
                value={editedJob.offerReceivedDate || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment End Date</label>
              <input 
                name="employmentEndDate"
                type="date"
                value={editedJob.employmentEndDate || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              name="notes"
              rows={3}
              placeholder="Add your personal notes here..."
              value={editedJob.notes || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              <button 
                onClick={handleSummarize}
                disabled={isSummarizing || !editedJob.description}
                className="text-xs flex items-center space-x-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded-md font-medium transition-colors disabled:opacity-50"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm"
            />
            
            {aiResult && (
              <div className="mt-4 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="font-semibold text-indigo-900 text-sm mb-2 flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Analysis</h4>
                <div className="text-sm text-gray-700 space-y-3">
                  <div>
                    <strong className="block text-xs uppercase tracking-wider text-indigo-800/70 mb-1">Role Summary</strong>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {aiResult.summary.map((point, i) => <li key={i}>{point}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong className="block text-xs uppercase tracking-wider text-indigo-800/70 mb-1">Key Skills</strong>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {aiResult.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-700 rounded-md text-xs font-medium shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 italic">This analysis will be automatically appended to your notes when you save.</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <a 
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Set Follow-up Reminder</span>
          </a>
          
          <div className="flex space-x-3">
            {onDelete && (
              <button 
                onClick={() => onDelete(editedJob.id)}
                className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
