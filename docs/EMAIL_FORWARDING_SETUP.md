# Email Forwarding Setup Guide

## Overview
To receive emails sent to your aliases (like marketing@thegeektrepreneur.com) in your personal inbox (rfavors@gmail.com), you need to configure email forwarding infrastructure.

## Current Implementation
Geek Mail Pro includes:
- ✅ Email forwarding service (`server/emailForwarding.ts`)
- ✅ Webhook endpoint for incoming emails (`/api/webhook/email`)
- ✅ Test forwarding functionality
- ✅ Forwarding logs and analytics

## DNS Configuration Required

### 1. MX Records
Add these MX records to your thegeektrepreneur.com domain:

```
Priority 10: mail.thegeektrepreneur.com
Priority 20: backup-mail.thegeektrepreneur.com
```

### 2. Mail Server Setup
You'll need a mail server to receive emails. Options:

#### Option A: Use Email Service (Recommended)
- **Mailgun**: Provides webhook functionality
- **SendGrid**: Inbound email parsing
- **AWS SES**: Email receiving rules
- **Zoho Mail**: Custom domain email with forwarding

#### Option B: Self-Hosted Mail Server
- Set up Postfix/Dovecot on a VPS
- Configure to forward to webhook endpoint

## Quick Setup with Mailgun

1. **Domain Verification**
   - Add thegeektrepreneur.com to Mailgun
   - Verify DNS records

2. **Receiving Routes**
   ```
   Forward Expression: catch_all()
   Actions: forward("https://your-replit-url/api/webhook/email")
   ```

3. **Webhook Configuration**
   - Mailgun will POST incoming emails to your webhook
   - Geek Mail Pro will automatically forward them

## Testing Forwarding

Use the "Test Forwarding" button in the alias configuration dialog, or send a real email to marketing@thegeektrepreneur.com once DNS is configured.

## Current Status
- ✅ Forwarding logic implemented
- ✅ Database logging ready
- ⏳ DNS/Mail server configuration needed
- ⏳ Domain verification required

## Next Steps
1. Choose an email service provider (Mailgun recommended)
2. Configure DNS records for thegeektrepreneur.com
3. Set up webhook forwarding
4. Test with real emails

## Security Notes
- Webhook endpoint is public but validates email format
- All forwarding is logged for audit purposes
- Reply-to headers preserve original sender
- SMTP credentials are securely stored in environment variables