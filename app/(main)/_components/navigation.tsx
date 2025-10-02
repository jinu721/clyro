"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Search,
  Settings,
  ChevronRight,
  Plus,
  FileText,
  Folder,
  ChevronLeft,
  MenuIcon,
  Trash2,
} from "lucide-react";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import UserProfile from "./user-profile";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import DocumentList from "./document-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TrashBox from "./trash-box";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import Navbar from "./navbar";

const Navigation = () => {
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const router = useRouter();

  const create = useMutation(api.documents.create);

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [trashOpen, setTrashOpen] = useState(false);

  const trashedItems = useQuery(api.documents.getArchived);

  const search = useSearch();
  const settings = useSettings();

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;

    let width = event.clientX;
    if (width < 240) width = 240;
    if (width > 480) width = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${width}px`;
      navbarRef.current.style.setProperty("left", `${width}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${width}px)`);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const resetSidebar = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);
      sidebarRef.current.style.width = isMobile ? "0" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "100%" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty("left", isMobile ? "0" : "240px");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const openSidebar = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);
      sidebarRef.current.style.width = "240px";
      navbarRef.current.style.setProperty("width", "calc(100% - 240px)");
      navbarRef.current.style.setProperty("left", "240px");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const handleCreate = async () => {
    const promise = create({
      title: "Untitled",
    });
    toast.promise(promise, {
      loading: "Creating a page...",
      success: "Page created successfully",
      error: "Failed to create a page",
    });
    const newPage = await promise;

    router.push(`/workspace/${newPage}`);
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-screen w-60 border-r flex flex-col relative overflow-y-auto",
          "bg-[#F9F8F7] dark:bg-[#1E1E1E]",
          "border-gray-200 dark:border-white/5",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 rounded-sm absolute top-8 right-2 cursor-pointer opacity-0 group-hover/sidebar:opacity-100 transition-all flex items-center justify-center",
            "text-gray-500 dark:text-muted-foreground",
            "hover:bg-gray-200 dark:hover:bg-white/10",
            isMobile && "opacity-100"
          )}
        >
          <ChevronLeft className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        </div>

        <div className="mt-4">
          <UserProfile />
        </div>

        <div className="px-3 pb-2 pt-5">
          <div
            onClick={search.onOpen}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all group/search",
              "bg-gray-100 dark:bg-white/5",
              "hover:bg-gray-200 dark:hover:bg-white/8"
            )}
          >
            <Search className={cn(
              "w-4 h-4 transition-all duration-200 group-hover/search:scale-110",
              "text-gray-600 dark:text-gray-500",
              "group-hover/search:text-gray-700 dark:group-hover/search:text-gray-400"
            )} />
            <span className="text-sm text-gray-600 dark:text-gray-500">Search</span>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-600">⌘K</span>
          </div>
        </div>

        <div onClick={handleCreate} className="pt-4 px-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1.5 cursor-pointer group/section",
            "text-gray-700 dark:text-white/90",
            "hover:text-gray-900 dark:hover:text-gray-400"
          )}>
            <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover/section:translate-x-0.5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Create a page
            </span>
            <Plus className="w-3 h-3 ml-auto transition-all duration-200 group-hover/section:scale-110 group-hover/section:rotate-90" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          <div className="py-1">
            <DocumentList />
          </div>
        </div>

        <div className={cn(
          "p-2 border-t space-y-1",
          "border-gray-200 dark:border-white/5"
        )}>
          <Popover open={trashOpen} onOpenChange={setTrashOpen}>
            <PopoverTrigger asChild>
              <div className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all group/trash",
                "text-gray-600 dark:text-gray-400",
                "hover:bg-gray-200 dark:hover:bg-white/5",
                "hover:text-gray-900 dark:hover:text-white"
              )}>
                <Trash2 className="w-4 h-4 transition-all duration-200 group-hover/trash:scale-110" />
                <span className="text-sm">Trash</span>
                {trashedItems && trashedItems?.length > 0 && (
                  <span className={cn(
                    "ml-auto text-xs px-1.5 py-0.5 rounded",
                    "bg-gray-200 dark:bg-white/10",
                    "text-gray-700 dark:text-gray-300"
                  )}>
                    {trashedItems.length}
                  </span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="end"
              className="w-80 p-0 bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10"
            >
              <TrashBox setTrashOpen={setTrashOpen} />
            </PopoverContent>
          </Popover>

          <div
            onClick={settings.onOpen}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all group/settings",
              "text-gray-600 dark:text-gray-400",
              "hover:bg-gray-200 dark:hover:bg-white/5",
              "hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Settings className="w-4 h-4 transition-all duration-300 group-hover/settings:rotate-90" />
            <span className="text-sm">Settings</span>
          </div>
        </div>

        <div
          onMouseDown={handleMouseDown}
          onClick={resetSidebar}
          className={cn(
            "opacity-0 group-hover/sidebar:opacity-100 absolute h-full w-1 right-0 top-0 cursor-ew-resize transition-all",
            "bg-gray-300/50 dark:bg-gray-500/30",
            "hover:bg-gray-400/50 dark:hover:bg-gray-600/40"
          )}
        />
      </aside>
      <div
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
        ref={navbarRef}
      >
        {!!params.documentId ? (
          <Navbar
           isCollapsed={isCollapsed}
           openSidebar={openSidebar}
           />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && (
              <MenuIcon
                onClick={openSidebar}
                className={cn(
                  "h-4 w-4 cursor-pointer transition-all duration-200 hover:scale-110",
                  "text-gray-600 dark:text-muted-foreground",
                  "hover:text-gray-900 dark:hover:text-gray-300"
                )}
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
};

export default Navigation;