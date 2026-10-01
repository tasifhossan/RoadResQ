// TODO: remove before submission
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  PageHeader,
  StatCard,
  StatusBadge,
  EmptyState,
  ErrorState,
  DataTable,
  UrlPagination,
  SearchInput,
  FilterSelect,
  ConfirmDialog,
  FormField,
} from "@/components/shared";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, ShieldAlert, DollarSign, Activity } from "lucide-react";
import { formatMoney, formatDate, formatDistanceKm } from "@/lib/format";

interface SampleRow {
  id: string;
  description: string;
  customerName: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  amount: number;
  date: string;
}

const sampleData: SampleRow[] = [
  {
    id: "REQ-101",
    description: "Flat tire replacement on Highway 101",
    customerName: "Alex Johnson",
    status: "IN_PROGRESS",
    amount: 1500,
    date: "2026-09-30T10:00:00Z",
  },
  {
    id: "REQ-102",
    description: "Engine overheating near exit 4",
    customerName: "Sarah Connor",
    status: "PENDING",
    amount: 3200,
    date: "2026-09-30T11:30:00Z",
  },
  {
    id: "REQ-103",
    description: "Battery jump start",
    customerName: "Bob Smith",
    status: "COMPLETED",
    amount: 800,
    date: "2026-09-29T14:15:00Z",
  },
];

