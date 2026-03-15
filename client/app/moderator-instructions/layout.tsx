import Link from "next/link";
import "./moderator-instructions.css";
import { C, IS_CUBING_CONTESTS_INSTANCE } from "~/helpers/constants";

type Props = {
  children: React.ReactNode;
};

function ModeratorInstructionsLayout({ children }: Props) {
  if (!IS_CUBING_CONTESTS_INSTANCE)
    return <span className="text-center">THIS PAGE IS ONLY SUPPORTED FOR CUBINGCONTESTS.COM</span>;

  return (
    <div className="px-3 pb-4">
      <h2 className="mb-4 text-center">Moderator Instructions</h2>

      <div className="mb-4">
        <p>
          If you don't already have moderator privileges and you would like to hold unofficial events at a WCA
          competition (A) or create an unofficial competition (B) or meetup (C), follow these steps:
        </p>
        <div style={{ height: "1rem" }} />
        <p>
          1.{" "}
          <Link href="/register" prefetch={false}>
            Create an account
          </Link>{" "}
          and send an email to {process.env.NEXT_PUBLIC_CONTACT_EMAIL} with the following information (exception: for
          WCA competitions, <b>you must first wait until the competition has been announced</b> on the WCA website):
        </p>
        <p>1.1. Username</p>
        <p>1.2. WCA ID</p>
        <p>1.3. Name of the competition/meetup you are organizing</p>
        <p>
          1.4. Your Discord username (if you're on the Cubing Contests{" "}
          <a href={C.discordServerLink} target="_blank" rel="noopener noreferrer">
            Discord server
          </a>
          )
        </p>
        <p>
          2. Once an admin grants you moderator privileges and ties your competitor profile to your account, log out and
          log back in. You will now be able to find the "Mod Dashboard" button in the user section in the navbar. Go to
          that page.
        </p>
      </div>

      {children}
    </div>
  );
}

export default ModeratorInstructionsLayout;
