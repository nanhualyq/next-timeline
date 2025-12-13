import { db } from "@/src/db";
import { channelTable } from "@/src/db/schema";
import { groupBy } from "lodash-es";
import styles from "./channel_tree.module.css";
import ChannelItem from "./ChannelItem";

export default async function ChannelTree() {
  const channels = await db.select().from(channelTable);
  const tree = groupBy(channels, (c) => c.category || "UNCATEGORIZED");

  return (
    <div className={styles.root}>
      {Object.keys(tree).map((k) => (
        // if default open by <ChannelItem /> controls
        <details key={k}>
          <summary>{k}</summary>
          <ul className={styles.c_ul}>
            {tree[k].map((c) => (
              <li key={c.id}>
                <ChannelItem channel={c} />
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
