For Phase 6 I am looking into AI integration where instead of filling all the job details manually you can just paste in the job description and the AI will extract all the details and fill the form automatically. The form should be filled in such a way that it is easy to edit and correct if needed.

In terms of UI I am looking into a new UI for the job tracker which is more modern and user friendly. I am thinking of a dashboard style UI where you can see all the job cards in a grid format and also a calendar view where you can see the job cards in a calendar format. I am also thinking of a dark mode for the job tracker.

The job tracking UI should be very responsive and also provide an overall experience. I am looking to add a feature that can also show the data in a cv format where you can see the job details in a cv format and also a calendar view where you can see the job cards in a calendar format. I am also thinking of a dark mode for the job tracker.

I want the dashboard to have some key statistics about the job tracker, such as the number of jobs in each status, the number of jobs in each priority, the number of jobs in each category, etc. These stats should be displayed in a way that is easy to understand and digest.






Phase 6: AI Extraction & Modern Dashboard
This phase implements a major upgrade to the JobTracker application:

AI Autofill / Extraction: Paste in a job description and automatically extract key fields (company, title, priority, pay/salary, contacts, category, summary, skills) using Gemini 2.5 Flash. The extracted details populate the form in real time, making them easy to edit before saving.
Modern Dashboard UI: A premium, responsive interface featuring layout tabs to switch views, a sidebar/header, statistics dashboard cards, and a dark/light mode toggle.
Multi-View System:
Overview / Stats: Visual metrics showing counts by status, priority, and category, plus recent activity and basic analytics.
Kanban Board: Drag-and-drop workflow styled for light & dark modes.
Grid View: Searchable, filterable card grid.
Calendar View: Monthly layout plotting applications, offers, and deadlines.
CV View: CV preview and configuration mode embedded directly as a dashboard tab.
Category Support: Introduce a category field (e.g. Engineering, Design, Product, etc.) to categorize applications.
User Review Required
IMPORTANT

Database Schema Update Needed Since this is a remote Supabase database and we don't have superuser/admin credentials, a migration SQL script supabase/migrations/002_add_category_column.sql is provided. You will need to run the content of this script in your Supabase project SQL Editor to add the category column to the jobs table.

Graceful Fallback: The code will gracefully handle scenarios where the database column has not been added yet by verifying database actions, but full functionality requires running the migration.

Proposed Changes
Database & Schema
[NEW] 
002_add_category_column.sql
SQL migration file to add the category column to jobs table.
[MODIFY] 
job.ts
Add category?: string to Job interface.
AI Integration
[NEW] 
route.ts
Create a POST endpoint /api/extract that:
Takes a raw job description (and optional jobLink).
Calls Gemini 2.5 Flash with a structured prompt.
Returns JSON containing: company, title, priority, payAmount, contacts, category, summary, and skills.
[MODIFY] 
JobModal.tsx
Integrate a new "AI Autofill" panel at the top.
Include a text area to paste job descriptions and an "Extract with AI" button.
Dynamically fill out the fields (Company, Title, Priority, Contacts, Salary, Category, Notes, and Description) on extraction.
Allow the user to review, edit, and click "Save Changes".
UI Components & Views
[MODIFY] 
JobCard.tsx
Adjust styling to support light/dark modes (dark:bg-slate-900, etc.).
Render the category badge on cards.
[MODIFY] 
KanbanBoard.tsx
Implement state-level support for views: 'overview' | 'kanban' | 'grid' | 'calendar' | 'cv'.
Implement a modern responsive dashboard structure with sidebar/header navigation, dark mode toggler, and layout view tabs.
Pass category in Supabase update and insert queries.
Build/integrate sub-views inside the dashboard page (Overview/Statistics, Grid View, Calendar View, CV View).
[MODIFY] 
globals.css
Add custom utility classes for calendar view styling, print overrides, and variables supporting transition-based light/dark theme selectors.
Verification Plan
Automated Tests
Since this is primarily a UI and integration update, run existing Playwright tests to ensure auth routing remains correct:
bash

npx playwright test
Manual Verification
Run local development environment:
bash

npm run dev
Log in to the application and navigate to the dashboard.
Verify that the dark mode toggle functions correctly across all views (colors shift smoothly, text remains highly legible, cards have matching contrast).
Verify the Dashboard Overview stats (totals matching each status, priority, and category columns).
Switch to Grid View, search for jobs, and verify filtering.
Switch to Calendar View and verify that cards display correctly on dates.
Click "Add Job" -> click "AI Autofill" -> paste a test job description -> click "Extract". Verify that input fields are correctly filled and editable. Save changes and verify they are persisted to Supabase.
