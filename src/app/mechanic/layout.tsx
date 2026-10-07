import { getCurrentUser, requireRole } from "@/lib/auth/session";
import { MechanicShell } from "@/components/layout/mechanic-shell";
import { SessionProvider } from "@/components/providers/session-provider";

export default async function MechanicLayout({ children }: { children: React.ReactNode }) {
  await requireRole("MECHANIC");
  const user = await getCurrentUser();

  return (
    <SessionProvider initialUser={user}>
      <MechanicShell>{children}</MechanicShell>
    </SessionProvider>
  );
}
