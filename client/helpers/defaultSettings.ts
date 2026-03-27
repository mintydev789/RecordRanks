import type { InsertSetting } from "~/server/db/schema/settings.ts";

export const defaultSettings: InsertSetting[] = [
  {
    key: "error-logs-contact-email",
    group: "default",
    value: "",
    description: "Contact email address to send error logs to",
  },
  {
    key: "video-based-results-contact-email",
    group: "default",
    value: "",
    description: "Contact email address to send notifications about video-based results to",
  },
  // page-contents
  {
    key: "home-page-description",
    group: "page-contents",
    value: "",
    description: "Description of the project for the home page (Markdown supported)",
  },
  {
    key: "about-page-content",
    group: "page-contents",
    value: "",
    description: "Page content for the about page (Markdown supported)",
  },
  {
    key: "rules-page-content",
    group: "page-contents",
    value: "",
    description: "Page content for the rules page (Markdown supported)",
  },
  {
    key: "video-based-results-instructions",
    group: "page-contents",
    value: `Video-based results can be submitted by any user, but there is a review process involved. Until a video-based result reviewer approves the result, it won't be included in the rankings. The review process works as follows:

1. Find the email thread for the result and check that there are no outstanding issues or questions from the author or other reviewers.
2. Click on the edit result button and open the video in a new tab.
3. Make sure the link doesn't contain any tracking parameters (e.g. \`?source=xyz\`).
4. Check that the video contains information about the competitor to verify that the correct person is selected.
5. Check that the correct event is being done in the video.
6. Check that the date is correct (the date of upload serves as evidence of when the result was achieved, which affects records).
7. Check the time and memorization time, if applicable. The time has to match exactly, but the memorization time can have a few seconds of leeway, since it doesn't affect rankings.
8. If everything is correct, submit and approve. If something is off or you would like to come back to the result later, simply submit to save your changes. You can also just close the tab without submitting.

If you see any errors, correct them before submitting. If you see anything that requires following up with the author, do not approve the result and send an email in the result submission thread. Some other things to note:

- Make sure the rules are being followed (you can find them on the result submission page).
- Don't approve your own results, let another reviewer do it.
- Bo3 and Bo5 formats are not available, since there's no point in them. Mo3 and Ao5 are used instead respectively, since in the video-based result rankings both single and average from the same result are considered.
- Reviewers can set "unknown" time using the \`U\` key when entering a result. This is used for events where simply getting a result is a significant achievement, but the video does not show the entire memorization and/or execution phase. Results like that get ranked last (for multi, points are still considered, but point ties lead to the result being ranked last). This also works on the submission page.
- Reviewers can set "video no longer available" for results that have already been verified, but the video has since been removed. This also works on the submission page.
- Once a result is approved, record results set on the same day or after are cancelled, if they are worse than the approved result. You will see this on the video-based results page after you approve the new record result. E.g. a \`1:00.41\` 4x4x4 Blindfolded ER set on 19.02.2026 cancels a \`1:01.58\` ER set on 23.02.2026.`,
    description:
      "These instructions are shown at the top of the video-based results page. Only video-based result reviewers can see this.",
  },
  // features
  {
    key: "collective-cubing-enabled",
    group: "features",
    value: "false",
    description:
      "Whether or not to enable Collective Cubing - the minigame where people solve a 2x2x2 Rubik's Cube one move at a time on the home page (true/false)",
  },
];
