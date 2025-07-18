import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { createCheckout, createBillingPortal, handleWebhook } from "./payment";
import { PRICING_PLANS } from "./stripe";
import nodemailer from "nodemailer";
import { emailForwardingService, type IncomingEmail } from "./emailForwarding";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { 
  insertDomainSchema, 
  insertEmailAliasSchema,
  insertForwardingRuleSchema,
  insertForwardingDestinationSchema,
  insertForwardingLogSchema,
  insertContactListSchema, 
  insertContactSchema,
  insertContactSegmentSchema,
  insertCampaignSchema,
  insertLeadSourceSchema,
  insertLeadSchema,
  insertLeadCampaignSchema,
  insertEmailSequenceSchema,
  insertEmailSequenceStepSchema,
  insertEmailSequenceSubscriberSchema,
  insertEmailSequenceAnalyticsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for image uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage_multer,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // Test endpoint for manual email forwarding (for debugging)
  app.post('/api/test-forward', async (req, res) => {
    try {
      console.log('Manual test forwarding triggered');
      
      const testEmail = {
        to: 'marketing@thegeektrepreneur.com',
        from: 'rfavors@gmail.com',
        subject: 'Test Email Forward',
        html: '<p>This is a test email to verify forwarding works</p>',
        text: 'This is a test email to verify forwarding works',
        headers: {},
        attachments: []
      };

      const forwarded = await emailForwardingService.forwardEmail(testEmail);
      
      res.json({ 
        success: forwarded,
        message: forwarded ? 'Test email forwarded successfully' : 'Forwarding failed - check logs'
      });
      
    } catch (error) {
      console.error('Test forward error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check endpoint for deployment monitoring
  app.get('/api/health', async (req, res) => {
    try {
      // Basic health check
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      };

      // Check database connection
      try {
        await storage.getUserStats('health-check');
        healthStatus.database = 'connected';
      } catch (dbError) {
        healthStatus.database = 'disconnected';
        healthStatus.status = 'unhealthy';
      }

      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  // Signup endpoint for new users
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName, company, plan, planPrice } = req.body;
      
      console.log('Signup attempt:', { email, plan });
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail?.(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
      
      // Create new user with trial status
      const user = await storage.upsertUser({
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName,
        lastName,
        profileImageUrl: null,
      });
      
      // Create session
      req.session = req.session || {};
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: plan,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        isActive: true
      };
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        }
      });
      
      res.json({ 
        success: true, 
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: plan,
          trialEndsAt: req.session.user.trialEndsAt,
          isActive: true
        }
      });
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Custom auth middleware for session-based auth
  const requireAuth = (req: any, res: any, next: any) => {
    // Check session-based auth first
    if (req.session?.user) {
      return next();
    }
    // Check Replit auth if available
    if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Get pricing plans
  app.get('/api/pricing/plans', (req, res) => {
    res.json(PRICING_PLANS);
  });

  // Create Stripe checkout session
  app.post('/api/payment/create-checkout', requireAuth, createCheckout);

  // Create billing portal session
  app.post('/api/payment/billing-portal', requireAuth, createBillingPortal);

  // Stripe webhook handler
  app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), handleWebhook);

  // Custom login endpoint for unlimited user
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt:', { email, session: !!req.session });
      
      // Check for unlimited admin account
      if (email === 'raymond@thegeektrepreneur.com' && password === 'Nomorelies101@') {
        // Create/update user with unlimited plan
        const user = await storage.upsertUser({
          id: 'unlimited-user-raymond',
          email: 'raymond@thegeektrepreneur.com',
          firstName: 'Raymond',
          lastName: 'Favors',
          profileImageUrl: null,
        });
        
        // Create session
        req.session = req.session || {};
        req.session.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: 'unlimited',
          isActive: true
        };
        
        // Save session explicitly
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
          }
        });
        
        res.json({ 
          success: true, 
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            plan: 'unlimited',
            isActive: true
          }
        });
      } else {
        // Check for regular user account
        const user = await storage.getUserByEmail?.(email);
        if (!user) {
          return res.status(401).json({ success: false, message: 'Account not found. Please sign up first.' });
        }
        
        // For now, accept any password for demo purposes
        // In production, you would verify the hashed password here
        
        // Create session for regular user
        req.session = req.session || {};
        req.session.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: 'pro', // Default plan for demo
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          isActive: true
        };
        
        // Save session explicitly
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
          }
        });
        
        res.json({ 
          success: true, 
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            plan: req.session.user.plan,
            trialEndsAt: req.session.user.trialEndsAt,
            isActive: true
          }
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Admin setup for unlimited user
  app.post('/api/admin/setup-unlimited-user', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (email === 'raymond@thegeektrepreneur.com' && password === 'Nomorelies101@') {
        // Create/update user with unlimited plan
        const user = await storage.upsertUser({
          id: 'unlimited-user-raymond',
          email: 'raymond@thegeektrepreneur.com',
          firstName: 'Raymond',
          lastName: 'Favors',
          profileImageUrl: null,
        });
        
        res.json({ 
          success: true, 
          message: 'Unlimited plan user created successfully',
          user: {
            id: user.id,
            email: user.email,
            plan: 'unlimited'
          }
        });
      } else {
        res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error setting up unlimited user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Auth middleware
  await setupAuth(app);

  // Image upload route
  app.post('/api/upload/image', requireAuth, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Return the URL to access the uploaded file
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      
      res.json({
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check session-based auth first
      if (req.session?.user) {
        return res.json(req.session.user);
      }
      
      // Check Replit auth if available
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Get user plan (check if user has unlimited plan)
  app.get('/api/user-plan', async (req: any, res) => {
    try {
      let userEmail = null;
      
      // Check session-based auth first
      if (req.session?.user) {
        userEmail = req.session.user.email;
      }
      // Check Replit auth if available
      else if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.email) {
        userEmail = req.user.claims.email;
      }
      
      // Check if this is the unlimited user
      if (userEmail === 'raymond@thegeektrepreneur.com') {
        res.json({
          plan: 'unlimited',
          limits: {
            subscribers: 'unlimited',
            emails: 'unlimited',
            campaigns: 'unlimited',
            sequences: 'unlimited'
          }
        });
      } else {
        // Default to starter plan for other users
        res.json({
          plan: 'starter',
          limits: {
            subscribers: 2500,
            emails: 15000,
            campaigns: 10,
            sequences: 5
          }
        });
      }
    } catch (error) {
      console.error('Error getting user plan:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Domain management routes
  app.post('/api/domains', requireAuth, async (req: any, res) => {
    try {
      // Get user ID from session or Replit auth
      let userId = null;
      if (req.session?.user) {
        userId = req.session.user.id;
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      
      const domainData = insertDomainSchema.parse({ ...req.body, userId });
      
      // Mock DNS verification for thegeektrepreneur.com
      if (domainData.domain === 'thegeektrepreneur.com') {
        domainData.isVerified = true;
        domainData.spfRecord = 'v=spf1 include:mailgeek.io ~all';
        domainData.dkimRecord = 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBA...';
        domainData.dmarcRecord = 'v=DMARC1; p=reject; rua=mailto:dmarc@thegeektrepreneur.com';
        domainData.warmingProgress = 78;
        domainData.senderScore = 87;
        domainData.bounceRate = "1.2";
        domainData.spamRate = "0.03";
      }

      const domain = await storage.createDomain(domainData);
      res.json(domain);
    } catch (error) {
      console.error("Error creating domain:", error);
      res.status(500).json({ message: "Failed to create domain" });
    }
  });

  app.get('/api/domains', requireAuth, async (req: any, res) => {
    try {
      // Get user ID from session or Replit auth
      let userId = null;
      if (req.session?.user) {
        userId = req.session.user.id;
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      
      const domains = await storage.getDomainsByUserId(userId);
      res.json(domains);
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });

  // Email alias routes
  app.post('/api/domains/:domainId/aliases', requireAuth, async (req: any, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const aliasData = insertEmailAliasSchema.parse({ ...req.body, domainId, isVerified: true });
      
      const alias = await storage.createEmailAlias(aliasData);
      res.json(alias);
    } catch (error) {
      console.error("Error creating email alias:", error);
      res.status(500).json({ message: "Failed to create email alias" });
    }
  });

  app.get('/api/domains/:domainId/aliases', requireAuth, async (req: any, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const aliases = await storage.getEmailAliasesByDomainId(domainId);
      res.json(aliases);
    } catch (error) {
      console.error("Error fetching email aliases:", error);
      res.status(500).json({ message: "Failed to fetch email aliases" });
    }
  });

  app.patch('/api/email-aliases/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const alias = await storage.updateEmailAlias(Number(id), updates);
      res.json(alias);
    } catch (error) {
      console.error("Error updating email alias:", error);
      res.status(500).json({ message: "Failed to update email alias" });
    }
  });

  app.delete('/api/email-aliases/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmailAlias(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email alias:", error);
      res.status(500).json({ message: "Failed to delete email alias" });
    }
  });

  // Test alias endpoint
  app.post('/api/test-alias', isAuthenticated, async (req: any, res) => {
    try {
      const { alias, destination } = req.body;
      
      // Create transporter (using Gmail SMTP for testing)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
      // Email content
      const mailOptions = {
        from: `"Geek Mail Pro Test" <${process.env.SMTP_USER || 'noreply@thegeektrepreneur.com'}>`,
        to: destination,
        subject: `Test Email from ${alias}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Alias Test Successful!</h2>
            <p>This is a test email to verify that your email alias <strong>${alias}</strong> is working correctly.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Alias Details:</h3>
              <p><strong>From:</strong> ${alias}</p>
              <p><strong>Forwarding to:</strong> ${destination}</p>
              <p><strong>Test time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>If you received this email, your alias forwarding is set up correctly!</p>
            <hr>
            <p style="color: #666; font-size: 12px;">This test email was sent from your Geek Mail Pro platform.</p>
          </div>
        `
      };
      
      // Validate SMTP configuration
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(400).json({ 
          message: "SMTP configuration missing. Please configure SMTP_USER and SMTP_PASS environment variables." 
        });
      }

      try {
        // Verify transporter connection
        await transporter.verify();
        console.log('SMTP connection verified successfully');
        
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Test email sent successfully from ${alias} to ${destination}. Message ID: ${info.messageId}`);
        
        res.json({ 
          success: true, 
          message: `Test email sent successfully to ${destination}`,
          messageId: info.messageId
        });
      } catch (emailError: any) {
        console.error("Email sending failed:", emailError.message);
        
        res.status(500).json({ 
          success: false, 
          message: `Failed to send test email: ${emailError.message}`,
          error: emailError.code || 'UNKNOWN_ERROR'
        });
      }
      
    } catch (error) {
      console.error("Error in test alias endpoint:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });



  // Manual email forwarding test endpoint
  app.post('/api/test-forwarding', isAuthenticated, async (req: any, res) => {
    try {
      const { alias, fromEmail, subject, content } = req.body;
      
      const testEmail: IncomingEmail = {
        to: `${alias}@thegeektrepreneur.com`,
        from: fromEmail || 'test@example.com',
        subject: subject || 'Test Email',
        text: content || 'This is a test email to verify forwarding functionality.',
        html: `<p>${content || 'This is a test email to verify forwarding functionality.'}</p>`,
        headers: {}
      };

      const forwarded = await emailForwardingService.forwardEmail(testEmail);
      
      if (forwarded) {
        res.json({ 
          success: true, 
          message: `Test email forwarded successfully from ${testEmail.to}` 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: `No forwarding configured for ${alias}@thegeektrepreneur.com` 
        });
      }
      
    } catch (error) {
      console.error('Test forwarding error:', error);
      res.status(500).json({ message: "Failed to test email forwarding" });
    }
  });

  // Forwarding rule routes
  app.post('/api/forwarding-rules', isAuthenticated, async (req: any, res) => {
    try {
      const ruleData = insertForwardingRuleSchema.parse(req.body);
      const rule = await storage.createForwardingRule(ruleData);
      res.json(rule);
    } catch (error) {
      console.error("Error creating forwarding rule:", error);
      res.status(500).json({ message: "Failed to create forwarding rule" });
    }
  });

  app.get('/api/forwarding-rules/alias/:aliasId', isAuthenticated, async (req: any, res) => {
    try {
      const { aliasId } = req.params;
      const rules = await storage.getForwardingRulesByAliasId(Number(aliasId));
      res.json(rules);
    } catch (error) {
      console.error("Error fetching forwarding rules:", error);
      res.status(500).json({ message: "Failed to fetch forwarding rules" });
    }
  });

  app.patch('/api/forwarding-rules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const rule = await storage.updateForwardingRule(Number(id), updates);
      res.json(rule);
    } catch (error) {
      console.error("Error updating forwarding rule:", error);
      res.status(500).json({ message: "Failed to update forwarding rule" });
    }
  });

  app.delete('/api/forwarding-rules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteForwardingRule(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting forwarding rule:", error);
      res.status(500).json({ message: "Failed to delete forwarding rule" });
    }
  });

  // Forwarding destination routes
  app.post('/api/forwarding-destinations', isAuthenticated, async (req: any, res) => {
    try {
      const destinationData = insertForwardingDestinationSchema.parse(req.body);
      const destination = await storage.createForwardingDestination(destinationData);
      res.json(destination);
    } catch (error) {
      console.error("Error creating forwarding destination:", error);
      res.status(500).json({ message: "Failed to create forwarding destination" });
    }
  });

  app.get('/api/forwarding-destinations/alias/:aliasId', isAuthenticated, async (req: any, res) => {
    try {
      const { aliasId } = req.params;
      const destinations = await storage.getForwardingDestinationsByAliasId(Number(aliasId));
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching forwarding destinations:", error);
      res.status(500).json({ message: "Failed to fetch forwarding destinations" });
    }
  });

  app.patch('/api/forwarding-destinations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const destination = await storage.updateForwardingDestination(Number(id), updates);
      res.json(destination);
    } catch (error) {
      console.error("Error updating forwarding destination:", error);
      res.status(500).json({ message: "Failed to update forwarding destination" });
    }
  });

  app.delete('/api/forwarding-destinations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteForwardingDestination(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting forwarding destination:", error);
      res.status(500).json({ message: "Failed to delete forwarding destination" });
    }
  });

  // Forwarding log routes
  app.get('/api/forwarding-logs/alias/:aliasId', isAuthenticated, async (req: any, res) => {
    try {
      const { aliasId } = req.params;
      const logs = await storage.getForwardingLogsByAliasId(Number(aliasId));
      res.json(logs);
    } catch (error) {
      console.error("Error fetching forwarding logs:", error);
      res.status(500).json({ message: "Failed to fetch forwarding logs" });
    }
  });

  app.get('/api/forwarding-stats/alias/:aliasId', isAuthenticated, async (req: any, res) => {
    try {
      const { aliasId } = req.params;
      const stats = await storage.getForwardingStats(Number(aliasId));
      res.json(stats);
    } catch (error) {
      console.error("Error fetching forwarding stats:", error);
      res.status(500).json({ message: "Failed to fetch forwarding stats" });
    }
  });

  // Contact list routes
  app.post('/api/contact-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listData = insertContactListSchema.parse({ ...req.body, userId });
      
      const list = await storage.createContactList(listData);
      res.json(list);
    } catch (error) {
      console.error("Error creating contact list:", error);
      res.status(500).json({ message: "Failed to create contact list" });
    }
  });

  app.get('/api/contact-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lists = await storage.getContactListsByUserId(userId);
      res.json(lists);
    } catch (error) {
      console.error("Error fetching contact lists:", error);
      res.status(500).json({ message: "Failed to fetch contact lists" });
    }
  });

  // Contact routes
  app.post('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contactData = insertContactSchema.parse({ ...req.body, userId });
      
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.get('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getContactsByUserId(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post('/api/contacts/import-csv', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { csvData, listId } = req.body;

      // Parse CSV data (simplified implementation)
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
      const contacts = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= headers.length && values[0].trim()) {
          const contact: any = { userId };
          headers.forEach((header, index) => {
            if (header === 'email') contact.email = values[index].trim();
            if (header === 'firstname' || header === 'first_name') contact.firstName = values[index].trim();
            if (header === 'lastname' || header === 'last_name') contact.lastName = values[index].trim();
            if (header === 'company') contact.company = values[index].trim();
          });
          
          if (contact.email) {
            const newContact = await storage.createContact(contact);
            if (listId) {
              await storage.addContactToList(newContact.id, parseInt(listId));
            }
            contacts.push(newContact);
          }
        }
      }

      res.json({ imported: contacts.length, contacts });
    } catch (error) {
      console.error("Error importing CSV:", error);
      res.status(500).json({ message: "Failed to import CSV" });
    }
  });

  // Contact segment routes
  app.post('/api/contact-segments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const segmentData = insertContactSegmentSchema.parse({ ...req.body, userId });
      
      const segment = await storage.createContactSegment(segmentData);
      res.json(segment);
    } catch (error) {
      console.error("Error creating contact segment:", error);
      res.status(500).json({ message: "Failed to create contact segment" });
    }
  });

  app.get('/api/contact-segments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const segments = await storage.getContactSegmentsByUserId(userId);
      res.json(segments);
    } catch (error) {
      console.error("Error fetching contact segments:", error);
      res.status(500).json({ message: "Failed to fetch contact segments" });
    }
  });

  app.get('/api/contact-segments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const segment = await storage.getContactSegment(Number(id));
      
      if (!segment) {
        return res.status(404).json({ message: "Contact segment not found" });
      }
      
      res.json(segment);
    } catch (error) {
      console.error("Error fetching contact segment:", error);
      res.status(500).json({ message: "Failed to fetch contact segment" });
    }
  });

  app.patch('/api/contact-segments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const segment = await storage.updateContactSegment(Number(id), updates);
      res.json(segment);
    } catch (error) {
      console.error("Error updating contact segment:", error);
      res.status(500).json({ message: "Failed to update contact segment" });
    }
  });

  app.delete('/api/contact-segments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContactSegment(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting contact segment:", error);
      res.status(500).json({ message: "Failed to delete contact segment" });
    }
  });

  app.get('/api/contact-segments/:id/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const contacts = await storage.getContactsBySegmentId(Number(id));
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching segment contacts:", error);
      res.status(500).json({ message: "Failed to fetch segment contacts" });
    }
  });

  app.post('/api/contact-segments/:id/refresh', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.refreshSegmentMembership(Number(id));
      
      // Return updated segment with new contact count
      const segment = await storage.getContactSegment(Number(id));
      res.json(segment);
    } catch (error) {
      console.error("Error refreshing segment membership:", error);
      res.status(500).json({ message: "Failed to refresh segment membership" });
    }
  });

  // Campaign routes
  app.post('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaignData = insertCampaignSchema.parse({ ...req.body, userId });
      
      const campaign = await storage.createCampaign(campaignData);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.get('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaigns = await storage.getCampaignsByUserId(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post('/api/campaigns/:id/send', isAuthenticated, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Mock email sending - update campaign status and stats
      const mockStats = {
        status: "sent",
        sentAt: new Date(),
        totalSent: Math.floor(Math.random() * 5000) + 1000,
        totalOpens: 0,
        totalClicks: 0,
        openRate: "0.00",
        clickRate: "0.00",
      };

      // Simulate some opens and clicks after a delay
      setTimeout(async () => {
        const opens = Math.floor(mockStats.totalSent * (0.35 + Math.random() * 0.15));
        const clicks = Math.floor(opens * (0.15 + Math.random() * 0.10));
        
        await storage.updateCampaign(campaignId, {
          totalOpens: opens,
          totalClicks: clicks,
          openRate: ((opens / mockStats.totalSent) * 100).toFixed(2),
          clickRate: ((clicks / mockStats.totalSent) * 100).toFixed(2),
        });
      }, 5000);

      const updatedCampaign = await storage.updateCampaign(campaignId, mockStats);
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error sending campaign:", error);
      res.status(500).json({ message: "Failed to send campaign" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Mock Stripe webhook
  app.post('/api/stripe/webhook', async (req, res) => {
    try {
      // Mock webhook handling for subscription updates
      const { type, data } = req.body;
      
      if (type === 'checkout.session.completed') {
        // Handle successful payment
        console.log('Payment successful:', data);
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Webhook error" });
    }
  });

  // Lead source routes
  app.post('/api/lead-sources', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leadSourceData = insertLeadSourceSchema.parse({ ...req.body, userId });
      
      const leadSource = await storage.createLeadSource(leadSourceData);
      res.json(leadSource);
    } catch (error) {
      console.error("Error creating lead source:", error);
      res.status(500).json({ message: "Failed to create lead source" });
    }
  });

  app.get('/api/lead-sources', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leadSources = await storage.getLeadSourcesByUserId(userId);
      res.json(leadSources);
    } catch (error) {
      console.error("Error fetching lead sources:", error);
      res.status(500).json({ message: "Failed to fetch lead sources" });
    }
  });

  app.patch('/api/lead-sources/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const leadSource = await storage.updateLeadSource(Number(id), updates);
      res.json(leadSource);
    } catch (error) {
      console.error("Error updating lead source:", error);
      res.status(500).json({ message: "Failed to update lead source" });
    }
  });

  app.delete('/api/lead-sources/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLeadSource(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting lead source:", error);
      res.status(500).json({ message: "Failed to delete lead source" });
    }
  });

  // Lead routes
  app.post('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leadData = insertLeadSchema.parse({ ...req.body, userId });
      
      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.get('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { sourceId } = req.query;
      
      if (sourceId) {
        const leads = await storage.getLeadsBySourceId(Number(sourceId));
        res.json(leads);
      } else {
        const leads = await storage.getLeadsByUserId(userId);
        res.json(leads);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.patch('/api/leads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const lead = await storage.updateLead(Number(id), updates);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete('/api/leads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLead(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  app.post('/api/leads/:id/convert', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { listId } = req.body;
      
      const contact = await storage.convertLeadToContact(Number(id), listId);
      res.json(contact);
    } catch (error) {
      console.error("Error converting lead:", error);
      res.status(500).json({ message: "Failed to convert lead" });
    }
  });

  // Lead campaign routes
  app.post('/api/lead-campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaignData = insertLeadCampaignSchema.parse({ ...req.body, userId });
      
      const campaign = await storage.createLeadCampaign(campaignData);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating lead campaign:", error);
      res.status(500).json({ message: "Failed to create lead campaign" });
    }
  });

  app.get('/api/lead-campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaigns = await storage.getLeadCampaignsByUserId(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching lead campaigns:", error);
      res.status(500).json({ message: "Failed to fetch lead campaigns" });
    }
  });

  app.patch('/api/lead-campaigns/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const campaign = await storage.updateLeadCampaign(Number(id), updates);
      res.json(campaign);
    } catch (error) {
      console.error("Error updating lead campaign:", error);
      res.status(500).json({ message: "Failed to update lead campaign" });
    }
  });

  app.delete('/api/lead-campaigns/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLeadCampaign(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting lead campaign:", error);
      res.status(500).json({ message: "Failed to delete lead campaign" });
    }
  });

  // Email sequence routes
  app.post('/api/email-sequences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sequenceData = insertEmailSequenceSchema.parse({ ...req.body, userId });
      
      const sequence = await storage.createEmailSequence(sequenceData);
      res.json(sequence);
    } catch (error) {
      console.error("Error creating email sequence:", error);
      res.status(500).json({ message: "Failed to create email sequence" });
    }
  });

  app.get('/api/email-sequences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sequences = await storage.getEmailSequencesByUserId(userId);
      res.json(sequences);
    } catch (error) {
      console.error("Error fetching email sequences:", error);
      res.status(500).json({ message: "Failed to fetch email sequences" });
    }
  });

  app.get('/api/email-sequences/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const sequence = await storage.getEmailSequence(Number(id));
      
      if (!sequence) {
        return res.status(404).json({ message: "Email sequence not found" });
      }
      
      res.json(sequence);
    } catch (error) {
      console.error("Error fetching email sequence:", error);
      res.status(500).json({ message: "Failed to fetch email sequence" });
    }
  });

  app.patch('/api/email-sequences/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const sequence = await storage.updateEmailSequence(Number(id), updates);
      res.json(sequence);
    } catch (error) {
      console.error("Error updating email sequence:", error);
      res.status(500).json({ message: "Failed to update email sequence" });
    }
  });

  app.delete('/api/email-sequences/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmailSequence(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email sequence:", error);
      res.status(500).json({ message: "Failed to delete email sequence" });
    }
  });

  // Email sequence steps
  app.post('/api/email-sequences/:sequenceId/steps', isAuthenticated, async (req: any, res) => {
    try {
      const { sequenceId } = req.params;
      const stepData = insertEmailSequenceStepSchema.parse({ 
        ...req.body, 
        sequenceId: Number(sequenceId) 
      });
      
      const step = await storage.createEmailSequenceStep(stepData);
      res.json(step);
    } catch (error) {
      console.error("Error creating email sequence step:", error);
      res.status(500).json({ message: "Failed to create email sequence step" });
    }
  });

  app.get('/api/email-sequences/:sequenceId/steps', isAuthenticated, async (req: any, res) => {
    try {
      const { sequenceId } = req.params;
      const steps = await storage.getEmailSequenceStepsBySequenceId(Number(sequenceId));
      res.json(steps);
    } catch (error) {
      console.error("Error fetching email sequence steps:", error);
      res.status(500).json({ message: "Failed to fetch email sequence steps" });
    }
  });

  // Email sequence analytics
  app.get('/api/email-sequences/:sequenceId/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const { sequenceId } = req.params;
      const analytics = await storage.getEmailSequenceAnalyticsBySequenceId(Number(sequenceId));
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching email sequence analytics:", error);
      res.status(500).json({ message: "Failed to fetch email sequence analytics" });
    }
  });

  app.get('/api/email-sequences/:sequenceId/stats', isAuthenticated, async (req: any, res) => {
    try {
      const { sequenceId } = req.params;
      const stats = await storage.getEmailSequenceStats(Number(sequenceId));
      res.json(stats);
    } catch (error) {
      console.error("Error fetching email sequence stats:", error);
      res.status(500).json({ message: "Failed to fetch email sequence stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
