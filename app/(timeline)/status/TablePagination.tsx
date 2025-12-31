"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  total: number;
  pageSize: number;
}

export default function TablePagination({ total, pageSize }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  return (
    <Pagination>
      <PaginationContent>
        Total: {total}
        {Array.from({ length: Math.ceil(total / pageSize) }).map((_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              isActive={i + 1 === Number(sp.get("page") || "1")}
              onClick={() => router.replace(`?page=${i + 1}`)}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          {/* <PaginationEllipsis /> */}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
