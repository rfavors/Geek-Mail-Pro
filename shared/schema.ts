import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id").unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  plan: varchar("plan").default("starter"), // starter, pro, enterprise, unlimited
  subscriptionStatus: varchar("subscription_status").default("trialing"), // trialing, active, canceled, past_due
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Domain configuration
export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  domain: varchar("domain").notNull(),
  isVerified: boolean("is_verified").default(false),
  spfRecord: text("spf_record"),
  dkimRecord: text("dkim_record"),
  dmarcRecord: text("dmarc_record"),
  warmingProgress: integer("warming_progress").default(0),
  senderScore: integer("sender_score").default(50),
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default("0.00"),
  spamRate: decimal("spam_rate", { precision: 5, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email aliases
export const emailAliases = pgTable("email_aliases", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domains.id),
  alias: varchar("alias").notNull(), // e.g., "support", "marketing"
  destination: varchar("destination"), // Primary destination email
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  forwardingType: varchar("forwarding_type").default("simple"), // simple, conditional, split, round_robin
  autoReply: boolean("auto_reply").default(false),
  autoReplyMessage: text("auto_reply_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Advanced forwarding rules
export const forwardingRules = pgTable("forwarding_rules", {
  id: serial("id").primaryKey(),
  aliasId: integer("alias_id").notNull().references(() => emailAliases.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  priority: integer("priority").default(1), // Lower number = higher priority
  isActive: boolean("is_active").default(true),
  conditions: jsonb("conditions").notNull(), // JSON conditions for when rule applies
  actions: jsonb("actions").notNull(), // JSON actions to take when conditions match
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email forwarding destinations
export const forwardingDestinations = pgTable("forwarding_destinations", {
  id: serial("id").primaryKey(),
  aliasId: integer("alias_id").notNull().references(() => emailAliases.id, { onDelete: "cascade" }),
  email: varchar("email").notNull(),
  name: varchar("name"),
  weight: integer("weight").default(1), // For round-robin distribution
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email forwarding logs
export const forwardingLogs = pgTable("forwarding_logs", {
  id: serial("id").primaryKey(),
  aliasId: integer("alias_id").notNull().references(() => emailAliases.id, { onDelete: "cascade" }),
  ruleId: integer("rule_id").references(() => forwardingRules.id),
  fromEmail: varchar("from_email").notNull(),
  toEmail: varchar("to_email").notNull(),
  subject: varchar("subject"),
  action: varchar("action").notNull(), // forwarded, blocked, auto_replied
  status: varchar("status").default("pending"), // pending, success, failed
  errorMessage: text("error_message"),
  processedAt: timestamp("processed_at").defaultNow(),
});

// Contact lists
export const contactLists = pgTable("contact_lists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  subscriberCount: integer("subscriber_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contacts
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  email: varchar("email").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  phone: varchar("phone"),
  location: varchar("location"),
  website: varchar("website"),
  notes: text("notes"),
  customFields: jsonb("custom_fields"), // Flexible custom data storage
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  subscriptionDate: timestamp("subscription_date").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  lastActivityAt: timestamp("last_activity_at"), // For engagement tracking
  totalEmailsReceived: integer("total_emails_received").default(0),
  totalEmailsOpened: integer("total_emails_opened").default(0),
  totalEmailsClicked: integer("total_emails_clicked").default(0),
  engagementScore: integer("engagement_score").default(0), // 0-100 engagement score
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact list memberships
export const contactListMemberships = pgTable("contact_list_memberships", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  listId: integer("list_id").notNull().references(() => contactLists.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact segments for advanced targeting
export const contactSegments = pgTable("contact_segments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  conditions: jsonb("conditions").notNull(), // Complex filtering conditions
  contactCount: integer("contact_count").default(0),
  isActive: boolean("is_active").default(true),
  isAutoUpdate: boolean("is_auto_update").default(true), // Automatically update segment membership
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact segment memberships (many-to-many)
export const contactSegmentMemberships = pgTable("contact_segment_memberships", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  segmentId: integer("segment_id").notNull().references(() => contactSegments.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow(),
});

// Email campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  subject: text("subject").notNull(),
  fromEmail: varchar("from_email").notNull(),
  fromName: varchar("from_name"),
  content: jsonb("content").notNull(), // Rich content structure
  status: varchar("status").default("draft"), // draft, scheduled, sending, sent
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  totalSent: integer("total_sent").default(0),
  totalOpens: integer("total_opens").default(0),
  totalClicks: integer("total_clicks").default(0),
  totalBounces: integer("total_bounces").default(0),
  totalUnsubscribes: integer("total_unsubscribes").default(0),
  openRate: decimal("open_rate", { precision: 5, scale: 2 }).default("0.00"),
  clickRate: decimal("click_rate", { precision: 5, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign recipients
export const campaignRecipients = pgTable("campaign_recipients", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  status: varchar("status").default("pending"), // pending, sent, opened, clicked, bounced
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lead generation tables
export const leadSources = pgTable("lead_sources", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // linkedin, website, social, api, manual
  config: jsonb("config").notNull(), // Source-specific configuration
  isActive: boolean("is_active").default(true),
  totalLeads: integer("total_leads").default(0),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sourceId: integer("source_id").references(() => leadSources.id, { onDelete: "cascade" }),
  email: varchar("email").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  linkedinUrl: varchar("linkedin_url"),
  website: varchar("website"),
  phone: varchar("phone"),
  location: varchar("location"),
  industry: varchar("industry"),
  score: integer("score").default(0), // Lead quality score 0-100
  status: varchar("status").default("new"), // new, qualified, contacted, converted, rejected
  tags: text("tags").array(),
  notes: text("notes"),
  metadata: jsonb("metadata"), // Additional data from source
  convertedToContactAt: timestamp("converted_to_contact_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leadCampaigns = pgTable("lead_campaigns", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  sourceIds: integer("source_ids").array(),
  filters: jsonb("filters"), // Lead filtering criteria
  status: varchar("status").default("active"), // active, paused, completed
  totalLeads: integer("total_leads").default(0),
  qualifiedLeads: integer("qualified_leads").default(0),
  convertedLeads: integer("converted_leads").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Sequence Builder Tables
export const emailSequences = pgTable("email_sequences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("draft"), // draft, active, paused, archived
  triggerType: varchar("trigger_type").notNull(), // signup, purchase, abandoned_cart, date_based, manual
  triggerData: jsonb("trigger_data"), // configuration for trigger
  flowData: jsonb("flow_data").notNull(), // drag-drop visual flow data
  settings: jsonb("settings"), // sequence settings like delays, timezones
  totalSubscribers: integer("total_subscribers").default(0),
  activeSubscribers: integer("active_subscribers").default(0),
  completedSubscribers: integer("completed_subscribers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailSequenceSteps = pgTable("email_sequence_steps", {
  id: serial("id").primaryKey(),
  sequenceId: integer("sequence_id").notNull().references(() => emailSequences.id, { onDelete: "cascade" }),
  stepId: varchar("step_id").notNull(), // unique within sequence
  stepType: varchar("step_type").notNull(), // email, delay, condition, action
  name: varchar("name").notNull(),
  position: jsonb("position"), // x, y coordinates for visual editor
  configuration: jsonb("configuration").notNull(), // step-specific config
  nextSteps: jsonb("next_steps"), // array of next step IDs with conditions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailSequenceSubscribers = pgTable("email_sequence_subscribers", {
  id: serial("id").primaryKey(),
  sequenceId: integer("sequence_id").notNull().references(() => emailSequences.id, { onDelete: "cascade" }),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  currentStepId: varchar("current_step_id"),
  status: varchar("status").notNull().default("active"), // active, paused, completed, unsubscribed
  startedAt: timestamp("started_at").defaultNow(),
  lastEmailSentAt: timestamp("last_email_sent_at"),
  nextEmailScheduledAt: timestamp("next_email_scheduled_at"),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"), // tracking data, custom fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailSequenceAnalytics = pgTable("email_sequence_analytics", {
  id: serial("id").primaryKey(),
  sequenceId: integer("sequence_id").notNull().references(() => emailSequences.id, { onDelete: "cascade" }),
  stepId: varchar("step_id").notNull(),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  eventType: varchar("event_type").notNull(), // sent, delivered, opened, clicked, bounced, unsubscribed
  eventData: jsonb("event_data"), // additional event information
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  domains: many(domains),
  contactLists: many(contactLists),
  contacts: many(contacts),
  contactSegments: many(contactSegments),
  campaigns: many(campaigns),
  leadSources: many(leadSources),
  leads: many(leads),
  leadCampaigns: many(leadCampaigns),
  emailSequences: many(emailSequences),
}));

export const domainRelations = relations(domains, ({ one, many }) => ({
  user: one(users, { fields: [domains.userId], references: [users.id] }),
  aliases: many(emailAliases),
}));

export const emailAliasRelations = relations(emailAliases, ({ one, many }) => ({
  domain: one(domains, { fields: [emailAliases.domainId], references: [domains.id] }),
  forwardingRules: many(forwardingRules),
  forwardingDestinations: many(forwardingDestinations),
  forwardingLogs: many(forwardingLogs),
}));

export const forwardingRuleRelations = relations(forwardingRules, ({ one, many }) => ({
  alias: one(emailAliases, { fields: [forwardingRules.aliasId], references: [emailAliases.id] }),
  logs: many(forwardingLogs),
}));

export const forwardingDestinationRelations = relations(forwardingDestinations, ({ one }) => ({
  alias: one(emailAliases, { fields: [forwardingDestinations.aliasId], references: [emailAliases.id] }),
}));

export const forwardingLogRelations = relations(forwardingLogs, ({ one }) => ({
  alias: one(emailAliases, { fields: [forwardingLogs.aliasId], references: [emailAliases.id] }),
  rule: one(forwardingRules, { fields: [forwardingLogs.ruleId], references: [forwardingRules.id] }),
}));

export const contactListRelations = relations(contactLists, ({ one, many }) => ({
  user: one(users, { fields: [contactLists.userId], references: [users.id] }),
  memberships: many(contactListMemberships),
}));

export const contactRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, { fields: [contacts.userId], references: [users.id] }),
  memberships: many(contactListMemberships),
  segmentMemberships: many(contactSegmentMemberships),
  campaignRecipients: many(campaignRecipients),
}));

export const contactSegmentRelations = relations(contactSegments, ({ one, many }) => ({
  user: one(users, { fields: [contactSegments.userId], references: [users.id] }),
  memberships: many(contactSegmentMemberships),
}));

export const contactSegmentMembershipRelations = relations(contactSegmentMemberships, ({ one }) => ({
  contact: one(contacts, { fields: [contactSegmentMemberships.contactId], references: [contacts.id] }),
  segment: one(contactSegments, { fields: [contactSegmentMemberships.segmentId], references: [contactSegments.id] }),
}));

export const campaignRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, { fields: [campaigns.userId], references: [users.id] }),
  recipients: many(campaignRecipients),
}));

export const leadSourceRelations = relations(leadSources, ({ one, many }) => ({
  user: one(users, { fields: [leadSources.userId], references: [users.id] }),
  leads: many(leads),
}));

export const leadRelations = relations(leads, ({ one }) => ({
  user: one(users, { fields: [leads.userId], references: [users.id] }),
  source: one(leadSources, { fields: [leads.sourceId], references: [leadSources.id] }),
}));

export const leadCampaignRelations = relations(leadCampaigns, ({ one }) => ({
  user: one(users, { fields: [leadCampaigns.userId], references: [users.id] }),
}));

export const emailSequenceRelations = relations(emailSequences, ({ one, many }) => ({
  user: one(users, { fields: [emailSequences.userId], references: [users.id] }),
  steps: many(emailSequenceSteps),
  subscribers: many(emailSequenceSubscribers),
  analytics: many(emailSequenceAnalytics),
}));

export const emailSequenceStepRelations = relations(emailSequenceSteps, ({ one }) => ({
  sequence: one(emailSequences, { fields: [emailSequenceSteps.sequenceId], references: [emailSequences.id] }),
}));

export const emailSequenceSubscriberRelations = relations(emailSequenceSubscribers, ({ one }) => ({
  sequence: one(emailSequences, { fields: [emailSequenceSubscribers.sequenceId], references: [emailSequences.id] }),
  contact: one(contacts, { fields: [emailSequenceSubscribers.contactId], references: [contacts.id] }),
}));

export const emailSequenceAnalyticsRelations = relations(emailSequenceAnalytics, ({ one }) => ({
  sequence: one(emailSequences, { fields: [emailSequenceAnalytics.sequenceId], references: [emailSequences.id] }),
  contact: one(contacts, { fields: [emailSequenceAnalytics.contactId], references: [contacts.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
});

export const insertEmailAliasSchema = createInsertSchema(emailAliases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForwardingRuleSchema = createInsertSchema(forwardingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForwardingDestinationSchema = createInsertSchema(forwardingDestinations).omit({
  id: true,
  createdAt: true,
});

export const insertForwardingLogSchema = createInsertSchema(forwardingLogs).omit({
  id: true,
  processedAt: true,
});

export const insertContactListSchema = createInsertSchema(contactLists).omit({
  id: true,
  subscriberCount: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSegmentSchema = createInsertSchema(contactSegments).omit({
  id: true,
  contactCount: true,
  lastUpdatedAt: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  totalSent: true,
  totalOpens: true,
  totalClicks: true,
  totalBounces: true,
  totalUnsubscribes: true,
  openRate: true,
  clickRate: true,
  createdAt: true,
});

export const insertLeadSourceSchema = createInsertSchema(leadSources).omit({
  id: true,
  totalLeads: true,
  lastSyncAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  convertedToContactAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadCampaignSchema = createInsertSchema(leadCampaigns).omit({
  id: true,
  totalLeads: true,
  qualifiedLeads: true,
  convertedLeads: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailSequenceSchema = createInsertSchema(emailSequences).omit({
  id: true,
  totalSubscribers: true,
  activeSubscribers: true,
  completedSubscribers: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailSequenceStepSchema = createInsertSchema(emailSequenceSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailSequenceSubscriberSchema = createInsertSchema(emailSequenceSubscribers).omit({
  id: true,
  startedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailSequenceAnalyticsSchema = createInsertSchema(emailSequenceAnalytics).omit({
  id: true,
  timestamp: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;
export type InsertEmailAlias = z.infer<typeof insertEmailAliasSchema>;
export type EmailAlias = typeof emailAliases.$inferSelect;
export type InsertForwardingRule = z.infer<typeof insertForwardingRuleSchema>;
export type ForwardingRule = typeof forwardingRules.$inferSelect;
export type InsertForwardingDestination = z.infer<typeof insertForwardingDestinationSchema>;
export type ForwardingDestination = typeof forwardingDestinations.$inferSelect;
export type InsertForwardingLog = z.infer<typeof insertForwardingLogSchema>;
export type ForwardingLog = typeof forwardingLogs.$inferSelect;
export type InsertContactList = z.infer<typeof insertContactListSchema>;
export type ContactList = typeof contactLists.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContactSegment = z.infer<typeof insertContactSegmentSchema>;
export type ContactSegment = typeof contactSegments.$inferSelect;
export type ContactSegmentMembership = typeof contactSegmentMemberships.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type InsertLeadSource = z.infer<typeof insertLeadSourceSchema>;
export type LeadSource = typeof leadSources.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLeadCampaign = z.infer<typeof insertLeadCampaignSchema>;
export type LeadCampaign = typeof leadCampaigns.$inferSelect;
export type InsertEmailSequence = z.infer<typeof insertEmailSequenceSchema>;
export type EmailSequence = typeof emailSequences.$inferSelect;
export type InsertEmailSequenceStep = z.infer<typeof insertEmailSequenceStepSchema>;
export type EmailSequenceStep = typeof emailSequenceSteps.$inferSelect;
export type InsertEmailSequenceSubscriber = z.infer<typeof insertEmailSequenceSubscriberSchema>;
export type EmailSequenceSubscriber = typeof emailSequenceSubscribers.$inferSelect;
export type InsertEmailSequenceAnalytics = z.infer<typeof insertEmailSequenceAnalyticsSchema>;
export type EmailSequenceAnalytics = typeof emailSequenceAnalytics.$inferSelect;
