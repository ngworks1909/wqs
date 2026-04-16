import { Card, CardFooter, CardHeader } from "../ui/card";

export default function SkeletonCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="@container/card">
          <CardHeader className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center w-full">
              <div className="h-4 w-24 animate-pulse rounded bg-muted"></div> {/* description */}
              <div className="h-6 w-16 animate-pulse rounded-3xl bg-muted"></div> {/* badge */}
            </div>
            <div className="h-8 w-32 animate-pulse rounded bg-muted"></div> {/* value */}
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-2.5">
            <div className="flex items-center gap-2 w-full">
              <div className="h-4 w-32 animate-pulse rounded bg-muted"></div> {/* trend text */}
              <div className="h-4 w-4 animate-pulse rounded bg-muted"></div> {/* trend icon */}
            </div>
            <div className="h-4 w-40 animate-pulse rounded bg-muted"></div> {/* footer message */}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}