"use client";
import { readAllArticles } from "@/app/actions";
import { Button, Radio, RadioChangeEvent, Space } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

export default function FilterBar() {
  const sp = useSearchParams();
  const router = useRouter();

  function onChange(e: RadioChangeEvent) {
    const nsp = new URLSearchParams(sp);
    nsp.set("read", e.target.value);
    router.push(`?${nsp}`);
  }

  async function handleReadAll() {
    await readAllArticles();
    location.href = "/";
    // location.reload();
  }

  return (
    <div style={{ padding: "8px" }}>
      <Space>
        <Radio.Group
          value={sp.get("read") || ""}
          onChange={onChange}
          options={[
            {
              label: "New",
              value: "",
            },
            {
              label: "Old",
              value: "old",
            },
            {
              label: "All",
              value: "all",
            },
          ]}
        />
        <Button onClick={handleReadAll}>Read All</Button>
      </Space>
    </div>
  );
}
