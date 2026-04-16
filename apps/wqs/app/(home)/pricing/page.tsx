import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchPricing } from '@/actions/fetchPricing'

export default async function Page() {
  const tests = await fetchPricing()

  return (
    <div className="flex flex-col w-full h-[calc(100vh-5rem)] px-4 py-6">
      {/* Fixed Title Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pricing</h1>
        <p className="text-sm text-muted-foreground">
          View all available tests and their respective prices
        </p>
      </div>
      {/* Scrollable Content Section */}
      {/* Scrollable Content Section */}
<div className="relative flex-1 min-h-0">

  <div className="h-full overflow-y-auto scrollbar-custom">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tests.map((test) => (
        <Card key={test.name} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">{test.name}</CardTitle>
            <CardDescription>{test.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Price</span>
                <span className="text-2xl font-bold">₹{test.price}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Sample Tests</span>
                <span className="font-semibold">
                  {test._count.sampleTests}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</div>

    </div>
  )
}
