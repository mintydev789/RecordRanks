"use client";

import { faBars, faBook, faCalendarDays, faRankingStar, faStar, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { authClient } from "~/helpers/authClient.ts";
import { C } from "~/helpers/constants.ts";
import { useSession } from "~/helpers/hooks.ts";
import { SwrKey } from "~/helpers/swr-keys.ts";
import { clientGetHasPermission, getHasRole } from "~/helpers/utilityFunctions.ts";
import { getModInstructionsSF, getPublicExportsToKeepSF } from "~/server/server-functions/server-functions.ts";

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, user, member, organization } = useSession();
  const { mutate } = useSWRConfig();

  const { data: moderatorInstructions } = useSWR(["mod-instructions"], () => getModInstructionsSF());
  const [expanded, setExpanded] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [moreExpanded, setMoreExpanded] = useState(false);
  const [userExpanded, setUserExpanded] = useState(false);
  const { data: canAccessModDashboard } = useSWR(session ? [SwrKey.CanAccessModDashboard, session] : null, () =>
    clientGetHasPermission({ modDashboard: ["view"] }),
  );
  const { data: canApproveVideoBasedResults } = useSWR(
    session ? [SwrKey.CanApproveVideoBasedResults, session] : null,
    () => clientGetHasPermission({ videoBasedResults: ["approve"] }),
  );

  const { data: publicExportsToKeep } = useSWR("public-exports-to-keep", () => getPublicExportsToKeepSF(), {
    fallbackData: "0",
  });

  const logOut = async () => {
    // Clear the SWR cache
    mutate(
      () => true, // update all keys
      undefined, // set cache data to undefined
      { revalidate: false },
    );

    collapseAll();
    await authClient.signOut();
    router.push("/");
  };

  const toggleDropdown = (dropdown: "results" | "more" | "user", newValue: boolean) => {
    if (dropdown === "results") {
      setResultsExpanded(newValue);
      setMoreExpanded(false);
      setUserExpanded(false);
    } else if (dropdown === "more") {
      setResultsExpanded(false);
      setMoreExpanded(newValue);
      setUserExpanded(false);
    } else {
      setResultsExpanded(false);
      setMoreExpanded(false);
      setUserExpanded(newValue);
    }
  };

  const collapseAll = () => {
    setExpanded(false);
    setResultsExpanded(false);
    setUserExpanded(false);
  };

  // TO-DO: FIX NO NAVBAR FLASHING BEFORE HYDRATION!
  if (!organization) return;

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-md position-relative">
        <Link href={`/${organization.slug}`} prefetch={false} className="navbar-brand">
          {organization.logo ? <img src={organization.logo} height={45} width={45} alt="Home" /> : "Home"}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="rr-icon-button d-lg-none"
          title="Menu"
          aria-label="Menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div className={`navbar-collapse justify-content-end ${expanded ? "" : "collapse"}`}>
          <ul className="navbar-nav fs-5 mx-2 mt-3 mt-lg-0 gap-lg-2 align-items-lg-end align-items-start">
            <li className="nav-item">
              <Link
                href={`/${organization.slug}/competitions`}
                onClick={collapseAll}
                prefetch={false}
                className={`nav-link ${pathname === `/${organization.slug}/competitions` ? "active" : ""}`}
              >
                <FontAwesomeIcon icon={faCalendarDays} size="xs" className="me-2" />
                Contests
              </Link>
            </li>
            <li
              onMouseEnter={() => toggleDropdown("results", true)}
              onMouseLeave={() => toggleDropdown("results", false)}
              className="nav-item dropdown"
            >
              <button
                type="button"
                onClick={() => toggleDropdown("results", !resultsExpanded)}
                className={`nav-link dropdown-toggle ${/^\/[a-z0-9]+\/(rankings|records|export)/.test(pathname) ? "active" : ""}`}
              >
                <FontAwesomeIcon icon={faRankingStar} size="xs" className="me-2" />
                Results
              </button>
              <ul className={`dropdown-menu px-3 px-lg-2 py-0 ${resultsExpanded ? "show" : ""}`}>
                <li>
                  <Link
                    href={`/${organization.slug}/records`}
                    onClick={collapseAll}
                    prefetch={false}
                    className={`nav-link ${/^\/[a-z0-9]+\/records\//.test(pathname) ? "active" : ""}`}
                  >
                    Records
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${organization.slug}/rankings`}
                    onClick={collapseAll}
                    prefetch={false}
                    className={`nav-link ${/^\/[a-z0-9]+\/rankings\//.test(pathname) ? "active" : ""}`}
                  >
                    Rankings
                  </Link>
                </li>
                {publicExportsToKeep !== "0" && (
                  <li>
                    <Link
                      href={`/${organization.slug}/export`}
                      onClick={collapseAll}
                      prefetch={false}
                      className={`nav-link ${pathname === `/${organization.slug}/export` ? "active" : ""}`}
                    >
                      Exports
                    </Link>
                  </li>
                )}
              </ul>
            </li>
            <li className="nav-item">
              <Link
                href={`/${organization.slug}/rules`}
                onClick={collapseAll}
                prefetch={false}
                className={`nav-link ${pathname === `/${organization.slug}/rules` ? "active" : ""}`}
              >
                <FontAwesomeIcon icon={faBook} size="xs" className="me-2" />
                Rules
              </Link>
            </li>
            <li
              onMouseEnter={() => toggleDropdown("more", true)}
              onMouseLeave={() => toggleDropdown("more", false)}
              className="nav-item dropdown"
            >
              <button
                type="button"
                onClick={() => toggleDropdown("more", !moreExpanded)}
                className="nav-link dropdown-toggle"
              >
                <FontAwesomeIcon icon={faStar} size="xs" className="me-2" />
                More
              </button>
              <ul className={`dropdown-menu px-3 px-lg-2 py-0 ${moreExpanded ? "show" : ""}`}>
                <li>
                  <Link
                    href={`/${organization.slug}/about`}
                    onClick={collapseAll}
                    prefetch={false}
                    className={`nav-link ${pathname === `/${organization.slug}/about` ? "active" : ""}`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${organization.slug}/posts`}
                    onClick={collapseAll}
                    prefetch={false}
                    className={`nav-link ${/^\/[a-z0-9]+\/posts/.test(pathname) ? "active" : ""}`}
                  >
                    Blog
                  </Link>
                </li>
                {moderatorInstructions && (
                  <li>
                    <Link
                      href={`/${organization.slug}/moderator-instructions`}
                      onClick={collapseAll}
                      prefetch={false}
                      className={`nav-link ${pathname === `/${organization.slug}/moderator-instructions` ? "active" : ""}`}
                    >
                      Moderator instructions
                    </Link>
                  </li>
                )}
                <li>
                  <a
                    href={C.rrDonationLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={collapseAll}
                    className="nav-link"
                  >
                    Support RecordRanks
                  </a>
                </li>
              </ul>
            </li>
            {!member ? (
              // TO-DO: THIS NEEDS TO BE REMOVED NOW! BUT WAIT, WHAT ABOUT WHITE-LABEL? (i.e. CC)
              <li className="nav-item">
                <Link href="/login" prefetch={false} onClick={collapseAll} className="nav-link">
                  <FontAwesomeIcon icon={faUser} size="xs" className="me-2" />
                  Log In
                </Link>
              </li>
            ) : (
              <li
                onMouseEnter={() => toggleDropdown("user", true)}
                onMouseLeave={() => toggleDropdown("user", false)}
                className="nav-item dropdown"
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown("user", !userExpanded)}
                  className="nav-link dropdown-toggle text-truncate"
                  style={{ maxWidth: "15rem" }}
                >
                  <FontAwesomeIcon icon={faUser} size="xs" className="me-2" />
                  {user!.name}
                </button>
                <ul className={`dropdown-menu end-0 px-3 px-lg-2 py-0 ${userExpanded ? "show" : ""}`}>
                  {canAccessModDashboard && (
                    <li>
                      <Link
                        href={`/${organization.slug}/mod${getHasRole("admin", member.role) ? "?state=pending" : ""}`}
                        prefetch={false}
                        onClick={collapseAll}
                        className={`nav-link ${pathname === `/${organization.slug}/mod` ? "active" : ""}`}
                      >
                        Mod dashboard
                      </Link>
                    </li>
                  )}
                  {canApproveVideoBasedResults && (
                    <li>
                      <Link
                        href={`/${organization.slug}/video-based-results`}
                        prefetch={false}
                        onClick={collapseAll}
                        className={`nav-link ${pathname === `/${organization.slug}/video-based-results` ? "active" : ""}`}
                      >
                        Video-based results
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href={`/${organization.slug}/video-based-results/submit`}
                      prefetch={false}
                      onClick={collapseAll}
                      className={`nav-link ${pathname === `/${organization.slug}/video-based-results/submit` ? "active" : ""}`}
                    >
                      Submit results
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/user/settings"
                      prefetch={false}
                      onClick={collapseAll}
                      className={`nav-link ${pathname === "/user/settings" ? "active" : ""}`}
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={logOut} className="nav-link">
                      Log out
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
