import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaveSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="border border-border/40 bg-muted/30 shadow-sm hover:shadow-none transition"
          >
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-7 w-16 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 border-b border-border/40 pb-1">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-24 rounded-md" />
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="border border-border/40 bg-muted/30 overflow-hidden">
        <CardHeader className="border-b border-border/40">
          <CardTitle>
            <Skeleton className="h-4 w-48 rounded-md" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-3 w-32 rounded-md" />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-7 gap-4 px-6 py-4 items-center"
              >
                <Skeleton className="h-4 w-28 rounded-md" /> {/* Employee */}
                <Skeleton className="h-4 w-20 rounded-md" /> {/* Type */}
                <Skeleton className="h-4 w-32 rounded-md" /> {/* Dates */}
                <Skeleton className="h-4 w-10 rounded-md" /> {/* Days */}
                <Skeleton className="h-4 w-36 rounded-md" /> {/* Reason */}
                <Skeleton className="h-4 w-20 rounded-md" /> {/* Status */}
                <Skeleton className="h-4 w-16 rounded-md" /> {/* Actions */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
