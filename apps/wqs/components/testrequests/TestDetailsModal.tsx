'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PendingTestRequest } from '@/types/testRequest';

interface TestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testRequest: PendingTestRequest | null;
}

export function TestDetailsModal({ isOpen, onClose, testRequest }: TestDetailsModalProps) {
  if (!testRequest) return null;

  const formatDate = (dateString: Date): string => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-800">{status}</Badge>;
    } else if (statusLower === 'completed') {
      return <Badge variant="outline" className="bg-green-50 text-green-800">{status}</Badge>;
    } else if (statusLower === 'samplecollected') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-800">{status}</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Test Request Details</DialogTitle>
          <DialogDescription>
            Request ID: {testRequest.requestId}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-hidden overflow-y-scroll scrollbar-custom">
          <div className="space-y-6 px-6 py-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-sm mt-1">{testRequest.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sample Location</p>
                    <p className="text-sm mt-1">{testRequest.sampleLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Water Type</p>
                    <p className="text-sm mt-1">{testRequest.waterType.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mobile Number</p>
                    <p className="text-sm mt-1">{testRequest.mobileNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                    <p className="text-sm mt-1">{formatDate(testRequest.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(testRequest.status)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sample Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {testRequest.sampleTests && testRequest.sampleTests.length > 0 ? (
                  testRequest.sampleTests.map((sample, sampleIndex) => (
                    <div key={sampleIndex} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{sample.test.name}</p>
                        </div>
                        <div>
                          {sample.status === 'Pending' ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                              Pending
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-800">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {sample.status !== 'Pending' && sample.value !== null && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium text-muted-foreground">Result Value</p>
                          <p className="text-sm mt-1 font-semibold text-green-700">{sample.value}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No sample tests available</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            {testRequest.payment && testRequest.payment.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {testRequest.payment.map((paymentInfo, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <p className="text-sm font-medium">Amount</p>
                      <p className="text-sm font-semibold">₹{paymentInfo.amount}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
