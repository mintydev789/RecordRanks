"use client";

import Link from "next/link";
import { useContext } from "react";
import FormCheckbox from "~/app/components/form/FormCheckbox.tsx";
import { C } from "~/helpers/constants.ts";
import { MainContext } from "~/helpers/contexts.ts";

function Footer() {
  const { theme, setTheme } = useContext(MainContext);

  return (
    <footer className="d-flex justify-content-center min-vw-100 fs-5 container flex-wrap gap-3 bg-body-tertiary py-3 text-center align-items-center">
      <p className="m-0">
        Powered by
        <a
          href={C.sourceCodeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-flex justify-content-center ms-2 gap-2 align-items-center text-light-emphasis"
        >
          RecordRanks
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Codeberg"
            role="img"
            viewBox="0 0 512 512"
            style={{ width: "1.75rem", height: "1.75rem" }}
          >
            <defs>
              <linearGradient id="A" x1="259.804" x2="383.132" y1="161.4" y2="407.835" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0"></stop>
                <stop offset=".5" stopColor="#71c2ff"></stop>
                <stop offset="1" stopColor="#39aaff"></stop>
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
      </p>
      <Link href="/about" prefetch={false} className="text-light-emphasis">
        About
      </Link>
      <FormCheckbox
        title="Flashbang"
        selected={theme === "light"}
        setSelected={(val) => setTheme(val ? "light" : "dark")}
        noMargin
        small
      />
    </footer>
  );
}

export default Footer;
