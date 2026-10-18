import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  const isPositive = trend?.positive ?? (trend ? trend.value >= 0 : true);

  return (
    <Card className={cn("rounded-xl border shadow-sm bg-card hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        {trend && (
          <p className="text-xs flex items-center gap-1">
            <span
              className={cn(
                "font-semibold inline-flex items-center gap-0.5",
                isPositive ? "text-primary" : "text-destructive"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3 shrink-0" aria-hidden="true" />
              ) : (
                <TrendingDown className="h-3 w-3 shrink-0" aria-hidden="true" />
              )}
              {trend.value >= 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </p>
        )}
        {description && !trend && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
