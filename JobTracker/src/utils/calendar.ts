import { Job } from '@/types/job';
import { addDays, format } from 'date-fns';

export function generateGoogleCalendarLink(job: Job, followUpDays: number = 7): string {
  const followUpDate = addDays(new Date(), followUpDays);
  
  // Google Calendar dates format: YYYYMMDDTHHmmssZ
  const formattedDate = format(followUpDate, "yyyyMMdd'T'HHmmss'Z'");
  // End date can just be 1 hour later
  const endDate = format(addDays(followUpDate, 0), "yyyyMMdd'T'HHmmss'Z'"); // For a simple all-day or specific time, we can adjust. Actually let's make it an all-day event.
  const allDayDate = format(followUpDate, 'yyyyMMdd');
  const allDayNext = format(addDays(followUpDate, 1), 'yyyyMMdd');

  const text = encodeURIComponent(`Follow up with ${job.company} for ${job.title} role`);
  const details = encodeURIComponent(`Remember to follow up on your job application for the ${job.title} position at ${job.company}.\n\nJob Notes:\n${job.notes || 'None'}`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${allDayDate}/${allDayNext}&details=${details}`;
}
