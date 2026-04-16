import { Test } from "@prisma/client"

export interface IWater{
    waterTypeId: string,
    name: string
}

interface BaseTest{
    name: string,
    description: string,
    price: number
}

export interface ITest extends BaseTest{
    testId: string
}

export interface IPricing extends BaseTest{
    _count: {
        sampleTests: number
    }
}

export interface ICommonData{
    waterTypes: IWater[],
    tests: ITest[]
}

export type PartialTest = Pick<
  Test,
  "testId" | "name" | "minValue" | "maxValue" | "price" | "unit"
>;