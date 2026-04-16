import { DashBoardData } from "@/types/dashboard"
import { create } from "zustand"

type DashboardStore = DashBoardData & {
  setData: (
    updater:
      | Partial<DashBoardData>
      | ((prev: DashBoardData) => Partial<DashBoardData>)
  ) => void
}

export const useDashboardState = create<DashboardStore>((set) => ({
  kpi: {
    testRequests: {
      currentMonthTestRequestsCount: 0,
      prevMonthCount: 0
    },
    users: {
      currentMonthNewUsersCount: 0,
      userCount: 0
    },
    payments: {
      currentMonthRevenue: 0,
      lastMonthPaymentTotal: 0,
    }
  },
  paymentsByStatus: {
    Pending: 0,
    Success: 0,
    Failed: 0
  },
  testRequestByStatus: {
    Pending: 0,
    Rejected: 0,
    Accepted: 0,
    PaymentPending: 0,
    PaymentCollected: 0,
    SampleCollected: 0,
    Testing: 0,
    Completed: 0,
    Deleted: 0,
  },
  topTechnicians: [],
  mostActiveUsers: [],

  setData: (updater) =>
    set((state) =>
      typeof updater === "function"
        ? { ...state, ...updater(state) }
        : { ...state, ...updater }
    ),
}))