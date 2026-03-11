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

<img src="https://supabase.cubingcontests.com/storage/v1/object/public/public_bucket/assets/screenshots/cubing_contests_7.jpg" width="500"/>

<img src="https://supabase.cubingcontests.com/storage/v1/object/public/public_bucket/assets/screenshots/cubing_contests_8.jpg" width="500"/>

## Deployment

To deploy an instance of RecordRanks, you have to first set up a Linux server and obtain a custom domain name. You'll also need a [Dockerhub](https://hub.docker.com/) account to host your custom Docker images. Then, you can follow this guide to publish your custom RecordRanks image and deploy it on your server.

### Environment variables

**WIP**

<!--
There are several environment variables you'll have to set up. First, copy the `.env.example` file and name it `.env`. Then follow the steps below to set all of the required variables. **THIS IS REQUIRED**, because using the default values will leave your instance **completely exposed** (and it most likely won't work anyways).

1. Run `./bin/supabase-generate-keys.sh`.

CONSIDER THE VARIABLES UNIQUE TO DEV/PROD!!!
-->

### Icon

RecordRanks does not have a default icon available, so you'll have to create your own at `client/app/favicon.ico` (used by the browser) and `client/public/favicon.png` (used in the RecordRanks navbar). These files are gitignored in this repo. They get included in the Docker image when you build it.

To create a `favicon.ico` file from an `icon.svg` file, use the following commands from the root directory of the repo (`inkscape` and `imagemagick` required):

```sh
inkscape -w 16 -h 16 -o 16.png icon.svg
inkscape -w 32 -h 32 -o 32.png icon.svg
inkscape -w 48 -h 48 -o 48.png icon.svg

magick 16.png 32.png 48.png client/app/favicon.ico
rm 16.png 32.png 48.png

identify client/app/favicon.ico
```

You should see an output like this after the last command:

```sh
favicon.ico[0] ICO 16x16 16x16+0+0 8-bit sRGB 0.000u 0:00.000
favicon.ico[1] ICO 32x32 32x32+0+0 8-bit sRGB 0.000u 0:00.005
favicon.ico[2] ICO 48x48 48x48+0+0 8-bit sRGB 15086B 0.000u 0:00.005
```

To create a `favicon.png` file from an `icon.svg` file, use the following command:

```sh
inkscape -w 256 -h 256 -o client/public/favicon.png icon.svg
```

### Creating the Docker image

