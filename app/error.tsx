"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center max-w-md px-6">
        <div className="mb-8 relative">
          <img
            src="https://illustrations.popsy.co/amber/crashed-error.svg"
            alt="Page not found"
            className="w-64 h-64 object-contain opacity-90"
          />
        </div>
        
        <h1 className="text-4xl font-semibold mb-2 text-foreground">
          404
        </h1>
        
        <p className="text-base text-muted-foreground mb-8 text-center">
          This page doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>
        
        <div className="flex gap-3">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="h-9"
          >
            Go back
          </Button>
          <Button
            onClick={() => router.push("/")}
            size="sm"
            className="h-9"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;