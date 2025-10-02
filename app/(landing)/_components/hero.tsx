"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { SignInButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="relative max-w-5xl mx-auto px-6 py-12 text-center overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-none select-none">
          <span className="block font-['Caveat',_'Dancing_Script',_'Kalam',_cursive] text-gray-400 dark:text-gray-600 opacity-80">
            Your Ideas,
          </span>
          <span className="block font-['Caveat',_'Dancing_Script',_'Kalam',_cursive] text-transparent bg-gradient-to-r from-gray-700 via-gray-900 to-black dark:from-gray-200 dark:via-white dark:to-gray-100 bg-clip-text relative">
            Organized
            <div className="absolute -top-16 sm:-top-20 md:-top-24 left-1/2 transform -translate-x-1/2 z-20">
              <div className="relative">
                <Image
                  src="/hero.png"
                  width={200}
                  height={200}
                  alt="Person sitting and reading"
                  className="drop-shadow-2xl dark:invert dark:brightness-0"
                />
              </div>
            </div>
          </span>
          <span className="block font-['Caveat',_'Dancing_Script',_'Kalam',_cursive] text-gray-800 dark:text-gray-400">
            Beautifully
          </span>
        </h1>
      </div>

      <div className="relative z-10 mt-8">
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Keep notes, tasks, and projects in one
          <br />
          simple space that grows with you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          {isLoading && <Spinner />}
          {!isLoading && !isAuthenticated && (
            <SignInButton>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 px-8 py-3 rounded-full font-medium text-base transition-all hover:shadow-lg hover:shadow-gray-900/25 dark:hover:shadow-gray-100/25 group cursor-pointer">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </SignInButton>
          )}
          {!isLoading && isAuthenticated && (
            <Button className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 px-8 py-3 rounded-full font-medium text-base transition-all hover:shadow-lg hover:shadow-gray-900/25 dark:hover:shadow-gray-100/25 group cursor-pointer">
              <Link href="/workspace">Get Started Free</Link>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
