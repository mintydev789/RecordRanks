"use client";

import { faBars, faBook, faCalendarDays, faRankingStar, faStar, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "~/helpers/authClient.ts";
import { IS_CUBING_CONTESTS_INSTANCE } from "~/helpers/constants.ts";
import { getHasRole } from "~/helpers/utilityFunctions.ts";

function NavbarItems() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [expanded, setExpanded] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [moreExpanded, setMoreExpanded] = useState(false);
  const [userExpanded, setUserExpanded] = useState(false);
  const [canAccessModDashboard, setCanAccessModDashboard] = useState(false);
  const [canApproveVideoBasedResults, setCanApproveVideoBasedResults] = useState(false);

  useEffect(() => {
    if (session?.user) {
      authClient.admin.hasPermission({ permissions: { modDashboard: ["view"] } }).then(({ data }) => {
        if (data) setCanAccessModDashboard(data.success);
      });

      authClient.admin.hasPermission({ permissions: { videoBasedResults: ["approve"] } }).then(({ data }) => {
        if (data) setCanApproveVideoBasedResults(data.success);
      });
    }
  }, [session]);

  const logOut = async () => {
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

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-md position-relative">
        <Link href="/" prefetch={false} className="navbar-brand">
          <Image src="/favicon.png" height={45} width={45} alt="Home" />
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
                href="/competitions"
                onClick={collapseAll}
                prefetch={false}
                className={`nav-link ${pathname === "/competitions" ? "active" : ""}`}
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
                className={`nav-link dropdown-toggle ${/^\/(rankings|records|export)/.test(pathname) ? "active" : ""}`}
              >
                <FontAwesomeIcon icon={faRankingStar} size="xs" className="me-2" />
                Results
              </button>
              <ul className={`dropdown-menu px-3 px-lg-2 py-0 ${resultsExpanded ? "show" : ""}`}>
                <li>
                  <Link
                    href="/records"
                    onClick={collapseAll}
                    prefetch={false}
                    className={`nav-link ${/^\/records\//.test(pathname) ? "active" : ""}`}
                  >
                    Records
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rankings"
                    onClick={collapseAll}
                    prefetch={false}
                    className={`nav-link ${/^\/rankings\//.test(pathname) ? "active" : ""}`}
                  >
                    Rankings
                  </Link>
                </li>
                {process.env.NEXT_PUBLIC_EXPORTS_TO_KEEP && process.env.NEXT_PUBLIC_EXPORTS_TO_KEEP !== "0" && (
                  <li>
                    <Link
                      href="/export"
                      onClick={collapseAll}
                      prefetch={false}
                      className={`nav-link ${pathname === "/export" ? "active" : ""}`}
                    >
                      Exports
                    </Link>
                  </li>
                )}
              </ul>
            </li>
            <li className="nav-item">
              <Link
                href="/rules"
                onClick={collapseAll}
                prefetch={false}
                className={`nav-link ${pathname === "/rules" ? "active" : ""}`}
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
                    href="/about"
                    onClick={collapseAll}
                    prefetch={false}
                    className={`nav-link ${pathname === "/about" ? "active" : ""}`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/posts"
                    onClick={collapseAll}
                    prefetch={false}
                    className={`nav-link ${/^\/posts/.test(pathname) ? "active" : ""}`}
                  >
                    Blog
                  </Link>
                </li>
                {IS_CUBING_CONTESTS_INSTANCE && (
                  <li>
                    <Link
                      href="/moderator-instructions"
                      onClick={collapseAll}
                      prefetch={false}
                      className={`nav-link ${/^\/moderator-instructions/.test(pathname) ? "active" : ""}`}
                    >
                      Moderator instructions
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/donate"
                    onClick={collapseAll}
                    prefetch={false}
                    className={`nav-link ${pathname === "/donate" ? "active" : ""}`}
                  >
                    Donate
                  </Link>
                </li>
              </ul>
            </li>
            {!session ? (
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
                  {session.user.username}
                </button>
                <ul className={`dropdown-menu end-0 px-3 px-lg-2 py-0 ${userExpanded ? "show" : ""}`}>
                  {canAccessModDashboard && (
                    <li>
                      <Link
                        href={`/mod${getHasRole("admin", session.user.role) ? "?state=pending" : ""}`}
                        prefetch={false}
                        onClick={collapseAll}
                        className={`nav-link ${pathname === "/mod" ? "active" : ""}`}
                      >
                        Mod dashboard
                      </Link>
                    </li>
                  )}
                  {canApproveVideoBasedResults && (
                    <li>
                      <Link
                        href="/video-based-results"
                        prefetch={false}
                        onClick={collapseAll}
                        className={`nav-link ${pathname === "/video-based-results" ? "active" : ""}`}
                      >
                        Video-based results
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/video-based-results/submit"
                      prefetch={false}
                      onClick={collapseAll}
                      className={`nav-link ${pathname === "/video-based-results/submit" ? "active" : ""}`}
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

export default NavbarItems;
