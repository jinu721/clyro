import {
  buildKindNotesSystemPrompt,
  buildKindNotesUserPrompt,
} from "../prompts/kindNotes";
import { parseAiNotesResponse } from "../parseBlocks";
import { AiProvider } from "../types";

const DEFAULT_MODEL = "gemini-2.0-flash";

export const geminiProvider: AiProvider = {
  id: "gemini",
  defaultModel: DEFAULT_MODEL,
  async generateNotes(request, apiKey, model = DEFAULT_MODEL) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${buildKindNotesSystemPrompt()}\n\n${buildKindNotesUserPrompt(request)}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const raw = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("");

    if (!raw) {
      throw new Error("Gemini returned an empty response");
    }

    const parsed = parseAiNotesResponse(raw);
    return { ...parsed, model };
  },
  async chat(request, apiKey, model = DEFAULT_MODEL) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const noteContext = request.noteContent
      ? `\n\nCurrent note title: ${request.noteTitle || "Untitled"}\nCurrent note content (BlockNote JSON):\n${request.noteContent.slice(0, 24000)}`
      : "";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text:
              "You are Clyro, a calm and accurate study partner for school students. Answer clearly in short sections. Use the current note when relevant, admit uncertainty, and never shame the student." +
              noteContext,
          }],
        },
        contents: request.messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: { temperature: 0.45 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");
    if (!content) throw new Error("Gemini returned an empty response");
    return { content, model };
  },
};

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it in the Convex dashboard environment variables."
    );
  }
  return key;
}
