import { Gauge, Router, Settings, ShieldCheck, Waypoints } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const navigationItems = [
  { title: 'Dashboard', icon: Gauge, available: false },
  { title: 'Router Management', icon: Router, available: true },
  { title: 'Network Devices', icon: Waypoints, available: false },
  { title: 'Security', icon: ShieldCheck, available: false },
  { title: 'Settings', icon: Settings, available: false },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    aria-current={item.available ? 'page' : undefined}
                    disabled={!item.available}
                    isActive={item.available}
                    tooltip={item.available ? item.title : `${item.title} - Coming soon`}
                  >
                    <item.icon aria-hidden="true" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-sidebar-foreground/60 px-2 text-xs group-data-[collapsible=icon]:hidden">
          Router Management MVP
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
