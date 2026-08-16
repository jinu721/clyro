type InlineText = {
  type: "text";
  text: string;
  styles: Record<string, never>;
};

type PartialBlock = {
  type: string;
  props?: Record<string, unknown>;
  content?: InlineText[];
};

function textContent(text: string): InlineText[] {
  return [{ type: "text", text, styles: {} }];
}

function heading(level: 2 | 3, text: string): PartialBlock {
  return {
    type: "heading",
    props: { level },
    content: textContent(text),
  };
}

function paragraph(text: string): PartialBlock {
  return {
    type: "paragraph",
    content: textContent(text),
  };
}

function bullet(text: string): PartialBlock {
  return {
    type: "bulletListItem",
    content: textContent(text),
  };
}

function stripCodeFence(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fence ? fence[1].trim() : trimmed;
}

function markdownToBlocks(markdown: string): PartialBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: PartialBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      blocks.push(heading(3, trimmed.slice(4)));
    } else if (trimmed.startsWith("## ")) {
      blocks.push(heading(2, trimmed.slice(3)));
    } else if (trimmed.startsWith("# ")) {
      blocks.push(heading(2, trimmed.slice(2)));
    } else if (/^[-*]\s+/.test(trimmed)) {
      blocks.push(bullet(trimmed.replace(/^[-*]\s+/, "")));
    } else if (/^\d+\.\s+/.test(trimmed)) {
      blocks.push({
        type: "numberedListItem",
        content: textContent(trimmed.replace(/^\d+\.\s+/, "")),
      });
    } else {
      blocks.push(paragraph(trimmed));
    }
  }

  if (blocks.length === 0) {
    blocks.push(paragraph(markdown.trim() || "No notes generated."));
  }

  return blocks;
}

function normalizeBlocks(rawBlocks: unknown[]): PartialBlock[] {
  const blocks: PartialBlock[] = [];

  for (const item of rawBlocks) {
    if (!item || typeof item !== "object") continue;
    const block = item as Record<string, unknown>;
    const type = typeof block.type === "string" ? block.type : "paragraph";

    if (Array.isArray(block.content)) {
      const content = block.content
        .filter(
          (c): c is Record<string, unknown> =>
            !!c && typeof c === "object" && (c as { type?: string }).type === "text"
        )
        .map((c) => ({
          type: "text" as const,
          text: typeof c.text === "string" ? c.text : String(c.text ?? ""),
          styles: {},
        }));

      if (type === "heading") {
        const props = (block.props as Record<string, unknown>) || {};
        const level = props.level === 3 ? 3 : 2;
        blocks.push({
          type: "heading",
          props: { level },
          content: content.length ? content : textContent("Untitled"),
        });
      } else {
        blocks.push({
          type,
          content: content.length ? content : textContent(""),
        });
      }
    } else if (typeof block.content === "string") {
      if (type === "heading") {
        blocks.push(heading(2, block.content));
      } else if (type === "bulletListItem") {
        blocks.push(bullet(block.content));
      } else {
        blocks.push(paragraph(block.content));
      }
    }
  }

  return blocks.length ? blocks : [paragraph("No notes generated.")];
}

export function parseAiNotesResponse(raw: string): {
  title: string;
  content: string;
} {
  const cleaned = stripCodeFence(raw);

  try {
    const parsed = JSON.parse(cleaned) as {
      title?: string;
      blocks?: unknown[];
    };

    if (Array.isArray(parsed)) {
      const blocks = normalizeBlocks(parsed);
      return {
        title: "AI Study Notes",
        content: JSON.stringify(blocks, null, 2),
      };
    }

    if (parsed && typeof parsed === "object") {
      const title =
        typeof parsed.title === "string" && parsed.title.trim()
          ? parsed.title.trim()
          : "AI Study Notes";
      const blocks = Array.isArray(parsed.blocks)
        ? normalizeBlocks(parsed.blocks)
        : markdownToBlocks(cleaned);
      return {
        title,
        content: JSON.stringify(blocks, null, 2),
      };
    }
  } catch {
    // fall through to markdown
  }

  const titleMatch = cleaned.match(/^#\s+(.+)$/m);
  return {
    title: titleMatch?.[1]?.trim() || "AI Study Notes",
    content: JSON.stringify(markdownToBlocks(cleaned), null, 2),
  };
}
