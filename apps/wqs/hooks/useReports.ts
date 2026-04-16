import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Pagination } from "@/types/testRequest";
import { SampleTestReport } from "@/types/testRequest";

export const useReports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<SampleTestReport[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalPages: 1,
    currentPage: 1,
  });

  const fetchReports = async (page: number) => {
    try {
      setLoading(true);
      const response = await api.get("/reports", {
        params: { page },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        toast.error("Failed to fetch reports");
        return;
      }

      const data = response.data;

      setReports(data.reports);
      setPagination({
        currentPage: page,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(pagination.currentPage);
  }, [pagination.currentPage]);

  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  };

  const prevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
    }
  };

  return {
    loading,
    reports,
    pagination,
    nextPage,
    prevPage,
    setPagination,
  };
};