import { Outlet, useLocation, Link } from "react-router-dom";
import { AppSidebar } from "./sideBar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import React from "react";
const segmentLabels: Record<string, string> = {
  dashboard: "Tableau de bord",
  users: "Utilisateurs",
  restaurants: "Restaurants",
  plans: "Abonnements",
  features: "Fonctionnalités",
  configs: "Configurations",
  logs: "Logs",
  payments: "Paiements",
  "sponsor-codes": "Codes Sponsor",
};

export const Index = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-zinc-50/50 dark:bg-zinc-950/20">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 transition-all">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" />
              <Separator orientation="vertical" className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
              <Breadcrumb>
                <BreadcrumbList className="gap-1 sm:gap-2">
                  <BreadcrumbItem>
                    <Link to="/admin/dashboard" className="transition-colors hover:text-foreground">
                      Admin
                    </Link>
                  </BreadcrumbItem>
                  {pathSegments.map((segment, index) => {
                    const href = "/" + pathSegments.slice(0, index + 1).join("/");
                    const isLast = index === pathSegments.length - 1;

                    if ((segment === "admin" || segment === "account") && index === 0) {
                      return null;
                    }

                    return (
                      <React.Fragment key={href}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage>{segmentLabels[segment] || segment}</BreadcrumbPage>
                          ) : (
                            <Link to={href} className="transition-colors hover:text-foreground">
                              {segmentLabels[segment] || segment}
                            </Link>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
