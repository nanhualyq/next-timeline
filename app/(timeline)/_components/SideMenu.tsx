"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import CountShow from "./CountShow";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  IconHeartRateMonitor,
  IconHome,
  IconPlus,
  IconStar,
} from "@tabler/icons-react";

export default function SideMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isHome() {
    return (
      pathname === "/" &&
      !searchParams.get("star") &&
      !searchParams.get("channel")
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isHome()}>
              <Link href="/" accessKey="a">
                <IconHome />
                <span>Timeline</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuBadge>
              <CountShow isHome />
            </SidebarMenuBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={searchParams.has("star")}>
              <Link href="/?star=1&read=all" accessKey="s">
                <IconStar />
                <span>Star</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuBadge>
              <CountShow isStar />
            </SidebarMenuBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/channel/add"}>
              <Link href="/channel/add">
                <IconPlus />
                <span>Add Feed</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/status"}>
              <Link href="/status">
                <IconHeartRateMonitor />
                <span>Status</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
