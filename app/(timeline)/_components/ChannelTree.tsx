import { db } from "@/src/db";
import { channelTable } from "@/src/db/schema";
import { groupBy } from "lodash-es";
import styles from "./channel_tree.module.css";

export default async function ChannelTree() {
  const channels = await db.select().from(channelTable);
  const tree = groupBy(channels, (c) => c.category || "UNCATEGORIZED");
  return (
    <div className={styles.root}>
      {Object.keys(tree).map((k) => (
        <details key={k}>
          <summary>{k}</summary>
          <ul className={styles.c_ul}>
            {tree[k].map((c) => (
              <li key={c.id}>{c.title}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
