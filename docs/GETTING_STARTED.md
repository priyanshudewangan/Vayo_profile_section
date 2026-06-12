# VAYO Onboarding & Setup Guide

Welcome to the **VAYO Commune** codebase! This guide is designed for new developers to quickly set up the project locally on their computer, understand the Git branching workflow, and resolve any database or backend issues they might face.

---

## 📌 Project Overview
VAYO consists of two frontend components and a Supabase backend:
1. **Main Portal (Next.js)**: Located in the root directory. Manages landing page, user waitlist registry, and admin tools.
2. **Profile Sub-App (Vite + React)**: Located in `Profile_vayo/`. Renders the personal/social/business dashboard.
3. **Supabase Backend**: Manages user waitlists, authentication passwords, and selfie uploads.

---

## 🛠️ Step 1: Open and Clone the Project

### 1. Clone the Repository
Open your terminal (Terminal on macOS/Linux, Git Bash or Command Prompt on Windows) and run:
```bash
# Clone the repository
git clone https://github.com/LanewayIndia/Vayo_temp.git

# Navigate into the project folder
cd Vayo_temp
```

### 2. Open in VS Code (or your preferred editor)
If you have the `code` command configured in your path:
```bash
code .
```
Otherwise, open your editor manually, select **Open Folder**, and select the `Vayo_temp` directory.

---

## 🌿 Step 2: Git Branching Workflow
To avoid overwriting each other's code or breaking production, we follow a strict branching model.

### 1. Get the Latest Code
Never work directly on the `main` branch. Before starting, update your local `main` branch:
```bash
git checkout main
git pull origin main
```

### 2. Create a Feature Branch
Create a new branch for the feature or fix you are working on. Name your branch using lowercase and hyphens:
* Format: `feature/your-name-short-description` or `bugfix/your-name-short-description`
* Example: `feature/joy-add-user-badges`

To create and switch to it:
```bash
git checkout -b feature/your-name-short-description
```

### 3. Save Your Changes
Commit your work with descriptive messages:
```bash
git add .
git commit -m "feat: implement verified founder badges on profile"
```

### 4. Push and Merge
Push your branch to GitHub and open a Pull Request (PR):
```bash
git push origin feature/your-name-short-description
```
Ask another team member to review your code before merging it into `main`.

---

## 🗄️ Step 3: Setting Up the Backend (Supabase & Resend)

A common issue for new developers is that the signup or dashboard page fails because their local project isn't connected to a database. Follow these steps to configure Supabase:

### 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and log in or create a free account.
2. Click **New Project** and choose a name (e.g., `Vayo Local Dev`).
3. Set a database password (save this safely) and choose a server location closest to you.
4. Wait a couple of minutes for the project to provision.

### 2. Create the Database Schema (Waitlist Table)
Our authentication and application flow queries a custom table called `waitlist`. 
1. In your Supabase Dashboard, click on **SQL Editor** (the `>_` icon on the left sidebar).
2. Click **New Query**.
3. Paste the following SQL schema command and click **Run**:

```sql
-- Create the waitlist table
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  phone text,
  birthdate date,
  instagram text,
  interests text[] default '{}',
  selfie_url text,
  status text default 'Pending', -- Can be 'Pending', 'Approved', 'Sent'
  password text, -- SHA-256 hashed password
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) or disable for testing
-- For fast local setup, you can disable RLS or add policies:
alter table waitlist disable row level security;
```

> [!NOTE]
> We disable Row Level Security (RLS) here for rapid development setup. For staging or production, create custom RLS policies allowing insert for anonymous users and select/update for authenticated admins.

### 3. Create the Storage Bucket (for Selfie Uploads)
When applying for the waitlist, users upload a selfie for verification. 
1. In the Supabase sidebar, click on **Storage** (bucket icon).
2. Click **New Bucket**.
3. Set the name to exactly `selfies`.
4. **Crucial**: Toggle the **Public** option **ON** (so uploaded selfies can be viewed via public links).
5. Click **Save**.
6. Set Up Policies: Click on **Policies** for the `selfies` bucket:
   * Create an **Insert** policy: Allow anyone (anon) to upload files.
   * Create a **Select** policy: Allow anyone (anon) to read files.

### 4. Set Up Resend (For Onboarding Emails)
1. Go to [Resend](https://resend.com) and create a free account.
2. In the sidebar, go to **API Keys** and click **Create API Key** (give it full access). Copy the key.
3. If you have a custom domain, add it under **Domains** to send email from your brand. If not, you can test emails using their default sandbox domain, sending only to your registered account email.

---

## 🔑 Step 4: Configure Local Environment Variables

1. In the root directory of your cloned codebase, find or create a `.env.local` file.
2. Fill it out with your credentials like so:

```env
# Supabase Configuration
# (Found in Supabase: Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"

# Admin Dashboard Password (used to access admin pages)
ADMIN_PASSWORD="your_custom_admin_password"

# Resend API Key for Sending Emails
RESEND_API_KEY="re_your-resend-api-key"

# WhatsApp Group Invite Link
WHATSAPP_LINK="https://chat.whatsapp.com/your-group-invite-id"
```

---

## 🚀 Step 5: Running the Next.js Main Frontend

Once the database and environment variables are set up, start the main application:

### 1. Install Dependencies
In the root directory of the project, run:
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser. You should see the landing page!

---

## 💻 Step 6: Running the Profile Sub-App (`Profile_vayo`)

The profile section runs in a separate Vite-based React sub-directory. 

### 1. Navigate to the Directory
In a new terminal window, run:
```bash
cd Profile_vayo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Vite Dev Server
```bash
npm run dev
```
Open the local server link shown in your terminal (usually [http://localhost:5173](http://localhost:5173)) to view the dynamic interactive profile dashboard.

---

## ☁️ Step 7: Deploying Your Changes (Vercel Workaround)

If you are deploying to **Vercel** on a free **Hobby Plan**, Vercel blocks deployments on private repositories if commits are authored by multiple collaborators. 

We have automated a workaround inside `package.json`'s `deploy` script:
```bash
# To build and push your local workspace build straight to production:
npm run deploy
```
* **How it works**: The script temporarily renames `.git` to `temp_git`, runs `npx vercel --prod --yes` to upload the folder contents, and then restores `.git`. This bypasses collaborator email scanning.

---

## ❓ Troubleshooting & FAQs

#### 🔴 Error: `Failed to upload image. Please verify you created the 'selfies' bucket...`
* **Fix**: Make sure you created a bucket named exactly `selfies` (lowercase) in the Supabase Storage console, and marked it **Public**.

#### 🔴 Error: `Supabase credentials missing.`
* **Fix**: Check that your `.env.local` file is in the **root** folder, and the keys are named correctly. Restart the dev server (`npm run dev`) after editing `.env.local`.

#### 🔴 Error: `Mail delivery failed...`
* **Fix**: If using a free Resend key without a verified domain, you can only send emails to the email address you signed up to Resend with. To send to any user, verify a domain in the Resend dashboard. Alternatively, test the API with `simulate: true` in the request body to bypass email sending.
