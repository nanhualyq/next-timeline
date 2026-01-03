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
  const pageCount = Math.ceil(total / pageSize);
  function onPageChange(n: number) {
    const params = new URLSearchParams(sp);
    params.set("page", n + "");
    router.replace(`?${params.toString()}`);
  }
  return (
    <Pagination>
      <PaginationContent>
        Total: {total}
        {Array.from({ length: Math.min(pageCount, 10) }).map((_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              isActive={i + 1 === Number(sp.get("page") || "1")}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        {pageCount > 10 && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                isActive={pageCount === Number(sp.get("page") || "1")}
                onClick={() => onPageChange(pageCount)}
              >
                {pageCount}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
      </PaginationContent>
    </Pagination>
  );
}
