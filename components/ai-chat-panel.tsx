"use client";

import { FormEvent, Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";
import { ArrowUp, PanelRightClose, PanelRightOpen, Plus } from "lucide-react";
import { toast } from "sonner";

import { ClyroBot } from "@/components/icons/clyro-bot";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAiChat } from "@/hooks/use-ai-chat";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const STARTERS = [
  "Explain this note simply",
  "Quiz me on this topic",
  "What should I revise next?",
];

const MessageText = ({ text }: { text: string }) => {
  const renderInline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      )
    );

  return (
    <div className="space-y-2">
      {text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          if (/^#{1,6}\s/.test(line)) {
            return (
              <p
                key={index}
                className="pt-1 text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                {renderInline(line.replace(/^#{1,6}\s/, ""))}
              </p>
            );
          }

          if (/^[-*]\s/.test(line)) {
            return (
              <div key={index} className="flex gap-2 pl-0.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400 dark:bg-gray-600" />
                <span>{renderInline(line.replace(/^[-*]\s/, ""))}</span>
              </div>
            );
          }

          return <p key={index}>{renderInline(line)}</p>;
        })}
    </div>
  );
};

export function AiChatPanel() {
  const params = useParams();
  const documentId = params.documentId as Id<"documents"> | undefined;
  const note = useQuery(
    api.documents.getById,
    documentId ? { documentId } : "skip"
  );
  const chat = useAction(api.aiNotes.chat);
  const { isOpen, open, close, width, setWidth, resetWidth } = useAiChat();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [documentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsResizing(true);

      const onMouseMove = (moveEvent: MouseEvent) => {
        setWidth(window.innerWidth - moveEvent.clientX);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [setWidth]
  );

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const result = await chat({ messages: nextMessages, documentId });
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.content },
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Clyro could not respond"
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  if (!isOpen) {
    return (
      <aside
        className={cn(
          "fixed bottom-4 right-4 z-40 md:static md:bottom-auto md:right-auto",
          "md:flex md:h-screen md:w-11 md:shrink-0 md:flex-col md:items-center md:gap-1 md:border-l md:py-3",
          "md:bg-[#F9F8F7] md:dark:bg-[#1E1E1E]",
          "md:border-gray-200 md:dark:border-white/5"
        )}
      >
        <button
          type="button"
          onClick={open}
          aria-label="Open Ask Clyro"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md shadow-lg transition-all md:shadow-none",
            "bg-gray-900 text-white dark:bg-white dark:text-gray-900",
            "md:bg-gray-100 md:text-gray-600 md:dark:bg-white/5 md:dark:text-gray-400",
            "md:hover:bg-gray-200 md:dark:hover:bg-white/10"
          )}
        >
          <ClyroBot className="h-[18px] w-[18px] md:hidden" />
          <PanelRightOpen className="hidden h-4 w-4 md:block" />
        </button>
      </aside>
    );
  }

  const contextLabel =
    documentId && note ? note.title : "No note selected";

  return (
    <aside
      style={isMobile ? undefined : { width }}
      className={cn(
        "group/chat fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l",
        "md:relative md:inset-auto md:z-auto md:h-screen md:shrink-0",
        "bg-[#F9F8F7] dark:bg-[#1E1E1E]",
        "border-gray-200 dark:border-white/5",
        !isResizing && "transition-[width] ease-in-out duration-300"
      )}
    >
      {!isMobile && (
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={resetWidth}
          className={cn(
            "absolute left-0 top-0 h-full w-1 cursor-ew-resize transition-all",
            "opacity-0 group-hover/chat:opacity-100",
            "bg-gray-300/50 dark:bg-gray-500/30",
            "hover:bg-gray-400/50 dark:hover:bg-gray-600/40",
            isResizing && "opacity-100"
          )}
        />
      )}

      <div className="flex h-[52px] shrink-0 items-center gap-2 px-3">
        <ClyroBot className="h-[18px] w-[18px] shrink-0 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          Ask Clyro
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMessages([])}
            disabled={messages.length === 0}
            aria-label="New chat"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              "text-gray-500 dark:text-gray-500",
              "hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white",
              "disabled:pointer-events-none disabled:opacity-40"
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Collapse Ask Clyro"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              "text-gray-500 dark:text-gray-500",
              "hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white"
            )}
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5",
            "bg-gray-100 dark:bg-white/5"
          )}
        >
          <span className="text-xs text-gray-500 dark:text-gray-500">
            Context
          </span>
          <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
            {contextLabel}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="px-1 pb-1 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-500">
              Suggested
            </p>
            {STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => void sendMessage(starter)}
                className={cn(
                  "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                  "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
                  "hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                )}
              >
                {starter}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 py-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "text-sm leading-6",
                    message.role === "user"
                      ? "max-w-[85%] rounded-md bg-gray-200 px-3 py-2 text-gray-900 dark:bg-white/10 dark:text-gray-100"
                      : "w-full text-gray-700 dark:text-gray-300"
                  )}
                >
                  <MessageText text={message.content} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-1.5 py-1 text-gray-400 dark:text-gray-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-gray-200 p-3 dark:border-white/5">
        <form
          onSubmit={onSubmit}
          className={cn(
            "flex items-end gap-2 rounded-md border px-2.5 py-2 transition-colors",
            "border-gray-200 bg-white dark:border-white/10 dark:bg-white/5",
            "focus-within:border-gray-300 dark:focus-within:border-white/20"
          )}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage(input);
              }
            }}
            rows={1}
            placeholder="Ask about this note..."
            disabled={isLoading}
            className={cn(
              "max-h-32 min-h-6 flex-1 resize-none bg-transparent text-sm outline-none",
              "text-gray-800 placeholder:text-gray-400",
              "dark:text-gray-200 dark:placeholder:text-gray-600"
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors",
              "bg-gray-900 text-white dark:bg-white dark:text-gray-900",
              "disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-gray-600"
            )}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </form>
        <p className="pt-2 text-center text-[11px] text-gray-400 dark:text-gray-600">
          Clyro can make mistakes. Check important facts.
        </p>
      </div>
    </aside>
  );
}
