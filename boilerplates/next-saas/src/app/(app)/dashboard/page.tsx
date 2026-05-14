import { getProfile } from "@/lib/api/endpoints/users";
import { requireAuth } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireAuth();
  const user = await getProfile(session.accessToken);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo de volta, {user.username}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard label="Email" value={user.email} />
        <InfoCard label="Função" value={user.role} />
        <InfoCard label="Membro desde" value={formatDate(user.createdAt)} />
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize">{value}</p>
    </div>
  );
}
