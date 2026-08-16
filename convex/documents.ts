import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    return await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId: userId,
      isArchived: false,
      isPublished: false,
      source: "manual",
    });
  },
});

export const archive = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    const existingDocument = await ctx.db.get(args.id);
    if (!existingDocument) throw new Error("Document Not Found");
    if (existingDocument?.userId !== userId) throw new Error("Unauthorized");
    const recursiveArchive = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .filter((q) => q.eq(q.field("isArchived"), false))
        .collect();
      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });
        await recursiveArchive(child._id);
      }
    };

    const documents = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    recursiveArchive(args.id);
    return documents;
  },
});

export const getArchived = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", user.subject))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .collect();
  },
});

export const restore = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    const existingDocument = await ctx.db.get(args.id);
    if (!existingDocument) throw new Error("Document Not Found");
    if (existingDocument?.userId !== userId) throw new Error("Unauthorized");

    const options: Partial<Doc<"documents">> = {
      isArchived: false,
    };

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .filter((q) => q.eq(q.field("isArchived"), true))
        .collect();
      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });
        await recursiveRestore(child._id);
      }
    };

    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument);
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }

    const documents = await ctx.db.patch(args.id, {
      isArchived: false,
    });

    recursiveRestore(args.id);
    return documents;
  },
});

export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    const existingDocument = await ctx.db.get(args.id);
    if (!existingDocument) throw new Error("Document Not Found");
    if (existingDocument?.userId !== userId) throw new Error("Unauthorized");
    return await ctx.db.delete(args.id);
  },
});

export const clear = mutation({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .collect();

    for (const doc of docs) {
      await ctx.db.delete(doc._id);
    }
  },
});

export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    return await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument)
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();
  },
});

export const get = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    return ctx.db.query("documents").collect();
  },
});

export const getById = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document Not Found");
    if (document.isPublished && !document.isArchived) {
      return document;
    }
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    if (document.userId !== userId) {
      if (!document.projectId) throw new Error("Unauthorized");
      const membership = await ctx.db
        .query("projectMembers")
        .withIndex("by_project_user", (q) =>
          q.eq("projectId", document.projectId!).eq("userId", userId)
        )
        .unique();
      if (!membership) throw new Error("Unauthorized");
    }
    return document;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    const { id, ...rest } = args;
    const document = await ctx.db.get(id);
    if (!document) throw new Error("Document Not Found");
    if (document.userId !== userId) {
      if (!document.projectId) throw new Error("Unauthorized");
      const membership = await ctx.db
        .query("projectMembers")
        .withIndex("by_project_user", (q) =>
          q.eq("projectId", document.projectId!).eq("userId", userId)
        )
        .unique();
      if (!membership || membership.role === "viewer") {
        throw new Error("Unauthorized");
      }
    }
    return await ctx.db.patch(id, rest);
  },
});


export const removeIcon = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("Document Not Found");
    if (document.userId !== userId) throw new Error("Unauthorized");
    return await ctx.db.patch(args.id, {
      icon: undefined,
    });
  }
});

export const removeCoverImage = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;
    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("Document Not Found");
    if (document.userId !== userId) throw new Error("Unauthorized");
    return await ctx.db.patch(args.id, {
      coverImage: undefined,
    });
  }
})