export default function DesignPreviewPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
    },
  });

  const columns = [
    { key: "id", header: "ID", cell: (item: SampleRow) => <span className="font-mono text-xs font-bold">{item.id}</span> },
    { key: "description", header: "Description", cell: (item: SampleRow) => <span>{item.description}</span> },
    { key: "customer", header: "Customer", cell: (item: SampleRow) => <span>{item.customerName}</span> },
    { key: "status", header: "Status", cell: (item: SampleRow) => <StatusBadge status={item.status} /> },
    { key: "amount", header: "Amount", cell: (item: SampleRow) => <span className="font-semibold">{formatMoney(item.amount)}</span> },
    { key: "date", header: "Date", cell: (item: SampleRow) => <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span> },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-12 max-w-7xl">
      <div className="border-b pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">
          Temporary Preview Route
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-2">Design Token & Primitive Gallery</h1>
        <p className="text-sm text-muted-foreground">Interactive demo of all shared UI primitives, design tokens, and role shell previews.</p>
      </div>

      <Tabs defaultValue="primitives" className="space-y-8">
        <TabsList className="rounded-xl p-1 bg-muted">
          <TabsTrigger value="primitives" className="rounded-lg">Shared Primitives</TabsTrigger>
          <TabsTrigger value="badges" className="rounded-lg font-semibold">Status Badges</TabsTrigger>
          <TabsTrigger value="table" className="rounded-lg">Data Tables & Controls</TabsTrigger>
          <TabsTrigger value="form" className="rounded-lg">Form Primitives</TabsTrigger>
          <TabsTrigger value="shells" className="rounded-lg">Shell Navigation Lists</TabsTrigger>
        </TabsList>

        {/* Tab 1: Shared Primitives */}
        <TabsContent value="primitives" className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold">1. PageHeader</h2>
            <div className="p-6 border rounded-2xl bg-card">
              <PageHeader title="Service Requests" description="View and manage live breakdown dispatches.">
                <Button className="bg-primary text-primary-foreground rounded-xl">Create Request</Button>
              </PageHeader>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">2. StatCard (Design Tokens)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Requests"
                value="1,248"
                icon={<Activity className="h-5 w-5 text-primary" />}
                trend={{ value: 12.5, label: "vs last month" }}
              />
              <StatCard
                title="Active Mechanics"
                value="42"
                icon={<Wrench className="h-5 w-5 text-accent" />}
                description="34 currently available"
              />
              <StatCard
                title="Total Revenue"
                value={formatMoney(458000)}
                icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
                trend={{ value: 8.2, label: "growth", positive: true }}
              />
              <StatCard
                title="Avg Distance"
                value={formatDistanceKm(4.8)}
                icon={<ShieldAlert className="h-5 w-5 text-indigo-500" />}
                description="Within service radius"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">3. EmptyState & ErrorState</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmptyState
                title="No active service requests"
                description="When stranded motorists request rescue, they will appear right here."
                action={<Button size="sm" className="rounded-xl">Request Towing</Button>}
              />
              <ErrorState
                title="Failed to load dispatch queue"
                description="Could not connect to the RoadResQ API server."
                onRetry={() => alert("Retrying load...")}
              />
            </div>
          </section>
        </TabsContent>

        {/* Tab 2: Status Badges */}
        <TabsContent value="badges" className="space-y-6">
          <Card className="rounded-2xl border">
            <CardHeader>
              <CardTitle>Prisma Enum Mapped Status Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">RequestStatus</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="PENDING" />
                  <StatusBadge status="SEARCHING" />
                  <StatusBadge status="ASSIGNED" />
                  <StatusBadge status="EN_ROUTE" />
                  <StatusBadge status="ARRIVED" />
                  <StatusBadge status="IN_PROGRESS" />
                  <StatusBadge status="COMPLETED" />
                  <StatusBadge status="CANCELLED" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Invoice & Payment Status</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="PAID" />
                  <StatusBadge status="FAILED" />
                  <StatusBadge status="REFUNDED" />
                  <StatusBadge status="PENDING" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Mechanic Availability</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="AVAILABLE" />
                  <StatusBadge status="BUSY" />
                  <StatusBadge status="OFFLINE" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Role Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="CUSTOMER" />
                  <StatusBadge status="MECHANIC" />
                  <StatusBadge status="ADMIN" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: DataTable & URL Controls */}
        <TabsContent value="table" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-2xl bg-card">
            <SearchInput placeholder="Search requests..." />
            <FilterSelect
              paramName="status"
              placeholder="Filter by status"
              options={[
                { label: "Pending", value: "PENDING" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Completed", value: "COMPLETED" },
              ]}
            />
          </div>

          <DataTable data={sampleData} columns={columns} />

          <UrlPagination meta={{ page: 1, limit: 10, total: 25, totalPages: 3 }} />
        </TabsContent>

        {/* Tab 4: Form Primitives & Dialog */}
        <TabsContent value="form" className="space-y-6">
          <Card className="rounded-2xl border max-w-xl">
            <CardHeader>
              <CardTitle>FormField Wrapper Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="vehicleMake" label="Vehicle Make" required>
                {(field) => <Input {...field} className="rounded-xl" />}
              </FormField>

              <FormField control={form.control} name="vehicleModel" label="Vehicle Model" description="e.g. Corolla, Civic, Accord">
                {(field) => <Input {...field} className="rounded-xl" />}
              </FormField>

              <Button onClick={() => setDialogOpen(true)} variant="destructive" className="rounded-xl">
                Open Confirm Dialog
              </Button>
            </CardContent>
          </Card>

          <ConfirmDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Delete Vehicle Registration?"
            description="This action cannot be undone. This vehicle will be removed from your profile."
            variant="destructive"
            confirmText="Delete Vehicle"
            loading={loading}
            onConfirm={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setDialogOpen(false);
              }, 1000);
            }}
          />
        </TabsContent>

        {/* Tab 5: Shell Navigation Lists */}
        <TabsContent value="shells" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Customer Shell Routes</CardTitle>
                <UserMenu defaultName="Customer Demo" defaultRole="CUSTOMER" />
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 rounded-lg bg-muted">/customer (Dashboard)</div>
                <div className="p-2 rounded-lg bg-muted">/customer/new-request</div>
                <div className="p-2 rounded-lg bg-muted">/customer/requests</div>
                <div className="p-2 rounded-lg bg-muted">/customer/vehicles</div>
                <div className="p-2 rounded-lg bg-muted">/customer/payments</div>
                <div className="p-2 rounded-lg bg-muted">/customer/profile</div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Mechanic Shell Routes</CardTitle>
                <UserMenu defaultName="Mechanic Demo" defaultRole="MECHANIC" />
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 rounded-lg bg-muted">/mechanic (Dashboard)</div>
                <div className="p-2 rounded-lg bg-muted">/mechanic/inventory</div>
                <div className="p-2 rounded-lg bg-muted">/mechanic/earnings</div>
                <div className="p-2 rounded-lg bg-muted">/mechanic/profile</div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Admin Shell Routes</CardTitle>
                <UserMenu defaultName="Admin Demo" defaultRole="ADMIN" />
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 rounded-lg bg-muted">/admin (Dashboard)</div>
                <div className="p-2 rounded-lg bg-muted">/admin/users</div>
                <div className="p-2 rounded-lg bg-muted">/admin/spare-parts</div>
                <div className="p-2 rounded-lg bg-muted">/admin/audit-logs</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
