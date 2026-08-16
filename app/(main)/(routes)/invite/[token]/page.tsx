"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const invite = useQuery(api.projects.getInvite, { token });
  const acceptInvite = useMutation(api.projects.acceptInvite);
  const [isAccepting, setIsAccepting] = useState(false);

  const accept = async () => {
    setIsAccepting(true);
    try {
      const projectId = await acceptInvite({ token });
      router.replace(`/projects/${projectId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invite failed");
      setIsAccepting(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-background p-6 text-center shadow-sm">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
          <Users className="h-5 w-5" />
        </div>
        {invite === undefined ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading invite...</p>
        ) : invite === null ? (
          <>
            <h1 className="mt-4 font-semibold">Invite unavailable</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This invite may have expired or already been used.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-lg font-semibold">
              Join {invite.projectName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You’ll join as {invite.role} and get access to team chat and shared
              notes.
            </p>
            <Button
              className="mt-5 w-full"
              onClick={() => void accept()}
              disabled={isAccepting}
            >
              {isAccepting ? "Joining..." : "Join project"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
