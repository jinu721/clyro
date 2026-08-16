import { geminiProvider, getGeminiApiKey } from "./providers/gemini";
import { getGroqApiKey, groqProvider } from "./providers/groq";
import {
  AiProvider,
  AiProviderId,
  ChatRequest,
  GenerateNotesRequest,
  GenerateNotesResult,
} from "./types";

const providers: Record<AiProviderId, AiProvider | undefined> = {
  groq: groqProvider,
  gemini: geminiProvider,
  openai: undefined,
  anthropic: undefined,
};

function resolveProviderId(override?: AiProviderId): AiProviderId {
  if (override) return override;
  const fromEnv = process.env.AI_DEFAULT_PROVIDER as AiProviderId | undefined;
  if (fromEnv && providers[fromEnv]) return fromEnv;
  return "groq";
}

function getApiKey(providerId: AiProviderId): string {
  switch (providerId) {
    case "groq":
      return getGroqApiKey();
    case "gemini":
      return getGeminiApiKey();
    case "openai": {
      const key = process.env.OPENAI_API_KEY;
      if (!key) throw new Error("OPENAI_API_KEY is not set");
      return key;
    }
    case "anthropic": {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
      return key;
    }
    default:
      throw new Error(`Unknown AI provider: ${providerId}`);
  }
}

export async function routeGenerateNotes(
  request: GenerateNotesRequest
): Promise<GenerateNotesResult> {
  const providerId = resolveProviderId(request.providerId);
  const provider = providers[providerId];

  if (!provider) {
    throw new Error(
      `AI provider "${providerId}" is not implemented yet. Use groq or gemini, or add an adapter in convex/ai/providers/.`
    );
  }

  const apiKey = getApiKey(providerId);
  const result = await provider.generateNotes(request, apiKey);

  return {
    title: result.title,
    content: result.content,
    providerId,
    model: result.model,
  };
}

export function listAvailableProviders(): AiProviderId[] {
  return (Object.keys(providers) as AiProviderId[]).filter(
    (id) => providers[id] !== undefined
  );
}

export async function routeChat(request: ChatRequest): Promise<{
  content: string;
  providerId: AiProviderId;
  model: string;
}> {
  const providerId = resolveProviderId(request.providerId);
  const provider = providers[providerId];
  if (!provider) {
    throw new Error(
      `AI provider "${providerId}" is not implemented yet. Use groq or gemini.`
    );
  }

  const result = await provider.chat(request, getApiKey(providerId));
  return { ...result, providerId };
}
