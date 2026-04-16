import TestRequestMain from '@/components/testrequests/TestRequestMain'
import { TestRequestStatus } from '@prisma/client'

export default function page() {
  return (
    <TestRequestMain status={TestRequestStatus.Testing}/>
  )
}
