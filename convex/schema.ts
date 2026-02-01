
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  organizations: defineTable({
    name: v.string(),
    slug: v.string(), // unique identifier for URLs
    settings: v.object({
      triageRequired: v.boolean(),
      defaultCurrency: v.union(v.literal("USD"), v.literal("SSP")),
      whatsappEnabled: v.boolean(),
    }),
    createdAt: v.number(),
    createdBy: v.id("users"),
  }).index("by_slug", ["slug"]),

  memberships: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("doctor"),
      v.literal("nurse"),
      v.literal("lab"),
      v.literal("pharmacy"),
      v.literal("cashier"),
      v.literal("viewer")
    ),
    createdAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_org", ["organizationId"])
  .index("by_org_user", ["organizationId", "userId"]),

  patients: defineTable({
    organizationId: v.id("organizations"),
    mrn: v.string(),
    fullName: v.string(),
    gender: v.string(),
    dob: v.string(),
    phone: v.string(),
    address: v.string(),
    createdAt: v.number(),
  })
  .index("by_org_mrn", ["organizationId", "mrn"])
  .index("by_org_name", ["organizationId", "fullName"]),

  visits: defineTable({
    organizationId: v.id("organizations"),
    patientId: v.id("patients"),
    status: v.union(v.literal("triage"), v.literal("consultation"), v.literal("lab"), v.literal("pharmacy"), v.literal("completed")),
    vitals: v.optional(v.object({
      temp: v.number(),
      bp: v.string(),
      pulse: v.number(),
      spo2: v.number(),
    })),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_org_status", ["organizationId", "status"]),

  auditLogs: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    meta: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_org_timestamp", ["organizationId", "timestamp"]),
});
