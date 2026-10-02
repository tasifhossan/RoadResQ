import { requireRole } from "@/lib/auth/session";
import { MechanicShell } from "@/components/layout/mechanic-shell";

export default async function MechanicLayout({ children }: { children: React.ReactNode }) {
  await requireRole("MECHANIC");
  return <MechanicShell>{children}</MechanicShell>;
}