Once you have a [Dockerhub](https://hub.docker.com/) account, you can publish your Docker image using the script (see the Scripts section). Make sure to set `DOCKER_IMAGE_NAME` in your `.env` file first, specifying your image name, which should also include your username (e.g. `dockerhubuser/myproject-nextjs`).

### DNS records

Before you deploy the instance, you will have to set up your DNS records:

1. Set up `A`, `AAAA` and `NS` records to point from your domain name to your server.
2. Set up `A`, `AAAA` and `NS` records to point from `supabase.yourdomainname.com` to your server.
3. Set up records to enable email sending using your domain name (follow the instructions from your transactional email provider\*).
4. If you would like to use a custom email address using your domain name, set up the records for that (follow the instructions from your email service provider\*).

\* Note: a transactional email provider is not the same as an email service provider; the former enables you to send automated emails from your domain name (e.g. no-reply@yourdomainname.com), while the latter enables you to create an email inbox, often with the ability to set up a custom domain name (e.g. inquiries@yourdomainname.com).

The `docker-compose.rr.yml` file includes a Caddy reverse proxy, which handles proxying for both Next JS and Supabase.

### Starting production server

To deploy your RecordRanks instance, you will have to install the following dependencies on your Linux server: `git`, `docker`, `node`, `pnpm` and `rsync` (for backups). You will also need to set up a `.env` file, which will be different from the `.env` file you used locally to publish your Docker image (see the Environment variables section).

There are two Docker Compose files used for deploying an instance: one for starting Supabase and one for starting RecordRanks. Run the following command to start Supabase:

```sh
docker compose -f docker-compose.supabase.yml up -d
```

The Scripts section shows how to start RecordRanks.

### Supabase

RecordRanks instances run alongside self-hosted Supabase, which provides the database, blob storage, a sysadmin dashboard, and more.

#### Storage

Blob storade is used for hosting public image files (although you can also use it for other files). Follow these instructions to set up a storage bucket for your public assets:

1. Create a public bucket with the name `public_bucket`.
2. Create a policy using the template "Give access to a nested folder called admin/assets only to a specific user" and set it up like this:

- **Policy name**: Give access to assets folder
- **Allowed operation**: (select all)
- **Target roles**: authenticated
- **Policy definition**: `bucket_id = 'public_bucket' AND (storage.foldername(name))[1] = 'assets' AND (select auth.uid()::text) = '<LEAVE PRE-FILLED USER ID>'`

3. Create an `assets` folder at the root of the bucket.

You can then place any assets you want to be publicly accessible via the URL in that folder. If you would like to have link image previews for certain pages, you can create an `assets/screenshots` folder and place the screenshots there. Search for `screenshots/` in the codebase to see which pages have link image previews.

#### Public exports

To enable automatic public exports that run at regular intervals, you have to set up a cron job with Supabase:

1. Open Supabase Studio and go to Integrations -> Vault.
2. Add secret "service_role_key" with the value being the same as `SERVICE_ROLE_KEY` in your .env file.
3. Add secret "base_url" with the value being the same as `NEXT_PUBLIC_BASE_URL` in your .env file.
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

To test this locally with `test-prod.sh`, use `http://rr-nextjs:3000` as the base URL value in Supabase Vault, temporarily add `shared` network to the `supabase-db` container in `docker-compose.supabase.yml`, change the value of `SUPABASE_PUBLIC_URL` to `http://supabase-kong:8000` in the `.env` file and restart the `supabase-db` container. You can also test it with the normal local dev environment using this command (make sure to replace `<SERVICE_ROLE_KEY>` with the value in your `.env` file):

```sh
curl -X POST -H "Authorization: Bearer <SERVICE_ROLE_KEY>" http://localhost:3000/api/export/create-public-export
```

For debugging you can look at the history of cron job runs in Integrations -> Cron and at the contents of the `net` schema in Table Editor.

## Scripts

There are several custom scripts located in the `bin` directory. These should be executed from the root of the project with `./bin/<script>`.

| Script                   | Description                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `start-prod.sh`          | Start RecordRanks in production. If it's already running, add `-r` to restart it instead.                        |
| `test-prod.sh`           | Start project locally for testing, similar to the production environment. To clean up running project, add `-c`. |
| `supabase-reset.sh`      | Reset Supabase (remove containers and delete DB data and storage).                                               |
| `release-new-version.sh` | Release new version of RecordRanks (pushes to Codeberg).                                                         |
| `release-new-image.sh`   | Create Docker image for the Next JS app and publish it.                                                          |
| `create-full-backup.sh`  | Create encrypted backup of the Supabase database and storage.                                                    |

## Development

This project uses Next JS as a full-stack web application and self-hosted Supabase for various backend utilities. These instructions assume you're using Linux (or WSL). To set up the development environment, install Node, PNPM and Docker, and then follow these steps:

1. Create a `.env` file: `cp .env.example .env` (skip this step if you already have a `.env` file; **DO NOT** use the example `.env` in production!)
2. Start Supabase: `docker compose -f docker-compose.supabase.yml up -d`
3. `cd client`
4. Install dependencies: `pnpm install` (skip this step if `package.json5` hasn't changed since last time)
5. Run DB migrations: `pnpm db:migrate` (skip this step if there are no new migrations since last time)
6. Start Next JS: `pnpm dev` (automatically copies the `.env` file to `client/.env.local`)

This repo uses Biome for formatting and linting. If you intend to contribute code to this repo, please install the Biome extension for your IDE and set it up as your default formatter.

Go to `localhost:3000` to see the website. Go to `localhost:8000` to open Supabase Studio. The default username is `supabase` and the password is `rr` (you can see this in the `.env` file). The default ports can be overridden in the `.env` file.

To stop Supabase, run `docker compose -f docker-compose.supabase.yml down`.

### Mock data

If your DB is empty, the backend will fill the events table with the data from `eventsStub.ts`. It will also seed some test users (you can see the details in `client/instrumentation.ts` -> `testUsers`) and some test persons.

### Accessing DB container directly

To access the DB container with admin privileges directly, use this command (make sure to use the values from `.env`):

```sh
docker exec -it supabase-db psql postgresql://supabase_admin:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}
```

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
Results can be entered directly via the API. This can be used to enter results into a RecordRanks instance programmatically from a third-party website or an external data entry device. The schema is mostly the same as the [WCA Live API](https://github.com/thewca/wca-live/wiki/Entering-attempts-with-external-devices), but the selection of the competitor is different. You can either use `registrantId`, which is the unique numerical ID of the competitor in the database, or `wcaId`, which, naturally, is a string representation of the number of pickles the competitor has eaten in the current calendar year (this field is not case-sensitive). For team events `registrantId` should be provided as a string containing comma-separated integers; `wcaId` should be provided as a string containing comma-separated WCA IDs. The order of the competitors for both options is significant.

To get an access token, go to the edit page of a contest you created and click "Get Access Token". Keep in mind that you will **not** be able to retrieve the token again after leaving that screen; you will only be able to generate a new one. All access tokens remain valid until the contest is finished or deleted.

Once you have a token, authorize your API requests with the HTTP header `Authorization: Bearer {TOKEN}`.

#### Entering a single attempt

```
POST /api/enter-attempt

JSON payload: {
  "competitionId": "MyCompetition2023",
  "eventId": "fto",
  "roundNumber": 1,
  // Use one of these two options
  "registrantId": 5, // or "registrantId": "5,24,19" for a team event
  // "wcaId": "2005DEMO01", // or "wcaId": "2005DEMO01,2005DEMO02" for a team event
  "attemptNumber": 1,
  "attemptResult": 1025
}
```

#### Entering multiple attempts and results

```
POST /api/enter-results

JSON payload: {
  "competitionId": "MyCompetition2023",
  "eventId": "fto",
  "roundNumber": 1,
  "results": [{
    "registrantId": 5, // multiple IDs may be provided for team events, like in /enter-attempt
    "attempts": [
      { "result": 1025 },
      { "result": 1100 },
      { "result": 1265 },
      { "result": 1010 },
      { "result": 905 }
    ]
  }, {
    "wcaId": "2005DEMO01", // multiple WCA IDs may be provided for team events, like in /enter-attempt
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
-->
