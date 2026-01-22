import { type LucideIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    icon: LucideIcon;
    isActive?: boolean;
    url: string;
  }[];
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");
  const { t } = useTranslation();

  function handleClick(url: string) {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate(url);
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
        Main Navigation
      </SidebarGroupLabel>
      <SidebarMenu className="gap-2">
        {items.map((item) => {
          const active = isActive(item.url);
          return (
            <SidebarMenuItem key={item.title} onClick={() => handleClick(item.url)}>
              <SidebarMenuButton
                tooltip={t(`pages.admin.${item.title}`)}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-6 rounded-2xl transition-all duration-300 group cursor-pointer",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
                  state === "collapsed" && "justify-center px-2 py-6",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    active ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100",
                  )}
                />
                {state === "expanded" && (
                  <>
                    <span className={cn("text-sm font-bold tracking-tight", active ? "opacity-100" : "opacity-80 group-hover:opacity-100")}>
                      {t(`pages.admin.${item.title}`)}
                    </span>
                    {active && <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />}
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
