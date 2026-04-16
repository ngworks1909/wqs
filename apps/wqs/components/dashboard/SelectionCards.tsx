import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { KPIData } from "@/types/dashboard"
import { useMemo } from "react"

interface CardConfig {
  title: string
  value: string | number
  percentageChange: number
  getTrendText: (percentage: number) => string
  getFooterMessage: (percentage: number) => string
  description: string
}

function getCardConfig(kpi: KPIData): CardConfig[] {
  const lastMonthRevenue = kpi.payments.lastMonthPaymentTotal
  const paymentPercentageChange = lastMonthRevenue > 0
            ? (((kpi.payments.currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : 100;
  const userCount = kpi.users.userCount;
  const userGrowthPercentage = userCount > 0
            ? (((kpi.users.currentMonthNewUsersCount) / userCount) * 100)
            : 100;
  const prevMonthCount = kpi.testRequests.prevMonthCount;
  const testRequestPercentageChange = prevMonthCount > 0
            ? (((kpi.testRequests.currentMonthTestRequestsCount - prevMonthCount) / prevMonthCount) * 100)
            : 100;
  
  return [
    {
      title: 'Total Revenue',
      value: `₹${kpi.payments.currentMonthRevenue.toFixed(2)}`,
      percentageChange: paymentPercentageChange,
      getTrendText: (pct) => {
        if (pct > 0) return `Up ${pct.toFixed(1)}% this month`
        if (pct < 0) return `Down ${Math.abs(pct).toFixed(1)}% this month`
        return 'No change this month'
      },
      getFooterMessage: (pct) => {
        if (pct > 0) return 'Revenue growth is positive'
        if (pct < 0) return 'Revenue declined compared to last month'
        return 'Revenue remains stable'
      },
      description: 'Revenue this month'
    },
    {
      title: 'New Users',
      value: kpi.users.currentMonthNewUsersCount,
      percentageChange: userGrowthPercentage,
      getTrendText: (pct) => {
        if (pct > 0) return `Up ${pct.toFixed(1)}% this month`
        return 'No new users change this month'
      },
      getFooterMessage: (pct) => {
        if (pct > 0) return 'Strong user acquisition'
        return 'User growth is stable'
      },
      description: 'New users this month'
    },
    {
      title: 'Test Requests',
      value: kpi.testRequests.currentMonthTestRequestsCount,
      percentageChange: testRequestPercentageChange,
      getTrendText: (pct) => {
        if (pct > 0) return `Up ${pct.toFixed(1)}% this month`
        if (pct < 0) return `Down ${Math.abs(pct).toFixed(1)}% this month`
        return 'No change this month'
      },
      getFooterMessage: (pct) => {
        if (pct > 0) return 'Test requests increased'
        if (pct < 0) return 'Test requests decreased'
        return 'Test requests remain consistent'
      },
      description: 'Test requests this month'
    },
  ]
}

export default function SectionCards({kpi}: {kpi: KPIData}) {
  const cardConfigs = useMemo(() => getCardConfig(kpi), [kpi])

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {cardConfigs.map((config) => {
        const isTrendingUp = config.percentageChange > 0
        const hasChange = config.percentageChange !== 0
        const TrendIcon = isTrendingUp ? IconTrendingUp : IconTrendingDown

        return (
          <Card key={config.title} className="@container/card">
            <CardHeader>
              <CardDescription>{config.description}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {config.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  {hasChange && <TrendIcon />}
                  {isTrendingUp ? '+' : ''}{config.percentageChange.toFixed(1)}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {config.getTrendText(config.percentageChange)}
                {hasChange && <TrendIcon className="size-4" />}
              </div>
              <div className="text-muted-foreground">
                {config.getFooterMessage(config.percentageChange)}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
