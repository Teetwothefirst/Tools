# JobTracker

JobTracker is a modern, AI-powered Kanban-style job application tracking system designed to streamline the job hunt process. Built with speed and usability in mind, it allows users to visually organize their applications, import data in bulk, and leverage AI to instantly extract key insights from dense job descriptions.

## 🚀 Key Features

*   **Interactive Kanban Board:** Visually manage job applications through customizable columns (`Saved`, `Applied`, `Interviewing`, `Offer`, `Rejected`) with smooth drag-and-drop interactions.
*   **AI-Powered Summarization:** Paste a job description into a card and use the integrated Gemini AI to instantly extract a concise 3-bullet-point summary and the top 5 technical skills required for the role.
*   **Bulk Excel/CSV Import:** Quickly onboard your existing job hunt data by importing `.xlsx`, `.xls`, or `.csv` files directly into your board.
*   **Google Calendar Integration:** Never miss a follow-up. Generate and schedule one-click follow-up reminders directly to your Google Calendar.
*   **Cloud Synchronization:** Powered by Supabase, ensuring all your job cards, statuses, and notes are securely stored and synced across devices in real-time.
*   **Mobile Responsive:** A clean, tailored layout that ensures a seamless experience on both desktop and mobile devices.

## 🛠️ Technology Stack

*   **Frontend:** [Next.js (App Router)](https://nextjs.org/) & [React](https://react.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
*   **Drag & Drop:** [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
*   **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security)
*   **AI Integration:** [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
*   **Testing:** [Playwright](https://playwright.dev/) for End-to-End Testing

## 📦 Local Development Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Database Migration:**
   Run the SQL script located at `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor to set up the necessary `jobs` table and Row-Level Security (RLS) policies.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000`. You will be prompted to create an account or log in.

## 🧪 End-to-End Testing

To ensure reliability, the application uses Playwright for E2E testing. 

1. Install required browsers:
   ```bash
   npx playwright install
   ```
2. Run the test suite:
   ```bash
   npx playwright test
   ```

## 📋 Excel Import Format
When importing an Excel or CSV file, ensure your columns are named exactly as follows:
`Company`, `Title`, `Status`, `Priority`, `Notes`, `Description`, `Contacts`, `DateAdded`
