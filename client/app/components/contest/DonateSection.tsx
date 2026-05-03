import DonateButton from "~/app/components/DonateButton.tsx";
import { C } from "~/helpers/constants.ts";

function DonateSection() {
  return (
    <>
      <h3 className="rr-basic-heading">Support RecordRanks</h3>
      <p>
        {process.env.NEXT_PUBLIC_PROJECT_NAME} is powered by RecordRanks, an{" "}
        <a href={C.sourceCodeLink} target="_blank" rel="noreferrer">
          open source project
        </a>{" "}
        created for the benefit of hobby sports communities. You can contribute through the{" "}
        <a href={C.rrDonationLink} target="_blank" rel="noreferrer">
          Ko-fi page
        </a>{" "}
        without creating an account. All contributions directly support the development of RecordRanks.
      </p>
      <DonateButton />
    </>
  );
}

export default DonateSection;
