import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsSkeletonProps {
  count?: number;
}

export function StatsSkeleton({ count = 5 }: StatsSkeletonProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="flex-1 min-w-[200px] border border-border/40 rounded-xl"
        >
          <CardContent className="p-6 space-y-3">
            {/* Label */}
            <Skeleton className="h-3 w-24 rounded" />

            {/* Number */}
            <Skeleton className="h-7 w-16 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
