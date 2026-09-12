import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, UserPlus } from "lucide-react";

export const APP_NAME = "LeadIQ";
export const APP_TAGLINE = "Sales Intelligence Engine";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Primary navigation. Only routes implemented in Phase 1 are enabled here;
 * later phases will extend this list.
 */
export const PRIMARY_NAV: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", href: "/leads", icon: Users },
  { title: "Add Lead", href: "/leads/new", icon: UserPlus },
];
