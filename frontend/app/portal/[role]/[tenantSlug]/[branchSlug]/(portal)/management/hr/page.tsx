import { redirect } from "next/navigation";

export default async function HRRootPage({
  params,
}: {
  params: Promise<{ role: string; tenantSlug: string; branchSlug: string }>;
}) {
  const { role, tenantSlug, branchSlug } = await params;
  redirect(`/portal/${role}/${tenantSlug}/${branchSlug}/management/hr/employees`);
}
