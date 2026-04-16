'use client';

import { useContext, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TestItemComponent } from './TestItemComponent';
import { DataContext } from '@/providers/DataProvider';
import { ITest } from '@/types/common';

interface ChooseTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: ( selectedTests: ITest[]) => void;
}

export function ChooseTestsModal({ isOpen, onClose, onConfirm }: ChooseTestsModalProps) {
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const {tests} = useContext(DataContext)

  const handleTestToggle = (testId: string) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  const selectedTestsData = tests.filter((test) =>
    selectedTests.includes(test.testId)
  );

  const totalAmount = selectedTestsData.reduce((sum, test) => sum + test.price, 0);

  const handleConfirm = () => {
    onConfirm(selectedTestsData);
    setSelectedTests([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedTests([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl p-0 flex flex-col">
        {/* Fixed Header */}
        <div className="border-b border-border px-6 pt-6 pb-4">
          <DialogHeader className="space-y-2">
            <DialogTitle>Choose Tests</DialogTitle>
            <DialogDescription>
              Select the tests you want to perform. Your total amount will be calculated automatically.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Tests List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-custom">
          <div className="space-y-3">
            {tests.map((test) => (
              <TestItemComponent
                key={test.testId}
                test={test}
                isSelected={selectedTests.includes(test.testId)}
                onToggle={() => handleTestToggle(test.testId)}
              />
            ))}
          </div>
        </div>

        {/* Fixed Payment Summary and Actions */}
        <div className="border-t border-border px-6 py-4 space-y-4">
          {/* Payment Summary */}
          {/* <PaymentSummary
            selectedTests={selectedTestsData}
            totalAmount={totalAmount}
          /> */}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedTests.length === 0}
            >
              Pay ₹{totalAmount.toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
