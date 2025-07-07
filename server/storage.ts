import {
  users,
  domains,
  emailAliases,
  forwardingRules,
  forwardingDestinations,
  forwardingLogs,
  contactLists,
  contacts,
  contactListMemberships,
  campaigns,
  campaignRecipients,
  leadSources,
  leads,
  leadCampaigns,
  type User,
  type UpsertUser,
  type InsertDomain,
  type Domain,
  type InsertEmailAlias,
  type EmailAlias,
  type InsertForwardingRule,
  type ForwardingRule,
  type InsertForwardingDestination,
  type ForwardingDestination,
  type InsertForwardingLog,
  type ForwardingLog,
  type InsertContactList,
  type ContactList,
  type InsertContact,
  type Contact,
  type InsertCampaign,
  type Campaign,
  type CampaignRecipient,
  type InsertLeadSource,
  type LeadSource,
  type InsertLead,
  type Lead,
  type InsertLeadCampaign,
  type LeadCampaign,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Domain operations
  createDomain(domain: InsertDomain): Promise<Domain>;
  getDomainsByUserId(userId: string): Promise<Domain[]>;
  updateDomain(id: number, updates: Partial<Domain>): Promise<Domain>;
  deleteDomain(id: number): Promise<void>;
  
  // Email alias operations
  createEmailAlias(alias: InsertEmailAlias): Promise<EmailAlias>;
  getEmailAliasesByDomainId(domainId: number): Promise<EmailAlias[]>;
  updateEmailAlias(id: number, updates: Partial<EmailAlias>): Promise<EmailAlias>;
  deleteEmailAlias(id: number): Promise<void>;
  
  // Forwarding rule operations
  createForwardingRule(rule: InsertForwardingRule): Promise<ForwardingRule>;
  getForwardingRulesByAliasId(aliasId: number): Promise<ForwardingRule[]>;
  updateForwardingRule(id: number, updates: Partial<ForwardingRule>): Promise<ForwardingRule>;
  deleteForwardingRule(id: number): Promise<void>;
  
  // Forwarding destination operations
  createForwardingDestination(destination: InsertForwardingDestination): Promise<ForwardingDestination>;
  getForwardingDestinationsByAliasId(aliasId: number): Promise<ForwardingDestination[]>;
  updateForwardingDestination(id: number, updates: Partial<ForwardingDestination>): Promise<ForwardingDestination>;
  deleteForwardingDestination(id: number): Promise<void>;
  
  // Forwarding log operations
  createForwardingLog(log: InsertForwardingLog): Promise<ForwardingLog>;
  getForwardingLogsByAliasId(aliasId: number): Promise<ForwardingLog[]>;
  getForwardingStats(aliasId: number): Promise<{
    totalForwarded: number;
    totalBlocked: number;
    totalAutoReplied: number;
    successRate: number;
  }>;
  
  // Contact list operations
  createContactList(list: InsertContactList): Promise<ContactList>;
  getContactListsByUserId(userId: string): Promise<ContactList[]>;
  updateContactList(id: number, updates: Partial<ContactList>): Promise<ContactList>;
  deleteContactList(id: number): Promise<void>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getContactsByUserId(userId: string): Promise<Contact[]>;
  getContactsByListId(listId: number): Promise<Contact[]>;
  updateContact(id: number, updates: Partial<Contact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
  addContactToList(contactId: number, listId: number): Promise<void>;
  removeContactFromList(contactId: number, listId: number): Promise<void>;
  
  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaignsByUserId(userId: string): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;
  
  // Analytics operations
  getUserStats(userId: string): Promise<{
    totalSubscribers: number;
    totalCampaigns: number;
    avgOpenRate: number;
    avgClickRate: number;
    totalRevenue: number;
  }>;

  // Lead source operations
  createLeadSource(leadSource: InsertLeadSource): Promise<LeadSource>;
  getLeadSourcesByUserId(userId: string): Promise<LeadSource[]>;
  updateLeadSource(id: number, updates: Partial<LeadSource>): Promise<LeadSource>;
  deleteLeadSource(id: number): Promise<void>;

  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadsByUserId(userId: string): Promise<Lead[]>;
  getLeadsBySourceId(sourceId: number): Promise<Lead[]>;
  updateLead(id: number, updates: Partial<Lead>): Promise<Lead>;
  deleteLead(id: number): Promise<void>;
  convertLeadToContact(leadId: number, listId?: number): Promise<Contact>;

  // Lead campaign operations
  createLeadCampaign(campaign: InsertLeadCampaign): Promise<LeadCampaign>;
  getLeadCampaignsByUserId(userId: string): Promise<LeadCampaign[]>;
  updateLeadCampaign(id: number, updates: Partial<LeadCampaign>): Promise<LeadCampaign>;
  deleteLeadCampaign(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Domain operations
  async createDomain(domain: InsertDomain): Promise<Domain> {
    const [newDomain] = await db.insert(domains).values(domain).returning();
    return newDomain;
  }

  async getDomainsByUserId(userId: string): Promise<Domain[]> {
    return await db.select().from(domains).where(eq(domains.userId, userId));
  }

  async updateDomain(id: number, updates: Partial<Domain>): Promise<Domain> {
    const [domain] = await db
      .update(domains)
      .set(updates)
      .where(eq(domains.id, id))
      .returning();
    return domain;
  }

  async deleteDomain(id: number): Promise<void> {
    await db.delete(domains).where(eq(domains.id, id));
  }

  // Email alias operations
  async createEmailAlias(alias: InsertEmailAlias): Promise<EmailAlias> {
    const [newAlias] = await db.insert(emailAliases).values(alias).returning();
    return newAlias;
  }

  async getEmailAliasesByDomainId(domainId: number): Promise<EmailAlias[]> {
    return await db
      .select()
      .from(emailAliases)
      .where(eq(emailAliases.domainId, domainId))
      .orderBy(emailAliases.createdAt);
  }

  async updateEmailAlias(id: number, updates: Partial<EmailAlias>): Promise<EmailAlias> {
    const [alias] = await db
      .update(emailAliases)
      .set(updates)
      .where(eq(emailAliases.id, id))
      .returning();
    return alias;
  }

  async deleteEmailAlias(id: number): Promise<void> {
    await db.delete(emailAliases).where(eq(emailAliases.id, id));
  }

  // Forwarding rule operations
  async createForwardingRule(rule: InsertForwardingRule): Promise<ForwardingRule> {
    const [forwardingRule] = await db
      .insert(forwardingRules)
      .values(rule)
      .returning();
    return forwardingRule;
  }

  async getForwardingRulesByAliasId(aliasId: number): Promise<ForwardingRule[]> {
    return await db
      .select()
      .from(forwardingRules)
      .where(eq(forwardingRules.aliasId, aliasId))
      .orderBy(forwardingRules.priority);
  }

  async updateForwardingRule(id: number, updates: Partial<ForwardingRule>): Promise<ForwardingRule> {
    const [rule] = await db
      .update(forwardingRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forwardingRules.id, id))
      .returning();
    return rule;
  }

  async deleteForwardingRule(id: number): Promise<void> {
    await db.delete(forwardingRules).where(eq(forwardingRules.id, id));
  }

  // Forwarding destination operations
  async createForwardingDestination(destination: InsertForwardingDestination): Promise<ForwardingDestination> {
    const [forwardingDestination] = await db
      .insert(forwardingDestinations)
      .values(destination)
      .returning();
    return forwardingDestination;
  }

  async getForwardingDestinationsByAliasId(aliasId: number): Promise<ForwardingDestination[]> {
    return await db
      .select()
      .from(forwardingDestinations)
      .where(eq(forwardingDestinations.aliasId, aliasId))
      .orderBy(forwardingDestinations.createdAt);
  }

  async updateForwardingDestination(id: number, updates: Partial<ForwardingDestination>): Promise<ForwardingDestination> {
    const [destination] = await db
      .update(forwardingDestinations)
      .set(updates)
      .where(eq(forwardingDestinations.id, id))
      .returning();
    return destination;
  }

  async deleteForwardingDestination(id: number): Promise<void> {
    await db.delete(forwardingDestinations).where(eq(forwardingDestinations.id, id));
  }

  // Forwarding log operations
  async createForwardingLog(log: InsertForwardingLog): Promise<ForwardingLog> {
    const [forwardingLog] = await db
      .insert(forwardingLogs)
      .values(log)
      .returning();
    return forwardingLog;
  }

  async getForwardingLogsByAliasId(aliasId: number): Promise<ForwardingLog[]> {
    return await db
      .select()
      .from(forwardingLogs)
      .where(eq(forwardingLogs.aliasId, aliasId))
      .orderBy(desc(forwardingLogs.processedAt));
  }

  async getForwardingStats(aliasId: number): Promise<{
    totalForwarded: number;
    totalBlocked: number;
    totalAutoReplied: number;
    successRate: number;
  }> {
    const [forwardedCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(forwardingLogs)
      .where(and(eq(forwardingLogs.aliasId, aliasId), eq(forwardingLogs.action, "forwarded")));

    const [blockedCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(forwardingLogs)
      .where(and(eq(forwardingLogs.aliasId, aliasId), eq(forwardingLogs.action, "blocked")));

    const [autoRepliedCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(forwardingLogs)
      .where(and(eq(forwardingLogs.aliasId, aliasId), eq(forwardingLogs.action, "auto_replied")));

    const [successCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(forwardingLogs)
      .where(and(eq(forwardingLogs.aliasId, aliasId), eq(forwardingLogs.status, "success")));

    const totalLogs = forwardedCount.count + blockedCount.count + autoRepliedCount.count;
    const successRate = totalLogs > 0 ? (successCount.count / totalLogs) * 100 : 0;

    return {
      totalForwarded: forwardedCount.count,
      totalBlocked: blockedCount.count,
      totalAutoReplied: autoRepliedCount.count,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  // Contact list operations
  async createContactList(list: InsertContactList): Promise<ContactList> {
    const [newList] = await db.insert(contactLists).values(list).returning();
    return newList;
  }

  async getContactListsByUserId(userId: string): Promise<ContactList[]> {
    return await db.select().from(contactLists).where(eq(contactLists.userId, userId));
  }

  async updateContactList(id: number, updates: Partial<ContactList>): Promise<ContactList> {
    const [list] = await db
      .update(contactLists)
      .set(updates)
      .where(eq(contactLists.id, id))
      .returning();
    return list;
  }

  async deleteContactList(id: number): Promise<void> {
    await db.delete(contactLists).where(eq(contactLists.id, id));
  }

  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async getContactsByUserId(userId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.userId, userId)).orderBy(desc(contacts.createdAt));
  }

  async getContactsByListId(listId: number): Promise<Contact[]> {
    return await db
      .select({ 
        id: contacts.id,
        userId: contacts.userId,
        email: contacts.email,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        company: contacts.company,
        tags: contacts.tags,
        isActive: contacts.isActive,
        subscriptionDate: contacts.subscriptionDate,
        unsubscribedAt: contacts.unsubscribedAt,
        createdAt: contacts.createdAt,
      })
      .from(contacts)
      .innerJoin(contactListMemberships, eq(contacts.id, contactListMemberships.contactId))
      .where(eq(contactListMemberships.listId, listId));
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    const [contact] = await db
      .update(contacts)
      .set(updates)
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async addContactToList(contactId: number, listId: number): Promise<void> {
    await db.insert(contactListMemberships).values({ contactId, listId });
  }

  async removeContactFromList(contactId: number, listId: number): Promise<void> {
    await db
      .delete(contactListMemberships)
      .where(
        and(
          eq(contactListMemberships.contactId, contactId),
          eq(contactListMemberships.listId, listId)
        )
      );
  }

  // Campaign operations
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async getCampaignsByUserId(userId: string): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<{
    totalSubscribers: number;
    totalCampaigns: number;
    avgOpenRate: number;
    avgClickRate: number;
    totalRevenue: number;
  }> {
    const [subscriberCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.isActive, true)));

    const [campaignCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(campaigns)
      .where(eq(campaigns.userId, userId));

    const [avgRates] = await db
      .select({
        avgOpenRate: sql<number>`cast(avg(${campaigns.openRate}) as decimal(5,2))`,
        avgClickRate: sql<number>`cast(avg(${campaigns.clickRate}) as decimal(5,2))`,
      })
      .from(campaigns)
      .where(and(eq(campaigns.userId, userId), eq(campaigns.status, "sent")));

    return {
      totalSubscribers: subscriberCount?.count || 0,
      totalCampaigns: campaignCount?.count || 0,
      avgOpenRate: Number(avgRates?.avgOpenRate) || 0,
      avgClickRate: Number(avgRates?.avgClickRate) || 0,
      totalRevenue: 8429, // Mock revenue for demo
    };
  }

  // Lead source operations
  async createLeadSource(leadSource: InsertLeadSource): Promise<LeadSource> {
    const [source] = await db
      .insert(leadSources)
      .values(leadSource)
      .returning();
    return source;
  }

  async getLeadSourcesByUserId(userId: string): Promise<LeadSource[]> {
    return await db
      .select()
      .from(leadSources)
      .where(eq(leadSources.userId, userId))
      .orderBy(desc(leadSources.createdAt));
  }

  async updateLeadSource(id: number, updates: Partial<LeadSource>): Promise<LeadSource> {
    const [source] = await db
      .update(leadSources)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leadSources.id, id))
      .returning();
    return source;
  }

  async deleteLeadSource(id: number): Promise<void> {
    await db.delete(leadSources).where(eq(leadSources.id, id));
  }

  // Lead operations
  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db
      .insert(leads)
      .values(lead)
      .returning();
    return newLead;
  }

  async getLeadsByUserId(userId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsBySourceId(sourceId: number): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.sourceId, sourceId))
      .orderBy(desc(leads.createdAt));
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async convertLeadToContact(leadId: number, listId?: number): Promise<Contact> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Create contact from lead
    const [contact] = await db
      .insert(contacts)
      .values({
        userId: lead.userId,
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        tags: lead.tags,
      })
      .returning();

    // Add to list if specified
    if (listId) {
      await this.addContactToList(contact.id, listId);
    }

    // Update lead status
    await this.updateLead(leadId, {
      status: "converted",
      convertedToContactAt: new Date(),
    });

    return contact;
  }

  // Lead campaign operations
  async createLeadCampaign(campaign: InsertLeadCampaign): Promise<LeadCampaign> {
    const [leadCampaign] = await db
      .insert(leadCampaigns)
      .values(campaign)
      .returning();
    return leadCampaign;
  }

  async getLeadCampaignsByUserId(userId: string): Promise<LeadCampaign[]> {
    return await db
      .select()
      .from(leadCampaigns)
      .where(eq(leadCampaigns.userId, userId))
      .orderBy(desc(leadCampaigns.createdAt));
  }

  async updateLeadCampaign(id: number, updates: Partial<LeadCampaign>): Promise<LeadCampaign> {
    const [campaign] = await db
      .update(leadCampaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leadCampaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteLeadCampaign(id: number): Promise<void> {
    await db.delete(leadCampaigns).where(eq(leadCampaigns.id, id));
  }
}

export const storage = new DatabaseStorage();
