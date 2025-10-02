"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";

const Navbar = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <nav className="backdrop-blur border border-gray-200 dark:border-white/10 rounded-full  mx-8 mt-6 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="text-lg font-medium text-black dark:text-white">
            Clyro
          </div>
          <div className="hidden md:flex space-x-6 text-sm">
            <span className="bg-gray-200 dark:bg-gray-600 px-4 rounded-full text-gray-800 dark:text-gray-200  cursor-pointer">
              Product
            </span>
            <span className="text-gray-700  dark:text-gray-200 cursor-pointer hover:text-gray-900">
              Download
            </span>
            <span className="text-gray-700 dark:text-gray-200 cursor-pointer hover:text-gray-900">
              Solutions
            </span>
            <span className="text-gray-700 dark:text-gray-200 cursor-pointer hover:text-gray-900">
              Resources
            </span>
            <span className="text-gray-700 dark:text-gray-200 cursor-pointer hover:text-gray-900">
              Price
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isLoading && <Spinner />}
          {!isLoading && !isAuthenticated && (
            <>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-gray-700 dark:text-gray-50 cursor-pointer hover:text-gray-900"
                >
                  Login
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-800"
                >
                  Create Account
                </Button>
              </SignInButton>
            </>
          )}
          {isAuthenticated && !isLoading && (
            <>
              <Button
                variant="default"
                size="sm"
                className="bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-800"
              >
                <Link href="/workspace">Enter Workspace</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
