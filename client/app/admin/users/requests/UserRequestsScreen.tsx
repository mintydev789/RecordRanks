"use client";

import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAction } from "next-safe-action/hooks";
import { useContext, useState } from "react";
import Competitor from "~/app/components/Competitor.tsx";
import ActiveInactiveIcon from "~/app/components/UI/ActiveInactiveIcon.tsx";
import Button from "~/app/components/UI/Button.tsx";
import { MainContext } from "~/helpers/contexts.ts";
import { getActionError } from "~/helpers/utilityFunctions.ts";
import type { RegionResponse } from "~/server/db/schema/regions.ts";
import type { FullUserRequest } from "~/server/db/schema/user-requests.ts";
import { rolesObject } from "~/server/permissions.ts";
import { approveUserRequestSF, deleteUserRequestSF } from "~/server/server-functions/user-server-functions.ts";

type Props = {
  userRequests: FullUserRequest[];
  regions: RegionResponse[];
};

function UserRequestsScreen({ userRequests: initUserRequests, regions }: Props) {
  const { changeErrorMessages, changeSuccessMessage, resetMessages } = useContext(MainContext);

  const { executeAsync: approveUserRequest, isPending: isApproving } = useAction(approveUserRequestSF);
  const { executeAsync: deleteUserRequest, isPending: isRejecting } = useAction(deleteUserRequestSF);
  const [loadingId, setLoadingId] = useState("");
  const [userRequests, setUserRequests] = useState(initUserRequests);

  const isPending = isApproving || isRejecting;

  const approveRequest = async (id: number) => {
    resetMessages();
    setLoadingId(`approve_request_${id}_button`);
    const res = await approveUserRequest(id);

    if (res.serverError || res.validationErrors) {
      changeErrorMessages([getActionError(res)]);
    } else {
      setUserRequests(userRequests.filter((ur) => ur.id !== id));
      changeSuccessMessage("User request successfully approved");
    }
    setLoadingId("");
  };

  const rejectRequest = async (id: number) => {
    resetMessages();
    setLoadingId(`reject_request_${id}_button`);
    const res = await deleteUserRequest(id);

    if (res.serverError || res.validationErrors) {
      changeErrorMessages([getActionError(res)]);
    } else {
      setUserRequests(userRequests.filter((ur) => ur.id !== id));
      changeSuccessMessage("User request successfully rejected");
    }
    setLoadingId("");
  };

  return (
    <>
      <p className="mb-4 px-2">
        Please note that competitor profiles must be approved before you can approve the user request
      </p>

      {userRequests.length === 0 ? (
        <p className="fs-5 px-2">No user requests have been submitted yet</p>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table-hover table text-nowrap">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Requested Profile</th>
                <th scope="col">Requested Role</th>
                <th scope="col">Comment</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userRequests.map((ur) => (
                <tr key={ur.id}>
                  <td>{ur.user!.name}</td>
                  <td>{ur.user!.email}</td>
                  <td>
                    {ur.requestedPerson && (
                      <div className="d-flex gap-3 align-items-center">
                        <Competitor person={ur.requestedPerson} regions={regions} showWcaId />
                        <ActiveInactiveIcon isActive={ur.requestedPerson.approved} />
                      </div>
                    )}
                  </td>
                  <td>
                    {ur.requestedRole &&
                      (ur.requestedRole in rolesObject ? (
                        (rolesObject as any)[ur.requestedRole]
                      ) : (
                        <span className="text-danger">ERROR</span>
                      ))}
                  </td>
                  <td>
                    <div style={{ maxWidth: "25rem", whiteSpace: "pre-wrap" }}>{ur.comment}</div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        id={`approve_request_${ur.id}_button`}
                        onClick={() => approveRequest(ur.id)}
                        disabled={isPending}
                        loadingId={loadingId}
                        className="btn-xs btn-success"
                        title="Approve"
                        ariaLabel="Approve"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                      <Button
                        id={`reject_request_${ur.id}_button`}
                        onClick={() => rejectRequest(ur.id)}
                        disabled={isPending}
                        loadingId={loadingId}
                        className="btn-xs btn-danger"
                        title="Reject"
                        ariaLabel="Reject"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </Button>
                    </div>
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

export default UserRequestsScreen;
