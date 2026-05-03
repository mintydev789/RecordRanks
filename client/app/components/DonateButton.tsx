import { C } from "~/helpers/constants.ts";

function DonateButton() {
  return (
    <a
      href={C.rrDonationLink}
      target="_blank"
      rel="noreferrer"
      className="rr-kofi-button text-decoration-none text-white"
    >
      <img
        src="https://storage.ko-fi.com/cdn/cup-border.png"
        height={20}
        alt="Ko-fi donations"
        style={{ marginInlineEnd: "0.4rem" }}
      />
      Support RecordRanks
    </a>
  );
}

export default DonateButton;
