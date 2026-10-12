import { PortalWorkspace } from "../../../components/portal-workspace";

export default async function TeacherFeaturePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalWorkspace role="Guru" feature={resource} />;
}
