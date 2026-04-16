'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ActiveUserDetails, TechnicianDetails } from '@/types/dashboard'


interface UserStatsProps {
  topTechnicians: TechnicianDetails[]
  mostActiveUsers: ActiveUserDetails[],
  isLoading: boolean
}

export function UserStats({ topTechnicians, mostActiveUsers, isLoading }: UserStatsProps) {
  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Top Technicians Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-full">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 ml-2" />
                  </div>
                ))}
              </>
            ) : topTechnicians.length > 0 ? (
              topTechnicians.map((technician) => (
                <div
                  key={technician.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-500 text-white">
                        {getInitials(technician.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{technician.username}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {technician.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="ml-2 whitespace-nowrap">
                    {technician.solvedRequestCount} solved
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No technicians yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Most Active Users Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Most Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-full">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 ml-2" />
                  </div>
                ))}
              </>
            ) : mostActiveUsers.length > 0 ? (
              mostActiveUsers.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-green-500 text-white">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                    {user.requestCount} requests
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active users yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
