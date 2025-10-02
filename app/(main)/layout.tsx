"use client";

import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import Navbar from "./_components/navigation";
import { SearchCommand } from "@/components/search-command";

const WorkspaceLayout = ({children}:{
    children:React.ReactNode
}) => {

    const {isAuthenticated,isLoading} = useConvexAuth();

    if(isLoading){
        return (
            <div className="h-full flex items-center justify-center" >
                <Spinner size={40} />
            </div>
        )
    }


    if(!isAuthenticated){
        return redirect("/");
    }

    return (
        <div className="h-screen flex bg-[#FFFFFF] dark:bg-[#1E1E1E]" >
            <Navbar/>
            <main className="flex-1 h-full overflow-y-auto dark:bg-[#191919]" >
                <SearchCommand/>
              {children}
            </main>
        </div>
    )
}

export default WorkspaceLayout;