'use client'

import { useContext, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DataContext } from '@/providers/DataProvider'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'

interface NewRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewRequestModal({
  open,
  onOpenChange,
}: NewRequestModalProps) {
  const { waterTypes } = useContext(DataContext)

  const [formData, setFormData] = useState({
    location: '',
    sampleLocation: '',
    mobileNumber: '',
    waterTypeId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await api.post('/requests/createrequest', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 200) {
        toast.success('Analysis request submitted successfully')

        setFormData({
          waterTypeId: '',
          location: '',
          sampleLocation: '',
          mobileNumber: '',
        })

        onOpenChange(false) // close modal after success
      }
    } catch (error) {
      if (
        isAxiosError(error) &&
        error.response &&
        error.response.data?.error
      ) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Failed to submit analysis request')
      }
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Create New Analysis Request
          </DialogTitle>
          <DialogDescription>
            Submit water sample details for professional laboratory testing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City or Region"
                value={formData.location}
                onChange={(e) =>
                  handleChange('location', e.target.value)
                }
              />
            </div>

            {/* Sample Point */}
            <div className="space-y-2">
              <Label htmlFor="sampleLocation">Sample Point</Label>
              <Input
                id="sampleLocation"
                placeholder="Site/Facility Name"
                value={formData.sampleLocation}
                onChange={(e) =>
                  handleChange('sampleLocation', e.target.value)
                }
              />
            </div>

            {/* Contact Mobile */}
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Contact Mobile</Label>
              <Input
                id="mobileNumber"
                placeholder="0000000000"
                type="tel"
                minLength={10}
                maxLength={10}
                value={formData.mobileNumber}
                onChange={(e) => {
                  const value = e.target.value
                  if (!/^\d*$/.test(value)) return
                  handleChange('mobileNumber', value)
                }}
              />
            </div>

            {/* Water Type */}
            <div className="space-y-2">
              <Label htmlFor="waterType">Water Type</Label>
              <Select
                value={formData.waterTypeId}
                onValueChange={(value) =>
                  handleChange('waterTypeId', value)
                }
              >
                <SelectTrigger id="waterType">
                  <SelectValue placeholder="Select water type" />
                </SelectTrigger>
                <SelectContent>
                  {waterTypes?.map((type) => (
                    <SelectItem
                      key={type.waterTypeId}
                      value={type.waterTypeId}
                    >
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please ensure all fields are accurate. Analysis requests
              submitted before 2:00 PM local time will be processed for
              same-day sample collection.
            </AlertDescription>
          </Alert>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit Analysis Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
