"use client";
import Link from "next/link";
import styles from "./side_menu.module.css";
import { usePathname, useSearchParams } from "next/navigation";
import { HomeFilled, StarFilled } from "@ant-design/icons";

export default function SideMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function highlightCss(matched: unknown) {
    return matched ? styles.active : "";
  }
  return (
    <ul className={styles.root}>
      <Link href="/" accessKey="a">
        <li
          className={highlightCss(
            pathname === "/" &&
              !searchParams.get("star") &&
              !searchParams.get("channel")
          )}
        >
          <HomeFilled /> Timeline
        </li>
      </Link>
      <Link href="/?star=1&read=all" accessKey="s">
        <li className={highlightCss(searchParams.get("star"))}>
          <StarFilled /> Star
        </li>
      </Link>
      <Link href="/channel/add">
        <li className={highlightCss(pathname === "/channel/add")}>Add Feed</li>
      </Link>
    </ul>
  );
}
