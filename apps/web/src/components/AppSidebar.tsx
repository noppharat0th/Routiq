import { Gauge, LoaderCircle, LogOut, Settings, ShieldCheck, Waypoints } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';
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
import { routes } from '@/routes/route-paths';

const navigationItems = [
  { title: 'Dashboard', icon: Gauge, path: routes.dashboard },
  { title: 'Network Devices', icon: Waypoints, path: routes.devices },
  { title: 'Security', icon: ShieldCheck, path: routes.security },
  { title: 'Settings', icon: Settings, path: routes.settings },
];

interface AppSidebarProps {
  signingOut: boolean;
  onSignOut: () => void;
}

export function AppSidebar({ signingOut, onSignOut }: AppSidebarProps) {
  const location = useLocation();

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
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <NavLink to={item.path}>
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled={signingOut} onClick={onSignOut} tooltip="Sign out">
              {signingOut ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : (
                <LogOut aria-hidden="true" />
              )}
              <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
