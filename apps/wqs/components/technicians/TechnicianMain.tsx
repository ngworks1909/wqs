"use client"
import { useTechnicians } from '@/hooks/useTechnicians';
import React from 'react'
import { TechniciansTable } from './TechniciansTable';

export default function TechnicianMain() {
    const { technicians, loading, ...props } = useTechnicians();

  return (
    <div className="flex flex-1 flex-col px-4 pt-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Technicians</h1>
        <p className="text-sm text-muted-foreground">Manage and view all technicians</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
            </div>
            <p className="text-sm text-muted-foreground">Loading technicians...</p>
          </div>
        </div>
      )}

      {!loading && technicians.length > 0 && <TechniciansTable technicians={technicians} {...props} />}

      {!loading && technicians.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No technicians found</p>
        </div>
      )}
    </div>
  )
}
