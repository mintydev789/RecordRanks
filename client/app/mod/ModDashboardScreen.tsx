"use client";

import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { parseAsInteger, useQueryState } from "nuqs";
import { use, useContext, useState } from "react";
import ContestTypeBadge from "~/app/components/ContestTypeBadge.tsx";
import Country from "~/app/components/Country.tsx";
import DonateButton from "~/app/components/DonateButton.tsx";
import Loading from "~/app/components/UI/Loading.tsx";
import LoadingError from "~/app/components/UI/LoadingError.tsx";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import ModFilters from "~/app/mod/ModFilters.tsx";
import { C, IS_CUBING_CONTESTS_INSTANCE } from "~/helpers/constants.ts";
import { MainContext } from "~/helpers/contexts.ts";
import { getActionError, getFormattedDate } from "~/helpers/utilityFunctions.ts";
import type { ModDashboardFiltersDto } from "~/helpers/validators/ModDashboardFilters.ts";
import type { ContestResponse } from "~/server/db/schema/contests.ts";
import { getModContestsSF } from "~/server/serverFunctions/contestServerFunctions.ts";
import ContestControls from "./ContestControls.tsx";

type Props = {
  modContestsPromise: ReturnType<typeof getModContestsSF>;
  isAdminView: boolean;
};

function ModDashboardScreen({ modContestsPromise, isAdminView }: Props) {
  const res = use(modContestsPromise);
  if (!res.data) return <LoadingError loadingEntity="contests" />;

  const { changeErrorMessages } = useContext(MainContext);

  const { executeAsync: getModContests, isPending: isPendingContests } = useAction(getModContestsSF);
  const [organizerPersonId] = useQueryState("organizerPersonId", parseAsInteger);
  const [state] = useQueryState("state");
  const [contests, setContests] = useState<ContestResponse[]>(res.data.contests);

  const pendingContests = contests.filter((c) => ["created", "ongoing", "finished"].includes(c.state)).length;

  const fetchContests = async (newFilters?: ModDashboardFiltersDto) => {
    const res = await getModContests(newFilters ?? { organizerPersonId, state: state as any });

    if (res.serverError || res.validationErrors) changeErrorMessages([getActionError(res)]);
    else setContests(res.data!.contests);
  };

  return (
    <>
      <div className="px-2">
        <ToastMessages />

        {IS_CUBING_CONTESTS_INSTANCE && (
          <div className="alert alert-light mb-4" role="alert">
            We have a Cubing Contests Discord server!{" "}
            <a href={C.discordServerLink} target="_blank" rel="noopener noreferrer">
              Click here to join
            </a>
            , then send your CC username and your Discord username in an email to{" "}
            {process.env.NEXT_PUBLIC_CONTACT_EMAIL} so you can be given the moderator role on the server.
          </div>
        )}

        <div className="d-flex fs-5 column-gap-2 column-gap-xl-3 row-gap-2 mt-4 mb-3 flex-wrap">
          <Link href="/mod/competition" prefetch={false} className="btn btn-success btn-sm btn-lg-md">
            Create new contest
          </Link>
          <Link href="/mod/competitors" prefetch={false} className="btn btn-warning btn-sm btn-lg-md">
            Manage competitors
          </Link>
          {isAdminView ? (
            <>
              <Link href="/admin/users" prefetch={false} className="btn btn-warning btn-sm btn-lg-md">
                Manage users
              </Link>
              <Link href="/admin/events" prefetch={false} className="btn btn-secondary btn-sm btn-lg-md">
                Configure events
              </Link>
              <Link href="/admin/records-configuration" prefetch={false} className="btn btn-secondary btn-sm btn-lg-md">
                Configure records
              </Link>
            </>
          ) : (
            IS_CUBING_CONTESTS_INSTANCE && (
              <a
                href="https://docs.google.com/forms/d/12AuZdtH4qHwTxd4Kxd2Y_TwZHlBuBu8XuKX3VdKrE60"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-light btn-sm btn-lg-md"
              >
                Request new event
              </a>
            )
          )}
          <DonateButton />
        </div>
        <p>
          Total contests:&nbsp;<b>{contests.length ?? 0}</b>&#8194;|&#8194;Pending:&nbsp;<b>{pendingContests}</b>
        </p>
        {!isAdminView && contests && (
          <>
            {!state && !contests.some((c) => c.state !== "created") && (
              <p className="fw-bold my-3 text-danger">
                Your contests will not be publicly visible and you will not be able to enter results until an admin
                approves them
              </p>
            )}
            <p>
              Number of contests: <b>{contests.length}</b>
            </p>
          </>
        )}

        <ModFilters
          onChangeFilters={fetchContests}
          initOrganizerPerson={res.data.organizerPerson}
          isAdminView={isAdminView}
          disabled={isPendingContests}
        />
      </div>

      {isPendingContests ? (
        <Loading />
      ) : contests.length === 0 ? (
        <p className="fs-5 px-2">No contests found</p>
      ) : (
        <div className="table-responsive mb-5">
          <table className="table-hover table text-nowrap">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Name</th>
                <th scope="col">Place</th>
                <th scope="col">Type</th>
                <th scope="col">
                  <span title="Number of participants">
                    <FontAwesomeIcon icon={faUsers} aria-label="Number of participants" />
                  </span>
                </th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contests.map((contest) => (
                <tr key={contest.competitionId}>
                  <td>{getFormattedDate(contest.startDate, contest.endDate)}</td>
                  <td>
                    <Link href={`/competitions/${contest.competitionId}`} prefetch={false} className="link-primary">
                      {contest.shortName}
                    </Link>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-block m-0 text-truncate" style={{ maxWidth: "18rem" }}>
                        {contest.city}
                      </span>
                      <span className="me-1">,</span>
                      <Country countryIso2={contest.regionCode} swapPositions shorten />
                    </div>
                  </td>
                  <td>
                    <ContestTypeBadge type={contest.type} short />
                  </td>
                  <td>{contest.participants || ""}</td>
                  <td>
                    {contest.state === "removed" ? (
                      <span className="text-danger">Removed</span>
                    ) : (
                      <ContestControls
                        contest={contest}
                        isAdmin={isAdminView}
                        forPage="mod-dashboard"
                        onUpdateContestState={fetchContests}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default ModDashboardScreen;
