import { useParams } from "next/navigation";
import useSWR from "swr";
import { authClient } from "~/helpers/authClient.ts";
import type { FullSession } from "~/helpers/types.ts";
import { getOrgDetailsSF } from "~/server/server-functions/server-functions.ts";

export function useSession(): Partial<FullSession> {
  const { slug }: { slug?: string } = useParams();

  const { data } = useSWR(
    ["user-full-session", slug],
    async () => {
      const [{ data: session }, orgDetailsResponse] = await Promise.all([
        authClient.getSession(),
        slug ? getOrgDetailsSF({ slug }) : undefined,
      ]);

      const member = session?.session.activeOrganizationId
        ? ((await authClient.organization.getActiveMember()).data ?? undefined)
        : undefined;

      return {
        ...session,
        member,
        organization: orgDetailsResponse?.data,
      };
    },
    { revalidateOnFocus: true, dedupingInterval: 60_000 },
  );
  return data ?? {};
}
