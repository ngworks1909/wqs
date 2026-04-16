"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
    ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { PaymentByStatus } from "@/types/dashboard"

export function PaymentChartSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </CardHeader>

      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        <div className="h-50 w-50 rounded-full border-20 border-muted animate-pulse" />
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </CardFooter>
    </Card>
  )
}

export function PaymentChart({
  paymentByStatus,
  isLoading,
}: {
  paymentByStatus: PaymentByStatus
  isLoading: boolean
}) {

  if (isLoading) return <PaymentChartSkeleton />

  const safeData = paymentByStatus ?? {}

  const chartData = [
    {
      status: "Success",
      count: safeData.Success ?? 0,
      fill: "var(--chart-2)",
    },
    {
      status: "Pending",
      count: safeData.Pending ?? 0,
      fill: "var(--chart-3)",
    },
    {
      status: "Failed",
      count: safeData.Failed ?? 0,
      fill: "var(--chart-5)",
    },
  ]

  const totalPayments = chartData.reduce(
    (acc, curr) => acc + curr.count,
    0
  )

  const failurePercentage =
    totalPayments > 0
      ? Math.round((safeData.Failed / totalPayments) * 100)
      : 0

  const chartConfig = {
  visitors: {
    label: "Payments"
  }
} satisfies ChartConfig

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Payments by Status</CardTitle>
        <CardDescription>Current month overview</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig}  className="mx-auto aspect-square max-h-62.5">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalPayments}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Payments
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        {totalPayments === 0 ? (
          <div className="text-muted-foreground">
            No payments recorded yet
          </div>
        ) : failurePercentage > 30 ? (
          <div className="flex items-center gap-2 font-medium text-red-500">
            Payment failures are high this month ({failurePercentage}%)
          </div>
        ) : (
          <div className="flex items-center gap-2 font-medium text-green-500">
            Payment success rate is healthy
            <TrendingUp className="h-4 w-4" />
          </div>
        )}

        <div className="text-muted-foreground leading-none">
          Showing payment status distribution
        </div>
      </CardFooter>
    </Card>
  )
}