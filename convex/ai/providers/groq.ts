import {
  buildKindNotesSystemPrompt,
  buildKindNotesUserPrompt,
} from "../prompts/kindNotes";
import { parseAiNotesResponse } from "../parseBlocks";
import { AiProvider } from "../types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export const groqProvider: AiProvider = {
  id: "groq",
  defaultModel: DEFAULT_MODEL,
  async generateNotes(request, apiKey, model = DEFAULT_MODEL) {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: "system", content: buildKindNotesSystemPrompt() },
          { role: "user", content: buildKindNotesUserPrompt(request) },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) {
      throw new Error("Groq returned an empty response");
    }

    const parsed = parseAiNotesResponse(raw);
    return { ...parsed, model };
  },
  async chat(request, apiKey, model = DEFAULT_MODEL) {
    const noteContext = request.noteContent
      ? `\n\nCurrent note title: ${request.noteTitle || "Untitled"}\nCurrent note content (BlockNote JSON):\n${request.noteContent.slice(0, 24000)}`
      : "";
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.45,
        messages: [
          {
            role: "system",
            content:
              "You are Clyro, a calm and accurate study partner for school students. Answer clearly in short sections. Use the current note when relevant, admit uncertainty, and never shame the student. Do not claim facts are in the note unless they are present." +
              noteContext,
          },
          ...request.messages,
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq returned an empty response");
    return { content, model };
  },
};

export function getGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it in the Convex dashboard environment variables."
    );
  }
  return key;
}
