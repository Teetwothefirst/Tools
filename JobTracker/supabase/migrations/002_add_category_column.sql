-- Migration to add category column to jobs table
ALTER TABLE public.jobs ADD COLUMN category TEXT DEFAULT 'Other';
