import nodemailer from "nodemailer";
import { storage } from "./storage";

export interface IncomingEmail {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
  headers: Record<string, string>;
  attachments?: any[];
}

export class EmailForwardingService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async forwardEmail(incomingEmail: IncomingEmail): Promise<boolean> {
    try {
      // Check if we have a valid email address
      if (!incomingEmail.to || !incomingEmail.to.includes('@')) {
        console.log('Invalid email address:', incomingEmail.to);
        return false;
      }

      // Extract alias from the 'to' field
      const emailAddress = incomingEmail.to.toLowerCase();
      const [alias, domain] = emailAddress.split('@');
      
      if (domain !== 'thegeektrepreneur.com') {
        console.log(`Email not for our domain: ${domain}`);
        return false;
      }

      // Find the alias configuration in database
      const aliases = await storage.getEmailAliasesByDomain(1); // thegeektrepreneur.com domain ID
      const aliasConfig = aliases.find(a => a.alias.toLowerCase() === alias);

      if (!aliasConfig || !aliasConfig.destination) {
        console.log(`No forwarding configured for alias: ${alias}`);
        return false;
      }

      // Forward the email
      const forwardedEmail = {
        from: `"${aliasConfig.alias}@thegeektrepreneur.com" <${process.env.SMTP_USER}>`,
        to: aliasConfig.destination,
        subject: `[Forwarded] ${incomingEmail.subject}`,
        html: this.buildForwardedEmailHtml(incomingEmail),
        text: this.buildForwardedEmailText(incomingEmail),
        replyTo: incomingEmail.from
      };

      await this.transporter.sendMail(forwardedEmail);

      // Log the forwarding
      await storage.createForwardingLog({
        aliasId: aliasConfig.id,
        fromEmail: incomingEmail.from,
        toEmail: aliasConfig.destination,
        subject: incomingEmail.subject,
        status: 'forwarded',
        forwardedAt: new Date()
      });

      console.log(`Email forwarded from ${emailAddress} to ${aliasConfig.destination}`);
      return true;

    } catch (error) {
      console.error('Email forwarding failed:', error);
      
      // Log the error - with safe variable access
      try {
        const emailParts = incomingEmail.to?.split('@') || [];
        const alias = emailParts[0] || 'unknown';
        
        await storage.createForwardingLog({
          aliasId: 0, // Will be 0 for failed attempts
          fromEmail: incomingEmail.from || 'unknown',
          toEmail: 'unknown',
          subject: incomingEmail.subject || 'No subject',
          status: 'failed',
          forwardedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
      
      return false;
    }
  }

  private buildForwardedEmailHtml(email: IncomingEmail): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff;">
          <h3 style="margin: 0 0 10px 0; color: #495057;">Forwarded Email</h3>
          <p style="margin: 5px 0; color: #6c757d;"><strong>From:</strong> ${email.from}</p>
          <p style="margin: 5px 0; color: #6c757d;"><strong>To:</strong> ${email.to}</p>
          <p style="margin: 5px 0; color: #6c757d;"><strong>Subject:</strong> ${email.subject}</p>
          <p style="margin: 5px 0; color: #6c757d;"><strong>Forwarded by:</strong> Geek Mail Pro</p>
        </div>
        
        <div style="border-top: 1px solid #dee2e6; padding-top: 20px;">
          ${email.html || email.text?.replace(/\n/g, '<br>') || 'No content'}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 12px;">
            This email was automatically forwarded by Geek Mail Pro. 
            To reply, use the Reply button - your response will go directly to the original sender.
          </p>
        </div>
      </div>
    `;
  }

  private buildForwardedEmailText(email: IncomingEmail): string {
    return `
--- Forwarded Email ---
From: ${email.from}
To: ${email.to}
Subject: ${email.subject}
Forwarded by: Geek Mail Pro

${email.text || 'No text content'}

---
This email was automatically forwarded by Geek Mail Pro.
To reply, your response will go directly to the original sender.
    `;
  }

  async getForwardingStats(aliasId: number) {
    return await storage.getForwardingStats(aliasId);
  }
}

export const emailForwardingService = new EmailForwardingService();