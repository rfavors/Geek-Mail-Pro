# Mailgun Setup: Step-by-Step Walkthrough

## Step 1: Create Mailgun Account
1. Go to https://www.mailgun.com/
2. Click "Sign Up" (free account gives you 1,000 emails/month)
3. Fill out the form and verify your email

## Step 2: Add Your Domain
1. After login, you'll see the Mailgun dashboard
2. On the left sidebar, click **"Domains"**
3. Click **"Add New Domain"** button
4. Enter: `thegeektrepreneur.com`
5. Choose region: **US** (recommended)
6. Click **"Add Domain"**

## Step 3: Configure DNS Records
1. After adding domain, Mailgun shows you DNS records to add
2. Go to your domain registrar (where you bought thegeektrepreneur.com)
3. Find the DNS management section
4. Add these records exactly as shown in Mailgun:

**Copy these from your Mailgun dashboard:**
- MX records (usually 2 of them)
- TXT record for SPF
- TXT record for DKIM
- CNAME record

## Step 4: Verify Domain
1. After adding DNS records, wait 15-30 minutes
2. Back in Mailgun, click **"Verify DNS Settings"**
3. All records should show green checkmarks
4. Status changes to "Active"

## Step 5: Set Up Email Routes (This is the "forwarding")
1. In Mailgun dashboard, look for **"Routes"** in the left sidebar
2. Click **"Routes"**
3. Click **"Create Route"** button
4. Fill out the form:
   - **Priority**: 10
   - **Filter Expression**: Choose "Match Recipient"
   - **Enter**: `.*@thegeektrepreneur.com` (this catches all emails)
   - **Actions**: 
     - Choose "Forward"
     - Enter your webhook URL: `https://your-replit-url/api/webhook/email`
   - **Description**: "Forward all emails to Geek Mail Pro"
5. Click **"Create Route"**

## Step 6: Test the Setup
1. Send a test email to `marketing@thegeektrepreneur.com`
2. Check that it arrives in `rfavors@gmail.com`
3. If it doesn't work, check Mailgun logs

## Troubleshooting

### Can't find "Routes"?
- Look for "Receiving" or "Inbound" in the sidebar
- Some Mailgun interfaces call it "Email Routing"
- It might be under "Settings" → "Routes"

### DNS not verifying?
- Wait longer (can take up to 24 hours)
- Double-check you copied the records exactly
- Make sure you're editing the right domain

### Route not working?
- Check the webhook URL is correct
- Make sure your Replit app is running
- Check Mailgun logs for errors

---

**Your webhook URL should be:**
`https://[your-repl-name].[your-username].replit.app/api/webhook/email`

**Need help?** Let me know which step you're stuck on!