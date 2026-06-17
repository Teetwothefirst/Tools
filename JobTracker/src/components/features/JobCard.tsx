"use client";

import React from "react";
import { Job } from "@/types/job";
import { CalendarDays, Building2, ExternalLink, DollarSign, Mail, Tag, Clock } from "lucide-react";
import { format } from "date-fns";

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: any;
  dragHandleProps?: any;
  isDragging?: boolean;
}

const PRIORITY_STYLES: Record<string, React.CSSProperties> = {
  High:   { backgroundColor: "var(--priority-high-bg)",   color: "var(--priority-high-text)",   borderColor: "var(--priority-high-border)" },
  Medium: { backgroundColor: "var(--priority-medium-bg)", color: "var(--priority-medium-text)", borderColor: "var(--priority-medium-border)" },
  Low:    { backgroundColor: "var(--priority-low-bg)",    color: "var(--priority-low-text)",    borderColor: "var(--priority-low-border)" },
};

const CATEGORY_ACCENT: Record<string, string> = {
  Engineering: "var(--status-applied-text)",
  Design:      "var(--status-interviewing-text)",
  Product:     "#0D9488",
  Marketing:   "#DB2777",
  Sales:       "#EA580C",
  HR:          "var(--accent-text)",
  Other:       "var(--text-tertiary)",
};

const getDaysDifference = (targetDateStr: string, isFromToday: boolean): string => {
  try {
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / 86400000);
    if (isFromToday) {
      const past = -diffDays;
      return past >= 0 ? `${past}d ago` : `in ${Math.abs(past)}d`;
    } else {
      return diffDays >= 0 ? `${diffDays}d left` : `${Math.abs(diffDays)}d overdue`;
    }
  } catch {
    return "";
  }
};

const formatDate = (dateStr: string): string => {
  try { return format(new Date(dateStr), "dd/MM/yyyy"); } catch { return dateStr; }
};

export const JobCard = React.memo(function JobCard({
  job, onClick, innerRef, draggableProps, dragHandleProps, isDragging,
}: JobCardProps) {
  const isInterviewingOrOffer = job.status === "Interviewing" || job.status === "Offer";
  const shouldDisplayDates = isInterviewingOrOffer && !!job.employmentEndDate;
  const startDaysText = job.offerReceivedDate ? getDaysDifference(job.offerReceivedDate, true) : "";
  const endDaysText = job.employmentEndDate ? getDaysDifference(job.employmentEndDate, false) : "";
  const catAccent = CATEGORY_ACCENT[job.category || "Other"] || CATEGORY_ACCENT.Other;

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={() => onClick(job)}
      style={{
        position: "relative",
        padding: 12,
        marginBottom: 8,
        backgroundColor: "var(--bg-raised)",
        border: isDragging ? `0.5px solid var(--accent-border)` : "0.5px solid var(--border)",
        borderRadius: 6,
        cursor: "pointer",
        transform: isDragging ? "rotate(1deg) scale(1.02)" : "none",
        transition: "border-color 120ms ease, transform 120ms ease",
      }}
      onMouseEnter={(e) => {
        if (!isDragging) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        if (!isDragging) (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
    >
      {/* Top row: company + priority + link */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
          <Building2 size={11} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 400,
              color: "var(--text-secondary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 120,
            }}
          >
            {job.company}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {job.jobLink && (
            <a
              href={job.jobLink.startsWith("http") ? job.jobLink : `https://${job.jobLink}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 3,
                borderRadius: 4,
                color: "var(--text-tertiary)",
                transition: "color 100ms ease",
                textDecoration: "none",
              }}
              title="View job post"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent-text)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; }}
            >
              <ExternalLink size={11} />
            </a>
          )}
          <span
            className="chip"
            style={PRIORITY_STYLES[job.priority]}
          >
            {job.priority}
          </span>
        </div>
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: "var(--text-primary)",
          lineHeight: 1.35,
          marginBottom: 8,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {job.title}
      </p>

      {/* Meta badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
        {job.category && (
          <span
            className="chip"
            style={{
              backgroundColor: "var(--bg-subtle)",
              color: catAccent,
              borderColor: "var(--border)",
            }}
          >
            <Tag size={9} />
            {job.category}
          </span>
        )}
        {job.payAmount && (
          <span
            className="chip"
            style={{
              backgroundColor: "var(--status-offer-bg)",
              color: "var(--status-offer-text)",
              borderColor: "var(--status-offer-border)",
            }}
          >
            <DollarSign size={9} />
            {job.payAmount}
          </span>
        )}
        {job.mailUsed && (
          <span
            className="chip"
            style={{
              backgroundColor: "var(--status-applied-bg)",
              color: "var(--status-applied-text)",
              borderColor: "var(--status-applied-border)",
              maxWidth: 120,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={`Applied via: ${job.mailUsed}`}
          >
            <Mail size={9} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{job.mailUsed}</span>
          </span>
        )}
      </div>

      {/* Date block for interviewing/offer */}
      {shouldDisplayDates && (
        <div
          style={{
            marginBottom: 8,
            padding: "8px 10px",
            borderRadius: 4,
            border: "0.5px solid var(--accent-border)",
            backgroundColor: "var(--accent-subtle)",
            fontSize: "0.6875rem",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {job.offerReceivedDate && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--accent-text)" }}>Offer received</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {formatDate(job.offerReceivedDate)}{" "}
                <span style={{ color: "var(--text-tertiary)" }}>({startDaysText})</span>
              </span>
            </div>
          )}
          {job.employmentEndDate && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--accent-text)" }}>End date</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {formatDate(job.employmentEndDate)}{" "}
                <span style={{ color: "var(--text-tertiary)" }}>({endDaysText})</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer: date added */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          paddingTop: 8,
          borderTop: "0.5px solid var(--border)",
          color: "var(--text-tertiary)",
          fontSize: "0.6875rem",
        }}
      >
        <CalendarDays size={10} />
        {format(new Date(job.dateAdded), "MMM d, yyyy")}
      </div>
    </div>
  );
});
