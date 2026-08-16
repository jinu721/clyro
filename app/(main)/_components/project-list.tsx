"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ProjectList() {
  const router = useRouter();
  const projects = useQuery(api.projects.listMine);
  const createProject = useMutation(api.projects.create);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const onCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      const projectId = await createProject({ name: name.trim() });
      setName("");
      setIsOpen(false);
      router.push(`/projects/${projectId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create project"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const rootProjects = projects?.filter((project) => !project.parentProject);

  return (
    <>
      <div className="px-2 pt-4">
        <div className="flex items-center px-2 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-500">
            Projects
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="ml-auto flex h-5 w-5 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Create project"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-0.5">
          {rootProjects?.map((project) => (
            <button
              key={project._id}
              type="button"
              onClick={() => router.push(`/projects/${project._id}`)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                "text-gray-600 hover:bg-gray-200 hover:text-gray-900",
                "dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              )}
            >
              <FolderKanban className="h-4 w-4 shrink-0" />
              <span className="truncate">{project.name}</span>
            </button>
          ))}
          {projects !== undefined && rootProjects?.length === 0 && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-full px-2 py-1.5 text-left text-xs text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
            >
              Create your first project
            </button>
          )}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>
              A shared home for notes, messages, files, and your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void onCreate();
              }}
              placeholder="Project name"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => void onCreate()}
                disabled={!name.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
