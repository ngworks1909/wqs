'use client';

import { SetStateAction, useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, TestRequest, PendingTestRequest, SampleTestReport } from '@/types/testRequest';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditModal } from './EditTestRequest';
import { DeleteConfirmationDialog } from './DeleteConfirmation';
import { ChooseTestsModal } from './ChooseTestsModal';
import { TestDetailsModal } from './TestDetailsModal';
import { UpdateTestsModal } from './UpdateTestsModal';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Role, SampleTestStatus, TestRequestStatus } from '@prisma/client';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { generateReportPDF } from '@/lib/report';

interface TestRequestsTableProps {
  testRequests: TestRequest[];
  pagination: Pagination,
  prevPage: () => void;
  nextPage: () => void;
  setPagination: (value: SetStateAction<Pagination>) => void;
  onEdit: (request: TestRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  chooseTests: (requestId: string, testIds: string[]) => Promise<void>;
  updateStatus: (requestId: string, status: "Accepted" | "Rejected" | "SampleCollected") => Promise<void>;
  updateTask: (requestId: string, testsToUpdate: { id: string; value: number }[], status: SampleTestStatus) => void;
}

const ITEMS_PER_PAGE = 7;

export function TestRequestsTable({ testRequests, pagination, prevPage, nextPage, setPagination, onEdit, onDelete, chooseTests, updateStatus, updateTask }: TestRequestsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [editingRequest, setEditingRequest] = useState<TestRequest | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<TestRequest | null>(null);
  // const [isChooseTestsModalOpen, setIsChooseTestsModalOpen] = useState(false);
  const [choosedId, setChoosedId] = useState<string | null>(null);
  const [selectedTestRequest, setSelectedTestRequest] = useState<PendingTestRequest | null>(null);
  const [updateTestRequest, setUpdateTestRequest] = useState<TestRequest | null>(null);
  const currentPage  = pagination.currentPage
  const totalPages = pagination.totalPages;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session: any = useSession();

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const truncateText = (text: string, length: number): string => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };
  const handleUpdateSubmit = async (requestId: string, testsToUpdate: { id: string; value: number }[]) => {
      try {
        const response = await api.put(`/sampletest/update/${requestId}`, {
          tests: testsToUpdate
        }, {headers: {
          "Content-Type": "application/json",
        }})

        if (response.status === 200) {
          updateTask(requestId, testsToUpdate, "Completed")
          toast.success(response.data.message);
          return true
        }
        return false;
      } catch (error) {
        if(isAxiosError(error) && error.response){
          toast.error(error.response.data.error)
        }
        else{
          toast.error("Failed to update tests")
        }
        return false
      }
  };

  const handleViewReport = async (report: SampleTestReport) => {
    const pdfBlob = await generateReportPDF(report);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  };

