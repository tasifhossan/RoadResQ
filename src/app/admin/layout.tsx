import { getCurrentUser, requireRole } from "@/lib/auth/session";
import { AdminShell } from "@/components/layout/admin-shell";
import { SessionProvider } from "@/components/providers/session-provider";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  const user = await getCurrentUser();

  return (
    <SessionProvider initialUser={user}>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
