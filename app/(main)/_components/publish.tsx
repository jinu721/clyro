import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useOrigin } from "@/hooks/use-origin";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useMutation } from "convex/react";
import { Check, Copy, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PublishProps {
  initialData: Doc<"documents">;
}

const Publish = ({ initialData }: PublishProps) => {
  const origin = useOrigin();
  const update = useMutation(api.documents.update);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const url = `${origin}/preview/${initialData._id}`;

  const onPublish = () => {
    setIsSubmitting(true);
    const promise = update({
      id: initialData._id,
      isPublished: true,
    }).finally(() => {
      setIsSubmitting(false);
    });

    toast.promise(promise, {
      loading: "Publishing...",
      success: "Published",
      error: "Failed to publish",
    });
  };

  const onUnpublish = () => {
    setIsSubmitting(true);
    const promise = update({
      id: initialData._id,
      isPublished: false,
    }).finally(() => {
      setIsSubmitting(false);
    });

    toast.promise(promise, {
      loading: "Unpublishing...",
      success: "Unpublished",
      error: "Failed to unpublish",
    });
  };

  const onCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          {initialData.isPublished ? "Published" : "Publish"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end" alignOffset={8} forceMount>
        {initialData.isPublished ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Published</span>
              <Globe className="w-4 h-4" />
            </div>
            
            <div className="flex items-center gap-1 mb-3">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-2 py-1.5 text-xs bg-muted rounded border-0 truncate focus:outline-none"
              />
              <Button
                onClick={onCopy}
                size="sm"
                variant="ghost"
                className="h-7 px-2"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>

            <Button
              onClick={onUnpublish}
              disabled={isSubmitting}
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs"
            >
              Unpublish
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-3">
              <div className="text-sm font-medium mb-1">Publish page</div>
              <div className="text-xs text-muted-foreground">
                Share your work with others
              </div>
            </div>
            
            <Button
              onClick={onPublish}
              disabled={isSubmitting}
              size="sm"
              className="w-full h-8 text-xs"
            >
              Publish
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default Publish;