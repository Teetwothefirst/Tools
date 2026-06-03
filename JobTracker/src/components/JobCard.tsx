import { Job } from '@/types/job';
import { CalendarDays, Building2, ExternalLink, DollarSign, Mail } from 'lucide-react';
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
  High: 'bg-rose-100 text-rose-700 border-rose-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function JobCard({ job, onClick, innerRef, draggableProps, dragHandleProps, isDragging }: JobCardProps) {
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
        if (daysPassed >= 0) {
          return `${daysPassed}d ago`;
        } else {
          return `in ${Math.abs(daysPassed)}d`;
        }
      } else {
        if (diffDays >= 0) {
          return `${diffDays}d left`;
        } else {
          return `${Math.abs(diffDays)}d ago`;
        }
      }
    } catch {
      return '';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const startDaysText = job.offerReceivedDate ? getDaysDifference(job.offerReceivedDate, true) : '';
  const endDaysText = job.employmentEndDate ? getDaysDifference(job.employmentEndDate, false) : '';

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={() => onClick(job)}
      className={`group relative p-4 mb-3 bg-white rounded-xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:border-indigo-300
        ${isDragging ? 'shadow-lg ring-2 ring-indigo-500 ring-opacity-50 rotate-2' : 'border-gray-200'}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2 text-gray-700 font-medium">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-[120px] text-sm">{job.company}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          {job.jobLink && (
            <a
              href={job.jobLink.startsWith('http') ? job.jobLink : `https://${job.jobLink}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-gray-100 text-gray-400 hover:text-indigo-600 rounded-md transition-colors"
              title="View Job Post"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${priorityColors[job.priority]}`}>
            {job.priority}
          </span>
        </div>
      </div>
      
      <div className="mb-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {job.title}
        </h3>
      </div>

      {/* Badges for Pay and Mail */}
      {(job.payAmount || job.mailUsed) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.payAmount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <DollarSign className="w-3 h-3 mr-0.5" />
              {job.payAmount}
            </span>
          )}
          {job.mailUsed && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100" title={`Applied via: ${job.mailUsed}`}>
              <Mail className="w-3 h-3 mr-0.5" />
              <span className="truncate max-w-[80px]">{job.mailUsed}</span>
            </span>
          )}
        </div>
      )}

      {/* Phase 5 Date Display */}
      {shouldDisplayDates && (
        <div className="mb-3 p-2 bg-indigo-50/50 border border-indigo-100/50 rounded-lg text-xs space-y-1 text-slate-750 animate-in fade-in duration-200">
          {job.offerReceivedDate && (
            <div className="flex justify-between items-center">
              <span className="text-indigo-900/60 font-medium">Offer Recv:</span>
              <span className="font-semibold">
                {formatDate(job.offerReceivedDate)} <span className="text-indigo-600 font-medium">({startDaysText})</span>
              </span>
            </div>
          )}
          {job.employmentEndDate && (
            <div className="flex justify-between items-center">
              <span className="text-indigo-900/60 font-medium">End Date:</span>
              <span className="font-semibold">
                {formatDate(job.employmentEndDate)} <span className="text-indigo-600 font-medium">({endDaysText})</span>
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
        <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
        {format(new Date(job.dateAdded), 'MMM d, yyyy')}
      </div>
    </div>
  );
}
