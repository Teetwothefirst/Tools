"use client";

import { useState, useRef } from "react";
import { Job, JobStatus, JobPriority, JobAttachment } from "@/types/job";
import { Sparkles, Paperclip, X, FileText, Loader2, Link2, Copy, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface PromptJobGeneratorProps {
  onGenerateJob: (jobDraft: Partial<Job>) => void;
}

const SAMPLE_TEMPLATE = `Company: Independent National Electoral Commission (INEC)
Job Title: Administrative Officer II / Executive Officer
Status: Applied
Priority: High
Category: Government / Public Sector
Contacts: Plot 436 Zambezi Crescent, Maitama District, Abuja
Mail used to apply: applicant@email.com
Amount / Pay: Grade Level 08 ($120k/yr equivalent)
Job link: https://recruitment.inecnigeria.org
Offer letter received: No
Employment end date: N/A (Permanent Civil Service)
Notes: Application window was July 20-27, 2026.
Job description: Recruitment exercise aimed at strengthening capacity in electoral administration and logistics.`;

export function parsePromptTextLocally(text: string): Partial<Job> {
  const result: Partial<Job> = {
    company: "",
    title: "",
    status: "Saved",
    priority: "Medium",
    category: "Other",
    payAmount: "",
    contacts: "",
    mailUsed: "",
    jobLink: "",
    offerReceivedDate: "",
    employmentEndDate: "",
    notes: "",
    description: "",
  };

  const lines = text.split("\n");
  let isReadingDescription = false;
  let isReadingNotes = false;
  const descriptionLines: string[] = [];
  const notesLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && !isReadingDescription && !isReadingNotes) {
      const key = line.substring(0, colonIdx).trim().toLowerCase();
      const val = line.substring(colonIdx + 1).trim();

      if (key.includes("company")) {
        result.company = val;
        continue;
      }
      if (key === "job title" || key === "title" || key === "position") {
        result.title = val;
        continue;
      }
      if (key === "status") {
        const s = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        if (["Saved", "Applied", "Interviewing", "Offer", "Rejected"].includes(s)) {
          result.status = s as JobStatus;
        }
        continue;
      }
      if (key === "priority") {
        const p = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        if (["Low", "Medium", "High"].includes(p)) {
          result.priority = p as JobPriority;
        }
        continue;
      }
      if (key === "category") {
        result.category = val;
        continue;
      }
      if (key.includes("contact")) {
        result.contacts = val;
        continue;
      }
      if (key.includes("mail") || key.includes("email")) {
        result.mailUsed = val;
        continue;
      }
      if (key.includes("pay") || key.includes("amount") || key.includes("salary")) {
        result.payAmount = val;
        continue;
      }
      if (key.includes("job link") || key.includes("link") || key === "url") {
        result.jobLink = val;
        continue;
      }
      if (key.includes("offer")) {
        result.offerReceivedDate = val;
        continue;
      }
      if (key.includes("end date") || key.includes("employment end")) {
        result.employmentEndDate = val;
        continue;
      }
      if (key === "notes" || key.includes("note")) {
        notesLines.push(val);
        isReadingNotes = true;
        continue;
      }
      if (key.includes("job description") || key.includes("description")) {
        descriptionLines.push(val);
        isReadingDescription = true;
        continue;
      }
    }

    if (isReadingDescription) {
      descriptionLines.push(line);
    } else if (isReadingNotes) {
      notesLines.push(line);
    }
  }

  // Extract URLs if jobLink wasn't explicitly matched
  if (!result.jobLink) {
    const urlMatch = text.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      result.jobLink = urlMatch[0];
    }
  }

  // Extract Email if mailUsed wasn't explicitly matched
  if (!result.mailUsed) {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      result.mailUsed = emailMatch[0];
    }
  }

  // Fallback for title/company if freeform text
  if (!result.company || !result.title) {
    const firstLine = lines[0]?.trim() || "";
    if (firstLine && !firstLine.includes(":")) {
      if (firstLine.toLowerCase().includes(" at ")) {
        const parts = firstLine.split(/ at /i);
        result.title = parts[0].trim();
        result.company = parts[1].trim();
      } else {
        result.title = firstLine;
      }
    }
  }

  if (descriptionLines.length > 0) {
    result.description = descriptionLines.join("\n");
  } else if (!result.description) {
    result.description = text;
  }

  if (notesLines.length > 0) {
    result.notes = notesLines.join("\n");
  }

  return result;
}

