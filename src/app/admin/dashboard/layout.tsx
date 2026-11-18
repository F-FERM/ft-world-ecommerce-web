
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/src/components/ui/sidebar";

import { AppSidebar } from "@/src/components/admin/Sidebar";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import { TOKEN_KEYS } from "@/src/utility/localStorage";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEYS.admin);

    if (!token) {
      router.replace("/admin/login/");
      setCheckingAuth(false);
      return;
    }

    setAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger />

            <h1 className="text-[18px] font-semibold">
              FT World Admin
            </h1>
          </header>

          <main className="flex-1 bg-[#F7F7F7] p-6">
            {checkingAuth ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-[#542452] border-t-transparent" />
              </div>
            ) : authorized ? (
              children
            ) : null}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
