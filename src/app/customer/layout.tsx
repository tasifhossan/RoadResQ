import { getCurrentUser, requireRole } from "@/lib/auth/session";
import { CustomerShell } from "@/components/layout/customer-shell";
import { SessionProvider } from "@/components/providers/session-provider";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("CUSTOMER");
  const user = await getCurrentUser();

  return (
    <SessionProvider initialUser={user}>
      <CustomerShell>{children}</CustomerShell>
    </SessionProvider>
  );
}
