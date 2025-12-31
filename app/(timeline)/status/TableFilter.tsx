"use client";

import { channelTable } from "@/src/db/schema";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  channels: (typeof channelTable.$inferSelect)[];
}

export default function TableFilter({ channels }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  function setFilter(k: string, v: string) {
    const params = new URLSearchParams(sp);
    params.set(k, v);
    router.push(`?${params.toString()}`);
  }
  return (
    <div className="flex gap-2 flex-col sm:flex-row">
      <label>
        Channel:{" "}
        <select
          value={sp.get("channel") || ""}
          onChange={(e) => setFilter("channel", e.target.value)}
        >
          <option value="">All</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status:{" "}
        <select
          value={sp.get("status") || ""}
          onChange={(e) => setFilter("status", e.target.value)}
        >
          <option value="">All</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
        </select>
      </label>
      <label>
        Time:{" "}
        <select
          value={sp.get("time") || ""}
          onChange={(e) => setFilter("time", e.target.value)}
        >
          <option value="">All</option>
          <option value="-1 day">1 Day</option>
          <option value="-7 days">7 Days</option>
          <option value="-30 days">30 Days</option>
        </select>
      </label>
    </div>
  );
}
