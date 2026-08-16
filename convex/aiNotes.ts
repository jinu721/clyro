import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { routeChat, routeGenerateNotes } from "./ai/router";
import { AiProviderId, NotesDifficulty } from "./ai/types";

const difficultyValidator = v.union(
  v.literal("easy"),
  v.literal("exam"),
  v.literal("deep")
);

const providerValidator = v.optional(
  v.union(
    v.literal("groq"),
    v.literal("gemini"),
    v.literal("openai"),
    v.literal("anthropic")
  )
);

export const createFromAi = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    topic: v.string(),
    difficulty: difficultyValidator,
    providerId: v.string(),
    model: v.string(),
    grade: v.optional(v.string()),
    board: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    const userId = user.subject;

    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      userId,
      parentDocument: args.parentDocument,
      isArchived: false,
      isPublished: false,
      source: "ai",
      icon: "✨",
      aiMeta: {
        providerId: args.providerId,
        model: args.model,
        topic: args.topic,
        difficulty: args.difficulty,
        grade: args.grade,
        board: args.board,
      },
    });

    await ctx.db.insert("aiGenerations", {
      userId,
      documentId,
      providerId: args.providerId,
      model: args.model,
      prompt: args.topic,
      params: {
        difficulty: args.difficulty,
        grade: args.grade,
        board: args.board,
      },
      status: "success",
      createdAt: Date.now(),
    });

    return documentId;
  },
});

export const generateNotes = action({
  args: {
    topic: v.string(),
    difficulty: difficultyValidator,
    grade: v.optional(v.string()),
    board: v.optional(v.string()),
    providerId: providerValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    const topic = args.topic.trim();
    if (!topic) throw new Error("Topic is required");

    try {
      const result = await routeGenerateNotes({
        topic,
        difficulty: args.difficulty as NotesDifficulty,
        grade: args.grade,
        board: args.board,
        providerId: args.providerId as AiProviderId | undefined,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate notes";
      throw new Error(message);
    }
  },
});

export const askClyro = action({
  args: {
    topic: v.string(),
    difficulty: difficultyValidator,
    grade: v.optional(v.string()),
    board: v.optional(v.string()),
    providerId: providerValidator,
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args): Promise<{ documentId: string }> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    const topic = args.topic.trim();
    if (!topic) throw new Error("Topic is required");

    const result = await routeGenerateNotes({
      topic,
      difficulty: args.difficulty as NotesDifficulty,
      grade: args.grade,
      board: args.board,
      providerId: args.providerId as AiProviderId | undefined,
    });

    const documentId = await ctx.runMutation(api.aiNotes.createFromAi, {
      title: result.title,
      content: result.content,
      topic,
      difficulty: args.difficulty,
      providerId: result.providerId,
      model: result.model,
      grade: args.grade,
      board: args.board,
      parentDocument: args.parentDocument,
    });

    return { documentId };
  },
});

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    documentId: v.optional(v.id("documents")),
    providerId: providerValidator,
  },
  handler: async (ctx, args): Promise<{
    content: string;
    providerId: AiProviderId;
    model: string;
  }> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    if (args.messages.length === 0) throw new Error("Message is required");

    let noteTitle: string | undefined;
    let noteContent: string | undefined;
    if (args.documentId) {
      const document: Doc<"documents"> = await ctx.runQuery(
        api.documents.getById,
        {
        documentId: args.documentId,
        }
      );
      noteTitle = document.title;
      noteContent = document.content;
    }

    return await routeChat({
      messages: args.messages.slice(-12),
      noteTitle,
      noteContent,
      providerId: args.providerId as AiProviderId | undefined,
    });
  },
});
