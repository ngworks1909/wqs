import { SampleTestStatus, TestRequestStatus, ReportStatus, TestResultStatus } from "@prisma/client"
export interface BaseTestRequest{
    requestId: string,
    location: string,
    sampleLocation: string,
    mobileNumber: string,
    waterType: {
        name: string,
        waterTypeId: string
    },
    createdAt: Date,
    status: TestRequestStatus
}
export interface PendingTestRequest extends BaseTestRequest{
    sampleTests: {
        id: string,
        test: {
            name: string
        },
        status: SampleTestStatus,
        value: number | null
    }[],
    payment:{
        amount: number
    }[]
}

export type TestRequest = PendingTestRequest | BaseTestRequest;
export interface Pagination{
    currentPage: number,
    totalPages: number
}

export interface SampleTestReport extends BaseTestRequest{
    sampleTests: {
        id: string,
        testName: string,
        minValueUsed: number,
        maxValueUsed: number,
        unitUsed: string,
        result: TestResultStatus, value: number
    }[],
    overallResult: ReportStatus
}
