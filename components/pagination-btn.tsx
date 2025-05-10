'use client'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

interface PaginationBtnProps {
  name: string;
  pageIndex: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const PaginationBtn = ({
  name,
  pageIndex,
  totalPages,
  hasPreviousPage,
  hasNextPage
}: PaginationBtnProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || pageIndex

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Always show last page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add the page numbers with ellipsis
    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    router.push(`/user/${name}/flights?page=${page}`)
  }

  return (
    <Pagination>
      <PaginationContent className="bg-gray-700 text-white rounded-lg p-1">
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => handlePageChange(currentPage - 1)}
            className={cn(
              "text-white",
              "hover:bg-gray-600",
              "hover:text-white",
              "rounded-md transition-all",
              !hasPreviousPage && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>

        {getPageNumbers().map((pageNumber, index) => (
          pageNumber === '...' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis className="text-white" />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                onClick={() => handlePageChange(Number(pageNumber))}
                isActive={currentPage === pageNumber}
                className={cn(
                  "text-white",
                  "rounded-md transition-all",
                  "hover:bg-gray-600",
                  "hover:text-white",
                  currentPage === pageNumber && "bg-gray font-bold"
                )}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          )
        ))}

        <PaginationItem>
          <PaginationNext 
            onClick={() => handlePageChange(currentPage + 1)}
            className={cn(
              "text-white",
              "hover:bg-gray-600",
              "hover:text-white",
              "rounded-md transition-all",
              !hasNextPage && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default PaginationBtn