export function PromptJobGenerator({ onGenerateJob }: PromptJobGeneratorProps) {
  const [promptText, setPromptText] = useState("");
  const [attachments, setAttachments] = useState<JobAttachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newAttachments: JobAttachment[] = files.map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    toast(`Attached ${files.length} file(s)`, "success");
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleInsertTemplate = () => {
    setPromptText(SAMPLE_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 1500);
  };

  const handleGenerate = async () => {
    if (!promptText.trim() && attachments.length === 0) {
      toast("Please enter a prompt or attach a file to generate card details.", "error");
      return;
    }

    setIsGenerating(true);

    try {
      let extractedData: Partial<Job> = {};

      // Try AI extraction endpoint first
      try {
        const aiData = await api.extractDetails(promptText);
        extractedData = {
          company: aiData.company || "",
          title: aiData.title || "",
          status: (aiData.status as JobStatus) || "Saved",
          priority: (aiData.priority as JobPriority) || "Medium",
          category: aiData.category || "Other",
          payAmount: aiData.payAmount || "",
          contacts: aiData.contacts || "",
          mailUsed: aiData.mailUsed || "",
          jobLink: aiData.jobLink || "",
          offerReceivedDate: aiData.offerReceivedDate || "",
          employmentEndDate: aiData.employmentEndDate || "",
          description: aiData.description || promptText,
          notes: aiData.notes || (aiData.summary ? aiData.summary.join("\n") : ""),
        };
      } catch (aiErr) {
        console.warn("AI endpoint unavailable, using smart local parser fallback:", aiErr);
        extractedData = parsePromptTextLocally(promptText);
      }

      // Merge local fallback if fields are missing
      const localData = parsePromptTextLocally(promptText);
      const finalJobDraft: Partial<Job> = {
        company: extractedData.company || localData.company || "New Company",
        title: extractedData.title || localData.title || "Job Title",
        status: extractedData.status || localData.status || "Saved",
        priority: extractedData.priority || localData.priority || "Medium",
        category: extractedData.category || localData.category || "Engineering",
        payAmount: extractedData.payAmount || localData.payAmount || "",
        contacts: extractedData.contacts || localData.contacts || "",
        mailUsed: extractedData.mailUsed || localData.mailUsed || "",
        jobLink: extractedData.jobLink || localData.jobLink || "",
        offerReceivedDate: extractedData.offerReceivedDate || localData.offerReceivedDate || "",
        employmentEndDate: extractedData.employmentEndDate || localData.employmentEndDate || "",
        description: extractedData.description || localData.description || promptText,
        notes: extractedData.notes || localData.notes || "",
        attachments: attachments,
      };

      onGenerateJob(finalJobDraft);
      toast("Job card draft generated! Edit any field below.", "success");
      setPromptText("");
      setAttachments([]);
    } catch (err: any) {
      toast(`Failed to generate job card: ${err.message}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-4 shadow-sm transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-text)]">
            <Sparkles size={16} />
          </div>
          <span>AI Prompt & Quick Card Generator</span>
          <span className="rounded-full bg-[var(--status-applied-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--status-applied-text)] border border-[var(--status-applied-border)]">
            Flexible Key-Value & Freeform
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {isOpen ? "Hide Generator" : "Show Generator"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <div className="relative">
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={`Paste a prompt, key-value block, or job posting text...

Example Key-Value Format:
Company: INEC
Job Title: Administrative Officer II
Status: Applied
Job link: https://recruitment.inecnigeria.org`}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "0.5px solid var(--border-strong)",
                borderRadius: 8,
                backgroundColor: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "0.8125rem",
                outline: "none",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />

            <button
              onClick={handleInsertTemplate}
              className="absolute right-3 top-3 flex items-center gap-1 text-[11px] font-medium text-[var(--accent-text)] bg-[var(--accent-subtle)] hover:bg-[var(--bg-raised)] border border-[var(--accent-border)] px-2 py-1 rounded transition-colors"
            >
              {copiedTemplate ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedTemplate ? "Inserted Template" : "Use Sample Format"}</span>
            </button>
          </div>

          {/* Attachments list */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                >
                  <Paperclip size={13} className="text-[var(--accent-text)]" />
                  <span className="max-w-[160px] truncate">{att.name}</span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="text-[var(--text-tertiary)] hover:text-red-400"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Paperclip size={14} />
                <span>Attach Files ({attachments.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-lg bg-[var(--accent-text)] px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 shadow-sm transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Parsing Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate & Fill Job Form</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
