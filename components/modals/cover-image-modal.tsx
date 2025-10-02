"use client";

import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";

import { useCoverImage } from "@/hooks/use-cover-image";
import { SingleImageDropzone } from "@/components/upload/single-image";
import { useCallback, useState } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { UploaderProvider, UploadFn } from "../upload/uploader-provider";

export const CoverImageModal = () => {
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const coverImage = useCoverImage();
  const { edgestore } = useEdgeStore();

  const update = useMutation(api.documents.update);

  const onClose = useCallback(() => {
    setIsSubmitting(false);
    coverImage.onClose();
  }, []);

  const uploadFn: UploadFn = useCallback(
    async ({ file, onProgressChange, signal }) => {
      const res = await edgestore.publicFiles.upload({
        file,
        signal,
        onProgressChange,
        options: { replaceTargetUrl: coverImage.url },
      });
      await update({
        id: params.documentId as Id<"documents">,
        coverImage: res.url,
      });
      onClose();
      return res;
    },
    [edgestore, update, params.documentId, onClose]
  );

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold ">COVER IMAGE</h2>
        </DialogHeader>
        <UploaderProvider uploadFn={uploadFn} autoUpload>
          <SingleImageDropzone
            height={200}
            width={200}
            dropzoneOptions={{
              maxSize: 1024 * 1024 * 1,
            }}
            className="border-none"
            disabled={isSubmitting}
          />
        </UploaderProvider>
      </DialogContent>
    </Dialog>
  );
};
