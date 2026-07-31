import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Download, ArrowLeft } from 'lucide-react';
import { pollTaskStatus, TaskStatusResponse, getFullDownloadUrl } from '@/lib/api';

interface TaskProgressModalProps {
  taskId: string | null;
  onClose: () => void;
  title?: string;
}

export const TaskProgressModal: React.FC<TaskProgressModalProps> = ({
  taskId,
  onClose,
  title = "Processing Document"
}) => {
  const [taskState, setTaskState] = useState<TaskStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await pollTaskStatus(taskId);
        if (isSubscribed) {
          setTaskState(res);
          if (res.status === 'SUCCESS' || res.status === 'FAILED') {
            clearInterval(interval);
          }
        }
      } catch (err: any) {
        if (isSubscribed) {
          setError(err.message || "Failed to fetch task progress.");
          clearInterval(interval);
        }
      }
    }, 1200);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [taskId]);

  if (!taskId) return null;

  const isSuccess = taskState?.status === 'SUCCESS';
  const isFailed = taskState?.status === 'FAILED' || !!error;
  const progress = taskState?.progress || 10;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
        >
          <div className="text-center">
            {isSuccess ? (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            ) : isFailed ? (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400 mb-4">
                <XCircle className="h-10 w-10" />
              </div>
            ) : (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 mb-4">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            )}

            <h3 className="text-xl font-bold text-white">{title}</h3>
            
            <p className="text-sm text-slate-400 mt-1">
              {isSuccess
                ? "Your document processing is complete!"
                : isFailed
                ? error || taskState?.error || "An error occurred during processing."
                : "Converting layout, streams, and pages..."}
            </p>

            {!isSuccess && !isFailed && (
              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-500 to-blue-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              {isSuccess && taskState?.download_url && (
                <a
                  href={getFullDownloadUrl(taskState.download_url)}
                  download
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-blue-500 py-3.5 px-4 font-semibold text-white shadow-lg shadow-brand-500/25 hover:from-brand-500 hover:to-blue-400 transition-all"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Processed Document</span>
                </a>
              )}

              <button
                onClick={onClose}
                className={`flex items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors ${
                  isSuccess ? 'bg-slate-850' : 'w-full'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{isSuccess ? "Process Another Document" : "Cancel / Close"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
