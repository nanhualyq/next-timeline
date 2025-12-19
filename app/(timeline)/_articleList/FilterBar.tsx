"use client";
import { channelsCrawler, readAllArticles } from "@/app/actions";
import { Button, Select, Space } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import CountShow from "../_components/CountShow";
import { MenuOutlined } from "@ant-design/icons";
import layoutStyles from "../layout.module.css";

export default function FilterBar() {
  const sp = useSearchParams();
  const router = useRouter();

  function onChange(val: string) {
    const nsp = new URLSearchParams(sp);
    nsp.set("read", val);
    router.push(`?${nsp}`);
  }

  async function handleReadAll() {
    await readAllArticles();
    location.href = "/";
    // location.reload();
  }

  function handleRereshAll() {
    channelsCrawler();
    alert("Refresh started");
  }

  function handleFoldAsider() {
    document
      .querySelector("." + layoutStyles.sider)
      ?.classList.toggle(layoutStyles.sider_show);
  }

  return (
    <Space style={{ padding: "8px" }} wrap>
      <Button onClick={handleFoldAsider} className={layoutStyles.sider_handler}>
        <MenuOutlined />
        <CountShow isHome />
      </Button>
      <Select
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
      <Button onClick={handleRereshAll}>Refresh All</Button>
    </Space>
  );
}
