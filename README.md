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

You will have to set up a local `.env` file for releasing your Docker image and another one on your server, which will contain all of your secrets. Note that you **MUST NOT** use your local `.env` file or the `.env.example` file in production, because using the default values will leave your instance **completely exposed**. To set up a local `.env` file, follow these steps:

1. Create `.env` file: `cp .env.example .env`
2. Set `PROD_HOSTNAME` to your custom domain name without the protocol (e.g. `mysportsproject.com`)
3. Set `NEXT_PUBLIC_PROJECT_NAME` to your project name (e.g. `My Sports Project`)
4. Set `PROJECT_ID` to an alphanumeric ID for your project, in lowercase (e.g. `mysportsproject`)
5. Set your Dockerhub username in `DOCKER_IMAGE_NAME` (e.g. `dockerhubuser/$PROJECT_ID-nextjs`)

To set up a production `.env` file, follow these steps:

1. Create `.env` file: `cp .env.example .env`
2. Generate secure secret keys for Supabase: `./bin/supabase-generate-keys.sh`
3. Comment out all variables marked with `for local development` and uncomment variables marked with `for production`
4. Set `RR_DB_USERNAME` to a custom username for the DB user
5. Set `RR_DB_PASSWORD` to a secure password
6. Set `PROD_HOSTNAME` to your custom domain name without the protocol (e.g. `mysportsproject.com`)
7. Set `PROJECT_ID` to an alphanumeric ID for your project, in lowercase (e.g. `mysportsproject`)
8. Set `EMAIL_HOST`, `EMAIL_USERNAME` and `EMAIL_PASSWORD` to your transactional email credentials
9. Set your Dockerhub username in `DOCKER_IMAGE_NAME` (e.g. `dockerhubuser/$PROJECT_ID-nextjs`)

### Icon

RecordRanks does not have a default icon available, so before you publish your Docker image, you'll have to create your own at `client/app/favicon.ico` (used by the browser) and `client/public/favicon.png` (used in the navbar). These files are gitignored in this repo, but they get included in the Docker image when you build it.

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

