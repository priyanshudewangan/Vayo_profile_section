# Bypassing Vercel Hobby Plan Collaboration Restrictions on Private Repositories

This document outlines a simple, automated workaround for deploying private repositories to Vercel on a **Hobby Plan** when multiple developers are contributing to the project.

---

## The Problem

Vercel's **Hobby Plan** allows you to deploy private repositories for free, but it has a strict collaboration policy:
* If Vercel detects that a commit was authored by a user who is not the Vercel project owner, it will **block the deployment**.
* Vercel will present an error stating:  
  `The Hobby Plan does not support collaboration for private repositories. Please upgrade to Pro to add team members.`

Vercel checks this by reading the local Git commit metadata (`.git` directory) when building or deploying the application.

---

## The Workaround

To deploy without upgrading to a Pro Plan, you can temporarily hide the `.git` directory from the Vercel CLI during the deployment command. This forces Vercel to treat the codebase as a standalone folder upload instead of a Git repository, bypassing the collaborator checks.

### Automated CLI Deploy Script

Add a custom `deploy` script to your project's `package.json` file.

#### Bash/macOS/Linux
Add the following to the `"scripts"` block in your `package.json`:

```json
"scripts": {
  "deploy": "mv .git temp_git && npx vercel --prod --yes && mv temp_git .git"
}
```

#### How it works:
1. **`mv .git temp_git`**  
   Temporarily renames the `.git` directory to `temp_git`. The directory is no longer visible as a Git repository to the Vercel CLI.
2. **`npx vercel --prod --yes`**  
   Runs the Vercel CLI to trigger a production deployment. Since there is no `.git` directory, Vercel uploads the raw project files without author metadata. The `--yes` flag skips CLI confirmations.
3. **`mv temp_git .git`**  
   Renames the directory back to `.git` immediately after deployment. This restores your local Git repository safely, ensuring your local work history remains intact.

---

## Setup & First-Time Deployment

Before running the deploy script on a new project, follow these steps to link the project to your Vercel account:

### Step 1: Login to Vercel CLI
If you haven't logged in, authenticate your CLI session:
```bash
npx vercel login
```

### Step 2: Link your Project
Run the initial setup to link the local repository to a Vercel project:
```bash
npx vercel link
```
Follow the interactive prompts:
* Confirm you want to link the project.
* Choose your Vercel scope (account or team).
* Link to an existing project or create a new one.

This will generate a `.vercel/` directory containing your project credentials (`project.json`).

### Step 3: Run the Deploy Command
Now you can deploy your application at any time with:
```bash
npm run deploy
```

---

## Alternative Solutions

If you prefer not to use the directory renaming workaround, you have two alternative paths:

1. **Make the Git Repository Public**  
   Vercel allows unlimited collaborators on **public** Git repositories under the Hobby Plan. If your codebase does not contain sensitive IP, changing the GitHub repository visibility to Public will solve the issue permanently.
2. **Upgrade to Vercel Pro**  
   Upgrading to the Pro tier allows you to add team members to your Vercel team, enabling collaboration on private repositories natively.
