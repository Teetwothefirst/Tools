'use client';

import React from 'react';
import { Job } from '@/types/job';
import { CalendarDays, Building2, ExternalLink, DollarSign, Mail, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: any;
  dragHandleProps?: any;
  isDragging?: boolean;
}

const priorityColors = {
  High: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
};

const categoryColors: Record<string, string> = {
  Engineering: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
  Design: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900',
  Product: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900',
  Marketing: 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-900',
  Sales: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900',
  HR: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900',
  Other: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

export const JobCard = React.memo(function JobCard({ job, onClick, innerRef, draggableProps, dragHandleProps, isDragging }: JobCardProps) {
  const isInterviewingOrOffer = job.status === 'Interviewing' || job.status === 'Offer';
  const hasEndDate = !!job.employmentEndDate;
  const shouldDisplayDates = isInterviewingOrOffer && hasEndDate;

  const getDaysDifference = (targetDateStr: string, isFromToday: boolean) => {
    try {
      const target = new Date(targetDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (isFromToday) {
        const daysPassed = -diffDays;
        return daysPassed >= 0 ? `${daysPassed}d ago` : `in ${Math.abs(daysPassed)}d`;
      } else {
        return diffDays >= 0 ? `${diffDays}d left` : `${Math.abs(diffDays)}d overdue`;
      }
    } catch { return ''; }
  };

  const formatDate = (dateStr: string) => {
    try { return format(new Date(dateStr), 'dd/MM/yyyy'); } catch { return dateStr; }
  };

  const startDaysText = job.offerReceivedDate ? getDaysDifference(job.offerReceivedDate, true) : '';
  const endDaysText = job.employmentEndDate ? getDaysDifference(job.employmentEndDate, false) : '';
  const catColor = categoryColors[job.category || 'Other'] || categoryColors.Other;

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={() => onClick(job)}
      className={`group relative p-4 mb-3 bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700
        ${isDragging
          ? 'shadow-xl ring-2 ring-indigo-500/50 rotate-1 scale-105'
          : 'border-gray-200 dark:border-slate-800'}
      `}
    >
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center space-x-1.5 text-gray-700 dark:text-slate-300 font-medium min-w-0">
          <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 flex-shrink-0" />
          <span className="truncate max-w-[130px] text-sm">{job.company}</span>
        </div>
        <div className="flex items-center space-x-1.5 flex-shrink-0 ml-1">
          {job.jobLink && (
            <a
              href={job.jobLink.startsWith('http') ? job.jobLink : `https://${job.jobLink}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors"
              title="View Job Post"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${priorityColors[job.priority]}`}>
            {job.priority}
          </span>
        </div>
      </div>

      <div className="mb-2.5">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {job.title}
        </h3>
      </div>

      {/* Category + Pay badges */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {job.category && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${catColor}`}>
            <Tag className="w-2.5 h-2.5 mr-1" />
            {job.category}
          </span>
        )}
        {job.payAmount && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
            <DollarSign className="w-2.5 h-2.5 mr-0.5" />
            {job.payAmount}
          </span>
        )}
        {job.mailUsed && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900" title={`Applied via: ${job.mailUsed}`}>
            <Mail className="w-2.5 h-2.5 mr-0.5" />
            <span className="truncate max-w-[70px]">{job.mailUsed}</span>
          </span>
        )}
      </div>

      {/* Phase 5 Date Display */}
      {shouldDisplayDates && (
        <div className="mb-2.5 p-2.5 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg text-xs space-y-1">
          {job.offerReceivedDate && (
            <div className="flex justify-between items-center">
              <span className="text-indigo-700 dark:text-indigo-400 font-medium">Offer Recv:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(job.offerReceivedDate)} <span className="text-indigo-500 font-medium">({startDaysText})</span>
              </span>
            </div>
          )}
          {job.employmentEndDate && (
            <div className="flex justify-between items-center">
              <span className="text-indigo-700 dark:text-indigo-400 font-medium">End Date:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(job.employmentEndDate)} <span className="text-indigo-500 font-medium">({endDaysText})</span>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center text-[11px] text-gray-400 dark:text-slate-600 mt-auto pt-2.5 border-t border-gray-100 dark:border-slate-800">
        <CalendarDays className="w-3 h-3 mr-1.5" />
        {format(new Date(job.dateAdded), 'MMM d, yyyy')}
      </div>
    </div>
  );
});
