"use client";

import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { kebabCase } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext } from "react";
import { remove as removeAccents } from "remove-accents";
import { C } from "~/helpers/constants.ts";
import { MainContext } from "~/helpers/contexts.ts";
import { useFeaturesInfo, useSession } from "~/helpers/hooks.ts";
import { slugPath } from "~/helpers/utility-functions.ts";

function Footer() {
  const { slug }: { slug: string } = useParams();
  const { organization } = useSession();
  const { theme, setTheme } = useContext(MainContext);
  const { privacyPolicy } = useFeaturesInfo();

  return (
    <footer className="d-flex justify-content-center min-vw-100 fs-5 column-gap-2 column-gap-sm-3 container flex-wrap bg-body-tertiary py-3 text-center align-items-center">
      <div className="d-flex column-gap-1 flex-wrap align-items-center">
        {organization?.metadata.plan !== "custom" && <span>Powered by</span>}
        <a
          href={`${C.recordRanksLink}?utm_source=rr${organization ? `&utm_campaign=${kebabCase(removeAccents(organization.name))}` : ""}`}
          target="_blank"
          rel="noopener"
          className="rr-button"
        >
          {theme === "light" ? (
            <Image src="/recordranks_logo_transparent_light.png" height={40} width={177} alt="RecordRanks" />
          ) : (
            <Image src="/recordranks_logo_transparent.png" height={40} width={177} alt="RecordRanks" />
          )}
        </a>
      </div>
      <a href={C.sourceCodeLink} target="_blank" rel="noopener" className="rr-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Codeberg"
          role="img"
          viewBox="0 0 512 512"
          style={{ width: "1.75rem", height: "1.75rem", marginTop: "-5px" }}
        >
          <defs>
            <linearGradient id="A" x1="259.804" x2="383.132" y1="161.4" y2="407.835" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset=".5" stopColor="#71c2ff" />
              <stop offset="1" stopColor="#39aaff" />
            </linearGradient>
          </defs>
          <path
            fill="url(#A)"
            d="M259.804 161.4c-.44 0-1.1 0-1.32.44l-.44 1.1L332.04 440.21a192.039 192.039 0 0 0 86.77-74.437L261.125 162.06a1.762 1.762 0 0 0-1.321-.661z"
            opacity=".5"
            paintOrder="stroke markers fill"
          />
          <path
            fill="#2185d0"
            d="M255.3 71.8a192 192 0 0 0-162 294l160.1-207c.5-.6 1.5-1 2.6-1s2 .4 2.6 1l160 207a192 192 0 0 0 29.4-102c0-106-86-192-192-192a192 192 0 0 0-.7 0z"
            paintOrder="stroke markers fill"
          />
        </svg>
      </a>
      {slug && (
        <Link href={slugPath(slug, "/about")} prefetch={false} className="text-light-emphasis">
          About
        </Link>
      )}
      {privacyPolicy !== "disabled" &&
        (privacyPolicy === "policy-contents" ? (
          <Link href="/privacy" target="_blank" prefetch={false} className="text-light-emphasis">
            Privacy
          </Link>
        ) : (
          <a href={privacyPolicy} target="_blank" rel="noopener" className="text-light-emphasis">
            Privacy
          </a>
        ))}
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={`btn ${theme === "light" ? "btn-light" : "btn-dark"} rounded-circle px-2`}
      >
        <FontAwesomeIcon icon={theme === "light" ? faSun : faMoon} />
      </button>
    </footer>
  );
}

export default Footer;
