/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai_parseBlocks from "../ai/parseBlocks.js";
import type * as ai_prompts_kindNotes from "../ai/prompts/kindNotes.js";
import type * as ai_providers_gemini from "../ai/providers/gemini.js";
import type * as ai_providers_groq from "../ai/providers/groq.js";
import type * as ai_router from "../ai/router.js";
import type * as ai_types from "../ai/types.js";
import type * as aiNotes from "../aiNotes.js";
import type * as documents from "../documents.js";
import type * as projectMessages from "../projectMessages.js";
import type * as projects from "../projects.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "ai/parseBlocks": typeof ai_parseBlocks;
  "ai/prompts/kindNotes": typeof ai_prompts_kindNotes;
  "ai/providers/gemini": typeof ai_providers_gemini;
  "ai/providers/groq": typeof ai_providers_groq;
  "ai/router": typeof ai_router;
  "ai/types": typeof ai_types;
  aiNotes: typeof aiNotes;
  documents: typeof documents;
  projectMessages: typeof projectMessages;
  projects: typeof projects;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
