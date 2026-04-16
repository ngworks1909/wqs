import { Role, TestRequestStatus } from "@prisma/client"

export const selectionPipeline = {
    requestId: true,
    status: true,
    location: true,
    sampleLocation: true,
    mobileNumber: true,
    waterType: {
        select:{
            name: true,
            waterTypeId: true
        }
    },
    createdAt: true
}