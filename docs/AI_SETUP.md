# Ask Clyro — AI setup (Phase 1)

Secrets live in the **Convex dashboard** (Settings → Environment Variables), not in the Next.js client `.env`.

## Required (pick one free provider)

Temporary default provider is **Groq**.

| Variable | Example | Notes |
|----------|---------|--------|
| `AI_DEFAULT_PROVIDER` | `groq` | Or `gemini` |
| `GROQ_API_KEY` | from [console.groq.com](https://console.groq.com) | Free tier |
| `GEMINI_API_KEY` | from [aistudio.google.com](https://aistudio.google.com/apikey) | Only if using Gemini |

## Optional (later providers)

Add an adapter under `convex/ai/providers/`, register it in `convex/ai/router.ts`, then set:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

## After changing env

Redeploy or run `npx convex dev` so Convex picks up the variables.
