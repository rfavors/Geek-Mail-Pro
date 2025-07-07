# Complete Mailgun Setup Guide for thegeektrepreneur.com

## Step 1: Create Mailgun Account
1. Go to https://www.mailgun.com/
2. Sign up for a free account (includes 1,000 emails/month free)
3. Verify your email address

## Step 2: Add Your Domain
1. In Mailgun dashboard, go to "Domains"
2. Click "Add New Domain"
3. Enter: `thegeektrepreneur.com`
4. Select region (US recommended)
5. Click "Add Domain"

## Step 3: DNS Configuration
Add these DNS records to your thegeektrepreneur.com domain (through your domain registrar):

### Required DNS Records:
```
Type: TXT
Name: thegeektrepreneur.com
Value: v=spf1 include:mailgun.org ~all

Type: TXT  
Name: _dmarc.thegeektrepreneur.com
Value: v=DMARC1; p=none;

Type: TXT
Name: krs._domainkey.thegeektrepreneur.com  
Value: [Mailgun will provide this - copy from dashboard]

Type: MX
Name: thegeektrepreneur.com
Value: mxa.mailgun.org
Priority: 10

Type: MX  
Name: thegeektrepreneur.com
Value: mxb.mailgun.org
Priority: 10

Type: CNAME
Name: email.thegeektrepreneur.com
Value: mailgun.org
```

**Important**: The exact TXT record values will be shown in your Mailgun dashboard. Copy them exactly.

## Step 4: Verify Domain
1. After adding DNS records, wait 15-30 minutes
2. In Mailgun dashboard, click "Verify DNS Settings"
3. All records should show green checkmarks
4. Domain status should change to "Active"

## Step 5: Configure Email Routing
1. In Mailgun dashboard, go to "Routes"
2. Click "Create Route"
3. Set up route:
   - **Expression Type**: Match Recipient
   - **Expression**: `.*@thegeektrepreneur.com`
   - **Actions**: Forward → `https://your-replit-url.replit.app/api/webhook/email`
   - **Priority**: 10
   - **Description**: Forward all emails to Geek Mail Pro

## Step 6: Get Your Replit URL
Your webhook URL will be: `https://[your-repl-name].[your-username].replit.app/api/webhook/email`

Example: `https://geek-mail-pro.yourname.replit.app/api/webhook/email`

## Step 7: Test the Setup
1. Wait for DNS propagation (up to 24 hours, usually much faster)
2. Send test email to `marketing@thegeektrepreneur.com`
3. Check that it arrives in `rfavors@gmail.com`
4. Check Mailgun logs for delivery confirmation

## Troubleshooting

### DNS Not Verifying
- Wait longer (DNS can take up to 24 hours)
- Double-check record values match exactly
- Some registrars need @ symbol for root domain records

### Emails Not Forwarding
- Check Mailgun route is active
- Verify webhook URL is correct and accessible
- Check Mailgun logs for error messages
- Ensure your Replit app is running

### Webhook Issues
- Make sure your Replit app is always running
- Test webhook endpoint directly
- Check server logs for errors

## Cost
- Mailgun: 1,000 emails/month free, then $0.80 per 1,000 emails
- Very affordable for most use cases

## Security Notes
- SPF record prevents email spoofing
- DMARC provides additional security
- Webhook endpoint validates email format
- All activity is logged in Geek Mail Pro

## Next Steps After Setup
1. Create more aliases in Geek Mail Pro
2. Set up different forwarding destinations
3. Monitor forwarding logs and analytics
4. Consider upgrading Mailgun plan if needed

---
**Need help?** Contact Mailgun support or check your Geek Mail Pro forwarding logs for detailed error information.