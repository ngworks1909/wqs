import { PaymentStatus, TestRequestStatus } from "@prisma/client"


export interface KPIData{
  testRequests: {
    currentMonthTestRequestsCount: number,
    prevMonthCount: number
  },
  users: {
    currentMonthNewUsersCount: number,
    userCount: number
  },
  payments: {
    currentMonthRevenue: number,
    lastMonthPaymentTotal: number,
  }
}
export type TestRequestByStatus = Record<TestRequestStatus, number>
export type PaymentByStatus = Record<PaymentStatus, number>
interface BaseUserDetails{
    userId: string,
    username: string,
    email: string,
}

export interface ActiveUserDetails extends BaseUserDetails{
    requestCount: number,
}

export interface TechnicianDetails extends BaseUserDetails{
    solvedRequestCount: number,
}
export interface DashBoardData{
    kpi: KPIData,
    testRequestByStatus: TestRequestByStatus,
    paymentsByStatus: PaymentByStatus,
    topTechnicians: TechnicianDetails[],
    mostActiveUsers: ActiveUserDetails[],
}