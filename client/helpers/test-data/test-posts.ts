import type { InsertPost } from "~/server/db/schema/posts.ts";

export const testPosts: InsertPost[] = [
  {
    postId: "test-post1",
    title: "Welcome to the Super Mario Bros. Speedrunning Community!",
    content:
      "Welcome to the official blog of the Super Mario Bros. Speedrunning Community! Whether you're a seasoned speedrunner or just starting out, this is the place to stay updated on the latest competitions, records, and community news. Join us and be part of the excitement!",
    date: new Date("2025-11-13T19:15:03.000Z"),
  },
  {
    postId: "test-post2",
    title: "Announcing the Next Monthly Speedrunning Tournament",
    content:
      "Mark your calendars! The next Monthly Speedrunning Tournament is just around the corner. This is your chance to compete against the best in the community, set new records, and earn bragging rights. Don't miss out—sign up today and show off your skills!",
    date: new Date("2025-12-17T19:15:14.000Z"),
  },
  {
    postId: "test-post3",
    title: "How to Submit Your Speedrun for Verification",
    content:
      "Submitting your speedrun for verification is easier than ever! Follow our step-by-step guide to ensure your run is properly recorded and submitted. Whether you're aiming for a world record or just sharing your personal best, we've got you covered.",
    date: new Date("2025-12-29T19:16:39.000Z"),
  },
  {
    postId: "test-post4",
    title: "Celebrating the Latest World Records",
    content:
      "The Super Mario Bros. Speedrunning Community is thrilled to announce the latest world records! These incredible feats of skill and precision push the boundaries of what's possible in speedrunning. Check out the full leaderboards and see who's at the top!",
    date: new Date("2026-01-07T19:23:37.000Z"),
  },
  {
    postId: "test-post5",
    title: "Tips and Tricks for Faster Runs",
    content:
      "Looking to shave seconds off your time? Our latest blog post is packed with tips and tricks from top speedrunners. Learn about advanced techniques, glitches, and strategies to help you achieve your fastest runs yet.",
    date: new Date("2026-01-28T19:24:07.000Z"),
  },
  {
    postId: "test-post6",
    title: "Community Spotlight: Meet the Top Speedrunners",
    content:
      "Ever wondered who the fastest speedrunners in the community are? In this edition of Community Spotlight, we're highlighting the top players and their incredible achievements. Get to know the faces behind the records and learn their secrets to success.",
    date: new Date("2026-02-20T19:27:15.000Z"),
  },
  {
    postId: "test-post7",
    title: "How to Organize a Speedrunning Event",
    content:
      "Interested in organizing your own speedrunning event? Our guide walks you through everything you need to know, from setting up the competition to managing submissions and announcing winners. Share your love for speedrunning with the community!",
    date: new Date("2026-03-19T00:00:00.000Z"),
  },
  {
    postId: "test-post8",
    title: "Upcoming Community Meetups and Hangouts",
    content:
      "Join us for our next Community Meetup and hang out with fellow speedrunners! Whether you're here to compete, learn, or just chat, these events are a great way to connect with the community. Check out the schedule and mark your calendar!",
    date: new Date("2026-04-05T15:59:22.345Z"),
  },
  {
    postId: "test-post9",
    title: "Incredible Performance at San Diego Invitational!",
    content:
      "Last week, the most prestigious speedrunning competition took place in San Diego. This time, we saw performance unlike ever before!",
    date: new Date("2026-04-09T00:00:00.000Z"),
  },
  {
    postId: "test-post10",
    title: "Reserve Your Spot at Our Next Bootcamp",
    content:
      "Interested in boosting your speedrunning skills? Don't miss your chance to reserve a spot at our next bootcamp, where some of the best speedrunners in the World will share their expertise with those of you aspiring to one day beat them at their own game!",
    date: new Date("2026-04-14T13:00:00.00Z"),
  },
].map((p) => ({ organizationId: "default", ...p }));
