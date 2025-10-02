"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";
import Title from "./title";
import Banner from "./banner";
import Menu from "./menu";
import Publish from "./publish";

interface NavbarProps {
  isCollapsed: boolean;
  openSidebar: () => void;
}

const Navbar = ({ isCollapsed, openSidebar }: NavbarProps) => {
  const params = useParams();
  const document = useQuery(api.documents.getById, {
    documentId: params.documentId as Id<"documents">,
  });

  if (document === undefined) {
    return (
      <nav className="flex bg-transparent px-3 py-2 w-full justify-between">
        <Title.Skeleton />
        <Menu.Skeleton />
      </nav>
    );
  }

  return (
    <>
      <nav className="flex bg-transparent px-3 py-2 w-full">
        {isCollapsed && (
          <MenuIcon
            onClick={openSidebar}
            className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-gray-300 transition-all duration-200 hover:scale-110 mt-2 mr-2"
          />
        )}
        <div className="w-full flex item-center justify-between">
          <Title initialData={document} />
          <div className="flex item-center gap-x-2">
            <Publish initialData={document} />
            <Menu documentId={document._id} />
          </div>
        </div>
      </nav>
      {document.isArchived && <Banner documentId={document._id} />}
    </>
  );
};

export default Navbar;
