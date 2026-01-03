"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pubtime from "../article/[id]/Pubtime";
import { channelTable, crawlerLogTable } from "@/src/db/schema";

type Row = {
  channel: typeof channelTable.$inferSelect | null;
  crawler_log: typeof crawlerLogTable.$inferSelect | null;
};

interface Props {
  data: Row[];
}

export default function DataTable({ data }: Props) {
  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: "channel.title",
      header: "Channel",
    },
    {
      accessorKey: "crawler_log.result",
      header: "Result",
    },
    {
      accessorKey: "crawler_log.timestamp",
      header: "Time",
      cell: ({ getValue }) => <Pubtime time={getValue() as string} />,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className={`${
                row.original.crawler_log?.status === "success"
                  ? "bg-green-50"
                  : "bg-red-50"
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-wrap whitespace-break-spaces">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
