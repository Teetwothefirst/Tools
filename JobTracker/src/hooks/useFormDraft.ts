"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Job } from "@/types/job";

export const DRAFT_STORAGE_KEY = "jobtracker_form_draft";

export interface StoredDraft {
  job: Job;
  isNew: boolean;
  timestamp: number;
}

/**
 * Utility to get saved draft from localStorage
 */
export function getSavedDraft(): StoredDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDraft;
  } catch (error) {
    console.error("Failed to parse form draft from localStorage", error);
    return null;
  }
}

/**
 * Utility to clear saved draft from localStorage
 */
export function clearSavedDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear form draft from localStorage", error);
  }
}

/**
 * Utility to save draft directly to localStorage
 */
export function saveDraftToStorage(job: Job, isNew: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const draftData: StoredDraft = {
      job,
      isNew,
      timestamp: Date.now(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
  } catch (error) {
    console.error("Failed to save form draft to localStorage", error);
  }
}

/**
 * Compares two Job objects to determine if there are unsaved edits.
 */
export function isJobModified(original: Job | null, current: Job | null): boolean {
  if (!current) return false;
  if (!original) return true;

  const fieldsToCompare: (keyof Job)[] = [
    "company",
    "title",
    "status",
    "priority",
    "notes",
    "description",
    "contacts",
    "mailUsed",
    "payAmount",
    "jobLink",
    "offerReceivedDate",
    "employmentEndDate",
    "category",
  ];

  return fieldsToCompare.some(
    (field) => (original[field] || "") !== (current[field] || "")
  );
}

interface UseFormDraftOptions {
  originalJob: Job | null;
  editedJob: Job | null;
  isNewJob: boolean;
  onSetEditedJob: (job: Job) => void;
}

export function useFormDraft({
  originalJob,
  editedJob,
  isNewJob,
  onSetEditedJob,
}: UseFormDraftOptions) {
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const isInitialMount = useRef(true);

  // Check if draft was restored on initial modal mount
  useEffect(() => {
    if (!editedJob) {
      setIsDraftRestored(false);
      isInitialMount.current = true;
      return;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      const savedDraft = getSavedDraft();
      if (savedDraft && savedDraft.job.id === editedJob.id) {
        // If the draft contains changes compared to original, restore it
        if (isJobModified(originalJob, savedDraft.job)) {
          onSetEditedJob(savedDraft.job);
          setIsDraftRestored(true);
        }
      }
    }
  }, [editedJob?.id, originalJob]);

  // Determine if current state is dirty
  const isDirty = isJobModified(originalJob, editedJob);

  // Auto-save draft to localStorage whenever editedJob changes and is dirty
  useEffect(() => {
    if (!editedJob) return;

    if (isDirty) {
      saveDraftToStorage(editedJob, isNewJob);
    }
  }, [editedJob, isDirty, isNewJob]);

  // Window beforeunload event protection when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const discardDraft = useCallback(() => {
    clearSavedDraft();
    setIsDraftRestored(false);
    if (originalJob) {
      onSetEditedJob(originalJob);
    }
  }, [originalJob, onSetEditedJob]);

  return {
    isDirty,
    isDraftRestored,
    discardDraft,
    clearDraft: clearSavedDraft,
  };
}
