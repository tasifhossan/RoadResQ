import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Car, ShieldAlert, FileText, UserCheck, Package } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20 border-0 rounded-full px-4 py-1 text-sm font-semibold">
              On-Demand Roadside Emergency Platform
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              Rapid Rescue for Every <span className="text-primary">Drive & Breakdown</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Connecting stranded drivers with nearby verified mechanics in real-time. Transparent tracking, spare parts logging, and seamless digital invoices.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/customer/requests/new" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl shadow-md px-8">
                  Request Assistance
                </Button>
              </Link>
              <Link href="/mechanic" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-border rounded-xl px-8">
                  Mechanic Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services / Capability Overview */}
      <section className="py-12 bg-muted/50 border-t border-b">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Platform Capabilities</h2>
            <p className="mt-2 text-muted-foreground">Built directly on the RoadResQ API services</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Service Request Creation</CardTitle>
                <CardDescription>
                  Dispatch emergency repair requests with real-time location tags and nearby mechanic search.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent mb-2">
                  <Car className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Vehicle Management</CardTitle>
                <CardDescription>
                  Register customer vehicles, view details, and link vehicles to active roadside requests.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                  <UserCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Mechanic Dispatch & Tracking</CardTitle>
                <CardDescription>
                  Update mechanic availability, location pinging, and status transitions from Arrived to Completed.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent mb-2">
                  <Package className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Parts & Inventory</CardTitle>
                <CardDescription>
                  Global catalog definitions, mechanic-level inventory management, and spare parts logging during service.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Invoices & Digital Payments</CardTitle>
                <CardDescription>
                  Automatic invoice generation upon request completion with payment initiation and transaction history.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent mb-2">
                  <Wrench className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Admin & Audit Oversight</CardTitle>
                <CardDescription>
                  Role management, user promotion, system dashboard statistics, and comprehensive audit logging.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
