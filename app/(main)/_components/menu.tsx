import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { Clock, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MenuProps {
  documentId: Id<"documents">;
}

const Menu = ({ documentId }: MenuProps) => {
  const router = useRouter();
  const { user } = useUser();
  const archive = useMutation(api.documents.archive);

  const onArchive = () => {
    const promise = archive({
      id: documentId,
    });
    toast.promise(promise, {
      loading: "Archiving page...",
      success: "Page archived",
      error: "Failed to archive page",
    });
    router.push("/workspace");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          variant="ghost"
          className="h-7 w-7 p-0 hover:bg-white/5"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "w-60 bg-[#1e1e1e] border border-white/10",
          "shadow-lg shadow-black/50 p-1"
        )}
        align="end"
        sideOffset={8}
      >
        <DropdownMenuItem
          onClick={onArchive}
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 text-sm",
            "rounded-sm cursor-pointer",
            "text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300",
            "transition-colors duration-150"
          )}
        >
          <Trash className="h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-white/10" />

        <DropdownMenuItem
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 text-sm",
            "rounded-sm cursor-default",
            "text-gray-400 hover:bg-white/5 focus:bg-white/5",
            "transition-colors duration-150"
          )}
          onSelect={(e) => e.preventDefault()}
        >
          <Clock className="h-4 w-4 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-500">Last edited by</span>
            <span className="text-sm text-gray-300 truncate">
              {user?.firstName || "Unknown"}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-7 w-10 rounded-md" />;
};

export default Menu;