  // Download PDF
  const handleDownloadReport = async (report: SampleTestReport) => {
    const pdfBlob = await generateReportPDF(report);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `WaterTestReport_${report.requestId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Table Container */}
      <div className="flex-1 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left font-semibold">Request ID</th>
              <th className="px-4 py-3 text-left font-semibold">Location</th>
              <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">Sample Location</th>
              <th className="hidden px-4 py-3 text-left font-semibold lg:table-cell">Water Type</th>
              <th className="hidden px-4 py-3 text-left font-semibold lg:table-cell">Mobile Number</th>
              <th className="px-4 py-3 text-left font-semibold">Created Date</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testRequests.map((request, index) => (
              <tr
                key={index}
                className="border-b border-border transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-mono text-xs">
                          {truncateText(request.requestId, 12)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{request.requestId}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-4 py-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {truncateText(request.location, 15)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{request.location}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {truncateText(request.sampleLocation, 15)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{request.sampleLocation}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {truncateText(request.waterType.name, 15)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{request.waterType.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {truncateText(request.mobileNumber, 15)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{request.mobileNumber}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-4 py-3 text-sm">{formatDate(request.createdAt)}</td>
                <td className="px-4 py-3 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    {
                        (session.data?.user.role === Role.user &&pathname === "/requests/pending" )&& (
                    <DropdownMenuContent align="end">
                      
                            <>
                            <DropdownMenuItem onClick={() => setEditingRequest(request)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingRequest(request)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                            </>
                    </DropdownMenuContent>
                      )
                      }

                      {
                        (session.data?.user.role === Role.user && pathname === "/requests/action-needed") && (
                    <DropdownMenuContent align="end">
                      
                            <>
                            <DropdownMenuItem onClick={() => setChoosedId(request.requestId)}>
                        Choose Tests
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingRequest(request)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                            </>
                    </DropdownMenuContent>
                      )
                      }
                      {
                        (session.data?.user.role === Role.user && pathname === "/requests/testing") && (
                    <DropdownMenuContent align="end">
                      
                            <>
                            <DropdownMenuItem onClick={() => setSelectedTestRequest(request as PendingTestRequest)}>
                        View Details
                      </DropdownMenuItem>
                            </>
                    </DropdownMenuContent>
                      )
                      }
                      {
                        (session.data?.user.role === Role.user && pathname === "/requests/completed" && request.status !== TestRequestStatus.Rejected )&& (
                    <DropdownMenuContent align="end">
                      
                            <>
                            <DropdownMenuItem onClick={() => handleViewReport(request as SampleTestReport)}>
                        View Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadReport(request as SampleTestReport)}>
                        Download Report
                      </DropdownMenuItem>
                            </>
                    </DropdownMenuContent>
                      )
                      }
                      {
                        (session.data?.user.role === Role.technician &&pathname === "/requests/pending" )&& (
                    <DropdownMenuContent align="end">
                      
                            <>
                            <DropdownMenuItem onClick={() => {updateStatus(request.requestId, TestRequestStatus.Accepted)}}>
                        Accept
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {updateStatus(request.requestId, TestRequestStatus.Rejected)}}
                        className="text-destructive"
                      >
                        Reject
                      </DropdownMenuItem>
                            </>
                    </DropdownMenuContent>
                      )
                      }

                      {
                        (session.data?.user.role === Role.technician &&pathname === "/requests/sample-collection" )&& (
                    <DropdownMenuContent align="end">
                      
                            <>
                            <DropdownMenuItem onClick={() => {updateStatus(request.requestId, TestRequestStatus.SampleCollected)}}>
                        Mark as Collected
                      </DropdownMenuItem>
                            </>
                    </DropdownMenuContent>
                      )
                      }

                      {
                        (session.data?.user.role === Role.technician &&pathname === "/requests/testing" )&& (
                    <DropdownMenuContent align="end">
                      
                            <>
                            <DropdownMenuItem onClick={() => setUpdateTestRequest(request)}>
                        Update Tests
                      </DropdownMenuItem>
                            </>
                    </DropdownMenuContent>
                      )
                      }
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingRequest && (
        <EditModal
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
          onSave={async (updatedRequest) => {
            if (onEdit) {
              await onEdit(updatedRequest);
            }
            setEditingRequest(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingRequest && (
        <DeleteConfirmationDialog
          request={deletingRequest}
          onConfirm={async () => {
            if (onDelete) {
              await onDelete(deletingRequest.requestId);
            }
            setDeletingRequest(null);
          }}
          onCancel={() => setDeletingRequest(null)}
        />
      )}

      {/* Choose Tests Modal */}
      <ChooseTestsModal
        isOpen={!!choosedId}
        onClose={() => setChoosedId(null)}
        onConfirm={async(selectedTests) => {
          await chooseTests(choosedId as string, selectedTests.map(test => test.testId))
          // console.log('Selected tests:', selectedTests);
          setChoosedId(null)
          // Handle selected tests here
        }}
      />

      {/* Test Details Modal */}
      <TestDetailsModal
        isOpen={!!selectedTestRequest}
        onClose={() => setSelectedTestRequest(null)}
        testRequest={selectedTestRequest}
      />

      {/* Update Tests Modal */}
      <UpdateTestsModal
        isOpen={!!updateTestRequest}
        onClose={() => setUpdateTestRequest(null)}
        testRequest={updateTestRequest as PendingTestRequest | null}
        onSave={async (testValues) => {
          if (updateTestRequest) {
            const success = await handleUpdateSubmit(updateTestRequest.requestId, testValues);
            if(success){
              setUpdateTestRequest(null);
            }
            return success
          }
          return false
          
        }}
      />



      {/* Pagination Controls */}
      <div className="mt-1 flex flex-col items-center justify-between gap-4 border-t border-border px-4 py-4 sm:flex-row">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, testRequests.length)} of {testRequests.length} results
        </div>

        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPagination((prev) => ({...prev, currentPage: page as number}))}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

}
