"use client";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import DocumentItem from "./document-item";
import { cn } from "@/lib/utils";
import { FileIcon, FileText, Plus } from "lucide-react";

interface DocumentListProps {
  parentDocumentId?: Id<"documents">;
  level?: number;
  data?: Doc<"documents">[];
}

const DocumentList = ({ parentDocumentId, level = 0 }: DocumentListProps) => {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const documents = useQuery(api.documents.getSidebar, {
    parentDocument: parentDocumentId,
  });

  const onExpand = (documentId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [documentId]: !prev[documentId],
    }));
  };

  const onRedirect = (documentId: string) => {
    router.push(`/workspace/${documentId}`);
  };

  if (documents === undefined) {
    return (
      <>
        <DocumentItem.Skeleton level={level} />
        {level === 0 && (
          <>
            <DocumentItem.Skeleton level={level} />
            <DocumentItem.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  if (level===0 &&documents.length === 0) {
    return (
      <div className="px-4 py-3 flex items-center gap-2 text-gray-400 bg-white/5 rounded-md hover:bg-white/10 cursor-pointer transition-all">
        <FileText className="w-4 h-4" />
        <span className="text-sm font-medium">No Pages Yet</span>
      </div>
    );
  }

  return (
    <>
      <p
        style={{ paddingLeft: level ? `${level * 12 + 35}px` : undefined }}
        className={cn(
          "hidden text-xs font-medium text-muted-foreground/80 mt-2",
          expanded && "last:block",
          level === 0 && "hidden"
        )}
      >
        No Pages Inside
      </p>
      {documents.map((doc) => (
        <div key={doc._id}>
          <DocumentItem
            id={doc._id}
            onClick={() => onRedirect(doc._id)}
            label={doc.title}
            icon={FileIcon}
            documentIcon={doc.icon}
            active={params.documentId === doc._id}
            level={level}
            onExpand={() => onExpand(doc._id)}
            expanded={expanded[doc._id]}
            isAi={doc.source === "ai"}
          />
          {expanded[doc._id] && (
            <DocumentList parentDocumentId={doc._id} level={level + 1} />
          )}
        </div>
      ))}
    </>
  );
};

export default DocumentList;
