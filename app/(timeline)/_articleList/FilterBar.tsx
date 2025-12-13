"use client";
import { Radio, RadioChangeEvent } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

export default function FilterBar() {
  const sp = useSearchParams();
  const router = useRouter();

  function onChange(e: RadioChangeEvent) {
    router.push(`/?read=${e.target.value}`);
  }

  return (
    <div style={{ padding: "8px" }}>
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
    </div>
  );
}
