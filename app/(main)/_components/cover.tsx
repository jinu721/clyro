import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useEdgeStore } from "@/lib/edgestore";
import { Skeleton } from "@/components/ui/skeleton";

interface CoverProps {
  url: string | undefined;
  preview?: boolean;
  documentId: Id<"documents">;
}

const Cover = ({ url, preview, documentId }: CoverProps) => {
  const coverImage = useCoverImage();
  const removeCoverImage = useMutation(api.documents.removeCoverImage);

  const { edgestore } = useEdgeStore();

  const onRemove = async () => {
    removeCoverImage({
      id: documentId,
    });
    if (url) {
      await edgestore.publicFiles.delete({
        url,
      });
    }
  };

  const onReplace = () => {
    if(url){
        coverImage.onReplace(url);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-[35vh] group",
        !url && "h-[12vh]",
        url && "bg-muted"
      )}
    >
      {!!url && (
        <>
          <Image
            src={url}
            alt="cover"
            fill
            className="object-cover"
            priority={preview}
          />
          {!preview && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-x-2">
              <Button
                onClick={onReplace}
                className="text-xs text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 transition-all rounded-md px-3 py-1.5 font-medium h-auto"
                variant="ghost"
                size="sm"
              >
                <ImageIcon className="h-3 w-3 mr-1.5" />
                Replace cover
              </Button>
              <Button
                onClick={onRemove}
                className="text-xs text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 transition-all rounded-md px-3 py-1.5 font-medium h-auto"
                variant="ghost"
                size="sm"
              >
                <X className="h-3 w-3 mr-1.5" />
                Remove
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="h-[12vh] w-full" />;
};

export default Cover;
