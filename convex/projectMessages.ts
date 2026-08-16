import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const attachmentValidator = v.object({
  url: v.string(),
  name: v.string(),
  type: v.string(),
  size: v.number(),
});

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", user.subject)
      )
      .unique();
    if (!membership) throw new Error("Unauthorized");

    return await ctx.db
      .query("projectMessages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .take(200);
  },
});

export const send = mutation({
  args: {
    projectId: v.id("projects"),
    content: v.optional(v.string()),
    attachments: v.optional(v.array(attachmentValidator)),
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", user.subject)
      )
      .unique();
    if (!membership) throw new Error("Unauthorized");

    const content = args.content?.trim() || undefined;
    if (!content && !args.attachments?.length && !args.documentId) {
      throw new Error("Message cannot be empty");
    }

    if (args.documentId) {
      const document = await ctx.db.get(args.documentId);
      if (!document || document.projectId !== args.projectId) {
        throw new Error("Note is not shared with this project");
      }
    }

    return await ctx.db.insert("projectMessages", {
      projectId: args.projectId,
      userId: user.subject,
      userName: membership.name,
      userImage: membership.imageUrl,
      content,
      attachments: args.attachments,
      documentId: args.documentId,
      createdAt: Date.now(),
    });
  },
});
