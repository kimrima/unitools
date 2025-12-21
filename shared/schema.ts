import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  username: true,
  passwordHash: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export const toolUsageEvents = pgTable("tool_usage_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: text("tool_id").notNull(),
  locale: text("locale").notNull().default('en'),
  countryCode: text("country_code"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertToolUsageEventSchema = createInsertSchema(toolUsageEvents).pick({
  toolId: true,
  locale: true,
  countryCode: true,
  sessionId: true,
});

export type InsertToolUsageEvent = z.infer<typeof insertToolUsageEventSchema>;
export type ToolUsageEvent = typeof toolUsageEvents.$inferSelect;

export const toolUsageDaily = pgTable("tool_usage_daily", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: text("tool_id").notNull(),
  date: date("date").notNull(),
  totalCount: integer("total_count").notNull().default(0),
  uniqueSessions: integer("unique_sessions").notNull().default(0),
});

export type ToolUsageDaily = typeof toolUsageDaily.$inferSelect;

export const countryUsageDaily = pgTable("country_usage_daily", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: text("country_code").notNull(),
  date: date("date").notNull(),
  totalCount: integer("total_count").notNull().default(0),
});

export type CountryUsageDaily = typeof countryUsageDaily.$inferSelect;

export const toolSettings = pgTable("tool_settings", {
  toolId: text("tool_id").primaryKey(),
  isActive: boolean("is_active").notNull().default(true),
  spotlightRank: integer("spotlight_rank"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertToolSettingsSchema = createInsertSchema(toolSettings).pick({
  toolId: true,
  isActive: true,
  spotlightRank: true,
});

export type InsertToolSettings = z.infer<typeof insertToolSettingsSchema>;
export type ToolSettings = typeof toolSettings.$inferSelect;

export const featureVotes = pgTable("feature_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: text("tool_id").notNull(),
  locale: text("locale").notNull().default('en'),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeatureVoteSchema = createInsertSchema(featureVotes).pick({
  toolId: true,
  locale: true,
  sessionId: true,
});

export type InsertFeatureVote = z.infer<typeof insertFeatureVoteSchema>;
export type FeatureVote = typeof featureVotes.$inferSelect;

export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminSession = typeof adminSessions.$inferSelect;
