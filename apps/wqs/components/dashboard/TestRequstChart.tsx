"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { TestRequestByStatus } from "@/types/dashboard"
import { TestRequestStatus } from "@prisma/client"

export const description = "A bar chart showing test request status breakdown"

const chartConfig = {
  count: {
    label: "Requests",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const STATUS_LABELS: Record<keyof typeof TestRequestStatus, string> = {
  Pending: "Pending",
  Rejected: "Rejected",
  Accepted: "Accepted",
  PaymentPending: "Payment Pending",
  PaymentCollected: "Payment Collected",
  SampleCollected: "Sample Collected",
  Testing: "Testing",
  Completed: "Completed",
  Deleted: "Deleted",
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-muted rounded animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export function TestRequestChart({
  testRequestByStatus,
  isLoading = false,
}: {
  testRequestByStatus?: TestRequestByStatus
  isLoading?: boolean
}) {
  if (isLoading || !testRequestByStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Requests by Status</CardTitle>
          <CardDescription>Current month breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  const chartData = Object.entries(testRequestByStatus).map(([status, count]) => ({
    status: status as keyof typeof TestRequestStatus,
    label: STATUS_LABELS[status as keyof typeof TestRequestStatus] || status,
    count: Math.round(count),
  }))

  const totalRequestCount = chartData.reduce(
    (sum, entry) => sum + entry.count,
    0
  )

  const mostChoosenStatus =
    totalRequestCount > 0
      ? chartData.reduce((max, entry) =>
          entry.count > max.count ? entry : max
        )
      : null

  const mostChoosenStatusPercentage =
    totalRequestCount > 0 && mostChoosenStatus
      ? Math.round((mostChoosenStatus.count / totalRequestCount) * 100)
      : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Requests by Status</CardTitle>
        <CardDescription>Current month breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {totalRequestCount === 0 ? (
          <div className="text-muted-foreground leading-none">
            No tests chosen yet
          </div>
        ) : (
          <div className="flex gap-2 leading-none font-medium">
            {mostChoosenStatus?.label} is the most chosen test request (
            {mostChoosenStatusPercentage}%) this month
            <TrendingUp className="h-4 w-4" />
          </div>
        )}
        <div className="text-muted-foreground leading-none">
          Showing test request distribution across all statuses
        </div>
      </CardFooter>
    </Card>
  )
}
