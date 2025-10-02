import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { useMutation } from "convex/react";
import {
  ChevronDown,
  ChevronRight,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

interface DocumentItemProps {
  id: Id<"documents">;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick: () => void;
  icon: LucideIcon;
}

const DocumentItem = ({
  id,
  documentIcon,
  active,
  expanded,
  level = 0,
  onExpand,
  label,
  onClick,
  icon: Icon,
}: DocumentItemProps) => {
  const router = useRouter();
  const create = useMutation(api.documents.create);
  const archive = useMutation(api.documents.archive);
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  const handleExpand = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    onExpand?.();
  };

  const onCreate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;
    const promise = create({
      title: "Untitled",
      parentDocument: id,
    }).then((documentId) => {
      if (!expanded) {
        onExpand?.();
      }
      router.push(`/workspace/${documentId}`);
    });
    toast.promise(promise, {
      loading: "Creating a page...",
      success: "Page created successfully",
      error: "Failed to create a page",
    });
  };

  const onArchive = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;
    const promise = archive({
      id,
    });
    toast.promise(promise, {
      loading: "Archiving a page...",
      success: "Page archived successfully",
      error: "Failed to archive a page",
    });
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
      className={cn(
        "group relative flex items-center gap-x-2 w-full py-2 pr-3 text-sm rounded-lg cursor-pointer transition-all duration-200 ease-out mb-1.5",
        "text-gray-600 dark:text-gray-400",
        "hover:bg-gradient-to-r",
        "hover:from-gray-200/80 hover:to-gray-100/40",
        "dark:hover:from-white/10 dark:hover:to-white/5",
        "hover:text-gray-900 dark:hover:text-white",
        "hover:shadow-sm",
        active && [
          "bg-gradient-to-r",
          "from-gray-200/80 to-gray-100/40",
          "dark:from-white/10 dark:to-white/5",
          "text-gray-900 dark:text-white",
          "shadow-sm"
        ]
      )}
    >
      <div
        role="button"
        onClick={handleExpand}
        className={cn(
          "flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200",
          "hover:bg-gray-300 dark:hover:bg-white/10",
          "active:scale-95"
        )}
      >
        <ChevronIcon
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            expanded && "rotate-0",
            !expanded && "-rotate-0"
          )}
        />
      </div>

      <div
        className={cn(
          "flex items-center justify-center w-5 h-5 rounded-md transition-all duration-300",
          "group-hover:scale-110 group-hover:rotate-3"
        )}
      >
        {documentIcon ? (
          <span className="text-base leading-none">{documentIcon}</span>
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>

      <span className="flex-1 truncate font-medium">{label}</span>

      <div
        className={cn(
          "flex items-center gap-x-1 transition-all duration-200",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-sm transition-colors",
                "hover:bg-gray-300 dark:hover:bg-white/5",
                "active:bg-gray-400 dark:active:bg-white/10"
              )}
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              "w-56 p-1 shadow-lg",
              "bg-white dark:bg-[#1e1e1e]",
              "border border-gray-200 dark:border-white/10",
              "shadow-gray-200/50 dark:shadow-black/50"
            )}
            align="start"
            side="right"
            sideOffset={8}
          >
            <DropdownMenuItem
              onClick={onArchive}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer transition-colors",
                "text-red-600 dark:text-red-400",
                "hover:bg-red-50 dark:hover:bg-red-500/10",
                "focus:bg-red-50 dark:focus:bg-red-500/10"
              )}
            >
              <Trash className="w-4 h-4" />
              <span>Delete</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className={cn(
              "my-1",
              "bg-gray-200 dark:bg-white/10"
            )} />

            <DropdownMenuItem
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm",
                "text-gray-700 dark:text-gray-400",
                "hover:bg-gray-100 dark:hover:bg-white/5",
                "focus:bg-gray-100 dark:focus:bg-white/5",
                "transition-colors"
              )}
              onSelect={(e) => e.preventDefault()}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500 dark:text-gray-500">Last edited by</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {user?.firstName || "Unknown"}
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div
          onClick={onCreate}
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200",
            "hover:bg-gray-300 dark:hover:bg-white/15",
            "active:scale-90 hover:rotate-90"
          )}
        >
          <Plus className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

DocumentItem.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
      className="flex items-center gap-x-2 py-2"
    >
      <Skeleton className="h-5 w-5 rounded-md bg-gray-200 dark:bg-white/5" />
      <Skeleton className="h-4 w-4 rounded-md bg-gray-200 dark:bg-white/5" />
      <Skeleton className="h-4 flex-1 max-w-[200px] rounded-md bg-gray-200 dark:bg-white/5" />
    </div>
  );
};

export default DocumentItem;