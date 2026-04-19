"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useContext, useEffect, useState, useTransition } from "react";
import Competitor from "~/app/components/Competitor.tsx";
import FormTextInput from "~/app/components/form/FormTextInput.tsx";
import Button from "~/app/components/UI/Button.tsx";
import Loading from "~/app/components/UI/Loading.tsx";
import Tabs from "~/app/components/UI/Tabs.tsx";
import UserRequestTab from "~/app/user/settings/UserRequestTab.tsx";
import { authClient } from "~/helpers/authClient.ts";
import { HAS_WCA_AUTH } from "~/helpers/constants.ts";
import { MainContext } from "~/helpers/contexts.ts";
import type { NavigationItem } from "~/helpers/types/NavigationItem.ts";
import { getActionError } from "~/helpers/utilityFunctions.ts";
import type { PersonResponse } from "~/server/db/schema/persons.ts";
import type { RegionResponse } from "~/server/db/schema/regions.ts";
import { rolesObject } from "~/server/permissions.ts";
import { linkWcaProfileSF, logUserDeletedSF } from "~/server/serverFunctions/serverFunctions.ts";

const tabs = [
  { title: "Account", value: "account" },
  { title: "User Request", value: "user-request" },
] as const satisfies NavigationItem[];

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
  regions: RegionResponse[];
  userRequestInstructions: string | null;
};

function UserSettingsScreen({ initPerson, regions, userRequestInstructions }: Props) {
  const router = useRouter();
  const { changeErrorMessages, changeSuccessMessage, resetMessages } = useContext(MainContext);
  const { data: session, isPending: isPendingSession } = authClient.useSession();

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["value"]>("account");
  const [status, setStatus] = useQueryState("status", parseAsStringLiteral(["signup-success", "email-change-success"]));
  const [person, setPerson] = useState(initPerson);
  const [accounts, setAccounts] = useState<Account[]>();
  const [newEmail, setNewEmail] = useState("");
  const [wcaProfileLinkStatus, setWcaProfileLinkStatus] = useState<"disabled" | "enabled" | "pending" | "linked">(
    "disabled",
  );
  const [isInitiatingEmailChange, startEmailChange] = useTransition();
  const [isDeleting, startDeleteAccountTransition] = useTransition();

  const showLinkWcaProfileButton =
    HAS_WCA_AUTH &&
    !["disabled", "linked"].includes(wcaProfileLinkStatus) &&
    accounts!.some((a) => a.providerId === "wca");
  const roles = session
    ? session.user
        .role!.split(",")
        .map((role) => (rolesObject as any)[role])
        .join(", ")
    : "";
  const isPending = isPendingSession || wcaProfileLinkStatus === "pending" || isInitiatingEmailChange || isDeleting;

  useEffect(() => {
    if (session && !accounts) {
      // Get accounts data
      (async () => {
        const { data, error } = await authClient.listAccounts();

        if (error) {
          changeErrorMessages([error.message || error.statusText]);
        } else {
          setAccounts(data);

          if (status === "email-change-success") changeSuccessMessage("Your email has been changed successfully");

          if (HAS_WCA_AUTH) {
            if (status === "signup-success") {
              changeSuccessMessage(
                "Your account has been created successfully! Linking your WCA competitor profile...",
              );

              setWcaProfileLinkStatus("pending"); // set to pending immediately to start loading spinner
              setTimeout(() => linkWcaProfile(), 2000);
            } else if (data.find((a) => a.providerId === "wca")) {
              setWcaProfileLinkStatus("enabled");
            }
          }

          setStatus(null);
        }
      })();
    }
  }, [status, session, accounts]);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [isPending, session]);

  const linkWcaProfile = async () => {
    setWcaProfileLinkStatus("pending");

    const res = await linkWcaProfileSF();

    if (res.serverError || res.validationErrors) {
      changeErrorMessages([getActionError(res)]);
      setWcaProfileLinkStatus("enabled");
    } else {
      changeSuccessMessage(
        session!.user.personId
          ? "Successfully synced WCA competitor profile"
          : "Successfully linked WCA competitor profile",
      );
      setWcaProfileLinkStatus("linked");
      setPerson(res.data);
    }
  };

  const initiateEmailChange = () => {
    startEmailChange(async () => {
      const { error } = await authClient.changeEmail({
        newEmail,
        callbackURL: "/user/settings?status=email-change-success",
      });

      if (error) {
        changeErrorMessages([error.message || error.statusText]);
      } else {
        changeSuccessMessage(
          "A verification link has been sent to your new email. Please click that link for confirmation.",
        );
      }
    });
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
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab as any} />

      {activeTab === "account" && (
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
            <p className="mb-3">
              Username: <b>{session.user.username}</b>
            </p>
          )}
          <p className="mb-2">
            Email address: <b>{session.user.email}</b>
          </p>
          <div className="d-flex my-3 flex-wrap gap-3 align-items-end">
            <FormTextInput title="New email" value={newEmail} setValue={setNewEmail} disabled={isPending} />
            <Button onClick={() => initiateEmailChange()} isLoading={isInitiatingEmailChange} disabled={isPending}>
              Change email
            </Button>
          </div>
          {session.user.role && (
            <p className="mt-3">
              Your role: <strong>{roles}</strong>.
            </p>
          )}

          {person ? (
            <div className="d-flex flex-wrap gap-2">
              <span>Your competitor profile:</span>
              <div className="d-flex gap-2">
                <Competitor person={person} regions={regions} showLocalizedName />
                <span>
                  (CC ID: <strong>{person.id}</strong>)
                </span>
              </div>
            </div>
          ) : (
            <p>There is no competitor profile tied to your account.</p>
          )}
          {showLinkWcaProfileButton && (
            <Button
              onClick={() => linkWcaProfile()}
              isLoading={wcaProfileLinkStatus === "pending"}
              disabled={isPending}
              className="btn-success d-block mt-3 px-4"
            >
              <div className="d-flex gap-2 align-items-center">
                <Image src="/wca_logo.svg" height={30} width={30} alt="WCA Logo" />
                {person ? "Sync WCA profile" : "Link WCA profile"}
              </div>
            </Button>
          )}

          <Button onClick={deleteUser} isLoading={isDeleting} disabled={isPending} className="btn-danger btn-sm mt-4">
            Delete Account
          </Button>
          <p className="mt-2" style={{ fontSize: "0.85rem" }}>
            This deletes all of your account data, but does not affect your competitor data, even if your competitor
            profile is tied to your account.
          </p>
        </>
      )}

      {activeTab === "user-request" && (
        <UserRequestTab userRequestInstructions={userRequestInstructions} regions={regions} />
      )}
    </>
  );
}

export default UserSettingsScreen;
