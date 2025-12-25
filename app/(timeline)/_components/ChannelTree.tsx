"use client";
import { groupBy } from "lodash-es";
import ChannelItem from "./ChannelItem";
import CountShow from "./CountShow";
import { Suspense } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { channelTable } from "@/src/db/schema";
import { useSearchParams } from "next/navigation";

interface Props {
  channels: (typeof channelTable.$inferSelect)[];
}

export default function ChannelTree({ channels }: Props) {
  const tree = groupBy(channels, (c) => c.category || "UNCATEGORIZED");
  const sp = useSearchParams();

  function shouldUnfold(category: string) {
    return tree[category].some((c) => sp.get("channel") === c.id + "");
  }

  return (
    <>
      {Object.keys(tree).map((k) => (
        <Collapsible
          key={k}
          defaultOpen={shouldUnfold(k)}
          className="group/collapsible"
        >
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                {k}
                <CountShow channels={tree[k].map((c) => c.id)} />
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tree[k].map((c) => (
                    <Suspense key={c.id} fallback="loading...">
                      <ChannelItem channel={c} />
                    </Suspense>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </>
  );
}
