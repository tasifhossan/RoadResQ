import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Car, ShieldAlert, FileText, UserCheck, Package } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">RoadResQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex border-accent/30 text-accent font-medium">
              API Live v1
            </Badge>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
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
                <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl shadow-md px-8">
                  Request Assistance
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-border rounded-xl px-8">
                  Mechanic Portal
                </Button>
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
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} RoadResQ. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://road-res-q-backend.vercel.app/api/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Backend API
            </a>
            <a
              href="https://github.com/tasifhossan/RoadResQ-backend"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Backend GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
