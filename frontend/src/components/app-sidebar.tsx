import * as React from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Flame } from "lucide-react"
import { useTheme } from "./theme-provider"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const location = useLocation();
  const { theme } = useTheme();

  const isDark = React.useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'system') {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }, [theme]);

  const menuItems = React.useMemo(() => {
    return [
      {
        title: t('sidebar.dashboard'),
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: t('sidebar.users'),
        url: "/users",
        icon: Users,
      },
    ];
  }, [t]);

  return (
    <Sidebar collapsible="icon" className={isDark ? "dark" : ""} {...props}>
      <SidebarHeader className="border-b border-sidebar-border/50 h-16 flex items-center px-2 shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent active:bg-transparent data-[state=open]:bg-transparent">
              <Link to="/dashboard">
                <div className="flex aspect-square h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shrink-0">
                  <Flame className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5 truncate leading-none text-left">
                  <span className="font-semibold text-foreground">{t('sidebar.title')}</span>
                  <span className="text-[10px] text-muted-foreground">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="data-[active=true]:bg-indigo-600/10 data-[active=true]:text-indigo-500"
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
