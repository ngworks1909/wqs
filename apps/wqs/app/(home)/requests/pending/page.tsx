'use client';
import TestRequestMain from '@/components/testrequests/TestRequestMain';
import { TestRequestStatus } from '@prisma/client';

export default function Page() {
  return (
    <TestRequestMain status={TestRequestStatus.Pending}/>
  );
}
