import { useParams } from "next/navigation";
import useSWR from "swr";
import { authClient } from "~/helpers/authClient.ts";
import type { FeaturesInfo, FullSession } from "~/helpers/types.ts";
import { getFeaturesInfoSF, getOrgDetailsSF } from "~/server/server-functions/server-functions.ts";

export function useSession(): Partial<FullSession> {
  const { slug }: { slug?: string } = useParams();

  const { data } = useSWR(
    ["user-full-session", slug],
    async () => {
      const { data: session } = await authClient.getSession();

      const [memberRes, orgDetailsRes] = await Promise.all([
        session?.session.activeOrganizationId ? authClient.organization.getActiveMember() : undefined,
        session?.session.activeOrganizationId
          ? getOrgDetailsSF({ id: session.session.activeOrganizationId })
          : slug
            ? getOrgDetailsSF({ slug })
            : undefined,
      ]);

      return {
        ...session,
        member: memberRes?.data ?? undefined,
        organization: orgDetailsRes?.data,
      };
    },
    { revalidateOnFocus: true, dedupingInterval: 60_000 },
  );
  return data ?? {};
}

export function useFeaturesInfo(): FeaturesInfo {
  const fallbackData = {
    rulesPageEnabled: false,
    modInstructionsPageEnabled: false,
    videoBasedResultsEnabled: false,
    publicExportsEnabled: false,
    privacyPolicy: "disabled" as const,
  };

  const { organization } = useSession();

  const { data: featuresInfo } = useSWR(
    organization ? ["features-info", organization.id] : null,
    () => getFeaturesInfoSF().then((res) => res.data ?? fallbackData),
    { fallbackData },
  );

  return featuresInfo;
}
