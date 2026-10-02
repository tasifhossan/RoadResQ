import { requireRole } from "@/lib/auth/session";
import { CustomerShell } from "@/components/layout/customer-shell";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("CUSTOMER");
  return <CustomerShell>{children}</CustomerShell>;
}
