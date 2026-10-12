import { PortalWorkspace } from "../../../components/portal-workspace";

export default async function StudentFeaturePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalWorkspace role="Siswa" feature={resource} />;
}
