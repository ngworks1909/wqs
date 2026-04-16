'use client'
import { useDashboard } from '@/hooks/useDashboard';
import SectionCards from './SelectionCards'
import SkeletonCards from './SkeletonCards'
import { TestRequestChart } from './TestRequstChart';
import { PaymentChart } from './PaymentChart';
import { UserStats } from './UserStats';

export default function Dashboard() {
  const { loading, data } = useDashboard();
  
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {loading ? (
            <SkeletonCards />
          ) : (
            <SectionCards kpi={data.kpi} />
          )}
            <div className='grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-6 gap-4 lg:gap-6'>
                <TestRequestChart testRequestByStatus={data.testRequestByStatus} isLoading={loading} />
                <PaymentChart paymentByStatus = {data.paymentsByStatus} isLoading={loading} />
            </div>
            <div className='px-4 lg:px-6'>
                <UserStats topTechnicians={data.topTechnicians} mostActiveUsers={data.mostActiveUsers} isLoading={loading} />
            </div>
        </div>
      </div>
    </div>
  )
}
