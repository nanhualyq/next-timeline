import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { db } from "@/src/db";
import { channelTable, crawlerLogTable } from "@/src/db/schema";
import Link from "next/link";
import { desc, eq, and, gte, sql } from "drizzle-orm";
import DataTable from "./data-table";
import TablePagination from "./TablePagination";
import TableFilter from "./TableFilter";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function StatusPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pageSize = 50;
  const where = [];
  if (sp.channel) {
    where.push(eq(crawlerLogTable.channel_id, +sp.channel));
  }
  if (sp.status) {
    where.push(eq(crawlerLogTable.status, sp.status as "success"));
  }
  if (sp.time) {
    where.push(
      gte(
        crawlerLogTable.timestamp,
        sql`datetime('now', '${sql.raw(sp.time)}')`
      )
    );
  }
  const logs = await db
    .select()
    .from(crawlerLogTable)
    .leftJoin(channelTable, eq(crawlerLogTable.channel_id, channelTable.id))
    .orderBy(desc(crawlerLogTable.id))
    .limit(pageSize)
    .offset((Number(sp.page || "1") - 1) * pageSize)
    .where(and(...where));
  const total = await db.$count(crawlerLogTable, and(...where));
  const channels = await db.select().from(channelTable);

  return (
    <div className="p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Status</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <TableFilter channels={channels} />
      <DataTable data={logs} />
      <TablePagination total={total} pageSize={pageSize} />
    </div>
  );
}
