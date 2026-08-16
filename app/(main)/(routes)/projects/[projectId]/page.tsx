"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowUp,
  Copy,
  File,
  FileText,
  FolderPlus,
  Hash,
  Link2,
  MessageSquare,
  Paperclip,
  Plus,
  Share2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEdgeStore } from "@/lib/edgestore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Tab = "chat" | "notes" | "members";
type Attachment = { url: string; name: string; type: string; size: number };

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const projectId = params.projectId as Id<"projects">;
  const project = useQuery(api.projects.get, { projectId });
  const allProjects = useQuery(api.projects.listMine);
  const members = useQuery(api.projects.listMembers, { projectId });
  const notes = useQuery(api.projects.listDocuments, { projectId });
  const messages = useQuery(api.projectMessages.list, { projectId });
  const sendMessage = useMutation(api.projectMessages.send);
  const createInvite = useMutation(api.projects.createInvite);
  const createProject = useMutation(api.projects.create);
  const createDocument = useMutation(api.projects.createDocument);
  const { edgestore } = useEdgeStore();

  const [tab, setTab] = useState<Tab>("chat");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [projectOpen, setProjectOpen] = useState(false);
  const [childName, setChildName] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const children = allProjects?.filter(
    (item) => item.parentProject === projectId
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const onSend = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!message.trim() && attachments.length === 0) return;
    setIsSending(true);
    try {
      await sendMessage({
        projectId,
        content: message.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
      });
      setMessage("");
      setAttachments([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Message failed");
    } finally {
      setIsSending(false);
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const result = await edgestore.publicFiles.upload({ file });
          return {
            url: result.url,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
          };
        })
      );
      setAttachments((current) => [...current, ...uploaded]);
    } catch {
      toast.error("Could not upload attachment");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onInvite = async () => {
    try {
      const token = await createInvite({
        projectId,
        email: inviteEmail.trim() || undefined,
        role: inviteRole,
      });
      const url = `${window.location.origin}/invite/${token}`;
      await navigator.clipboard.writeText(url);
      setInviteEmail("");
      setInviteOpen(false);
      toast.success("Invite link copied");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invite failed");
    }
  };

  const onCreateChild = async () => {
    if (!childName.trim()) return;
    try {
      const id = await createProject({
        name: childName.trim(),
        parentProject: projectId,
      });
      setChildName("");
      setProjectOpen(false);
      router.push(`/projects/${id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create");
    }
  };

  const onCreateNote = async () => {
    try {
      const id = await createDocument({ projectId, title: "Untitled" });
      router.push(`/workspace/${id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create note"
      );
    }
  };

  const shareNote = async (documentId: Id<"documents">) => {
    await sendMessage({ projectId, documentId });
    setTab("chat");
  };

  if (!project) {
    return <div className="h-full animate-pulse bg-background" />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col pt-[52px]">
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-5 py-3 dark:border-white/5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
          <Hash className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{project.name}</h1>
          <p className="text-xs text-muted-foreground">
            {members?.length || 1} member{members?.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProjectOpen(true)}
            disabled={project.role === "viewer"}
          >
            <FolderPlus className="h-4 w-4" />
            Subproject
          </Button>
          <Button
            size="sm"
            onClick={() => setInviteOpen(true)}
            disabled={project.role === "viewer"}
          >
            <Users className="h-4 w-4" />
            Invite
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-52 shrink-0 border-r border-gray-200 p-3 dark:border-white/5 lg:block">
          <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Project
          </p>
          {(
            [
              ["chat", MessageSquare, "Team chat"],
              ["notes", FileText, "Shared notes"],
              ["members", Users, "Members"],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                tab === id
                  ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}

          {!!children?.length && (
            <>
              <p className="mt-5 px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Subprojects
              </p>
              {children.map((child) => (
                <button
                  key={child._id}
                  type="button"
                  onClick={() => router.push(`/projects/${child._id}`)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <Hash className="h-3.5 w-3.5" />
                  <span className="truncate">{child.name}</span>
                </button>
              ))}
            </>
          )}
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          {tab === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="mx-auto max-w-3xl space-y-5">
                  {messages?.length === 0 && (
                    <div className="py-16 text-center">
                      <MessageSquare className="mx-auto h-7 w-7 text-muted-foreground" />
                      <h2 className="mt-3 text-sm font-semibold">
                        Start the project conversation
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Share an update, a file, or one of your team notes.
                      </p>
                    </div>
                  )}
                  {messages?.map((item, index) => {
                    const previous = messages[index - 1];
                    const grouped =
                      previous?.userId === item.userId &&
                      item.createdAt - previous.createdAt < 5 * 60 * 1000;
                    return (
                      <div
                        key={item._id}
                        className={cn("flex gap-3", grouped && "pl-9")}
                      >
                        {!grouped && (
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={item.userImage} />
                            <AvatarFallback>
                              {item.userName.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="min-w-0 flex-1">
                          {!grouped && (
                            <div className="mb-1 flex items-baseline gap-2">
                              <span className="text-sm font-medium">
                                {item.userId === user?.id
                                  ? "You"
                                  : item.userName}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {formatTime(item.createdAt)}
                              </span>
                            </div>
                          )}
                          {item.content && (
                            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                              {item.content}
                            </p>
                          )}
                          {item.documentId && (
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/workspace/${item.documentId}`)
                              }
                              className="mt-2 flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                              <FileText className="h-5 w-5" />
                              <div>
                                <p className="text-sm font-medium">Shared note</p>
                                <p className="text-xs text-muted-foreground">
                                  Open in Clyro
                                </p>
                              </div>
                            </button>
                          )}
                          {!!item.attachments?.length && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.attachments.map((attachment) => (
                                <a
                                  key={attachment.url}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex max-w-xs items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                                >
                                  <File className="h-4 w-4 shrink-0" />
                                  <span className="truncate">
                                    {attachment.name}
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="shrink-0 border-t border-gray-200 p-4 dark:border-white/5">
                <div className="mx-auto max-w-3xl">
                  {!!attachments.length && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {attachments.map((item) => (
                        <span
                          key={item.url}
                          className="rounded-md bg-gray-100 px-2 py-1 text-xs dark:bg-white/5"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <form
                    onSubmit={onSend}
                    className="flex items-end gap-2 rounded-xl border bg-background p-2 shadow-sm"
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(event) => void onFiles(event.target.files)}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={isUploading}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void onSend();
                        }
                      }}
                      rows={1}
                      placeholder={`Message ${project.name}`}
                      className="max-h-32 min-h-8 flex-1 resize-none bg-transparent py-1 text-sm outline-none"
                    />
                    <button
                      type="submit"
                      disabled={
                        isSending ||
                        (!message.trim() && attachments.length === 0)
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white disabled:opacity-30 dark:bg-white dark:text-gray-900"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}

          {tab === "notes" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-3xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Shared notes</h2>
                    <p className="text-sm text-muted-foreground">
                      Everyone in this project can find the same study material.
                    </p>
                  </div>
                  <Button
                    onClick={() => void onCreateNote()}
                    disabled={project.role === "viewer"}
                  >
                    <Plus className="h-4 w-4" />
                    New note
                  </Button>
                </div>
                <div className="divide-y rounded-lg border">
                  {notes?.map((note) => (
                    <div
                      key={note._id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => router.push(`/workspace/${note._id}`)}
                        className="min-w-0 flex-1 truncate text-left text-sm font-medium"
                      >
                        {note.title}
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void shareNote(note._id)}
                      >
                        <Share2 className="h-4 w-4" />
                        Share in chat
                      </Button>
                    </div>
                  ))}
                  {notes?.length === 0 && (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                      No shared notes yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "members" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-2xl">
                <h2 className="text-lg font-semibold">Members</h2>
                <div className="mt-5 divide-y rounded-lg border">
                  {members?.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.imageUrl} />
                        <AvatarFallback>
                          {member.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs capitalize text-muted-foreground dark:bg-white/5">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Invite to {project.name}</DialogTitle>
            <DialogDescription>
              Add an email for a restricted invite, or leave it blank for a
              shareable link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="teammate@school.edu (optional)"
            />
            <select
              value={inviteRole}
              onChange={(event) =>
                setInviteRole(event.target.value as "editor" | "viewer")
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="editor">Can edit and chat</option>
              <option value="viewer">Can view and chat</option>
            </select>
            <Button className="w-full" onClick={() => void onInvite()}>
              {inviteEmail ? <Link2 /> : <Copy />}
              Create and copy invite link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={projectOpen} onOpenChange={setProjectOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>New subproject</DialogTitle>
            <DialogDescription>
              Organize a subject, assignment, or study group inside this project.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={childName}
            onChange={(event) => setChildName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void onCreateChild();
            }}
            placeholder="Subproject name"
          />
          <Button
            onClick={() => void onCreateChild()}
            disabled={!childName.trim()}
          >
            Create subproject
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
