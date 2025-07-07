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
  currentPlan: varchar("current_plan").default("starter"),
  customerId: varchar("stripe_customer_id"),
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
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  subscriptionDate: timestamp("subscription_date").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact list memberships
export const contactListMemberships = pgTable("contact_list_memberships", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  listId: integer("list_id").notNull().references(() => contactLists.id),
  createdAt: timestamp("created_at").defaultNow(),
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

// Relations
export const userRelations = relations(users, ({ many }) => ({
  domains: many(domains),
  contactLists: many(contactLists),
  contacts: many(contacts),
  campaigns: many(campaigns),
}));

export const domainRelations = relations(domains, ({ one, many }) => ({
  user: one(users, { fields: [domains.userId], references: [users.id] }),
  aliases: many(emailAliases),
}));

export const emailAliasRelations = relations(emailAliases, ({ one }) => ({
  domain: one(domains, { fields: [emailAliases.domainId], references: [domains.id] }),
}));

export const contactListRelations = relations(contactLists, ({ one, many }) => ({
  user: one(users, { fields: [contactLists.userId], references: [users.id] }),
  memberships: many(contactListMemberships),
}));

export const contactRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, { fields: [contacts.userId], references: [users.id] }),
  memberships: many(contactListMemberships),
  campaignRecipients: many(campaignRecipients),
}));

export const campaignRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, { fields: [campaigns.userId], references: [users.id] }),
  recipients: many(campaignRecipients),
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
});

export const insertContactListSchema = createInsertSchema(contactLists).omit({
  id: true,
  subscriberCount: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
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

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;
export type InsertEmailAlias = z.infer<typeof insertEmailAliasSchema>;
export type EmailAlias = typeof emailAliases.$inferSelect;
export type InsertContactList = z.infer<typeof insertContactListSchema>;
export type ContactList = typeof contactLists.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
