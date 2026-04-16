'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Check } from 'lucide-react';

interface SampleTest {
  id: string;
  status: 'Completed' | 'Testing' | 'Pending';
  test: {
    name: string;
  };
  value?: number | null;
}

interface UpdateTestRequest {
  requestId: string;
  sampleTests: SampleTest[];
}

interface UpdateTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testRequest: UpdateTestRequest | null;
  onSave: (selectedTests: {id: string, value: number}[]) => Promise<boolean>;
}


export function UpdateTestsModal({
  isOpen,
  onClose,
  testRequest,
  onSave,
}: UpdateTestsModalProps) {
  const [testValues, setTestValues] = useState<Record<string, number>>({});
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when modal opens with a new test request
  useEffect(() => {
    if (isOpen && testRequest) {
      setTestValues({});
      setSelectedTests(new Set());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, testRequest?.requestId]);

  if (!testRequest) return null;

  const completedCount = testRequest.sampleTests.filter(
    (st) => st.status === 'Completed'
  ).length;
  const total = testRequest.sampleTests.length;

  const handleTestValueChange = (testId: string, value: number) => {
    setTestValues((prev) => {
      const updated = {
        ...prev,
        [testId]: value,
      };
      return updated;
    });
  };

  const handleTestToggle = (testId: string) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
    } else {
      newSelected.add(testId);
    }
    setSelectedTests(newSelected);
  };

  

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedMap = Array.from(selectedTests).map((id) => ({
        id,
        value: testValues[id],
      }));
      const success = await onSave(selectedMap);
      if(success){
        setTestValues({});
        setSelectedTests(new Set());
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTestValues({});
    setSelectedTests(new Set());
    onClose();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Testing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Testing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Progress: #{testRequest.requestId}</DialogTitle>
          <DialogDescription>
            Mark completed tests to update overall progress
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-100 pr-4">
          <div className="space-y-4">
            {testRequest.sampleTests.map((st) => {
              const isCompleted = st.status === 'Completed';

              return (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="font-medium text-sm">{st.test.name}</span>
                    <Badge
                      variant={getStatusBadgeVariant(st.status)}
                      className={getStatusBadgeColor(st.status)}
                    >
                      {st.status}
                    </Badge>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-3 shrink-0">
                      <Input
                        type="text"
                        value={st.value || ''}
                        disabled
                        className="w-24"
                      />
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-xs font-semibold">Done</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 shrink-0">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={testValues[st.id] || ''}
                        onChange={(e) =>
                          handleTestValueChange(st.id, parseFloat(e.target.value))
                        }
                        className="w-24"
                      />
                      <Button
                        size="sm"
                        variant={
                          selectedTests.has(st.id) ? 'default' : 'outline'
                        }
                        onClick={() => handleTestToggle(st.id)}
                        disabled={!testValues[st.id]}
                        className="h-8 w-8 p-0 rounded-full shrink-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="space-y-4 border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Progress: {completedCount} / {total}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedTests.size === 0 || isSaving}
            >
              {isSaving ? 'Saving changes...' : 'Save Changes'}
              {selectedTests.size > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTests.size}
                </Badge>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