Once you have a [Dockerhub](https://hub.docker.com/) account, you can publish your Docker image using the script (see the Scripts section).

### DNS records

Before you deploy the instance, you will have to set up your DNS records:

1. Set up `A`, `AAAA` and `NS` records to point from your domain name to your server.
2. Set up `A`, `AAAA` and `NS` records to point from `supabase.yourdomainname.com` to your server.
3. Set up records to enable email sending using your domain name (follow the instructions from your transactional email provider\*).
4. If you would like to use a custom email address using your domain name, set up the records for that (follow the instructions from your email service provider\*).

\* Note: a transactional email provider is not the same as an email service provider; the former enables you to send automated emails from your domain name (e.g. no-reply@yourdomainname.com), while the latter enables you to create an email inbox, often with the ability to set up a custom domain name (e.g. inquiries@yourdomainname.com).

The `docker-compose.rr.yml` file includes a Caddy reverse proxy, which handles proxying for both Next JS and Supabase.

### Firewall

If you're using a firewall on your server, make sure the following ports are not being blocked: `80`, `443`, `443/udp`, `465`.

### Starting production server

To deploy your RecordRanks instance, you will have to install the following dependencies on your Linux server: `git`, `docker`, `node`, `pnpm` and `rsync` (for backups). It is also recommended that you [set up a better logging driver](https://docs.docker.com/engine/logging/configure/) for Docker. Here's an example `/etc/docker/daemon.json` file you could use for your server (don't forget to restart Docker and any running containers after setting it up):

```json
{
  "log-driver": "local",
  "log-opts": {
    "mode": "non-blocking"
  }
}
```

There are two Docker Compose files used for deploying an instance: one for starting Supabase and one for starting RecordRanks. Run the following command to start Supabase:

```sh
docker compose -f docker-compose.supabase.yml up -d
```

The Scripts section shows how to start RecordRanks.

### Supabase

RecordRanks instances run alongside self-hosted Supabase, which provides the database, blob storage, a sysadmin dashboard (Supabase Studio), and more. The credentials for accessing Supabase Studio are in the `.env` file.

#### RecordRanks settings

RecordRanks is designed to be customizable, allowing certain features to be enabled or disabled. The values in the `settings` table can be edited directly to customize some of the functionality of the instance. Only edit the `value` column (keep in mind the values cannot be `null`). The `description` column includes descriptions for each setting.

#### Blog

There is a simple blog feature, but it currently has no UI for creating posts within RecordRanks itself. For now, blog posts can be published directly using the `posts` table. A post has the following schema:

- `postId`: a unique text ID for the post; this is used in the URL for the post (e.g. `our-first-announcement`)
- `title`: the title of the post, shown at the top of the page
- `content`: the content of the post (Markdown supported)
- `date`: the date of the post (this doesn't have to be the same as the creation date; `createdAt` is a separate auto-generated column)
- `createdBy`: the user ID of the author; it's expected that there is a person tied to the user (get this value from the `users` table)

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

1. Open Supabase Studio and go to Integrations -> Vault -> Secrets.
2. Add secret "service_role_key" with the value being the same as `SERVICE_ROLE_KEY` in your `.env` file.
3. Add secret "base_url" with the value being the same as `NEXT_PUBLIC_BASE_URL` in your `.env` file.
4. Go to SQL Editor and run the query "Schedule public export cron job".

**NOTE**: while this cron job will be visible in Integrations -> Cron, it cannot be edited directly, due to the complex value of the authorization header; only activated and deactivated. To change the cron job, delete it and create it again following step 4.

To test this locally with `test-prod.sh`, use `http://rr-nextjs:<NEXTJS_PORT>` as the base URL value in Supabase Vault, temporarily add `shared` network to the `supabase-db` container in `docker-compose.supabase.yml`, change the value of `SUPABASE_PUBLIC_URL` to `http://supabase-kong:<KONG_HTTP_PORT>` in the `.env` file and restart the `supabase-db` container. You can also test it with the normal local dev environment using this command:

```sh
curl -X POST -H "Authorization: Bearer <SERVICE_ROLE_KEY>" http://localhost:<NEXTJS_PORT>/api/export/create-public-export
```

For debugging you can look at the history of cron job runs in Integrations -> Cron and at the contents of the `net` schema in Table Editor.

The export files can be imported with Supabase, but keep in mind that they don't include the data for some internal columns. The import process for each table is as follows:

1. Go to "SQL Editor" and run these queries to remove all entries from the table and temporarily remove the constraint on the `id` column:

```sql
DELETE FROM record_ranks.<table>;
-- Note that this query also affects tables that have references to this table because of CASCADE
ALTER TABLE record_ranks.<table> DROP CONSTRAINT <table>_pkey CASCADE;
ALTER TABLE record_ranks.<table> ALTER COLUMN id DROP IDENTITY IF EXISTS;
```

2. Go to "Table Editor" and select schema `record_ranks`.
3. Click "Insert" -> "Import data from CSV" -> select the CSV file -> "Import data".
4. Run these queries to add back the constraint for the `id` column:

```sql
ALTER TABLE record_ranks.<table> ADD CONSTRAINT <table>_pkey PRIMARY KEY (id);
ALTER TABLE record_ranks.<table> ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;
ALTER SEQUENCE record_ranks.<table>_id_seq RESTART WITH <ID of the last entry + 1>;
```

Note that, due to limitations with the CSV format, empty string values are represented as `__EMPTY_STRING__`. You can (and should) safely change those values to `""` (empty string).

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
6. Start Next JS: `pnpm dev`

Note that Next JS accesses the variables in `.env` through the `client/.env` symlink, which means that it won't be able to detect changes made to the source file. If you change any values in `.env`, simply restart `pnpm dev`.

This repo uses Biome for formatting and linting. If you intend to contribute code to this repo, please install the Biome extension for your IDE and set it up as your default formatter.

Go to `localhost:3000` to see the website. Go to `localhost:8000` to open Supabase Studio. The default username is `supabase` and the password is `rr` (you can see this in the `.env` file). The default ports can be overridden in the `.env` file.

Global constants are located in `constants.ts`. Keep in mind that some features are only enabled for the Cubing Contests instance (via the `IS_CUBING_CONTESTS_INSTANCE` constant).

Please note that some Supabase features, like analytics and cron only work in a production environment. You can test the production environment using the `test-prod.sh` script (see the Supabase section for more information).

To stop Supabase, use this command: `docker compose -f docker-compose.supabase.yml down`.

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
type              = "single" for top single rankings; "average" for top average rankings; "all-avg-formats" for top average rankings, including Mo3 and Ao5 formats
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
