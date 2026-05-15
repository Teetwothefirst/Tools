import { Job } from '@/types/job';
import { CalendarDays, Building2, Briefcase } from 'lucide-react';
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
          <span className="truncate max-w-[140px] text-sm">{job.company}</span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${priorityColors[job.priority]}`}>
          {job.priority}
        </span>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {job.title}
        </h3>
      </div>
      
      <div className="flex items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
        <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
        {format(new Date(job.dateAdded), 'MMM d, yyyy')}
      </div>
    </div>
  );
}
