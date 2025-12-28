"use client";
import { readAllArticles } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import CountShow from "../_components/CountShow";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResponsive } from "ahooks";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function FilterBar() {
  const sp = useSearchParams();
  const router = useRouter();
  const resp = useResponsive();

  function onChange(val: string) {
    const nsp = new URLSearchParams(sp);
    nsp.set("read", val === "new" ? "" : val);
    router.push(`?${nsp}`);
  }

  async function handleReadAll() {
    await readAllArticles();
    router.replace(`/?readall=${Date.now()}`);
  }

  const options = [
    {
      label: "New",
      value: "new",
    },
    {
      label: "Old",
      value: "old",
    },
    {
      label: "All",
      value: "all",
    },
  ];

  let ReadFilter = (
    <Select value={sp.get("read") || "new"} onValueChange={onChange}>
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="read filter" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>ReadFilter</SelectLabel>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  if (resp?.sm) {
    ReadFilter = (
      <ButtonGroup>
        {options.map((o) => (
          <Button
            key={o.value}
            variant="outline"
            disabled={o.value === (sp.get("read") || "new")}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </ButtonGroup>
    );
  }

  return (
    <div className="flex space-x-2 p-2 items-center">
      {!resp?.sm && (
        <>
          <SidebarTrigger />
          <CountShow isHome />
        </>
      )}
      {ReadFilter}
      <Button variant="outline" onClick={handleReadAll}>
        Read All
      </Button>
    </div>
  );
}
