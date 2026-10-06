"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Clock,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Calendar,
  X,
  Code,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { UrlPagination } from "@/components/shared/url-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryKeys } from "@/lib/api/keys";
import { formatDateTime } from "@/lib/format";
import { Paginated } from "@/lib/api/types";
import { AuditLogItem, GetAuditLogsQueryInput } from "@/lib/types/admin";
import { getAuditLogsApi } from "@/lib/api/endpoints/admin";

interface AuditLogsClientProps {
  initialData: Paginated<AuditLogItem> | null;
  initialError: string | null;
  queryParams: GetAuditLogsQueryInput;
}

const REAL_ENTITY_TYPES = [
  { label: "Service Request", value: "ServiceRequest" },
  { label: "Mechanic Inventory", value: "MechanicInventory" },
  { label: "User", value: "User" },
  { label: "System", value: "System" },
];

const REAL_ACTIONS = [
  { label: "Status Change", value: "STATUS_CHANGE" },
  { label: "Restock", value: "RESTOCK" },
  { label: "Update User Role", value: "UPDATE_USER_ROLE" },
  { label: "Deactivate User", value: "DEACTIVATE_USER" },
  { label: "Reactivate User", value: "REACTIVATE_USER" },
  { label: "Database Seed", value: "DATABASE_SEED" },
];

