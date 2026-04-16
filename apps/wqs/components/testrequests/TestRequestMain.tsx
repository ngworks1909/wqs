"use client"
import { useTestRequests } from '@/hooks/useTestRequests';
import React, { useMemo } from 'react'
import { TestRequestsTable } from './TestRequestTable';
import { TestRequestStatus } from '@prisma/client';

export default function TestRequestMain({status}: {status: TestRequestStatus}) {
    const { testRequests, loading, ...props } = useTestRequests(status);
    const info = useMemo(() => {
      if(status === TestRequestStatus.Accepted){
          return 'Action Needed'
      }
      return status;
    }, [status])
  return (
    <div className="flex flex-1 flex-col px-4 pt-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{info} Requests</h1>
        <p className="text-sm text-muted-foreground">Manage and view {info.toLowerCase()} water test requests</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
            </div>
            <p className="text-sm text-muted-foreground">Loading test requests...</p>
          </div>
        </div>
      )}

      {!loading && testRequests.length > 0 && <TestRequestsTable testRequests={testRequests} {...props} />}

      {!loading && testRequests.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No test requests found</p>
        </div>
      )}
    </div>
  )
}
