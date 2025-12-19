import { db } from "@/src/db";
import { channelTable } from "@/src/db/schema";
import { groupBy } from "lodash-es";
import styles from "./channel_tree.module.css";
import ChannelItem from "./ChannelItem";
import { FolderOutlined } from "@ant-design/icons";
import CountShow from "./CountShow";
import { Suspense } from "react";

export default async function ChannelTree() {
  const channels = await db.select().from(channelTable);
  const tree = groupBy(channels, (c) => c.category || "UNCATEGORIZED");

  return (
    <div className={styles.root}>
      {Object.keys(tree).map((k) => (
        // if default open by <ChannelItem /> controls
        <details key={k}>
          <summary className={styles.category}>
            <FolderOutlined /> {k}
            <CountShow channels={tree[k].map((c) => c.id)} />
          </summary>
          <ul className={styles.c_ul}>
            {tree[k].map((c) => (
              <li key={c.id}>
                <Suspense fallback="loading...">
                  <ChannelItem channel={c} />
                </Suspense>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
