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
  contactSegments,
  contactSegmentMemberships,
  campaigns,
  campaignRecipients,
  leadSources,
  leads,
  leadCampaigns,
  emailSequences,
  emailSequenceSteps,
  emailSequenceSubscribers,
  emailSequenceAnalytics,
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
  type InsertContactSegment,
  type ContactSegment,
  type ContactSegmentMembership,
  type InsertCampaign,
  type Campaign,
  type CampaignRecipient,
  type InsertLeadSource,
  type LeadSource,
  type InsertLead,
  type Lead,
  type InsertLeadCampaign,
  type LeadCampaign,
  type InsertEmailSequence,
  type EmailSequence,
  type InsertEmailSequenceStep,
  type EmailSequenceStep,
  type InsertEmailSequenceSubscriber,
  type EmailSequenceSubscriber,
  type InsertEmailSequenceAnalytics,
  type EmailSequenceAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail?(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Domain operations
  createDomain(domain: InsertDomain): Promise<Domain>;
  getDomainsByUserId(userId: string): Promise<Domain[]>;
  updateDomain(id: number, updates: Partial<Domain>): Promise<Domain>;
  deleteDomain(id: number): Promise<void>;
  
  // Email alias operations
  createEmailAlias(alias: InsertEmailAlias): Promise<EmailAlias>;
  getEmailAliasesByDomainId(domainId: number): Promise<EmailAlias[]>;
  getEmailAliasesByDomain(domainId: number): Promise<EmailAlias[]>;
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
  
  // Contact segment operations
  createContactSegment(segment: InsertContactSegment): Promise<ContactSegment>;
  getContactSegmentsByUserId(userId: string): Promise<ContactSegment[]>;
  getContactSegment(id: number): Promise<ContactSegment | undefined>;
  updateContactSegment(id: number, updates: Partial<ContactSegment>): Promise<ContactSegment>;
  deleteContactSegment(id: number): Promise<void>;
  getContactsBySegmentId(segmentId: number): Promise<Contact[]>;
  refreshSegmentMembership(segmentId: number): Promise<void>;
  addContactToSegment(contactId: number, segmentId: number): Promise<void>;
  removeContactFromSegment(contactId: number, segmentId: number): Promise<void>;
  
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

  // Email sequence operations
  createEmailSequence(sequence: InsertEmailSequence): Promise<EmailSequence>;
  getEmailSequencesByUserId(userId: string): Promise<EmailSequence[]>;
  getEmailSequence(id: number): Promise<EmailSequence | undefined>;
  updateEmailSequence(id: number, updates: Partial<EmailSequence>): Promise<EmailSequence>;
  deleteEmailSequence(id: number): Promise<void>;
  
  // Email sequence step operations
  createEmailSequenceStep(step: InsertEmailSequenceStep): Promise<EmailSequenceStep>;
  getEmailSequenceStepsBySequenceId(sequenceId: number): Promise<EmailSequenceStep[]>;
  updateEmailSequenceStep(id: number, updates: Partial<EmailSequenceStep>): Promise<EmailSequenceStep>;
  deleteEmailSequenceStep(id: number): Promise<void>;
  
  // Email sequence subscriber operations
  createEmailSequenceSubscriber(subscriber: InsertEmailSequenceSubscriber): Promise<EmailSequenceSubscriber>;
  getEmailSequenceSubscribersBySequenceId(sequenceId: number): Promise<EmailSequenceSubscriber[]>;
  updateEmailSequenceSubscriber(id: number, updates: Partial<EmailSequenceSubscriber>): Promise<EmailSequenceSubscriber>;
  deleteEmailSequenceSubscriber(id: number): Promise<void>;
  
  // Email sequence analytics operations
  createEmailSequenceAnalytics(analytics: InsertEmailSequenceAnalytics): Promise<EmailSequenceAnalytics>;
  getEmailSequenceAnalyticsBySequenceId(sequenceId: number): Promise<EmailSequenceAnalytics[]>;
  getEmailSequenceStats(sequenceId: number): Promise<{
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalUnsubscribed: number;
    openRate: number;
    clickRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async getEmailAliasesByDomain(domainId: number): Promise<EmailAlias[]> {
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

  // Contact segment operations
  async createContactSegment(segment: InsertContactSegment): Promise<ContactSegment> {
    const [newSegment] = await db.insert(contactSegments).values(segment).returning();
    // Trigger initial membership calculation if auto-update is enabled
    if (newSegment.isAutoUpdate) {
      await this.refreshSegmentMembership(newSegment.id);
    }
    return newSegment;
  }

  async getContactSegmentsByUserId(userId: string): Promise<ContactSegment[]> {
    return await db.select().from(contactSegments).where(eq(contactSegments.userId, userId)).orderBy(desc(contactSegments.createdAt));
  }

  async getContactSegment(id: number): Promise<ContactSegment | undefined> {
    const [segment] = await db.select().from(contactSegments).where(eq(contactSegments.id, id));
    return segment;
  }

  async updateContactSegment(id: number, updates: Partial<ContactSegment>): Promise<ContactSegment> {
    const [segment] = await db
      .update(contactSegments)
      .set({ ...updates, lastUpdatedAt: new Date() })
      .where(eq(contactSegments.id, id))
      .returning();
    
    // Refresh membership if conditions or auto-update changed
    if (updates.conditions || updates.isAutoUpdate) {
      await this.refreshSegmentMembership(segment.id);
    }
    
    return segment;
  }

  async deleteContactSegment(id: number): Promise<void> {
    await db.delete(contactSegments).where(eq(contactSegments.id, id));
  }

  async getContactsBySegmentId(segmentId: number): Promise<Contact[]> {
    return await db
      .select({ 
        id: contacts.id,
        userId: contacts.userId,
        email: contacts.email,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        company: contacts.company,
        jobTitle: contacts.jobTitle,
        phone: contacts.phone,
        location: contacts.location,
        website: contacts.website,
        customFields: contacts.customFields,
        tags: contacts.tags,
        isActive: contacts.isActive,
        subscriptionDate: contacts.subscriptionDate,
        unsubscribedAt: contacts.unsubscribedAt,
        lastActivityAt: contacts.lastActivityAt,
        totalEmailsReceived: contacts.totalEmailsReceived,
        totalEmailsOpened: contacts.totalEmailsOpened,
        totalEmailsClicked: contacts.totalEmailsClicked,
        engagementScore: contacts.engagementScore,
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt,
      })
      .from(contacts)
      .innerJoin(contactSegmentMemberships, eq(contacts.id, contactSegmentMemberships.contactId))
      .where(eq(contactSegmentMemberships.segmentId, segmentId));
  }

  async refreshSegmentMembership(segmentId: number): Promise<void> {
    const segment = await this.getContactSegment(segmentId);
    if (!segment || !segment.conditions) return;

    // Clear existing memberships
    await db.delete(contactSegmentMemberships).where(eq(contactSegmentMemberships.segmentId, segmentId));

    // Get all contacts for the user
    const allContacts = await this.getContactsByUserId(segment.userId);
    
    // Filter contacts based on segment conditions
    const matchingContacts = this.filterContactsByConditions(allContacts, segment.conditions as any);
    
    // Add matching contacts to segment
    if (matchingContacts.length > 0) {
      const memberships = matchingContacts.map(contact => ({
        contactId: contact.id,
        segmentId: segmentId,
      }));
      
      await db.insert(contactSegmentMemberships).values(memberships);
    }

    // Update contact count
    await db
      .update(contactSegments)
      .set({ 
        contactCount: matchingContacts.length,
        lastUpdatedAt: new Date()
      })
      .where(eq(contactSegments.id, segmentId));
  }

  async addContactToSegment(contactId: number, segmentId: number): Promise<void> {
    await db.insert(contactSegmentMemberships).values({ contactId, segmentId });
    
    // Update contact count
    const [count] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(contactSegmentMemberships)
      .where(eq(contactSegmentMemberships.segmentId, segmentId));
    
    await db
      .update(contactSegments)
      .set({ contactCount: count.count })
      .where(eq(contactSegments.id, segmentId));
  }

  async removeContactFromSegment(contactId: number, segmentId: number): Promise<void> {
    await db
      .delete(contactSegmentMemberships)
      .where(
        and(
          eq(contactSegmentMemberships.contactId, contactId),
          eq(contactSegmentMemberships.segmentId, segmentId)
        )
      );
    
    // Update contact count
    const [count] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(contactSegmentMemberships)
      .where(eq(contactSegmentMemberships.segmentId, segmentId));
    
    await db
      .update(contactSegments)
      .set({ contactCount: count.count })
      .where(eq(contactSegments.id, segmentId));
  }

  // Helper method to filter contacts by segment conditions
  private filterContactsByConditions(contacts: Contact[], conditions: any): Contact[] {
    return contacts.filter(contact => {
      try {
        return this.evaluateConditions(contact, conditions);
      } catch (error) {
        console.error('Error evaluating segment conditions:', error);
        return false;
      }
    });
  }

  private evaluateConditions(contact: Contact, conditions: any): boolean {
    if (!conditions) return true;

    const { operator = 'AND', rules = [] } = conditions;

    if (rules.length === 0) return true;

    const results = rules.map((rule: any) => {
      if (rule.rules) {
        // Nested condition group
        return this.evaluateConditions(contact, rule);
      }
      
      // Individual rule
      return this.evaluateRule(contact, rule);
    });

    if (operator === 'AND') {
      return results.every(Boolean);
    } else {
      return results.some(Boolean);
    }
  }

  private evaluateRule(contact: Contact, rule: any): boolean {
    const { field, operator, value } = rule;
    
    let contactValue: any;
    
    // Get contact field value
    switch (field) {
      case 'email':
        contactValue = contact.email;
        break;
      case 'firstName':
        contactValue = contact.firstName;
        break;
      case 'lastName':
        contactValue = contact.lastName;
        break;
      case 'company':
        contactValue = contact.company;
        break;
      case 'jobTitle':
        contactValue = contact.jobTitle;
        break;
      case 'location':
        contactValue = contact.location;
        break;
      case 'engagementScore':
        contactValue = contact.engagementScore || 0;
        break;
      case 'totalEmailsOpened':
        contactValue = contact.totalEmailsOpened || 0;
        break;
      case 'totalEmailsClicked':
        contactValue = contact.totalEmailsClicked || 0;
        break;
      case 'createdAt':
        contactValue = contact.createdAt;
        break;
      case 'lastActivityAt':
        contactValue = contact.lastActivityAt;
        break;
      case 'tags':
        contactValue = contact.tags || [];
        break;
      default:
        // Check custom fields
        if (contact.customFields && typeof contact.customFields === 'object') {
          contactValue = (contact.customFields as any)[field];
        }
        break;
    }

    // Apply operator
    switch (operator) {
      case 'equals':
        return contactValue === value;
      case 'not_equals':
        return contactValue !== value;
      case 'contains':
        return String(contactValue || '').toLowerCase().includes(String(value || '').toLowerCase());
      case 'not_contains':
        return !String(contactValue || '').toLowerCase().includes(String(value || '').toLowerCase());
      case 'starts_with':
        return String(contactValue || '').toLowerCase().startsWith(String(value || '').toLowerCase());
      case 'ends_with':
        return String(contactValue || '').toLowerCase().endsWith(String(value || '').toLowerCase());
      case 'greater_than':
        return Number(contactValue || 0) > Number(value || 0);
      case 'less_than':
        return Number(contactValue || 0) < Number(value || 0);
      case 'greater_equal':
        return Number(contactValue || 0) >= Number(value || 0);
      case 'less_equal':
        return Number(contactValue || 0) <= Number(value || 0);
      case 'is_empty':
        return !contactValue || contactValue === '' || (Array.isArray(contactValue) && contactValue.length === 0);
      case 'is_not_empty':
        return !!contactValue && contactValue !== '' && (!Array.isArray(contactValue) || contactValue.length > 0);
      case 'in_list':
        return Array.isArray(value) && value.includes(contactValue);
      case 'not_in_list':
        return !Array.isArray(value) || !value.includes(contactValue);
      case 'date_before':
        return new Date(contactValue || 0) < new Date(value || 0);
      case 'date_after':
        return new Date(contactValue || 0) > new Date(value || 0);
      case 'tag_contains':
        return Array.isArray(contactValue) && contactValue.some(tag => String(tag).toLowerCase().includes(String(value || '').toLowerCase()));
      default:
        return false;
    }
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

  // Email sequence operations
  async createEmailSequence(sequence: InsertEmailSequence): Promise<EmailSequence> {
    const [newSequence] = await db
      .insert(emailSequences)
      .values(sequence)
      .returning();
    return newSequence;
  }

  async getEmailSequencesByUserId(userId: string): Promise<EmailSequence[]> {
    return await db
      .select()
      .from(emailSequences)
      .where(eq(emailSequences.userId, userId))
      .orderBy(desc(emailSequences.createdAt));
  }

  async getEmailSequence(id: number): Promise<EmailSequence | undefined> {
    const [sequence] = await db
      .select()
      .from(emailSequences)
      .where(eq(emailSequences.id, id));
    return sequence;
  }

  async updateEmailSequence(id: number, updates: Partial<EmailSequence>): Promise<EmailSequence> {
    const [updated] = await db
      .update(emailSequences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailSequences.id, id))
      .returning();
    return updated;
  }

  async deleteEmailSequence(id: number): Promise<void> {
    await db.delete(emailSequences).where(eq(emailSequences.id, id));
  }

  // Email sequence step operations
  async createEmailSequenceStep(step: InsertEmailSequenceStep): Promise<EmailSequenceStep> {
    const [newStep] = await db
      .insert(emailSequenceSteps)
      .values(step)
      .returning();
    return newStep;
  }

  async getEmailSequenceStepsBySequenceId(sequenceId: number): Promise<EmailSequenceStep[]> {
    return await db
      .select()
      .from(emailSequenceSteps)
      .where(eq(emailSequenceSteps.sequenceId, sequenceId))
      .orderBy(emailSequenceSteps.createdAt);
  }

  async updateEmailSequenceStep(id: number, updates: Partial<EmailSequenceStep>): Promise<EmailSequenceStep> {
    const [updated] = await db
      .update(emailSequenceSteps)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailSequenceSteps.id, id))
      .returning();
    return updated;
  }

  async deleteEmailSequenceStep(id: number): Promise<void> {
    await db.delete(emailSequenceSteps).where(eq(emailSequenceSteps.id, id));
  }

  // Email sequence subscriber operations
  async createEmailSequenceSubscriber(subscriber: InsertEmailSequenceSubscriber): Promise<EmailSequenceSubscriber> {
    const [newSubscriber] = await db
      .insert(emailSequenceSubscribers)
      .values(subscriber)
      .returning();
    return newSubscriber;
  }

  async getEmailSequenceSubscribersBySequenceId(sequenceId: number): Promise<EmailSequenceSubscriber[]> {
    return await db
      .select()
      .from(emailSequenceSubscribers)
      .where(eq(emailSequenceSubscribers.sequenceId, sequenceId))
      .orderBy(desc(emailSequenceSubscribers.createdAt));
  }

  async updateEmailSequenceSubscriber(id: number, updates: Partial<EmailSequenceSubscriber>): Promise<EmailSequenceSubscriber> {
    const [updated] = await db
      .update(emailSequenceSubscribers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailSequenceSubscribers.id, id))
      .returning();
    return updated;
  }

  async deleteEmailSequenceSubscriber(id: number): Promise<void> {
    await db.delete(emailSequenceSubscribers).where(eq(emailSequenceSubscribers.id, id));
  }

  // Email sequence analytics operations
  async createEmailSequenceAnalytics(analytics: InsertEmailSequenceAnalytics): Promise<EmailSequenceAnalytics> {
    const [newAnalytics] = await db
      .insert(emailSequenceAnalytics)
      .values(analytics)
      .returning();
    return newAnalytics;
  }

  async getEmailSequenceAnalyticsBySequenceId(sequenceId: number): Promise<EmailSequenceAnalytics[]> {
    return await db
      .select()
      .from(emailSequenceAnalytics)
      .where(eq(emailSequenceAnalytics.sequenceId, sequenceId))
      .orderBy(desc(emailSequenceAnalytics.timestamp));
  }

  async getEmailSequenceStats(sequenceId: number): Promise<{
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalUnsubscribed: number;
    openRate: number;
    clickRate: number;
  }> {
    const stats = await db
      .select({
        eventType: emailSequenceAnalytics.eventType,
        count: sql<number>`count(*)`,
      })
      .from(emailSequenceAnalytics)
      .where(eq(emailSequenceAnalytics.sequenceId, sequenceId))
      .groupBy(emailSequenceAnalytics.eventType);

    const statMap = stats.reduce((acc, { eventType, count }) => {
      acc[eventType] = count;
      return acc;
    }, {} as Record<string, number>);

    const totalSent = statMap.sent || 0;
    const totalOpened = statMap.opened || 0;
    const totalClicked = statMap.clicked || 0;
    const totalBounced = statMap.bounced || 0;
    const totalUnsubscribed = statMap.unsubscribed || 0;

    return {
      totalSent,
      totalOpened,
      totalClicked,
      totalBounced,
      totalUnsubscribed,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
    };
  }
}

export const storage = new DatabaseStorage();
