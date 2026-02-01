
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireOrgMember } from "./rbac";

export const create = mutation({
  args: { name: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      settings: {
        triageRequired: true,
        defaultCurrency: "SSP",
        whatsappEnabled: false,
      },
      createdAt: Date.now(),
      createdBy: userId,
    });

    await ctx.db.insert("memberships", {
      organizationId,
      userId,
      role: "owner",
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "CREATE_ORGANIZATION",
      targetType: "organizations",
      targetId: organizationId,
      timestamp: Date.now(),
    });

    return organizationId;
  },
});

export const listMy = query({
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserId();
    if (!userId) return [];
    
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const orgs = await Promise.all(
      memberships.map((m) => ctx.db.get(m.organizationId))
    );
    
    return orgs.filter((o): o is NonNullable<typeof o> => !!o);
  },
});

export const get = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireOrgMember(ctx, args.organizationId);
    return await ctx.db.get(args.organizationId);
  },
});
