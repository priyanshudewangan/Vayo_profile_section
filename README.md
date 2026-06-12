# VAYO Commune Portal

Welcome to the development repository for the VAYO Commune. VAYO is a high-vibe community platform combining online matchings and offline curated mixers.

---

## 🚀 Getting Started

If you are a new developer or setting up this project on your computer for the first time, please read our **[Setup &amp; Onboarding Guide](file:///Users/chata/Desktop/Vayo_temp/docs/GETTING_STARTED.md)**.

It covers:

- Git cloning and branching workflows
- Database schemas for Supabase
- Storage bucket configurations for selfie verification
- Step-by-step instructions to run the main portal and the profile sub-app

---

## 📂 Project Structure

This project is divided into two primary workspaces:

### 1. Main Portal (Next.js App Router)

* **Path**: Root directory (`/`)
* **Commands**: `npm run dev` / `npm run build`
* **Purpose**: Waitlist landing pages, registration forms, admin interfaces, and integration APIs.

### 2. Profile Sub-App (Vite + React + TS)

* **Path**: `Profile_vayo/`
* **Commands**: `cd Profile_vayo && npm run dev`
* **Purpose**: Interactive user dashboard showcasing the Karma Points system, dynamic interest badges, tickets, offline circle connections, and event galleries.

---

## 📄 Documentation

Additional guides and roadmaps are available in the `docs/` folder:

* 📘 **[Setup &amp; Onboarding Guide](file:///Users/chata/Desktop/Vayo_temp/docs/GETTING_STARTED.md)** — Core local development guide.
* 🗺️ **[VAYO Roadmap](file:///Users/chata/Desktop/Vayo_temp/docs/VAYO_ROADMAP.md)** — Interactive features plan and milestone progress.
* 📦 **[File Structure Guide](file:///Users/chata/Desktop/Vayo_temp/docs/file_structure.md)** — Breakdown of all key folders and source files.
* ☁️ **[Vercel Collaboration Workaround](file:///Users/chata/Desktop/Vayo_temp/docs/vercel_hobby_deployment_workaround.md)** — How to deploy private repos under Hobby plans without restrictions.

---

## 🛠️ CLI Reference (Root)

Run the following commands in the root directory:

| Command            | Action                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| `npm install`    | Install all dependencies for the Next.js app                             |
| `npm run dev`    | Run Next.js portal locally on[http://localhost:3000](http://localhost:3000) |
| `npm run build`  | Compile Next.js production build                                         |
| `npm run deploy` | Bypass Hobby Plan restrictions and deploy to Vercel                      |

*Note: For the Profile dashboard, run `npm install` and `npm run dev` inside the `Profile_vayo` folder.*
