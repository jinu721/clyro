export type AiProviderId = "groq" | "gemini" | "openai" | "anthropic";

export type NotesDifficulty = "easy" | "exam" | "deep";

export type GenerateNotesRequest = {
  topic: string;
  difficulty: NotesDifficulty;
  grade?: string;
  board?: string;
  providerId?: AiProviderId;
};

export type GenerateNotesResult = {
  title: string;
  content: string;
  providerId: AiProviderId;
  model: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
  noteTitle?: string;
  noteContent?: string;
  providerId?: AiProviderId;
};

export type AiProvider = {
  id: AiProviderId;
  defaultModel: string;
  generateNotes: (
    request: GenerateNotesRequest,
    apiKey: string,
    model?: string
  ) => Promise<{ title: string; content: string; model: string }>;
  chat: (
    request: ChatRequest,
    apiKey: string,
    model?: string
  ) => Promise<{ content: string; model: string }>;
};
