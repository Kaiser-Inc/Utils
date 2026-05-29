import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui";
import { getProfile } from "@/lib/api/endpoints/users";
import { requireAuth } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";
import { Calendar, Mail, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const cardIcons: Record<string, React.ElementType> = {
  Email: Mail,
  Função: Shield,
  "Membro desde": Calendar,
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const user = await getProfile(session.accessToken);

  return (
    <div className="animate-fade-up space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[var(--fg-1)]">Dashboard</h1>
        <p className="text-[var(--fg-4)]">
          Bem-vindo de volta,{" "}
          <span className="font-medium text-[var(--fg-2)]">{user.username}</span>
        </p>
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
  const Icon = cardIcons[label];
  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-[var(--brand)]" />}
          <CardTitle className="text-xs font-normal text-[var(--fg-4)]">{label}</CardTitle>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <p className="font-medium capitalize text-[var(--fg-1)]">{value}</p>
      </CardBody>
    </Card>
  );
}
