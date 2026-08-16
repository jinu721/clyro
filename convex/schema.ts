import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    projectId: v.optional(v.id("projects")),
    source: v.optional(v.union(v.literal("manual"), v.literal("ai"))),
    aiMeta: v.optional(
      v.object({
        providerId: v.string(),
        model: v.string(),
        topic: v.string(),
        difficulty: v.string(),
        grade: v.optional(v.string()),
        board: v.optional(v.string()),
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"])
    .index("by_project", ["projectId"]),

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(),
    parentProject: v.optional(v.id("projects")),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_parent", ["parentProject"]),

  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    email: v.optional(v.string()),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(
      v.literal("owner"),
      v.literal("editor"),
      v.literal("viewer")
    ),
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_project_user", ["projectId", "userId"]),

  projectInvites: defineTable({
    projectId: v.id("projects"),
    inviterId: v.string(),
    email: v.optional(v.string()),
    token: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("revoked")
    ),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_project", ["projectId"]),

  projectMessages: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    content: v.optional(v.string()),
    attachments: v.optional(
      v.array(
        v.object({
          url: v.string(),
          name: v.string(),
          type: v.string(),
          size: v.number(),
        })
      )
    ),
    documentId: v.optional(v.id("documents")),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  aiGenerations: defineTable({
    userId: v.string(),
    documentId: v.optional(v.id("documents")),
    providerId: v.string(),
    model: v.string(),
    prompt: v.string(),
    params: v.object({
      difficulty: v.string(),
      grade: v.optional(v.string()),
      board: v.optional(v.string()),
    }),
    status: v.union(
      v.literal("success"),
      v.literal("error"),
      v.literal("pending")
    ),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
