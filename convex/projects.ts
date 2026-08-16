import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const roleValidator = v.union(v.literal("editor"), v.literal("viewer"));

async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<any> } }) {
  const user = await ctx.auth.getUserIdentity();
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function getMembership(
  ctx: any,
  projectId: Id<"projects">,
  userId: string
) {
  return await ctx.db
    .query("projectMembers")
    .withIndex("by_project_user", (q: any) =>
      q.eq("projectId", projectId).eq("userId", userId)
    )
    .unique();
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentProject: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Project name is required");

    if (args.parentProject) {
      const membership = await getMembership(ctx, args.parentProject, user.subject);
      if (!membership || membership.role === "viewer") {
        throw new Error("You cannot create a project here");
      }
    }

    const projectId = await ctx.db.insert("projects", {
      name,
      description: args.description?.trim() || undefined,
      ownerId: user.subject,
      parentProject: args.parentProject,
      createdAt: Date.now(),
    });

    await ctx.db.insert("projectMembers", {
      projectId,
      userId: user.subject,
      email: user.email,
      name: user.name || user.nickname || "Member",
      imageUrl: user.pictureUrl,
      role: "owner",
      joinedAt: Date.now(),
    });

    return projectId;
  },
});

export const listMine = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", user.subject))
      .collect();

    const items = await Promise.all(
      memberships.map(async (membership) => {
        const project = await ctx.db.get(membership.projectId);
        return project ? { ...project, role: membership.role } : null;
      })
    );

    return items.filter((item) => item !== null);
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const membership = await getMembership(ctx, args.projectId, user.subject);
    if (!membership) throw new Error("You do not have access to this project");
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    return { ...project, role: membership.role };
  },
});

export const listMembers = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const membership = await getMembership(ctx, args.projectId, user.subject);
    if (!membership) throw new Error("Unauthorized");
    return await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const createInvite = mutation({
  args: {
    projectId: v.id("projects"),
    email: v.optional(v.string()),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const membership = await getMembership(ctx, args.projectId, user.subject);
    if (!membership || membership.role === "viewer") {
      throw new Error("You cannot invite members");
    }

    const token = crypto.randomUUID().replaceAll("-", "");
    await ctx.db.insert("projectInvites", {
      projectId: args.projectId,
      inviterId: user.subject,
      email: args.email?.trim().toLowerCase() || undefined,
      token,
      role: args.role,
      status: "pending",
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      createdAt: Date.now(),
    });
    return token;
  },
});

export const getInvite = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("projectInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invite || invite.status !== "pending" || invite.expiresAt < Date.now()) {
      return null;
    }
    const project = await ctx.db.get(invite.projectId);
    return project
      ? { projectName: project.name, email: invite.email, role: invite.role }
      : null;
  },
});

export const acceptInvite = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const invite = await ctx.db
      .query("projectInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invite || invite.status !== "pending") throw new Error("Invalid invite");
    if (invite.expiresAt < Date.now()) throw new Error("Invite has expired");
    if (
      invite.email &&
      (!user.email || invite.email !== user.email.toLowerCase())
    ) {
      throw new Error(`This invite is for ${invite.email}`);
    }

    const existing = await getMembership(ctx, invite.projectId, user.subject);
    if (!existing) {
      await ctx.db.insert("projectMembers", {
        projectId: invite.projectId,
        userId: user.subject,
        email: user.email,
        name: user.name || user.nickname || "Member",
        imageUrl: user.pictureUrl,
        role: invite.role,
        joinedAt: Date.now(),
      });
    }
    await ctx.db.patch(invite._id, { status: "accepted" });
    return invite.projectId;
  },
});

export const listDocuments = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const membership = await getMembership(ctx, args.projectId, user.subject);
    if (!membership) throw new Error("Unauthorized");
    return await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
  },
});

export const createDocument = mutation({
  args: { projectId: v.id("projects"), title: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const membership = await getMembership(ctx, args.projectId, user.subject);
    if (!membership || membership.role === "viewer") {
      throw new Error("You cannot create notes in this project");
    }
    return await ctx.db.insert("documents", {
      title: args.title.trim() || "Untitled",
      userId: user.subject,
      projectId: args.projectId,
      isArchived: false,
      isPublished: false,
      source: "manual",
    });
  },
});
