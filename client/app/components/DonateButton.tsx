"use client";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { C } from "~/helpers/constants.ts";

function DonateButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const changeIsDialogOpen = (open: boolean) => {
    if (open) dialogRef.current!.showModal();
    else dialogRef.current!.close();

    setIsDialogOpen(open);
  };

  return (
    <>
      <button type="button" onClick={() => changeIsDialogOpen(true)} className="rr-kofi-button">
        <img
          src="https://storage.ko-fi.com/cdn/cup-border.png"
          height={20}
          alt="Ko-fi donations"
          style={{ marginInlineEnd: "0.4rem" }}
        />
        Support the project
      </button>

      <dialog
        ref={dialogRef}
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          padding: 0,
          border: 0,
          borderRadius: "10px",
          background: "#f9f9f9",
        }}
      >
        <div style={{ position: "relative" }}>
          <button type="button" onClick={() => changeIsDialogOpen(false)} className="rr-kofi-close-button">
            <FontAwesomeIcon icon={faXmark} size="sm" style={{ color: "#222" }} />
          </button>
          {isDialogOpen && (
            <iframe
              id="kofiframe"
              src="https://ko-fi.com/mintydev/?hidefeed=true&widget=true&embed=true&preview=true"
              style={{ width: "400px", maxWidth: "90vw", margin: 0, padding: 0, border: 0, background: "#f9f9f9" }}
              height="560"
              title="RecordRanks Ko-fi"
            />
          )}
          <a
            href={C.rrDonationLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", marginBottom: "1rem", textAlign: "center" }}
          >
            Fallback link
          </a>
        </div>
      </dialog>
    </>
  );
}

export default DonateButton;
