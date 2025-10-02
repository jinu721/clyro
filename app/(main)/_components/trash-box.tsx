"use client";

import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { FileText, RotateCcw, Trash2, X, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "../../../components/modals/confirm-modal";

const TrashBox = ({
  setTrashOpen,
}: {
  setTrashOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const params = useParams();
  const router = useRouter();
  const documents = useQuery(api.documents.getArchived);
  const restore = useMutation(api.documents.restore);
  const remove = useMutation(api.documents.remove);
  const clear = useMutation(api.documents.clear);

  const [search, setSearch] = useState("");
  
  const trashedItems = documents
    ?.filter((doc) => doc.isArchived)
    ?.filter((doc) => doc.title.toLowerCase().includes(search.toLowerCase()));

  const onClick = (documentId: Id<"documents">) => {
    router.push(`/workspace/${documentId}`);
  };

  const onRestore = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    documentId: Id<"documents">
  ) => {
    event.stopPropagation();
    const promise = restore({
      id: documentId,
    });
    toast.promise(promise, {
      loading: "Restoring page...",
      success: "Page restored",
      error: "Failed to restore page",
    });
  };

  const onRemove = (documentId: Id<"documents">) => {
    const promise = remove({
      id: documentId,
    });
    toast.promise(promise, {
      loading: "Deleting page...",
      success: "Page deleted",
      error: "Failed to delete page",
    });
    if (params.documentId === documentId) {
      router.push("/workspace");
    }
  };

  const onClear = () => {
    const promise = clear();
    toast.promise(promise, {
      loading: "Clearing trash...",
      success: "Trash cleared",
      error: "Failed to clear trash",
    });
  };

  if (documents === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size={20} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Trash</span>
          {trashedItems && trashedItems.length > 0 && (
            <span className="text-xs text-gray-500">
              {trashedItems.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setTrashOpen(false)}
          className="h-6 w-6 rounded-sm hover:bg-white/5 transition-colors flex items-center justify-center"
          aria-label="Close trash"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {documents && documents.length > 0 && (
        <div className="px-3 py-2 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white placeholder:text-gray-500 focus:outline-none focus:bg-white/10 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {documents?.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            <Trash2 className="w-8 h-8 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No documents in Trash</p>
          </div>
        ) : trashedItems?.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            <Search className="w-8 h-8 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No results</p>
          </div>
        ) : (
          <div className="p-1">
            {trashedItems?.map((doc) => (
              <div
                onClick={() => onClick(doc._id)}
                key={doc._id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-white/5 cursor-pointer group/doc transition-colors"
              >
                <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  {doc.icon ? (
                    <span className="text-base leading-none">{doc.icon}</span>
                  ) : (
                    <FileText className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">
                    {doc.title}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                  <button
                    onClick={(event) => onRestore(event, doc._id)}
                    className="p-1 hover:bg-white/10 rounded-sm transition-colors"
                    title="Restore"
                    aria-label="Restore document"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <ConfirmDialog onConfirm={() => onRemove(doc._id)}>
                    <button
                      className="p-1 hover:bg-white/10 rounded-sm transition-colors"
                      title="Delete permanently"
                      aria-label="Delete document permanently"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </ConfirmDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {trashedItems && trashedItems.length > 0 && (
        <div className="p-2 border-t border-white/10">
          <ConfirmDialog onConfirm={onClear}>
            <button className="w-full px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-sm transition-colors flex items-center justify-center gap-2">
              <Trash2 className="w-3.5 h-3.5" />
              Empty trash
            </button>
          </ConfirmDialog>
        </div>
      )}
    </div>
  );
};

export default TrashBox;