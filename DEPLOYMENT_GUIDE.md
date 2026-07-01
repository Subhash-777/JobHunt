# JobHunt India — Production Deployment Guide

This guide provides step-by-step instructions for deploying JobHunt India to production.

---

## 1. Supabase Production Setup

To host the backend database, authentication, and file storage in a production-ready environment:

1. **Create a Production Project**:
   - Go to the [Supabase Dashboard](https://supabase.com).
   - Click **New Project** and select your organization.
   - Enter `JobHunt India Production` as the name, generate a strong database password (keep this secure), and select your closest AWS region (e.g., `ap-south-1` Mumbai).
   
2. **Execute Database Migrations**:
   - Navigate to the **SQL Editor** in the left sidebar.
   - Click **New Query** and run the contents of the migration files in order:
     1. [0001_initial_schema.sql](file:///home/subhash/projects/JobHunt/supabase/migrations/0001_initial_schema.sql)
     2. [0002_auth_trigger.sql](file:///home/subhash/projects/JobHunt/supabase/migrations/0002_auth_trigger.sql)
     3. [0003_applications_unique.sql](file:///home/subhash/projects/JobHunt/supabase/migrations/0003_applications_unique.sql)
     4. [0004_mock_sessions.sql](file:///home/subhash/projects/JobHunt/supabase/migrations/0004_mock_sessions.sql)
     5. [0005_fix_auth_trigger.sql](file:///home/subhash/projects/JobHunt/supabase/migrations/0005_fix_auth_trigger.sql)
   - Ensure all queries run without errors.

3. **Enable Required Extensions**:
   - Run the following SQL to make sure required extensions are active:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
     CREATE EXTENSION IF NOT EXISTS pg_cron;
     CREATE EXTENSION IF NOT EXISTS pg_trgm;
     CREATE EXTENSION IF NOT EXISTS unaccent;
     ```

4. **Enable Google OAuth in Supabase Auth**:
   - Go to **Authentication** -> **Providers** -> **Google**.
   - Set **Client ID** and **Client Secret** (obtained in the Google Cloud Setup section below).
   - Copy the **Redirect URL** from Supabase to configure Google OAuth.

5. **Create Storage Buckets**:
   - Navigate to **Storage** in the sidebar.
   - Click **New Bucket**.
   - Name: `resumes`.
   - Toggle **Public bucket** to **OFF** (Keep it Private).
   - In **Allowed media types**, specify `application/pdf`.
   - Set the size limit to **5MB** (5242880 bytes).

6. **Authentication Rate Limits**:
   - Under **Authentication** -> **Settings**, re-enable email confirmations for signup (previously disabled during development).
   - Adjust security rate limits to protect your endpoints in production.

7. **Retrieve Environment Credentials**:
   - Go to **Project Settings** -> **API**.
   - Note the production `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 2. Google Cloud Project Setup

Used to handle calendar synchronization (Google Calendar API):

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com).
   - Click the project dropdown and click **New Project**.
   - Name: `JobHunt India Production` and click **Create**.

2. **Enable Google Calendar API**:
   - Navigate to **APIs & Services** -> **Library**.
   - Search for **Google Calendar API**.
   - Click **Google Calendar API** and then **Enable**.

3. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services** -> **OAuth consent screen**.
   - User Type: Select **External**.
   - App registration fields:
     - App name: `JobHunt India`
     - User support email: Select your email
     - Developer contact information: Enter your email
   - **Scopes**: Add or remove scopes. Select `.../auth/calendar` and `.../auth/calendar.events` (read/write access to Google Calendar).
   - Save and continue. Add test users if the app is kept in "Testing" mode.

4. **Create OAuth 2.0 Client ID Credentials**:
   - Go to **APIs & Services** -> **Credentials**.
   - Click **Create Credentials** -> **OAuth client ID**.
   - Application Type: **Web application**.
   - Name: `JobHunt India Web Client`.
   - **Authorized JavaScript origins**:
     - `https://your-domain.vercel.app` (and `http://localhost:3000` for development)
   - **Authorized redirect URIs**:
     - `https://your-domain.vercel.app/api/calendar/google/callback`
   - Click **Create** and copy the **Client ID** and **Client Secret**.

---

## 3. Free AI API Credentials

JobHunt India uses a dynamic cascading model using only free tiers:

1. **Groq Key**:
   - Sign up at [console.groq.com](https://console.groq.com).
   - Go to **API Keys** and generate a new key. Note it as `GROQ_API_KEY`.
   - Allows up to 14,400 free requests per day.

2. **OpenRouter Key**:
   - Sign up at [openrouter.ai](https://openrouter.ai).
   - Go to **API Keys** and generate a key. Note it as `OPENROUTER_API_KEY`.
   - Confirm free models are available by running:
     ```bash
     curl https://openrouter.ai/api/v1/models \
       -H "Authorization: Bearer $OPENROUTER_API_KEY" | grep ":free"
     ```

3. **Google Gemini Key**:
   - Sign up at [aistudio.google.com](https://aistudio.google.com).
   - Click **Get API Key** and create a key in an existing project. Note it as `GEMINI_API_KEY`.

4. **HuggingFace Access Token** (for vector embedding conversions):
   - Register at [huggingface.co](https://huggingface.co).
   - Go to **Profile** -> **Settings** -> **Access Tokens**.
   - Create a token with `read` scope. Note it as `HF_TOKEN`.

---

## 4. SerpApi (Trust-Verification Scraper)

Used as a supplementary source for validating Company Discovery requests:

1. Sign up at [serpapi.com](https://serpapi.com).
2. Note your key as `SERPAPI_KEY` (Free tier offers 100 searches/month).

---

## 5. GitHub Repository Setup (Ingestion CI/CD)

The ingestion pipeline scrapes ATS boards and India-specific portals in the background:

1. **Verify Workflow**:
   - Ensure the scraper action script is committed at `.github/workflows/ingest.yml`.

2. **Add Secrets**:
   - Go to your repository on GitHub.
   - Click **Settings** -> **Secrets and variables** -> **Actions**.
   - Click **New repository secret** and add the following:
     - `SUPABASE_URL`: Production Supabase URL
     - `SUPABASE_SERVICE_ROLE_KEY`: Production Supabase Service Role Key
     - `GROQ_API_KEY`: Groq API Key
     - `OPENROUTER_API_KEY`: OpenRouter API Key
     - `GEMINI_API_KEY`: Gemini API Key
     - `HF_TOKEN`: HuggingFace Token
     - `SERPAPI_KEY`: SerpApi Key
     
3. **Trigger Scrape manually**:
   - Go to the **Actions** tab in the GitHub Repository.
   - Select the `Ingest Jobs` workflow.
   - Click **Run workflow** -> **Run workflow** (select tier 1/2) and confirm it finishes successfully.

---

## 6. Vercel Deployment

Host the Next.js frontend and API route handlers:

1. **Import Project**:
   - Go to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
   - Import your GitHub repository.

2. **Build Settings**:
   - Preset: **Next.js** (Auto-detected).
   - Directory: `./` (Root).

3. **Environment Variables**:
   - Add all credentials exactly as configured in your local `.env.local`:
     - `NEXT_PUBLIC_APP_URL` (your custom production domain or Vercel URL)
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `GOOGLE_CALENDAR_CLIENT_ID`
     - `GOOGLE_CALENDAR_CLIENT_SECRET`
     - `GROQ_API_KEY`
     - `OPENROUTER_API_KEY`
     - `GEMINI_API_KEY`
     - `HF_TOKEN`
     - `SERPAPI_KEY`
   - **Important**: Make sure to check **Encrypt / Sensitive** for variables containing secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `HF_TOKEN`).

4. **Update OAuth Redirects**:
   - Once Vercel deploys, copy the live URL (e.g. `https://jobhunt-india.vercel.app`).
   - Go back to **Google Cloud Console Credentials** and update the **Authorized redirect URIs** to:
     `https://your-domain.vercel.app/api/calendar/google/callback`
   - Go back to **Supabase Auth Provider Settings** and update the Google OAuth Redirect URL.

---

## 7. Post-Deployment Verification Checklist

Verify these 7 items manually on your production deployment URL before launch:

- [ ] **Sign Up Flow**: Register a new user at `/auth/signup`. Ensure the email confirmation arrives, and check that a profile is automatically created in the Supabase database with `user_type` = `'student'`.
- [ ] **Profile Completion**: Complete the onboarding profile (graduation year, skills, branches) and confirm eligibility chips appear correctly on the feed.
- [ ] **Calendar Event Integration**: Authenticate your Google Account via the Profile page, save a job from the feed, and confirm a deadline event appears on your Google Calendar with a 2-day-prior reminder.
- [ ] **Watchlist Delta events**: Create a watchlist keyword alert, manually insert a matching job, trigger ingestion, and check that a same-day all-day event appears in your Google Calendar representing the new match.
- [ ] **Fit Score Rings**: Confirm the circular Fit Score badge on job details animations runs smoothly and computes correct percentages using the AI Cascade.
- [ ] **Lighthouse Performance**: Run a Lighthouse Audit on the main feed page. Target score: **Lighthouse ≥ 90** for both Performance and Accessibility.
- [ ] **Security Sanitization**: Open Chrome Developer Tools, go to the Network tab, reload pages, and verify that no secret keys (e.g. `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, etc.) are exposed in any client-side bundle or API headers.