export function AuditLogsClient({
  initialData,
  initialError,
  queryParams,
}: AuditLogsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Expandable row state for desktop
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Dialog state for mobile detail view
  const [selectedMobileLog, setSelectedMobileLog] = useState<AuditLogItem | null>(null);

  // Local date filter state synced with URL searchParams
  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || "";

  const [fromDate, setFromDate] = useState(fromParam);
  const [toDate, setToDate] = useState(toParam);

  // Sync state if URL searchParam changes externally
  const [prevFrom, setPrevFrom] = useState(fromParam);
  const [prevTo, setPrevTo] = useState(toParam);

  if (fromParam !== prevFrom) {
    setPrevFrom(fromParam);
    setFromDate(fromParam);
  }
  if (toParam !== prevTo) {
    setPrevTo(toParam);
    setToDate(toParam);
  }

  // Date range validation
  const isDateRangeInvalid = Boolean(
    fromDate && toDate && new Date(fromDate) > new Date(toDate)
  );

  // Construct active query for TanStack query (suppress invalid date range)
  const activeQueryParams: GetAuditLogsQueryInput = React.useMemo(() => {
    if (isDateRangeInvalid) {
      const cleanParams = { ...queryParams };
      delete cleanParams.from;
      delete cleanParams.to;
      return cleanParams;
    }
    return queryParams;
  }, [queryParams, isDateRangeInvalid]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.auditLogs(activeQueryParams),
    queryFn: () => getAuditLogsApi(activeQueryParams),
    initialData: initialData ?? undefined,
    enabled: !isDateRangeInvalid,
  });

  const handleDateChange = (newFrom: string, newTo: string) => {
    setFromDate(newFrom);
    setToDate(newTo);

    const params = new URLSearchParams(searchParams.toString());
    if (newFrom) {
      params.set("from", newFrom);
    } else {
      params.delete("from");
    }

    if (newTo) {
      params.set("to", newTo);
    } else {
      params.delete("to");
    }

    params.delete("page");
    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(targetUrl);
  };

  const handleClearDates = () => {
    handleDateChange("", "");
  };

  const renderSummary = (log: AuditLogItem) => {
    const meta = log.metadata;
    if (!meta) return <span className="text-muted-foreground opacity-60">No metadata</span>;

    if ("from" in meta && "to" in meta) {
      return (
        <span className="font-mono text-xs flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
            {String(meta.from)}
          </Badge>
          <span className="text-muted-foreground">→</span>
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-semibold text-primary border-primary/30">
            {String(meta.to)}
          </Badge>
          {meta.reason ? <span className="text-muted-foreground text-[11px] truncate max-w-[120px]">({String(meta.reason)})</span> : null}
        </span>
      );
    }

    if ("quantityAdded" in meta && "newStock" in meta) {
      return (
        <span className="text-xs font-medium text-foreground">
          +{String(meta.quantityAdded)} units (New stock: {String(meta.newStock)})
        </span>
      );
    }

    if ("email" in meta) {
      return (
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
          Target: <strong className="text-foreground font-medium">{String(meta.email)}</strong>
        </span>
      );
    }

    if ("demoAccounts" in meta && Array.isArray(meta.demoAccounts)) {
      return (
        <span className="text-xs text-muted-foreground">
          Seeded demo accounts ({meta.demoAccounts.length})
        </span>
      );
    }

    return (
      <span className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
        {JSON.stringify(meta)}
      </span>
    );
  };

  const logs = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Audit Logs"
        description="System audit activity, status transitions, and administrative logs."
      />

      {/* Filters Toolbar */}
      <div className="space-y-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <FilterSelect
              paramName="entityType"
              placeholder="Entity Type"
              allLabel="All Entities"
              options={REAL_ENTITY_TYPES}
              className="w-full sm:w-48"
            />
            <FilterSelect
              paramName="action"
              placeholder="Action"
              allLabel="All Actions"
              options={REAL_ACTIONS}
              className="w-full sm:w-52"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">From:</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => handleDateChange(e.target.value, toDate)}
                className="h-9 w-36 rounded-xl text-xs bg-background border-border"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">To:</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => handleDateChange(fromDate, e.target.value)}
                className="h-9 w-36 rounded-xl text-xs bg-background border-border"
              />
            </div>

            {(fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDates}
                className="h-9 px-2.5 rounded-xl text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Invalid Date Range Warning */}
        {isDateRangeInvalid && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Invalid Date Range:</strong> &apos;From&apos; date cannot be after &apos;To&apos; date. Please adjust filter dates.
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {(isError || initialError) && !data && (
        <ErrorState
          title="Failed to load audit logs"
          description={initialError || (error ? (error as Error).message : "An error occurred")}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <Card className="rounded-2xl border-border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      )}

      {data && (
        <>
          {logs.length === 0 ? (
            <Card className="rounded-2xl border-border bg-card p-8 shadow-sm">
              <EmptyState
                icon={<FileText className="h-8 w-8" />}
                title="No audit logs found"
                description="No system audit log entries matched your filter parameters."
              />
            </Card>
          ) : (
            <>
              {/* Desktop Table View (sm and above) */}
              <div className="hidden sm:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="font-semibold">Time</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                      <TableHead className="font-semibold">Entity & ID</TableHead>
                      <TableHead className="font-semibold">Actor</TableHead>
                      <TableHead className="font-semibold">Summary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const isExpanded = expandedRowId === log.id;

                      return (
                        <React.Fragment key={log.id}>
                          <TableRow
                            onClick={() => setExpandedRowId(isExpanded ? null : log.id)}
                            className="cursor-pointer hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="pr-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-md text-muted-foreground"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {formatDateTime(log.createdAt)}
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline" className="font-mono text-[11px] rounded-full px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20 font-semibold">
                                {log.action}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-foreground">{log.entityType}</span>
                                {log.entityId && (
                                  <span className="font-mono text-[11px] text-muted-foreground">
                                    #{log.entityId.slice(0, 8)}...
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-xs">
                              {log.actor ? (
                                <div className="flex items-center gap-1.5">
                                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="font-semibold text-foreground">{log.actor.name}</span>
                                  <StatusBadge status={log.actor.role} className="text-[10px] py-0 px-1.5" />
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic opacity-70">System</span>
                              )}
                            </TableCell>

                            <TableCell className="text-xs">
                              {renderSummary(log)}
                            </TableCell>
                          </TableRow>

                          {/* Expandable JSON Metadata Detail Row */}
                          {isExpanded && (
                            <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border">
                              <TableCell colSpan={6} className="p-4 pl-12">
                                <div className="space-y-2">
                                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                    <Code className="h-3.5 w-3.5 text-primary" />
                                    Pretty-printed Event Metadata JSON
                                  </div>
                                  <pre className="font-mono text-xs whitespace-pre-wrap break-all bg-card p-4 rounded-xl border border-border text-foreground overflow-x-auto shadow-inner">
                                    {log.metadata
                                      ? JSON.stringify(log.metadata, null, 2)
                                      : "null"}
                                  </pre>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View (xs) */}
              <div className="block sm:hidden space-y-3">
                {logs.map((log) => (
                  <Card
                    key={log.id}
                    onClick={() => setSelectedMobileLog(log)}
                    className="rounded-2xl border-border bg-card p-4 shadow-sm space-y-3 cursor-pointer hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="font-mono text-[11px] rounded-full bg-primary/10 text-primary border-primary/20 font-semibold">
                        {log.action}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{log.entityType}</span>
                        {log.entityId && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            #{log.entityId.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1.5">
                        <span>Actor:</span>
                        {log.actor ? (
                          <span className="font-medium text-foreground">{log.actor.name}</span>
                        ) : (
                          <span className="italic">System</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                      <div>{renderSummary(log)}</div>
                      <span className="text-xs font-semibold text-primary">Details →</span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {meta && <UrlPagination meta={meta} />}
            </>
          )}
        </>
      )}

      {/* Mobile Detail Modal */}
      <Dialog
        open={Boolean(selectedMobileLog)}
        onOpenChange={(open) => {
          if (!open) setSelectedMobileLog(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Audit Log Event Details
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Event {selectedMobileLog?.id} recorded at {selectedMobileLog ? formatDateTime(selectedMobileLog.createdAt) : ""}.
            </DialogDescription>
          </DialogHeader>

          {selectedMobileLog && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-xl">
                <div>
                  <span className="text-muted-foreground">Action:</span>
                  <div className="font-semibold text-foreground pt-0.5">{selectedMobileLog.action}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Entity:</span>
                  <div className="font-semibold text-foreground pt-0.5">{selectedMobileLog.entityType}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Actor:</span>
                  <div className="font-semibold text-foreground pt-0.5">{selectedMobileLog.actor?.name || "System"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Entity ID:</span>
                  <div className="font-mono text-[11px] text-foreground pt-0.5 truncate">{selectedMobileLog.entityId || "N/A"}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Pretty-Printed Metadata JSON
                </span>
                <pre className="font-mono text-xs whitespace-pre-wrap break-all bg-card p-4 rounded-xl border border-border text-foreground overflow-x-auto">
                  {selectedMobileLog.metadata
                    ? JSON.stringify(selectedMobileLog.metadata, null, 2)
                    : "null"}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
