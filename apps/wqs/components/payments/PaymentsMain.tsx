'use client';

import { usePayments } from '@/hooks/usePayments';
import React from 'react';
import { PaymentsTable } from './PaymentsTable';
import { CreditCard } from 'lucide-react';

export default function PaymentsMain() {
  const { payments, loading, pagination, nextPage, prevPage, setPagination } = usePayments();

  return (
    <div className="flex flex-1 flex-col px-4 pt-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-sm text-muted-foreground">
          View and manage all payment transactions
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
            </div>
            <p className="text-sm text-muted-foreground">Loading payments...</p>
          </div>
        </div>
      )}

      {!loading && payments.length > 0 && (
        <PaymentsTable
          payments={payments}
          pagination={pagination}
          nextPage={nextPage}
          prevPage={prevPage}
          setPagination={setPagination}
        />
      )}

      {!loading && payments.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-lg bg-muted p-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="mb-1 text-lg font-semibold">No payments found</h3>
            <p className="text-sm text-muted-foreground">
              {`You haven't made any payments yet. Start by creating a new payment request.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
