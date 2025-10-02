"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmDialog from "../../../components/modals/confirm-modal";

interface BannerProps {
  documentId: Id<"documents">;
}

const Banner = ({ documentId }: BannerProps) => {
  const router = useRouter();

  const remove = useMutation(api.documents.remove);
  const restore = useMutation(api.documents.restore);

  const onRemove = () => {
    const promise = remove({
      id: documentId,
    });

    toast.promise(promise, {
      loading: "Removing a page...",
      success: "Page removed successfully",
      error: "Failed to remove a page",
    });
    router.push("/workspace");
  };

  const onRestore = () => {
    const promise = restore({
      id: documentId,
    });
    toast.promise(promise, {
      loading: "Restoring a page...",
      success: "Page restored successfully",
      error: "Failed to restore a page",
    });
  };

  return (
    <div className="w-full bg-red-400 text-center text-sm p-2 flex items-center justify-center gap-x-2">
      <span className="font-medium">This Page is in the trash!</span>
      <Button
        variant="outline"
        className="w-[100px] h-8 text-sm font-normal"
        onClick={onRestore}
      >
        Restore Page
      </Button>
      <ConfirmDialog onConfirm={onRemove}>
        <Button variant="outline" className="w-[150px] h-8 text-sm font-normal">
          Remove from Trash
        </Button>
      </ConfirmDialog>
    </div>
  );
};

export default Banner;
