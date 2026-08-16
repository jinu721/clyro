"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

const WorkspacePage = () => {
  const { user } = useUser();
  const create = useMutation(api.documents.create);

  const handleCreate = async () => {
    const promise = create({
      title: "Untitled",
    });
    toast.promise(promise, {
      loading: "Creating a page...",
      success: "Page created successfully",
      error: "Failed to create a page",
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <div className="relative">
        <Image
          src={"/workspace.png"}
          width={300}
          height={300}
          alt="Hero Image"
          className="drop-shadow-2xl dark:invert dark:brightness-0"
        />
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          What are you studying today?
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center pt-1">
          <Button variant="outline" onClick={handleCreate}>
            Create a page
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
