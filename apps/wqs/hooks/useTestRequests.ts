'use client';

import { useEffect, useState } from 'react';
import { Pagination, PendingTestRequest, TestRequest } from '@/types/testRequest';
import { SampleTestStatus, TestRequestStatus } from '@prisma/client';
import { api } from '@/lib/api';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';



export const useTestRequests = (status: TestRequestStatus) => {
  const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/requests/fetchrequests/${status}`, {
          headers: { 
            "Content-Type": "application/json",
          },
          params: {
            page: pagination.currentPage
          },
        });
        
        if(response.status === 200){
          setTestRequests(response.data.requests);
          setPagination((prev) => {
            return {
              ...prev,
              totalPages: response.data.totalPages,
            }
          })
        }
        setError(null);
      } catch (error) {
        console.log(error)
        if(isAxiosError(error) && error.response && error.response.data.error){
          setError(error.response.data.error);
        } else {
          setError(error instanceof Error ? error.message : 'Failed to fetch data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [pagination.currentPage, status])

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

  const onEdit = async(request: TestRequest) => {
    try {
        const response = await api.put(`/requests/updaterequest/${request.requestId}`, {
            waterTypeId: request.waterType.waterTypeId,
            location: request.location,
            sampleLocation: request.sampleLocation,
            mobileNumber: request.mobileNumber
        });
        if(response.status === 200){
            setTestRequests(prev => prev.map(req => req.requestId === request.requestId ? request : req))
            toast.success("Request updated successfully")
        }
        else{
            toast.error("Failed to update request")
        }
    } catch (error) {
        console.log(error);
        toast.error("Failed to update request")
    }
  }

  const onDelete = async(requestId: string) => {
    try {
        const response = await api.delete(`/requests/deleterequest/${requestId}`);
        if(response.status === 200){
            setTestRequests(prev => prev.filter(req => req.requestId !== requestId))
            toast.success("Request deleted successfully")
        }
        else{
            toast.error("Failed to delete request")
        }
    } catch (error) {
        console.log(error);
        toast.error("Failed to delete request")
    }
  }

  const chooseTests = async(requestId: string, testIds: string[]) => {
    try {
      const response = await api.post(`/payments/create/${requestId}`, {testIds}, {headers: {
        "Content-Type": "application/json",
      }})
      if(response.status === 200){
        setTestRequests(prev => prev.filter(req => req.requestId !== requestId))
        toast.success("Payment collected successfully")
      }
    } catch (error) {
      if(isAxiosError(error) && error.message){
        toast.error(error.message)
        return
      }
      toast.error("Failed to collect payment")
    }
  }

  const updateStatus = async(requestId: string, status: "Accepted" | "Rejected" | "SampleCollected") => {
    try {
      api.patch(`/requests/status/${requestId}`, {
        status
      }, {headers: {
        "Content-Type": "application/json",
      }}).then((response) => {
        if(response.status === 200){
          setTestRequests(prev => prev.filter(req => req.requestId !== requestId))
          toast.success("Request updated successfully")
        }
      })
    } catch (error) {
      if(isAxiosError(error) && error.message){
        toast.error(error.message)
        return
      }
      toast.error("Failed to update request")
    }
  }

  const updateTask = (requestId: string, testsToUpdate: { id: string; value: number }[], status: SampleTestStatus) => {
        setTestRequests(prev => prev.map(request => {
            if(request.requestId === requestId){
                return {
                    ...request,
                    sampleTests: (request as PendingTestRequest).sampleTests.map(test => {
                        const t = testsToUpdate.find(t => t.id === test.id)
                        if(t){
                            return {
                                ...test,
                                status,
                                value: t.value
                            }
                        }
                        return test
                    })
                }
            }
            return request
        }))
    }

  return { testRequests, loading, error, pagination, prevPage, nextPage, setPagination, onEdit, onDelete, chooseTests, updateStatus, updateTask };
};
