import { useEffect, useState } from "react"
import { toast } from 'sonner'
import { api } from "@/lib/api"
import { Pagination } from "@/types/testRequest"
import { Technician } from "@/types/auth"
import { useTechnicianState } from "@/atoms/TechnicianState"



export const useTechnicians = () => {

   const {loading, technicians, pagination, setLoading, setTechnicians, setPagination} = useTechnicianState()
  const fetchTechnicians = async (page: number) => {
    try {
      setLoading(true)
      const response = await api.get("/technicians", {
        params: {
            page
        },
        headers: {
          "Content-Type": "application/json",
        },
      })

      if(response.status !== 200){
        toast.error("Failed to fetch technicians");
        return;
      }

      const data = response.data;

      setTechnicians(data.technicians)

      setPagination({
        ...pagination,
        totalPages: data.totalPages
      })
    } catch (error) {
      console.error("Failed to fetch technicians", error)
      toast.error("Failed to fetch technicians")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechnicians(pagination.currentPage)
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
    technicians,
    pagination,
    nextPage,
    prevPage,
    setPagination
  }
}
