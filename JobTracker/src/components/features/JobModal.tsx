"use client";

import { useState, useEffect } from "react";
import { Job } from "@/types/job";
import {
  X, Calendar as CalendarIcon, Save, Loader2, Sparkles,
  Trash2, PlusCircle,
} from "lucide-react";
// import { generateGoogleCalendarLink } from "@/lib/calendar";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
  onUpdate: (updatedJob: Job) => void;
  onDelete?: (jobId: string) => void;
}

// Shared input style
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "0.5px solid var(--border-strong)",
  borderRadius: 6,
  backgroundColor: "var(--bg-raised)",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  fontWeight: 400,
  outline: "none",
  transition: "border-color 120ms ease",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: 6,
};

export function JobModal({ job, onClose, onUpdate, onDelete }: JobModalProps) {
  const [editedJob, setEditedJob] = useState<Job | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showAiAutofill, setShowAiAutofill] = useState(false);
  const [autofillText, setAutofillText] = useState("");
  const [aiResult, setAiResult] = useState<{ summary: string[]; skills: string[] } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setEditedJob(job);
  }, [job]);

  if (!job || !editedJob) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedJob((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleExtractDetails = async () => {
    if (!autofillText.trim()) return;
    setIsExtracting(true);
    try {
      const data = await api.extractDetails(autofillText);
      const aiText = `\n\n--- AI Analysis ---\nSummary:\n${data.summary
        .map((s: string) => "- " + s)
        .join("\n")}\n\nTop Skills:\n${data.skills.join(", ")}`;
      setEditedJob((prev) =>
        prev
          ? {
              ...prev,
              company: data.company || prev.company,
              title: data.title || prev.title,
              priority: data.priority || prev.priority,
              payAmount: data.payAmount || prev.payAmount,
              contacts: data.contacts || prev.contacts,
              category: data.category || prev.category || "Other",
              description: autofillText,
              notes: (prev.notes || "") + aiText,
            }
          : null
      );
      setShowAiAutofill(false);
      setAutofillText("");
      toast("Extracted job details successfully!", "success");
    } catch (err: any) {
      toast(
        err.message || "Error extracting details. Please check your Gemini API key.",
        "error"
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    let finalJob = { ...editedJob };
    if (aiResult) {
      const aiText = `\n\n--- AI Analysis ---\nSummary:\n${aiResult.summary
        .map((s) => "- " + s)
        .join("\n")}\n\nTop Skills:\n${aiResult.skills.join(", ")}`;
      finalJob.notes = (finalJob.notes || "") + aiText;
    }
    setTimeout(() => {
      onUpdate(finalJob as Job);
      setIsSaving(false);
      onClose();
    }, 300);
  };

  const handleSummarize = async () => {
    if (!editedJob?.description) return;
    setIsSummarizing(true);
    try {
      const data = await api.summarizeJob(editedJob.description);
      setAiResult(data);
      toast("Job summarized successfully!", "success");
    } catch (err: any) {
      toast(err.message || "Error summarizing job description.", "error");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDownloadIcs = () => {
    try {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 7);
      
      const yyyy = followUpDate.getUTCFullYear();
      const mm = String(followUpDate.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(followUpDate.getUTCDate()).padStart(2, '0');
      
      const dateStr = `${yyyy}${mm}${dd}`;
      const title = `Follow up: ${editedJob.title} @ ${editedJob.company}`;
      const description = `Follow up on your application for the ${editedJob.title} role at ${editedJob.company}.\n\nNotes:\n${editedJob.notes || "None"}`;

      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//JobTracker//Calendar Event//EN",
        "BEGIN:VEVENT",
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `follow_up_${editedJob.company.replace(/\s+/g, '_')}.ics`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast("Downloaded .ics event file successfully!", "success");
    } catch (err: any) {
      toast("Error generating calendar event file", "error");
    }
  };

  // const calendarLink = generateGoogleCalendarLink(job);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(0,0,0,0.45)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-raised)",
          border: "0.5px solid var(--border)",
          borderRadius: 10,
          width: "100%",
          maxWidth: 680,
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "20px 24px",
            borderBottom: "0.5px solid var(--border)",
            backgroundColor: "var(--bg-subtle)",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.0625rem",
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                marginBottom: 2,
              }}
            >
              {editedJob.title || "Add New Job"}
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              {editedJob.company || "Enter details below"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: 6,
              color: "var(--text-tertiary)",
              display: "flex",
              alignItems: "center",
              transition: "color 120ms ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* AI Autofill strip */}
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "0.5px solid var(--border)",
            backgroundColor: "var(--accent-subtle)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Sparkles size={14} style={{ color: "var(--accent-text)" }} />
              <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--accent-text)" }}>
                AI Autofill
              </span>
            </div>
            <button
              onClick={() => setShowAiAutofill(!showAiAutofill)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "var(--accent-text)",
                padding: "2px 0",
              }}
            >
              {showAiAutofill ? "Hide" : "Paste job description"}
            </button>
          </div>

          {showAiAutofill && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <textarea
                placeholder="Paste the full job description here…"
                rows={4}
                value={autofillText}
                onChange={(e) => setAutofillText(e.target.value)}
                style={{
                  ...inputStyle,
                  resize: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleExtractDetails}
                  disabled={isExtracting || !autofillText.trim()}
                  className="btn-primary"
                  style={{ padding: "7px 14px", fontSize: "0.8125rem" }}
                >
                  {isExtracting ? (
                    <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /><span>Extracting…</span></>
                  ) : (
                    <><Sparkles size={14} /><span>Extract & Fill</span></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Body (scrollable) */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Company + Title */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Company</label>
                <input
                  name="company"
                  value={editedJob.company}
                  onChange={handleChange}
                  placeholder="e.g. Google"
                  style={inputStyle}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Job Title</label>
                <input
                  name="title"
                  value={editedJob.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Software Engineer"
                  style={inputStyle}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                />
              </div>
            </div>

            {/* Status + Priority + Category */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {(["status", "priority", "category"] as const).map((field) => (
                <div key={field}>
                  <label style={labelStyle}>
                    {field === "status" ? "Status" : field === "priority" ? "Priority" : "Category"}
                  </label>
                  <select
                    name={field}
                    value={
                      field === "status"
                        ? editedJob.status
                        : field === "priority"
                        ? editedJob.priority
                        : editedJob.category || "Other"
                    }
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                    onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                  >
                    {field === "status" && (
                      <>
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </>
                    )}
                    {field === "priority" && (
                      <>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </>
                    )}
                    {field === "category" && (
                      <>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Product">Product</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              ))}
            </div>

            {/* Contacts */}
            <div>
              <label style={labelStyle}>Contacts</label>
              <input
                name="contacts"
                placeholder="e.g. Jane Doe (Recruiter) — jane@example.com"
                value={editedJob.contacts || ""}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
              />
            </div>

            {/* Mail + Pay + Job Link */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Mail used to apply</label>
                <input
                  name="mailUsed"
                  type="email"
                  placeholder="personal@mail.com"
                  value={editedJob.mailUsed || ""}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Amount / Pay</label>
                <input
                  name="payAmount"
                  placeholder="e.g. £60,000/yr"
                  value={editedJob.payAmount || ""}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Job link</label>
                <input
                  name="jobLink"
                  placeholder="https://..."
                  value={editedJob.jobLink || ""}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                />
              </div>
            </div>

            {/* Offer date + End date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Offer letter received</label>
                <input
                  name="offerReceivedDate"
                  type="date"
                  value={editedJob.offerReceivedDate || ""}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Employment end date</label>
                <input
                  name="employmentEndDate"
                  type="date"
                  value={editedJob.employmentEndDate || ""}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Your personal notes…"
                value={editedJob.notes || ""}
                onChange={handleChange}
                style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
              />
            </div>

            {/* Job description */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Job description</label>
                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing || !editedJob.description}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "var(--accent-text)",
                    padding: 0,
                    opacity: isSummarizing || !editedJob.description ? 0.45 : 1,
                  }}
                >
                  {isSummarizing
                    ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                    : <Sparkles size={12} />
                  }
                  Summarise & key skills
                </button>
              </div>
              <textarea
                name="description"
                rows={6}
                placeholder="Paste the full job description here…"
                value={editedJob.description || ""}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  resize: "none",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  fontSize: "0.8125rem",
                  lineHeight: 1.6,
                }}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
              />

              {/* AI results */}
              {aiResult && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "14px 16px",
                    borderRadius: 6,
                    border: "0.5px solid var(--accent-border)",
                    backgroundColor: "var(--accent-subtle)",
                  }}
                >
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "var(--accent-text)",
                      marginBottom: 10,
                    }}
                  >
                    <Sparkles size={12} />
                    AI Analysis
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <p
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 500,
                          color: "var(--text-tertiary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: 6,
                        }}
                      >
                        Role summary
                      </p>
                      <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                        {aiResult.summary.map((point, i) => (
                          <li key={i} style={{ fontSize: "0.8125rem", color: "var(--text-primary)" }}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 500,
                          color: "var(--text-tertiary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: 6,
                        }}
                      >
                        Key skills
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {aiResult.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="chip"
                            style={{
                              backgroundColor: "var(--bg-raised)",
                              color: "var(--accent-text)",
                              borderColor: "var(--accent-border)",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", marginTop: 10 }}>
                    This analysis will be appended to your notes when you save.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 24px",
            borderTop: "0.5px solid var(--border)",
            backgroundColor: "var(--bg-subtle)",
            flexShrink: 0,
          }}
        >
          {/* Calendar links */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              // href={calendarLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.8125rem",
                color: "var(--accent-text)",
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 120ms ease",
              }}
            >
              <PlusCircle size={13} />
              Add to Google Calendar
            </a>
            <span style={{ color: "var(--border-strong)" }}>·</span>
            <button
              onClick={handleDownloadIcs}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                padding: 0,
                transition: "color 120ms ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
            >
              <CalendarIcon size={13} />
              Download Apple/Outlook Event (.ics)
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onDelete && (
              <button
                onClick={() => onDelete(editedJob.id)}
                className="btn-danger"
                style={{ padding: "8px 12px", fontSize: "0.8125rem" }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: "8px 12px", fontSize: "0.8125rem" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "0.8125rem" }}
            >
              {isSaving
                ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                : <Save size={14} />
              }
              Save changes
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
