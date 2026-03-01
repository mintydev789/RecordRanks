# RecordRanks

RecordRanks is a sports organization and ranking system. It's a web application that provides tools for organizing competitions for different kinds of competitive sports, selecting events (fully customizable), writing rules, managing competitor information, entering live results, and automated global rankings and records for each event. It also has support for user roles for streamlined moderation to ensure the integrity of the results, it supports results submitted with video evidence, and it supports World, continental and national records, including for team events.

RecordRanks can be deployed on any Linux server and runs as a web application, with self-hosted Supabase providing the database, logs, storage, cron, and a rich suite of system administration tools. It also automates the creation of daily backups of DB data.

## Screenshots

Below are some screenshots from one of the RecordRanks instances: [Cubing Contests](https://cubingcontests.com/) (the first ever instance).

<img src="https://supabase.cubingcontests.com/storage/v1/object/public/public_bucket/assets/screenshots/cubing_contests_1.jpg" width="500"/>

<img src="https://supabase.cubingcontests.com/storage/v1/object/public/public_bucket/assets/screenshots/cubing_contests_2.jpg" width="500"/>

<img src="https://supabase.cubingcontests.com/storage/v1/object/public/public_bucket/assets/screenshots/cubing_contests_3.jpg" width="500"/>

<img src="https://supabase.cubingcontests.com/storage/v1/object/public/public_bucket/assets/screenshots/cubing_contests_4.jpg" width="500"/>

<img src="https://supabase.cubingcontests.com/storage/v1/object/public/public_bucket/assets/screenshots/cubing_contests_5.jpg" width="500"/>

<img src="https://supabase.cubingcontests.com/storage/v1/object/public/public_bucket/assets/screenshots/cubing_contests_6.jpg" width="500"/>

<div style="display: flex; flex-wrap: wrap; gap: 2rem;">
  <img src="https://supabase.cubingcontests.com/storage/v1/object/public/public_bucket/assets/screenshots/cubing_contests_7.jpg" width="300"/>
  <img src="https://supabase.cubingcontests.com/storage/v1/object/public/public_bucket/assets/screenshots/cubing_contests_8.jpg" width="300"/>
</div>

## Deployment

**WIP**

<!--
To deploy an instance of RecordRanks, you have to first set up a Linux server and obtain a custom domain name. You'll also need a [Dockerhub](https://hub.docker.com/) account to host your custom Docker images. Then, you can follow this guide to publish your custom RecordRanks image and deploy it on your server.

### Environment variables

There are several environment variables you'll have to set up. First, copy the `.env.example` file and name it `.env`. Then follow the steps below to set all of the required variables. **THIS IS REQUIRED**, because using the default values will leave your instance completely exposed, and it most likely won't work anyways.

1.

CONSIDER THE VARIABLES UNIQUE TO DEV/PROD!!!

### Icon

RecordRanks does not have a default icon available, so you'll have to create your own at `client/app/favicon.ico`. This file is gitignored in this repo.

### Creating the Docker image

Once you have a [Dockerhub](https://hub.docker.com/) account, you can publish your Docker image.

```sh
./bin/release-new-image.sh
```

### DNS records

### Supabase

#### Database



#### Storage

CREATE PUBLIC BUCKET CALLED public_bucket
CREATE POLICY WITH TEMPLATE "Give access to a nested folder called admin/assets only to a specific user"
Policy name: Give access to assets folder
Allowed operation: (select all)
Target roles: authenticated
Policy definition: bucket_id = 'public_bucket' AND (storage.foldername(name))[1] = 'assets' AND (select auth.uid()::text) = '<LEAVE PRE-FILLED USER ID>'

Then create "assets" folder at the root of the bucket.

#### Public exports

To enable automatic public exports that run at regular intervals, you have to set up a cron job with Supabase:

1. Open Supabase Studio and go to Integrations -> Vault.
2. Add secret "service_role_key" with the value being the same as SERVICE_ROLE_KEY in your .env file.
3. Add secret "base_url" with the value being the same as NEXT_PUBLIC_BASE_URL in your .env file.
4. Go to SQL Editor and run the following query:

```sql
select
  cron.schedule(
    'Create public export',
    '0 0 * * *', -- at 00:00 every night; you can set a different schedule, using the cron syntax
    $$
    select
      net.http_post(
        url:=(select decrypted_secret from vault.decrypted_secrets where name = 'base_url') || '/api/export/create-public-export',
        headers:=jsonb_build_object(
          'Content-type', 'application/json',
          'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
        ),
        timeout_milliseconds:=5000
      ) as request_id;
    $$
  );
```

**NOTE**: while this cron job will be visible in Integrations -> Cron, it cannot be edited directly, due to the complex value of the authorization header; only activated and deactivated. To change the cron job, delete it and create it again following step 4.

To test this with test-prod.sh, use http://rr-nextjs:3000 as the base URL value in Supabase Vault, temporarily add "shared" network to the supabase-db container in the Supabase Docker Compose file, change the value of SUPABASE_PUBLIC_URL to http://supabase-kong:8000 in the .env file and restart the supabase-db container. You can also test it with the normal local dev environment using this command (make sure to replace <SERVICE_ROLE_KEY> with the value in your .env file):

```sh
curl -X POST -H "Authorization: Bearer <SERVICE_ROLE_KEY>" http://localhost:3000/api/export/create-public-export
```

For debugging you can look at the history of cron job runs in Integrations -> Cron and at the contents of the net schema in Table Editor.
-->

## Scripts

There are several custom scripts located in the `bin` directory. These should be executed from the root of the project with `./bin/<script>`.

| Script                   | Description                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `start-prod.sh`          | Start project in production (excluding Supabase). To restart a project that's already running, add `-r`.         |
| `test-prod.sh`           | Start project locally for testing, similar to the production environment. To clean up running project, add `-c`. |
| `supabase-reset.sh`      | Reset Supabase (remove containers and delete DB data and storage).                                               |
| `release-new-version.sh` | Release new version of RecordRanks (pushes to Codeberg).                                                         |
| `release-new-image.sh`   | Create Docker image for the Next JS app and publish it.                                                          |
| `create-full-backup.sh`  | Create encrypted backup of the Supabase database and storage.                                                    |

## Development

**WIP**

<!--
This project uses Next JS for the frontend, Hono for the backend, and Mongo DB as the database. To set up the development environment, install Deno, Node & NPM (won't be required once the legacy Nest JS backend is fully migrated to Hono) and Docker, clone this repository, and then run this command from the root of the project:

```sh
./bin/start-dev.sh
```

That is the script you can always run when developing Cubing Contests. It starts the Next JS frontend [c], Hono backend [s], legacy Nest JS backend [l], and database [d] in parallel using concurrently (the [c/s/l/d] prefix indicates where the logs are coming from). This script also checks that you have the Nest JS CLI installed globally (with NPM), sets up the .env files, and installs the NPM packages in both the `client` and the `server` directories.

The code in this repo has been formatted with `deno format`. It would be best for you to use this too while developing for this repo. You can install the Deno VS Code extension, set up Deno as your default formatter, and set it up to format on save (or whatever behavior you prefer).

Keep in mind that when Handlebars files (the `.hbs` files used for the email templates) are edited, the dev environment has to be restarted for those changes to take effect.

Go to `localhost:4000` to see the website. Go to `localhost:8081` to open Mongo Express (makes it much easier to work with the database). The username is `admin` and the password is `cc`. `localhost:5000` is used by the legacy Nest JS backend, and `localhost:8000` is used by the Hono backend. The default ports can be overridden in the environment variables (see below).

### Mock data

If your DB is empty, the backend will fill the events collection with official WCA events, some unofficial events, including the removed WCA events, some Extreme BLD events, and some miscellaneous events.

It will also create an admin user with the username `admin`, a moderator with the username `mod`, and a regular user with no additional privileges with the username `user`. The password for all of these is `rr`. Several mock competitors will also be created, and each

### Environment variables

Environment variables are specified in `.env` in the root of the project, and are automatically sourced by Docker. Simply copy the `.env.example` file, rename it to `.env` (which is not tracked by git in this repo), and change the values of the variables. This works the same way in production and in development.

TO-DO

[link description](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
MOVE THE EXPLANATIONS FROM .env.production HERE

**Keep in mind that the `TZ` environment variable is crucial for date processing (i.e. validating dates, schedules, etc.). The time zone being set to UTC on the backend simplifies some of the date-related code (Note: all dates are stored in UTC in the DB). Code running in the browser does not have this benefit and must account for the user's local time zone, since the Javascript Date object does not.**

In development the `server/.env.dev` file is used for environment variables; it is automatically read by Nest JS. The `start-dev.sh` script copies `.env` to `server/.env.dev` automatically. In production this file is ignored, and the container's environment variables (coming from the `.env` file) are used instead.

Frontend environment variables are specified in the `client/.env.[environment]` file. This file is automatically read by Next JS. See that file for more details. Some of the environment variables must be set during the container's build process as build arguments.

### Starting all containers

To start all containers locally, including the frontend, the backend and the database, run this command:

```sh
./script/start-prod.sh --dev # -d also works
```

To clean up everything, run this command:

```sh
./script/start-prod.sh --dev --cleanup
```

# NOTES (TODO: CLEAN THIS UP!!!!!!!!!!!)

Logging into DB with admin privileges locally:

docker exec -it supabase-db psql postgresql://supabase_admin:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}
-->

<!--
## User roles

## Record configuration
-->

## API endpoints

### Events

To get the list of events, use the endpoint below:

```
/api/events
```

### Rankings

To get the rankings, use the endpoint below:

```
/api/results/rankings/[eventId]/[singleOrAvg]/[category]?show=[show]&region=[region]&topN=[topN]

eventId           = ID of the event
singleOrAvg       = "single" for top single rankings; "average" for top average rankings
category          = record category; accepts values: "competitions" | "meetups" | "video-based-results" | "all"
show (optional)   = "persons" for top persons rankings (default); "results" for top results rankings
region (optional) = region (shows World rankings if omitted); accepts values: 2 letter country ISO code | "AFRICA" | "ASIA" | "EUROPE" | "OCEANIA" | "NORTH_AMERICA" | "SOUTH_AMERICA"
topN (optional)   = how many top results to return; number between 1 and 100,000; defaults to 100
```

### External data entry

**WIP**

<!--
Cubing Contests supports entering attempts using an external device or service.
The API is mostly the same as the
[WCA Live API](https://github.com/thewca/wca-live/wiki/Entering-attempts-with-external-devices),
but the selection of the competitor is different. You can either use
`registrantId`, which is the unique numerical ID of the competitor in the CC
database, or `wcaId`, which, naturally, is a string representation of the number
of pickles the competitor has eaten in the current year (non-case-sensitive).

To get the API key, go to the edit page of the contest and click "Get Access
Token". Keep in mind that you will not be able to retrieve the key again after
leaving that screen. You will only be able to generate a new one, which will
invalidate the old key.

#### Entering a single attempt

```
POST https://cubingcontests.com/api/enter-attempt

{
  "competitionWcaId": "MyCompetition2023",
  "eventId": "fto",
  "roundNumber": 1,
  "registrantId": 5, // or "wcaId": "2005DEMO01"
  "attemptNumber": 1,
  "attemptResult": 1025
}
```

#### Entering multiple attempts

```
POST https://cubingcontests.com/api/enter-results

{
  "competitionWcaId": "MyCompetition2023",
  "eventId": "fto",
  "roundNumber": 1,
  "results": [{
    "registrantId": 5,
    "attempts": [
      { "result": 1025 },
      { "result": 1100 },
      { "result": 1265 },
      { "result": 1010 },
      { "result": 905 }
    ]
  }, {
    "wcaId": "2005DEMO01",
    "attempts": [
      { "result": 1305 },
      { "result": 1170 },
      { "result": 1250 },
      { "result": 1120 },
      { "result": 1400 }
    ]
  }]
}
```

**Please note** that external data entry for team events is not supported yet.
Also, keep in mind that even if you submit a result that doesn't fit the cutoff
or is higher than the time limit, it will be changed to DNF or ignored if the
competitor did not make cutoff.
-->
