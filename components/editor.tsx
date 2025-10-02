"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const uploadHandler = async (file: File) => {
    const res = await edgestore.publicFiles.upload({
      file,
    });
    return res.url;
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: uploadHandler,
  });

  return (
    <div className="editor-wrapper w-full">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={() => {
          onChange(JSON.stringify(editor.document, null, 2));
        }}
      />
      <style jsx global>{`
        /* Container background */
        .editor-wrapper {
          background: transparent;
        }

        .editor-wrapper .bn-container {
          font-family: "Inter", sans-serif;
          background: transparent;
        }

        .editor-wrapper .bn-editor {
          background: transparent;
        }

        /* Light mode styles */
        .editor-wrapper .bn-editor[data-theme="light"] {
          color: #1f2937;
          background: transparent;
        }

        .editor-wrapper .bn-editor[data-theme="light"] .ProseMirror {
          background: transparent;
        }

        .editor-wrapper .bn-editor[data-theme="light"] .bn-block-outer {
          background: transparent;
        }

        .editor-wrapper .bn-editor[data-theme="light"] .bn-block-content {
          color: #1f2937;
        }

        .editor-wrapper .bn-editor[data-theme="light"] h1,
        .editor-wrapper .bn-editor[data-theme="light"] h2,
        .editor-wrapper .bn-editor[data-theme="light"] h3 {
          color: #111827;
        }

        .editor-wrapper .bn-editor[data-theme="light"] a {
          color: #2563eb;
        }

        .editor-wrapper .bn-editor[data-theme="light"] code {
          background-color: #f3f4f6;
          color: #1f2937;
          padding: 2px 4px;
          border-radius: 4px;
        }

        .editor-wrapper .bn-editor[data-theme="light"] pre {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
        }

        .editor-wrapper .bn-editor[data-theme="light"] blockquote {
          border-left-color: #d1d5db;
          color: #4b5563;
        }

        /* Dark mode styles */
        .editor-wrapper .bn-editor[data-theme="dark"] {
          color: #e5e7eb;
          background: transparent;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] .ProseMirror {
          background: transparent;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] .bn-block-outer {
          background: transparent;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] .bn-block-content {
          color: #e5e7eb;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] h1,
        .editor-wrapper .bn-editor[data-theme="dark"] h2,
        .editor-wrapper .bn-editor[data-theme="dark"] h3 {
          color: #f3f4f6;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] a {
          color: #60a5fa;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] code {
          background-color: #374151;
          color: #e5e7eb;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] pre {
          background-color: #1f2937;
          border: 1px solid #374151;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] blockquote {
          border-left-color: #4b5563;
          color: #9ca3af;
        }

        /* Placeholder text */
        .editor-wrapper .bn-editor[data-theme="light"] .ProseMirror p.is-empty::before {
          color: #9ca3af;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] .ProseMirror p.is-empty::before {
          color: #6b7280;
        }

        /* Selection */
        .editor-wrapper .bn-editor[data-theme="light"] ::selection {
          background-color: #bfdbfe;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] ::selection {
          background-color: #1e40af;
        }

        /* Menu styling for dark mode */
        .editor-wrapper .bn-editor[data-theme="dark"] .bn-toolbar,
        .editor-wrapper .bn-editor[data-theme="dark"] .bn-formatting-toolbar,
        .editor-wrapper .bn-editor[data-theme="dark"] .bn-slash-menu {
          background-color: #2d2d2d;
          border-color: #404040;
          color: #ffffff;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] .bn-toolbar-item:hover,
        .editor-wrapper .bn-editor[data-theme="dark"] .bn-menu-item:hover {
          background-color: #3d3d3d;
        }

        /* Menu styling for light mode */
        .editor-wrapper .bn-editor[data-theme="light"] .bn-toolbar,
        .editor-wrapper .bn-editor[data-theme="light"] .bn-formatting-toolbar,
        .editor-wrapper .bn-editor[data-theme="light"] .bn-slash-menu {
          background-color: #ffffff;
          border-color: #e5e7eb;
          color: #1f2937;
        }

        .editor-wrapper .bn-editor[data-theme="light"] .bn-toolbar-item:hover,
        .editor-wrapper .bn-editor[data-theme="light"] .bn-menu-item:hover {
          background-color: #f3f4f6;
        }

        /* Side menu button colors */
        .editor-wrapper .bn-editor[data-theme="dark"] .bn-side-menu-button {
          color: #9ca3af;
        }

        .editor-wrapper .bn-editor[data-theme="dark"] .bn-side-menu-button:hover {
          background-color: #374151;
        }

        .editor-wrapper .bn-editor[data-theme="light"] .bn-side-menu-button {
          color: #6b7280;
        }

        .editor-wrapper .bn-editor[data-theme="light"] .bn-side-menu-button:hover {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default Editor;