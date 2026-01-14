import { Outlet, useLocation, Link } from "react-router-dom";
import { AppSidebar } from "./sideBar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import React from "react";
import { useTranslation } from "react-i18next";

export const Index = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.map((segment, index) => {
                  const href = "/" + pathSegments.slice(0, index + 1).join("/");
                  const isLast = index === pathSegments.length - 1;
                  // Skip 'app' in breadcrumb display, show it as root
                  if ((segment === "admin" || segment === "account") && index === 0) {
                    return null;
                  }

                  return (
                    <React.Fragment key={href}>
                      {index > 1 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage> {t(`pages.admin.${segment}`)}</BreadcrumbPage>
                        ) : (
                          <Link to={href} className="text-sm text-muted-foreground hover:text-foreground">
                            {t(`pages.admin.${segment}`)}
                          </Link>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};
