import SideMenu from "./_components/SideMenu";
import ChannelTree from "./_components/ChannelTree";
import CountStore from "./_components/CountStore";
import { Suspense } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { db } from "@/src/db";
import { channelTable } from "@/src/db/schema";

interface Props {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default async function TimelineLayout({ children, modal }: Props) {
  const channels = await db.select().from(channelTable);

  return (
    <>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Suspense fallback="loading...">
              <SideMenu />
            </Suspense>
            <SidebarSeparator />
          </SidebarHeader>
          <SidebarContent className="gap-0">
            <Suspense fallback="loading...">
              <ChannelTree channels={channels} />
            </Suspense>
          </SidebarContent>
        </Sidebar>
        <main className="min-w-full">{children}</main>
      </SidebarProvider>
      <CountStore />
      {modal}
    </>
  );
}
