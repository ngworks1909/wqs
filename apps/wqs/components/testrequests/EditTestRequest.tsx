'use client';

import React, { useContext } from "react";

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataContext } from "@/providers/DataProvider";
import { TestRequest } from '@/types/testRequest';
import { useState } from 'react';

interface EditModalProps {
  request: TestRequest;
  onClose: () => void;
  onSave: (updatedRequest: TestRequest) => Promise<void>;
}

export function EditModal({ request, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<TestRequest>(request);
  const [isSaving, setIsSaving] = useState(false);
  const {waterTypes} = useContext(DataContext)


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof TestRequest
  ) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  const handleWaterTypeChange = (waterTypeName: string) => {
    const selectedType = waterTypes.find(wt => wt.name === waterTypeName);
    setFormData({
      ...formData,
      waterType: selectedType ? { waterTypeId: selectedType.waterTypeId, name: selectedType.name } : formData.waterType,
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Edit Test Request</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="requestId">Request ID</Label>
            <Input
              id="requestId"
              value={formData.requestId}
              onChange={(e) => handleInputChange(e, 'requestId')}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange(e, 'location')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sampleLocation">Sample Location</Label>
            <Input
              id="sampleLocation"
              value={formData.sampleLocation}
              onChange={(e) => handleInputChange(e, 'sampleLocation')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="waterType">Water Type</Label>
            <Select value={formData.waterType.name} onValueChange={handleWaterTypeChange}>
              <SelectTrigger id="waterType">
                <SelectValue placeholder="Select a water type" />
              </SelectTrigger>
              <SelectContent>
                {waterTypes.map((waterType) => (
                  <SelectItem key={waterType.waterTypeId} value={waterType.name}>
                    {waterType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange(e, 'mobileNumber')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
