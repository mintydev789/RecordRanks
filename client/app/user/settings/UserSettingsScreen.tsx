"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useContext, useEffect, useState, useTransition } from "react";
import z from "zod";
import Competitor from "~/app/components/Competitor.tsx";
import Button from "~/app/components/UI/Button.tsx";
import Loading from "~/app/components/UI/Loading.tsx";
import { authClient } from "~/helpers/authClient.ts";
import { C, HAS_WCA_AUTH } from "~/helpers/constants.ts";
import { MainContext } from "~/helpers/contexts.ts";
import { getActionError } from "~/helpers/utilityFunctions.ts";
import { WcaIdValidator } from "~/helpers/validators/Validators.ts";
import type { PersonResponse } from "~/server/db/schema/persons.ts";
import { rolesObject } from "~/server/permissions.ts";
import { getOrCreatePersonByWcaIdSF } from "~/server/serverFunctions/personServerFunctions.ts";
import { logUserDeletedSF } from "~/server/serverFunctions/serverFunctions.ts";

// Just a copy of the type of the data property from the return type of authClient.listAccounts()
type Account = {
  scopes: string[];
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  providerId: string;
  accountId: string;
};

type Props = {
  initPerson: PersonResponse | undefined;
};

function UserSettingsScreen({ initPerson }: Props) {
  const router = useRouter();
  const { changeErrorMessages, changeSuccessMessage, resetMessages } = useContext(MainContext);
  const { data: session, isPending: isPendingSession } = authClient.useSession();

  const [wcaLinkStatus, setWcaLinkStatus] = useQueryState(
    "wca-link-status",
    parseAsStringLiteral(["signup-success", "link-success"]),
  );
  const [person, setPerson] = useState(initPerson);
  const [accounts, setAccounts] = useState<Account[]>();
  const [isPendingWcaProfileLink, setIsPendingWcaProfileLink] = useState(false);
  const [isPendingWcaLink, startWcaLinkTransition] = useTransition();
  const [isDeleting, startDeleteAccountTransition] = useTransition();

  const hasLinkedWcaAccount = !!accounts?.some((a) => a.providerId === C.wcaOAuthProviderId);
  const roles = session
    ? session.user
        .role!.split(",")
        .map((role) => (rolesObject as any)[role])
        .join(", ")
    : "";
  const isPending = isPendingSession || isDeleting || isPendingWcaLink || isPendingWcaProfileLink;

  useEffect(() => {
    if (session && !accounts) {
      // Get accounts data
      (async () => {
        const { data, error } = await authClient.listAccounts();

        if (error) {
          changeErrorMessages([error.message || error.statusText]);
        } else {
          setAccounts(data);

          if (HAS_WCA_AUTH) {
            if (wcaLinkStatus === "link-success") {
              if (!data.some((a) => a.providerId === C.wcaOAuthProviderId)) {
                changeErrorMessages(["An error has occurred while linking your WCA account"]);
              } else {
                changeSuccessMessage(
                  "Your WCA account has been linked successfully! Linking your WCA competitor profile...",
                );

                setIsPendingWcaProfileLink(true);
                setTimeout(() => linkWcaProfile(data), 2000);
              }
            } else if (wcaLinkStatus === "signup-success") {
              changeSuccessMessage(
                "Your account has been created successfully! Linking your WCA competitor profile...",
              );

              setIsPendingWcaProfileLink(true);
              setTimeout(() => linkWcaProfile(data), 2000);
            }
          }
        }
      })();
    }
  }, [wcaLinkStatus, session, accounts]);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [isPending, session]);

  const linkWcaAccount = () => {
    resetMessages();
    startWcaLinkTransition(async () => {
      const { error } = await authClient.oauth2.link({
        providerId: C.wcaOAuthProviderId,
        callbackURL: "/user/settings?wca-link-status=link-success",
        // errorCallbackURL: "/oauth-error", // this is currently broken in Better Auth; see next.config.ts
      });

      if (error) changeErrorMessages([error.message || error.statusText]);
    });
  };

  const linkWcaProfile = async (accs: Account[] = accounts!) => {
    setIsPendingWcaProfileLink(true);
    const wcaAccount = accs.find((a) => a.providerId === C.wcaOAuthProviderId);

    const { data, error } = await authClient.accountInfo({ query: { accountId: wcaAccount!.accountId } });

    if (error) {
      changeErrorMessages([error?.message || error?.statusText]);
    } else {
      // This doesn't include the full schema of the user information the WCA returns
      const parsed = z
        .object({
          preferred_username: WcaIdValidator, // if the WCA user has no WCA ID, this will throw a validation error
          name: z.string().nonempty(),
          image: z.url().optional(),
        })
        .safeParse(data.data);

      if (!parsed.success) {
        changeErrorMessages([z.prettifyError(parsed.error)]);
      } else {
        const { preferred_username: wcaId, name, image } = parsed.data;
        const res = await getOrCreatePersonByWcaIdSF({ wcaId });

        if (res.serverError || res.validationErrors) {
          changeErrorMessages([getActionError(res)]);
        } else if (session!.user.personId && session!.user.personId !== res.data!.person.id) {
          changeErrorMessages([
            "Couldn't update user data, because there is already a different competitor linked to this user. Please contact the admin team.",
          ]);
          setWcaLinkStatus(null);
        } else {
          const credentialAccount = accs.find((a) => a.providerId === "credential");

          // Set the person ID. If the user already has an email + password account, set the name and image link too.
          const { error } = await authClient.updateUser(
            credentialAccount ? { image, name, personId: res.data!.person.id } : { personId: res.data!.person.id },
          );

          if (error) {
            changeErrorMessages([error.message || error.statusText]);
          } else {
            changeSuccessMessage("Successfully linked WCA competitor profile");
            setWcaLinkStatus(null);
            setPerson(res.data!.person);
          }
        }
      }
    }

    setIsPendingWcaProfileLink(false);
  };

  const deleteUser = () => {
    if (confirm("Are you CERTAIN you would like to delete your account? This action is permanent!")) {
      resetMessages();
      startDeleteAccountTransition(async () => {
        logUserDeletedSF({ id: session!.user.id });
        const { error } = await authClient.deleteUser();

        if (error) {
          changeErrorMessages([error.message || error.statusText]);
        } else {
          changeSuccessMessage("Your account has been successfully deleted");
          setTimeout(() => router.push("/"), 2000);
        }
      });
    }
  };

  if (!session || !accounts) return <Loading />;

  return (
    <>
      {session.user.name !== session.user.username && (
        <p className="mb-2">
          Name: <b>{session.user.name}</b>
        </p>
      )}
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name}
          style={{ maxWidth: "min(90%, 400px)", marginTop: "0.8rem", marginBottom: "2rem" }}
        />
      )}
      {session.user.username && (
        <p className="mb-2">
          Username: <b>{session.user.username}</b>
        </p>
      )}
      <p className="mb-2">
        Email address: <b>{session.user.email}</b>
      </p>
      <p className="mb-4" style={{ fontSize: "0.85rem" }}>
        Changing your email address is currently not supported. Please contact the development team if you would like to
        change your email.
      </p>
      {session.user.role && (
        <p>
          Your role: <strong>{roles}</strong>.
        </p>
      )}

      {person ? (
        <div className="d-flex flex-wrap gap-2">
          <span>Your competitor profile:</span>
          <div className="d-flex gap-2">
            <Competitor person={person} showLocalizedName />
            <span>
              (CC ID: <strong>{person.id}</strong>)
            </span>
          </div>
        </div>
      ) : (
        <p>There is no competitor profile tied to your account.</p>
      )}
      {HAS_WCA_AUTH &&
        (!hasLinkedWcaAccount ? (
          <Button
            onClick={() => linkWcaAccount()}
            isLoading={isPendingWcaLink}
            disabled={isPending}
            className="d-block mt-3 px-4"
          >
            <div className="d-flex gap-2 align-items-center">
              <Image src="/wca_logo.svg" height={30} width={30} alt="WCA Logo" />
              Link WCA account
            </div>
          </Button>
        ) : !person || wcaLinkStatus ? (
          <Button
            onClick={() => linkWcaProfile()}
            isLoading={isPendingWcaProfileLink}
            disabled={isPending}
            className="btn-success d-block mt-3 px-4"
          >
            <div className="d-flex gap-2 align-items-center">
              <Image src="/wca_logo.svg" height={30} width={30} alt="WCA Logo" />
              Link WCA profile
            </div>
          </Button>
        ) : undefined)}

      <Button onClick={deleteUser} isLoading={isDeleting} disabled={isPending} className="btn-danger btn-sm mt-4">
        Delete Account
      </Button>
      <p className="mt-2" style={{ fontSize: "0.85rem" }}>
        This deletes all of your account data, but does not affect your competitor data, even if your competitor profile
        is tied to your account.
      </p>
    </>
  );
}

export default UserSettingsScreen;
