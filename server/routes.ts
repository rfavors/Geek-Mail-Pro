import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { 
  insertDomainSchema, 
  insertEmailAliasSchema, 
  insertContactListSchema, 
  insertContactSchema,
  insertCampaignSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Domain management routes
  app.post('/api/domains', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/domains', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const domains = await storage.getDomainsByUserId(userId);
      res.json(domains);
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });

  // Email alias routes
  app.post('/api/domains/:domainId/aliases', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/domains/:domainId/aliases', isAuthenticated, async (req: any, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const aliases = await storage.getEmailAliasesByDomainId(domainId);
      res.json(aliases);
    } catch (error) {
      console.error("Error fetching email aliases:", error);
      res.status(500).json({ message: "Failed to fetch email aliases" });
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

  const httpServer = createServer(app);
  return httpServer;
}
