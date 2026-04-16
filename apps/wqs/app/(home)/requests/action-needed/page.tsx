import TestRequestMain from '@/components/testrequests/TestRequestMain'
import { TestRequestStatus } from '@prisma/client'
import React from 'react'

export default function page() {
  return (
    <TestRequestMain status={TestRequestStatus.Accepted} />
  )
}
