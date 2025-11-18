import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users2 } from "lucide-react";
import type { RoleStats } from "@/lib/types";

interface OrganizationPageStatsProps {
  roleStats?: RoleStats;
}

const OrganizationPageStats = ({ roleStats }: OrganizationPageStatsProps) => {
  const stats = {
    total: roleStats?.total ?? 0,
    admin: roleStats?.admin ?? 0,
    hr: roleStats?.hr ?? 0,
    manager: roleStats?.manager ?? 0,
    employee: roleStats?.employee ?? 0,
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Total Members
              </p>
              <TrendingUp className="w-4 h-4 text-primary/60" />
            </div>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-destructive/5 to-destructive/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-destructive">Admin</p>
              <Users2 className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-3xl font-bold text-destructive">{stats.admin}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-primary">HR</p>
              <Users2 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{stats.hr}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-accent/50 to-accent/30">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-accent-foreground">
                Manager
              </p>
              <Users2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="text-3xl font-bold text-accent-foreground">
              {stats.manager}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-muted/50 to-muted">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Employee
              </p>
              <Users2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-muted-foreground">
              {stats.employee}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationPageStats;
