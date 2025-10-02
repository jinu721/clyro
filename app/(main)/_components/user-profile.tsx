"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import { ChevronsLeftRight, LogOut, User } from "lucide-react";

const UserProfile = () => {
  const { user } = useUser();

  const getInitials = () => {
    if (!user?.firstName) return "U";
    return user.firstName.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center justify-between text-sm p-3 w-full hover:bg-primary/5 rounded-md transition-all duration-200 group cursor-pointer"
        >
          <div className="gap-x-2 flex items-center min-w-0 flex-1">
            <Avatar className="h-7 w-7 ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
              <AvatarImage src={user?.imageUrl} alt="user image" />
              <AvatarFallback className="text-xs font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="text-start font-medium line-clamp-1">
              {user?.firstName}&apos;s workspace
            </span>
            <ChevronsLeftRight className="rotate-90 text-muted-foreground h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80"
        align="start"
        alignOffset={11}
        forceMount
        sideOffset={8}
      >
        <div className="flex flex-col space-y-1 p-3 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.imageUrl} alt="user image" />
              <AvatarFallback className="text-sm font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-sm font-semibold line-clamp-1">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {user?.emailAddresses[0].emailAddress}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
            Workspace
          </DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer py-2.5 px-2">
            <User className="mr-3 h-4 w-4 text-muted-foreground" />
            <span className="flex-1">My Account</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="p-2">
          <SignOutButton>
            <DropdownMenuItem className="cursor-pointer py-2.5 px-2 focus:bg-destructive/10">
              <>
                <LogOut className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="flex-1">Log Out</span>
              </>
            </DropdownMenuItem>
          </SignOutButton>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
