import { 
  type User, type InsertUser,
  type AdminUser, type InsertAdminUser,
  type ToolUsageEvent, type InsertToolUsageEvent,
  type ToolSettings, type InsertToolSettings,
  type FeatureVote, type InsertFeatureVote,
  type AdminSession,
  adminUsers, toolUsageEvents, toolSettings, featureVotes, adminSessions, toolUsageDaily, countryUsageDaily
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
  updateAdminLastLogin(id: string): Promise<void>;
  
  createAdminSession(adminId: string, token: string, expiresAt: Date): Promise<AdminSession>;
  getAdminSession(token: string): Promise<AdminSession | undefined>;
  deleteAdminSession(token: string): Promise<void>;
  
  logToolUsage(event: InsertToolUsageEvent): Promise<void>;
  getToolUsageStats(): Promise<{ toolId: string; count: number }[]>;
  getTopTools(limit: number): Promise<{ toolId: string; count: number }[]>;
  getCountryStats(): Promise<{ countryCode: string; count: number }[]>;
  getTotalUsageToday(): Promise<number>;
  
  getToolSettings(toolId: string): Promise<ToolSettings | undefined>;
  getAllToolSettings(): Promise<ToolSettings[]>;
  upsertToolSettings(settings: InsertToolSettings): Promise<ToolSettings>;
  
  createFeatureVote(vote: InsertFeatureVote): Promise<FeatureVote>;
  getFeatureVotesByTool(): Promise<{ toolId: string; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    return { ...insertUser, id };
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    return result[0];
  }

  async createAdmin(admin: InsertAdminUser): Promise<AdminUser> {
    const result = await db.insert(adminUsers).values(admin).returning();
    return result[0];
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await db.update(adminUsers).set({ lastLogin: new Date() }).where(eq(adminUsers.id, id));
  }

  async createAdminSession(adminId: string, token: string, expiresAt: Date): Promise<AdminSession> {
    const result = await db.insert(adminSessions).values({ adminId, token, expiresAt }).returning();
    return result[0];
  }

  async getAdminSession(token: string): Promise<AdminSession | undefined> {
    const result = await db.select().from(adminSessions).where(eq(adminSessions.token, token)).limit(1);
    return result[0];
  }

  async deleteAdminSession(token: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  }

  async logToolUsage(event: InsertToolUsageEvent): Promise<void> {
    await db.insert(toolUsageEvents).values(event);
    
    const today = new Date().toISOString().split('T')[0];
    await db.execute(sql`
      INSERT INTO tool_usage_daily (id, tool_id, date, total_count, unique_sessions)
      VALUES (gen_random_uuid(), ${event.toolId}, ${today}, 1, 1)
      ON CONFLICT (tool_id, date) DO UPDATE SET 
        total_count = tool_usage_daily.total_count + 1
    `).catch(() => {});
    
    if (event.countryCode) {
      await db.execute(sql`
        INSERT INTO country_usage_daily (id, country_code, date, total_count)
        VALUES (gen_random_uuid(), ${event.countryCode}, ${today}, 1)
        ON CONFLICT (country_code, date) DO UPDATE SET 
          total_count = country_usage_daily.total_count + 1
      `).catch(() => {});
    }
  }

  async getToolUsageStats(): Promise<{ toolId: string; count: number }[]> {
    const result = await db.select({
      toolId: toolUsageEvents.toolId,
      count: sql<number>`count(*)::int`
    }).from(toolUsageEvents).groupBy(toolUsageEvents.toolId);
    return result;
  }

  async getTopTools(limit: number): Promise<{ toolId: string; count: number }[]> {
    const result = await db.select({
      toolId: toolUsageEvents.toolId,
      count: sql<number>`count(*)::int`
    }).from(toolUsageEvents)
      .groupBy(toolUsageEvents.toolId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
    return result;
  }

  async getCountryStats(): Promise<{ countryCode: string; count: number }[]> {
    const result = await db.select({
      countryCode: toolUsageEvents.countryCode,
      count: sql<number>`count(*)::int`
    }).from(toolUsageEvents)
      .where(sql`${toolUsageEvents.countryCode} IS NOT NULL`)
      .groupBy(toolUsageEvents.countryCode);
    return result as { countryCode: string; count: number }[];
  }

  async getTotalUsageToday(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.select({
      count: sql<number>`count(*)::int`
    }).from(toolUsageEvents)
      .where(sql`DATE(${toolUsageEvents.createdAt}) = ${today}`);
    return result[0]?.count || 0;
  }

  async getToolSettings(toolId: string): Promise<ToolSettings | undefined> {
    const result = await db.select().from(toolSettings).where(eq(toolSettings.toolId, toolId)).limit(1);
    return result[0];
  }

  async getAllToolSettings(): Promise<ToolSettings[]> {
    return await db.select().from(toolSettings);
  }

  async upsertToolSettings(settings: InsertToolSettings): Promise<ToolSettings> {
    const result = await db.insert(toolSettings).values(settings)
      .onConflictDoUpdate({
        target: toolSettings.toolId,
        set: { isActive: settings.isActive, spotlightRank: settings.spotlightRank, updatedAt: new Date() }
      })
      .returning();
    return result[0];
  }

  async createFeatureVote(vote: InsertFeatureVote): Promise<FeatureVote> {
    const result = await db.insert(featureVotes).values(vote).returning();
    return result[0];
  }

  async getFeatureVotesByTool(): Promise<{ toolId: string; count: number }[]> {
    const result = await db.select({
      toolId: featureVotes.toolId,
      count: sql<number>`count(*)::int`
    }).from(featureVotes).groupBy(featureVotes.toolId).orderBy(desc(sql`count(*)`));
    return result;
  }
}

export const storage = new DatabaseStorage();
