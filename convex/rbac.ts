
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getViewer(ctx: QueryCtx | MutationCtx) {
  const userId = await ctx.auth.getUserId();
  if (!userId) return null;
  return await ctx.db.get(userId);
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await ctx.auth.getUserId();
  if (!userId) throw new Error("Unauthorized: User not signed in");
  return userId;
}

export async function requireOrgMember(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">
) {
  const userId = await requireUser(ctx);
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_org_user", (q) =>
      q.eq("organizationId", organizationId).eq("userId", userId)
    )
    .unique();

  if (!membership) throw new Error("Unauthorized: Not a member of this clinic");
  return { userId, membership };
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
  allowedRoles: string[]
) {
  const { userId, membership } = await requireOrgMember(ctx, organizationId);
  if (!allowedRoles.includes(membership.role) && membership.role !== "owner") {
    throw new Error(`Unauthorized: Role '${membership.role}' lacks permission`);
  }
  return { userId, membership };
}
