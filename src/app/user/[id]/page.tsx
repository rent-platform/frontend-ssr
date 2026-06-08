import { PublicProfile } from '@/ux/features';

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicProfile userId={id} />;
}
