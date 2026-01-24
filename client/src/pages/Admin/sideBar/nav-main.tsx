import { type LucideIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
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

  function handleClick(url: string) {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate(url);
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground mb-2">{"Navigation Principale"}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const active = isActive(item.url);
          return (
            <SidebarMenuItem key={item.title} onClick={() => handleClick(item.url)}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={active}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group cursor-pointer h-10",
                  active
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground",
                  state === "collapsed" && "justify-center px-2",
                )}
              >
                <item.icon className={cn("w-4 h-4", active ? "opacity-100" : "opacity-70 group-hover:opacity-100")} />
                {state === "expanded" && <span className="text-sm">{item.title}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
