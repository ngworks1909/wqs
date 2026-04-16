import { useEffect, useState } from "react"
import { toast } from 'sonner'
import { api } from "@/lib/api"
import { Pagination } from "@/types/testRequest"
import { Payment } from "@/types/payment"



export const usePayments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    totalPages: 1,
    currentPage: 1
  })

  const fetchPayments = async (page: number) => {
    try {
      setLoading(true)
      const response = await api.get("/payments/list", {
        params: {
            page
        },
        headers: {
          "Content-Type": "application/json",
        },
      })

      if(response.status !== 200){
        toast.error("Failed to fetch payments");
        return;
      }

      const data = response.data;

      setPayments(data.payments)

      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages
      })
    } catch (error) {
      console.error("Failed to fetch payments", error)
      toast.error("Failed to fetch payments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments(pagination.currentPage)
  }, [pagination.currentPage])

  // pagination helpers
  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }))
    }
  }

  const prevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }))
    }
  }

  return {
    loading,
    payments,
    pagination,
    nextPage,
    prevPage,
    setPagination
  }
}
