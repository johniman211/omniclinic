
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clinicId);
  },
});

export const updateTriageSetting = mutation({
  args: { clinicId: v.id("clinics"), required: v.boolean() },
  handler: async (ctx, args) => {
    const clinic = await ctx.db.get(args.clinicId);
    if (!clinic) throw new Error("Clinic not found");

    await ctx.db.patch(args.clinicId, {
      settings: {
        ...clinic.settings,
        triageRequired: args.required,
      },
    });

    await ctx.db.insert("auditLogs", {
      clinicId: args.clinicId,
      userId: (await ctx.auth.getUserIdentity())?.subject as any, // Mock implementation
      action: "UPDATE_SETTING",
      entity: "CLINIC_WORKFLOW",
      timestamp: Date.now(),
      metadata: { triageRequired: args.required },
    });
  },
});
