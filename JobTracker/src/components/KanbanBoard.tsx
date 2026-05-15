"use client";

import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Job, JobStatus } from '@/types/job';
import { JobCard } from './JobCard';
import { JobModal } from './JobModal';
import { Plus, Upload, Info, Briefcase, LogOut } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const COLUMNS: { id: JobStatus; title: string }[] = [
  { id: 'Saved', title: 'Saved' },
  { id: 'Applied', title: 'Applied' },
  { id: 'Interviewing', title: 'Interviewing' },
  { id: 'Offer', title: 'Offer' },
  { id: 'Rejected', title: 'Rejected' },
];

export function KanbanBoard({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('date_added', { ascending: false });
      
    if (!error && data) {
      const mappedJobs: Job[] = data.map((dbJob: any) => ({
        id: dbJob.id,
        company: dbJob.company,
        title: dbJob.title,
        status: dbJob.status as JobStatus,
        priority: dbJob.priority as any,
        dateAdded: dbJob.date_added,
        notes: dbJob.notes || undefined,
        description: dbJob.description || undefined,
        contacts: dbJob.contacts || undefined,
      }));
      setJobs(mappedJobs);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const jobIndex = jobs.findIndex(j => j.id === draggableId);
    if (jobIndex === -1) return;

    const newStatus = destination.droppableId as JobStatus;
    const updatedJob = { ...jobs[jobIndex], status: newStatus };

    // Optimistic UI update
    const newJobs = [...jobs];
    newJobs.splice(jobIndex, 1);
    newJobs.push(updatedJob);
    setJobs(newJobs);

    // Update Supabase
    await supabase.from('jobs').update({ status: newStatus }).eq('id', draggableId);
  };

  const handleAddJob = () => {
    const newJob: Job = {
      id: uuidv4(), // We generate ID locally but it will be replaced by Supabase on insert, or we can use it if Supabase accepts it. Supabase uses uuid_generate_v4() by default. It's safe to insert our UUID.
      company: '',
      title: '',
      status: 'Saved',
      priority: 'Medium',
      dateAdded: new Date().toISOString(),
    };
    setSelectedJob(newJob);
  };

  const handleUpdateJob = async (updatedJob: Job) => {
    const exists = jobs.some(j => j.id === updatedJob.id);
    
    // Prepare data for Supabase
    const dbJob = {
      id: updatedJob.id,
      user_id: userId,
      company: updatedJob.company,
      title: updatedJob.title,
      status: updatedJob.status,
      priority: updatedJob.priority,
      notes: updatedJob.notes,
      description: updatedJob.description,
      contacts: updatedJob.contacts,
      date_added: updatedJob.dateAdded,
    };

    if (exists) {
      // Optimistic update
      setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
      await supabase.from('jobs').update(dbJob).eq('id', updatedJob.id);
    } else {
      // Optimistic insert
      setJobs(prev => [...prev, updatedJob]);
      await supabase.from('jobs').insert([dbJob]);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setSelectedJob(null);
    await supabase.from('jobs').delete().eq('id', jobId);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const importedJobs: Job[] = data.map((row: any) => ({
        id: uuidv4(),
        company: row.Company || 'Unknown Company',
        title: row.Title || 'Unknown Title',
        status: ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'].includes(row.Status) ? row.Status : 'Saved',
        priority: ['Low', 'Medium', 'High'].includes(row.Priority) ? row.Priority : 'Medium',
        dateAdded: row.DateAdded ? new Date(row.DateAdded).toISOString() : new Date().toISOString(),
        notes: row.Notes || '',
        description: row.Description || '',
        contacts: row.Contacts || '',
      }));

      // Optimistic
      setJobs(prev => [...prev, ...importedJobs]);

      // Bulk insert to Supabase
      const dbJobs = importedJobs.map(j => ({
        id: j.id,
        user_id: userId,
        company: j.company,
        title: j.title,
        status: j.status,
        priority: j.priority,
        notes: j.notes,
        description: j.description,
        contacts: j.contacts,
        date_added: j.dateAdded,
      }));
      await supabase.from('jobs').insert(dbJobs);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Top Nav Bar */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">JobTracker</h1>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import Excel</span>
          </button>
          
          <button 
            onClick={handleAddJob}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Job</span>
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50/50 p-4 sm:p-6">
        <div className="mb-4 flex items-center space-x-2 text-xs sm:text-sm text-gray-500 bg-white px-3 sm:px-4 py-2 rounded-lg border shadow-sm w-max max-w-full overflow-hidden">
          <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="truncate">Excel Format: <strong>Company, Title, Status, Priority, Notes, Description, Contacts, DateAdded</strong></span>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 sm:space-x-6 min-w-max h-[calc(100vh-140px)] pb-4">
            {COLUMNS.map((col) => {
              const columnJobs = jobs.filter(j => j.status === col.id);
              
              return (
                <div key={col.id} className="w-72 sm:w-80 flex flex-col bg-gray-100/80 rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-200/60 h-full">
                  <div className="flex justify-between items-center mb-3 sm:mb-4 px-1">
                    <h2 className="font-bold text-gray-700 tracking-tight flex items-center text-sm sm:text-base">
                      {col.title}
                      <span className="ml-2 text-xs font-semibold bg-white text-gray-500 px-2 py-0.5 rounded-full shadow-sm">
                        {columnJobs.length}
                      </span>
                    </h2>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto min-h-[150px] transition-colors rounded-xl p-1
                          ${snapshot.isDraggingOver ? 'bg-indigo-50 border-2 border-dashed border-indigo-200' : ''}
                        `}
                      >
                        {columnJobs.map((job, index) => (
                          <Draggable key={job.id} draggableId={job.id} index={index}>
                            {(provided, snapshot) => (
                              <JobCard 
                                job={job}
                                onClick={setSelectedJob}
                                innerRef={provided.innerRef}
                                draggableProps={provided.draggableProps}
                                dragHandleProps={provided.dragHandleProps}
                                isDragging={snapshot.isDragging}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {selectedJob && (
        <JobModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
          onUpdate={handleUpdateJob}
          onDelete={handleDeleteJob}
        />
      )}
    </div>
  );
}
