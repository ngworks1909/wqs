import { PaymentStatus } from "@prisma/client"

export interface Payment {
  paymentId: string
  amount: number
  request: {
    sampleLocation: string
    waterType: {
      name: string
    }
  },
  status: PaymentStatus,
  createdAt: Date
}