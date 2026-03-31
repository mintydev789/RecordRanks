"use client";

import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAction } from "next-safe-action/hooks";
import { useContext, useMemo, useState } from "react";
import Competitor from "~/app/components/Competitor.tsx";
import FiltersContainer from "~/app/components/FiltersContainer.tsx";
import Form from "~/app/components/form/Form.tsx";
import FormCheckbox from "~/app/components/form/FormCheckbox";
import FormPersonInputs from "~/app/components/form/FormPersonInputs.tsx";
import FormTextInput from "~/app/components/form/FormTextInput.tsx";
import ActiveInactiveIcon from "~/app/components/UI/ActiveInactiveIcon.tsx";
import Button from "~/app/components/UI/Button.tsx";
import type { authClient } from "~/helpers/authClient.ts";
import { C } from "~/helpers/constants.ts";
import { MainContext } from "~/helpers/contexts.ts";
import type { InputPerson } from "~/helpers/types.ts";
import { getActionError, getHasRole, getSimplifiedString } from "~/helpers/utilityFunctions.ts";
import type { PersonResponse } from "~/server/db/schema/persons.ts";
import type { RegionResponse } from "~/server/db/schema/regions.ts";
import { type Role, rolesObject } from "~/server/permissions.ts";
import { updateUserSF } from "~/server/serverFunctions/serverFunctions.ts";

type Props = {
  users: (typeof authClient.$Infer.Session.user & { providerId: string })[];
  userPersons: PersonResponse[];
  regions: RegionResponse[];
};

function ManageUsersScreen({ users: initUsers, userPersons: initUserPersons, regions }: Props) {
  const { changeErrorMessages, resetMessages } = useContext(MainContext);

  const { executeAsync: updateUser, isPending: isUpdating } = useAction(updateUserSF);
  const [users, setUsers] = useState(initUsers);
  const [userPersons, setUserPersons] = useState(initUserPersons);
  const [userId, setUserId] = useState<string>();
  const [name, setName] = useState(""); // for email + password users this is the same as the username
  const [email, setEmail] = useState("");
  const [personNames, setPersonNames] = useState([""]);
  const [persons, setPersons] = useState<InputPerson[]>([null]);
  const [isUser, setIsUser] = useState(false);
  const [isMod, setIsMod] = useState(false);
  const [isVideoBasedResultReviewer, setIsVideoBasedResultReviewer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const simplifiedSearch = getSimplifiedString(search);

    return users.filter(
      (u) =>
        u.name.toLocaleLowerCase().includes(simplifiedSearch) ||
        u.email.toLocaleLowerCase().includes(simplifiedSearch) ||
        getSimplifiedString(userPersons.find((p) => p.id === u.personId)?.name ?? "").includes(simplifiedSearch),
    );
  }, [search, users, userPersons]);

  const handleSubmit = async () => {
    if (persons[0] === null && personNames[0].trim() !== "") {
      changeErrorMessages(["The competitor has not been entered. Either enter them or clear the input."]);
      return;
    }

    const roles: Role[] = [];
    if (isUser) roles.push("user");
    if (isMod) roles.push("mod");
    if (isVideoBasedResultReviewer) roles.push("videoBasedResultReviewer");
    if (isAdmin) roles.push("admin");

    const res = await updateUser({ id: userId!, personId: persons[0]?.id, roles });

    if (res.serverError || res.validationErrors) {
      changeErrorMessages([getActionError(res)]);
    } else {
      resetMessages();
      setUserId(undefined);
      setName("");
      setUsers(users.map((u) => (u.id === userId ? { ...res.data!.user, providerId: u.providerId } : u)));
      const { person } = res.data!;
      if (person && !userPersons.some((p) => p.id === person.id)) setUserPersons([...userPersons, person]);
    }
  };

  const onEditUser = (user: typeof authClient.$Infer.Session.user) => {
    window.scrollTo(0, 0);
    resetMessages();

    setUserId(user.id);
    setName(user.name);
    setEmail(user.email);

    if (!user.role) throw new Error("Error: user role is empty");
    setIsUser(getHasRole("user", user.role));
    setIsMod(getHasRole("mod", user.role));
    setIsVideoBasedResultReviewer(getHasRole("videoBasedResultReviewer", user.role));
    setIsAdmin(getHasRole("admin", user.role));

    const person = user.personId ? userPersons.find((p) => p.id === user.personId) : undefined;

    if (person) {
      setPersons([person]);
      setPersonNames([person.name]);
    } else {
      setPersons([null]);
      setPersonNames([""]);
    }
  };

  return (
    <>
      {name && (
        <Form
          buttonText="Submit"
          onSubmit={handleSubmit}
          hideToasts
          onCancel={() => setName("")}
          isLoading={isUpdating}
        >
          <div className="row mb-3">
            <div className="col">
              <FormTextInput title="Name" value={name} disabled />
            </div>
            <div className="col">
              <FormTextInput title="Email" value={email} setValue={setEmail} disabled />
            </div>
          </div>
          <FormPersonInputs
            title="Competitor"
            persons={persons}
            setPersons={setPersons}
            personNames={personNames}
            setPersonNames={setPersonNames}
            regions={regions}
            disabled={isUpdating}
            addNewPersonMode="default"
          />
          <h5 className="mt-3 mb-3">Roles</h5>
          <FormCheckbox title={rolesObject.user} selected={isUser} setSelected={setIsUser} disabled={isUpdating} />
          <FormCheckbox title={rolesObject.mod} selected={isMod} setSelected={setIsMod} disabled={isUpdating} />
          <FormCheckbox
            title={rolesObject.videoBasedResultReviewer}
            selected={isVideoBasedResultReviewer}
            setSelected={setIsVideoBasedResultReviewer}
            disabled={isUpdating}
          />
          <FormCheckbox title={rolesObject.admin} selected={isAdmin} setSelected={setIsAdmin} disabled={isUpdating} />
        </Form>
      )}

      <div className="px-2">
        <FiltersContainer className="mt-4 mb-2">
          <FormTextInput title="Search" value={search} setValue={setSearch} oneLine />
        </FiltersContainer>
        <p className="text-secondary">Search by name, username, email or competitor name</p>

        <p className="mb-2">
          Number of users:&nbsp;<b>{filteredUsers.length}</b>
          {filteredUsers.length === C.maxUsers ? " (reached limit; please contact the development team)" : ""}
        </p>
      </div>

      <div className="table-responsive mt-3">
        <table className="table-hover table text-nowrap">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Provider ID</th>
              <th scope="col">Competitor</th>
              <th scope="col">Roles</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => {
              const person = userPersons.find((p) => p.id === user.personId);
              const roles = user
                .role!.split(",")
                .map((role) => (rolesObject as any)[role])
                .join(", ");

              return (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                      {user.email}
                      <ActiveInactiveIcon isActive={user.emailVerified} />
                    </div>
                  </td>
                  <td>{user.providerId}</td>
                  <td>{person && <Competitor person={person} regions={regions} noFlag />}</td>
                  <td>{roles}</td>
                  <td>
                    <Button onClick={() => onEditUser(user)} className="btn-xs" title="Edit" ariaLabel="Edit">
                      <FontAwesomeIcon icon={faPencil} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ManageUsersScreen;
