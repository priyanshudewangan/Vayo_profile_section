# VAYO - Domain Verification & Email Setup Guide

This guide explains how to move the **Forgot Password** and **Invitation** email system from "Test Mode" to "Production Mode" after you deploy your website.

---

## 1. Why do I need to do this?
Currently, the email service (**Resend**) is in **Sandbox Mode**. This means it will only send emails to *you*. To send reset passwords to *any user*, you must prove you own your domain (e.g., `vayo.in`).

---

## 2. Step-by-Step Instructions

### Step A: Add Domain to Resend
1. Log in to the [Resend Dashboard](https://resend.com/domains).
2. Click **"Add Domain"**.
3. Type in your domain name (e.g., `vayo.in`).
4. Select your region (usually "us-east-1").
5. Click **Add**.

### Step B: Update DNS Records
Resend will show you a table with **3 DNS records** (usually 1 TXT record and 2 MX/CNAME records).
1. Log in to your domain provider (GoDaddy, Hostinger, Namecheap, etc.).
2. Go to **DNS Management** for your domain.
3. Copy the values from Resend and paste them into your domain provider's settings.
4. Go back to Resend and click **"Verify"**.
   - *Note: It may take 10-60 minutes for the status to change to "Verified".*

### Step C: Update the "From" Address in Code
Once verified, you must update the "From" address in your VAYO code to match your domain.

**File:** `src/app/api/forgot-password/route.js`  
**File:** `src/app/api/admin/send-invite/route.js`

Change this line:
```javascript
from: "VAYO Support <onboarding@resend.dev>"
```
To this (example):
```javascript
from: "VAYO Support <support@yourdomain.com>"
```

---

## 3. Production Checklist
Before you launch, ensure these **Environment Variables** are set in your **Vercel Dashboard**:

| Variable | Value |
| :--- | :--- |
| `RESEND_API_KEY` | Your `re_...` key from Resend |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your secret Supabase key |
| `ADMIN_PASSWORD` | Your custom admin dashboard key |

---

## 4. Current "Dev Mode" Behavior
While you are in development, I have enabled **Developer Bypass**. If an email fails to send:
- The system will **still update the password** in the database.
- The new password will be **printed in your terminal/console**.
- This allows you to keep testing without waiting for DNS verification.
