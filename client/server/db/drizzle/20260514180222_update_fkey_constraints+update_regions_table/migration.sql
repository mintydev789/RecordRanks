CREATE TYPE "record_ranks"."region_type" AS ENUM('country', 'region', 'super-region', 'meta-region');--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" DROP CONSTRAINT "contests_region_code_regions_code_fkey";--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" DROP CONSTRAINT "persons_region_code_regions_code_fkey";--> statement-breakpoint
ALTER TABLE "record_ranks"."results" DROP CONSTRAINT "results_event_id_events_event_id_fkey";--> statement-breakpoint
ALTER TABLE "record_ranks"."results" DROP CONSTRAINT "results_region_code_regions_code_fkey";--> statement-breakpoint
ALTER TABLE "record_ranks"."results" DROP CONSTRAINT "results_competition_id_contests_competition_id_fkey";--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" DROP CONSTRAINT "rounds_competition_id_contests_competition_id_fkey";--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" DROP CONSTRAINT "rounds_event_id_events_event_id_fkey";--> statement-breakpoint
ALTER TABLE "record_ranks"."collective_solutions" DROP CONSTRAINT "collective_solutions_event_id_events_event_id_fkey";--> statement-breakpoint
DROP TABLE "record_ranks"."access_tokens";--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" DROP CONSTRAINT "contests_competition_id_key";--> statement-breakpoint
ALTER TABLE "record_ranks"."events" DROP CONSTRAINT "events_event_id_key";--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" DROP CONSTRAINT "persons_wca_id_key";--> statement-breakpoint
ALTER TABLE "record_ranks"."posts" DROP CONSTRAINT "posts_post_id_key";--> statement-breakpoint
ALTER TABLE "record_ranks"."record_configs" DROP CONSTRAINT "record_configs_label_key";--> statement-breakpoint
ALTER TABLE "record_ranks"."regions" DROP CONSTRAINT "regions_code_key";--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" DROP CONSTRAINT "competition_id_event_id_round_number";--> statement-breakpoint
-- CUSTOM ADDITION FOR RECORDRANKS! {
DELETE FROM "record_ranks"."regions";--> statement-breakpoint
UPDATE "record_ranks"."results" SET "super_region_code" = 'XE' WHERE "super_region_code" = 'EUROPE';--> statement-breakpoint
UPDATE "record_ranks"."results" SET "super_region_code" = 'XN' WHERE "super_region_code" = 'NORTH_AMERICA';--> statement-breakpoint
UPDATE "record_ranks"."results" SET "super_region_code" = 'XS' WHERE "super_region_code" = 'SOUTH_AMERICA';--> statement-breakpoint
UPDATE "record_ranks"."results" SET "super_region_code" = 'XA' WHERE "super_region_code" = 'ASIA';--> statement-breakpoint
UPDATE "record_ranks"."results" SET "super_region_code" = 'XO' WHERE "super_region_code" = 'OCEANIA';--> statement-breakpoint
UPDATE "record_ranks"."results" SET "super_region_code" = 'XF' WHERE "super_region_code" = 'AFRICA';--> statement-breakpoint
-- }
ALTER TABLE "record_ranks"."regions" ADD COLUMN "type" "record_ranks"."region_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."settings" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ALTER COLUMN "region_code" SET DATA TYPE text USING "region_code"::text;--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" ALTER COLUMN "region_code" SET DATA TYPE text USING "region_code"::text;--> statement-breakpoint
ALTER TABLE "record_ranks"."record_configs" ALTER COLUMN "record_type_id" SET DATA TYPE text USING "record_type_id"::text;--> statement-breakpoint
ALTER TABLE "record_ranks"."regions" ALTER COLUMN "code" SET DATA TYPE text USING "code"::text;--> statement-breakpoint
ALTER TABLE "record_ranks"."regions" ALTER COLUMN "super_region_code" SET DATA TYPE text USING "super_region_code"::text;--> statement-breakpoint
ALTER TABLE "record_ranks"."regions" ALTER COLUMN "super_region_record_type" SET DATA TYPE text USING "super_region_record_type"::text;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ALTER COLUMN "region_code" SET DATA TYPE text USING "region_code"::text;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ALTER COLUMN "regional_single_record" SET DATA TYPE text USING "regional_single_record"::text;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ALTER COLUMN "regional_average_record" SET DATA TYPE text USING "regional_average_record"::text;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ADD CONSTRAINT "unique_contests_competition_id" UNIQUE("organization_id","competition_id");--> statement-breakpoint
ALTER TABLE "record_ranks"."events" ADD CONSTRAINT "unique_events_event_id" UNIQUE("organization_id","event_id");--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" ADD CONSTRAINT "unique_persons_wca_id" UNIQUE("organization_id","wca_id");--> statement-breakpoint
ALTER TABLE "record_ranks"."posts" ADD CONSTRAINT "unique_posts_post_id" UNIQUE("organization_id","post_id");--> statement-breakpoint
ALTER TABLE "record_ranks"."record_configs" ADD CONSTRAINT "unique_record_configs" UNIQUE("organization_id","record_type_id","category");--> statement-breakpoint
ALTER TABLE "record_ranks"."regions" ADD CONSTRAINT "unique_regions_code" UNIQUE("organization_id","code");--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" ADD CONSTRAINT "unique_rounds" UNIQUE("organization_id","competition_id","event_id","round_number");--> statement-breakpoint
-- CUSTOM ADDITION FOR RECORDRANKS! {
INSERT INTO "record_ranks"."regions" ("organization_id", "name", "short_name", "code", "type", "super_region_code", "super_region_record_type") VALUES
  ('default', 'Afghanistan', NULL, 'AF', 'country', 'XA', 'AsR'),
  ('default', 'Albania', NULL, 'AL', 'country', 'XE', 'ER'),
  ('default', 'Algeria', NULL, 'DZ', 'country', 'XF', 'AfR'),
  ('default', 'Andorra', NULL, 'AD', 'country', 'XE', 'ER'),
  ('default', 'Angola', NULL, 'AO', 'country', 'XF', 'AfR'),
  ('default', 'Antigua and Barbuda', NULL, 'AG', 'country', 'XN', 'NAR'),
  ('default', 'Argentina', NULL, 'AR', 'country', 'XS', 'SAR'),
  ('default', 'Armenia', NULL, 'AM', 'country', 'XE', 'ER'),
  ('default', 'Australia', NULL, 'AU', 'country', 'XO', 'OcR'),
  ('default', 'Austria', NULL, 'AT', 'country', 'XE', 'ER'),
  ('default', 'Azerbaijan', NULL, 'AZ', 'country', 'XE', 'ER'),
  ('default', 'Bahamas', NULL, 'BS', 'country', 'XN', 'NAR'),
  ('default', 'Bahrain', NULL, 'BH', 'country', 'XA', 'AsR'),
  ('default', 'Bangladesh', NULL, 'BD', 'country', 'XA', 'AsR'),
  ('default', 'Barbados', NULL, 'BB', 'country', 'XN', 'NAR'),
  ('default', 'Belarus', NULL, 'BY', 'country', 'XE', 'ER'),
  ('default', 'Belgium', NULL, 'BE', 'country', 'XE', 'ER'),
  ('default', 'Belize', NULL, 'BZ', 'country', 'XN', 'NAR'),
  ('default', 'Benin', NULL, 'BJ', 'country', 'XF', 'AfR'),
  ('default', 'Bhutan', NULL, 'BT', 'country', 'XA', 'AsR'),
  ('default', 'Bolivia', NULL, 'BO', 'country', 'XS', 'SAR'),
  ('default', 'Bosnia and Herzegovina', NULL, 'BA', 'country', 'XE', 'ER'),
  ('default', 'Botswana', NULL, 'BW', 'country', 'XF', 'AfR'),
  ('default', 'Brazil', NULL, 'BR', 'country', 'XS', 'SAR'),
  ('default', 'Brunei', NULL, 'BN', 'country', 'XA', 'AsR'),
  ('default', 'Bulgaria', NULL, 'BG', 'country', 'XE', 'ER'),
  ('default', 'Burkina Faso', NULL, 'BF', 'country', 'XF', 'AfR'),
  ('default', 'Burundi', NULL, 'BI', 'country', 'XF', 'AfR'),
  ('default', 'Cabo Verde', NULL, 'CV', 'country', 'XF', 'AfR'),
  ('default', 'Cambodia', NULL, 'KH', 'country', 'XA', 'AsR'),
  ('default', 'Cameroon', NULL, 'CM', 'country', 'XF', 'AfR'),
  ('default', 'Canada', NULL, 'CA', 'country', 'XN', 'NAR'),
  ('default', 'Central African Republic', NULL, 'CF', 'country', 'XF', 'AfR'),
  ('default', 'Chad', NULL, 'TD', 'country', 'XF', 'AfR'),
  ('default', 'Chile', NULL, 'CL', 'country', 'XS', 'SAR'),
  ('default', 'China', NULL, 'CN', 'country', 'XA', 'AsR'),
  ('default', 'Colombia', NULL, 'CO', 'country', 'XS', 'SAR'),
  ('default', 'Comoros', NULL, 'KM', 'country', 'XF', 'AfR'),
  ('default', 'Costa Rica', NULL, 'CR', 'country', 'XN', 'NAR'),
  ('default', 'Côte d''Ivoire', NULL, 'CI', 'country', 'XF', 'AfR'),
  ('default', 'Croatia', NULL, 'HR', 'country', 'XE', 'ER'),
  ('default', 'Cuba', NULL, 'CU', 'country', 'XN', 'NAR'),
  ('default', 'Cyprus', NULL, 'CY', 'country', 'XE', 'ER'),
  ('default', 'Czechia', NULL, 'CZ', 'country', 'XE', 'ER'),
  ('default', 'Democratic Republic of the Congo', 'DRC', 'CD', 'country', 'XF', 'AfR'),
  ('default', 'Denmark', NULL, 'DK', 'country', 'XE', 'ER'),
  ('default', 'Djibouti', NULL, 'DJ', 'country', 'XF', 'AfR'),
  ('default', 'Dominica', NULL, 'DM', 'country', 'XN', 'NAR'),
  ('default', 'Dominican Republic', NULL, 'DO', 'country', 'XN', 'NAR'),
  ('default', 'Ecuador', NULL, 'EC', 'country', 'XS', 'SAR'),
  ('default', 'Egypt', NULL, 'EG', 'country', 'XF', 'AfR'),
  ('default', 'El Salvador', NULL, 'SV', 'country', 'XN', 'NAR'),
  ('default', 'Equatorial Guinea', NULL, 'GQ', 'country', 'XF', 'AfR'),
  ('default', 'Eritrea', NULL, 'ER', 'country', 'XF', 'AfR'),
  ('default', 'Estonia', NULL, 'EE', 'country', 'XE', 'ER'),
  ('default', 'Eswatini', NULL, 'SZ', 'country', 'XF', 'AfR'),
  ('default', 'Ethiopia', NULL, 'ET', 'country', 'XF', 'AfR'),
  ('default', 'Fiji', NULL, 'FJ', 'country', 'XO', 'OcR'),
  ('default', 'Finland', NULL, 'FI', 'country', 'XE', 'ER'),
  ('default', 'France', NULL, 'FR', 'country', 'XE', 'ER'),
  ('default', 'Gabon', NULL, 'GA', 'country', 'XF', 'AfR'),
  ('default', 'Gambia', NULL, 'GM', 'country', 'XF', 'AfR'),
  ('default', 'Georgia', NULL, 'GE', 'country', 'XE', 'ER'),
  ('default', 'Germany', NULL, 'DE', 'country', 'XE', 'ER'),
  ('default', 'Ghana', NULL, 'GH', 'country', 'XF', 'AfR'),
  ('default', 'Greece', NULL, 'GR', 'country', 'XE', 'ER'),
  ('default', 'Grenada', NULL, 'GD', 'country', 'XN', 'NAR'),
  ('default', 'Guatemala', NULL, 'GT', 'country', 'XN', 'NAR'),
  ('default', 'Guinea', NULL, 'GN', 'country', 'XF', 'AfR'),
  ('default', 'Guinea Bissau', NULL, 'GW', 'country', 'XF', 'AfR'),
  ('default', 'Guyana', NULL, 'GY', 'country', 'XS', 'SAR'),
  ('default', 'Haiti', NULL, 'HT', 'country', 'XN', 'NAR'),
  ('default', 'Honduras', NULL, 'HN', 'country', 'XN', 'NAR'),
  ('default', 'Hong Kong', NULL, 'HK', 'country', 'XA', 'AsR'),
  ('default', 'Hungary', NULL, 'HU', 'country', 'XE', 'ER'),
  ('default', 'Iceland', NULL, 'IS', 'country', 'XE', 'ER'),
  ('default', 'India', NULL, 'IN', 'country', 'XA', 'AsR'),
  ('default', 'Indonesia', NULL, 'ID', 'country', 'XA', 'AsR'),
  ('default', 'Iran', NULL, 'IR', 'country', 'XA', 'AsR'),
  ('default', 'Iraq', NULL, 'IQ', 'country', 'XA', 'AsR'),
  ('default', 'Ireland', NULL, 'IE', 'country', 'XE', 'ER'),
  ('default', 'Israel', NULL, 'IL', 'country', 'XE', 'ER'),
  ('default', 'Italy', NULL, 'IT', 'country', 'XE', 'ER'),
  ('default', 'Jamaica', NULL, 'JM', 'country', 'XN', 'NAR'),
  ('default', 'Japan', NULL, 'JP', 'country', 'XA', 'AsR'),
  ('default', 'Jordan', NULL, 'JO', 'country', 'XA', 'AsR'),
  ('default', 'Kazakhstan', NULL, 'KZ', 'country', 'XA', 'AsR'),
  ('default', 'Kenya', NULL, 'KE', 'country', 'XF', 'AfR'),
  ('default', 'Kiribati', NULL, 'KI', 'country', 'XO', 'OcR'),
  ('default', 'Kosovo', NULL, 'XK', 'country', 'XE', 'ER'),
  ('default', 'Kuwait', NULL, 'KW', 'country', 'XA', 'AsR'),
  ('default', 'Kyrgyzstan', NULL, 'KG', 'country', 'XA', 'AsR'),
  ('default', 'Laos', NULL, 'LA', 'country', 'XA', 'AsR'),
  ('default', 'Latvia', NULL, 'LV', 'country', 'XE', 'ER'),
  ('default', 'Lebanon', NULL, 'LB', 'country', 'XA', 'AsR'),
  ('default', 'Lesotho', NULL, 'LS', 'country', 'XF', 'AfR'),
  ('default', 'Liberia', NULL, 'LR', 'country', 'XF', 'AfR'),
  ('default', 'Libya', NULL, 'LY', 'country', 'XF', 'AfR'),
  ('default', 'Liechtenstein', NULL, 'LI', 'country', 'XE', 'ER'),
  ('default', 'Lithuania', NULL, 'LT', 'country', 'XE', 'ER'),
  ('default', 'Luxembourg', NULL, 'LU', 'country', 'XE', 'ER'),
  ('default', 'Macau', NULL, 'MO', 'country', 'XA', 'AsR'),
  ('default', 'Madagascar', NULL, 'MG', 'country', 'XF', 'AfR'),
  ('default', 'Malawi', NULL, 'MW', 'country', 'XF', 'AfR'),
  ('default', 'Malaysia', NULL, 'MY', 'country', 'XA', 'AsR'),
  ('default', 'Maldives', NULL, 'MV', 'country', 'XA', 'AsR'),
  ('default', 'Mali', NULL, 'ML', 'country', 'XF', 'AfR'),
  ('default', 'Malta', NULL, 'MT', 'country', 'XE', 'ER'),
  ('default', 'Marshall Islands', NULL, 'MH', 'country', 'XO', 'OcR'),
  ('default', 'Mauritania', NULL, 'MR', 'country', 'XF', 'AfR'),
  ('default', 'Mauritius', NULL, 'MU', 'country', 'XF', 'AfR'),
  ('default', 'Mexico', NULL, 'MX', 'country', 'XN', 'NAR'),
  ('default', 'Micronesia', NULL, 'FM', 'country', 'XO', 'OcR'),
  ('default', 'Moldova', NULL, 'MD', 'country', 'XE', 'ER'),
  ('default', 'Monaco', NULL, 'MC', 'country', 'XE', 'ER'),
  ('default', 'Mongolia', NULL, 'MN', 'country', 'XA', 'AsR'),
  ('default', 'Montenegro', NULL, 'ME', 'country', 'XE', 'ER'),
  ('default', 'Morocco', NULL, 'MA', 'country', 'XF', 'AfR'),
  ('default', 'Mozambique', NULL, 'MZ', 'country', 'XF', 'AfR'),
  ('default', 'Myanmar', NULL, 'MM', 'country', 'XA', 'AsR'),
  ('default', 'Namibia', NULL, 'NA', 'country', 'XF', 'AfR'),
  ('default', 'Nauru', NULL, 'NR', 'country', 'XO', 'OcR'),
  ('default', 'Nepal', NULL, 'NP', 'country', 'XA', 'AsR'),
  ('default', 'Netherlands', NULL, 'NL', 'country', 'XE', 'ER'),
  ('default', 'New Zealand', NULL, 'NZ', 'country', 'XO', 'OcR'),
  ('default', 'Nicaragua', NULL, 'NI', 'country', 'XN', 'NAR'),
  ('default', 'Niger', NULL, 'NE', 'country', 'XF', 'AfR'),
  ('default', 'Nigeria', NULL, 'NG', 'country', 'XF', 'AfR'),
  ('default', 'North Korea', NULL, 'KP', 'country', 'XA', 'AsR'),
  ('default', 'North Macedonia', NULL, 'MK', 'country', 'XE', 'ER'),
  ('default', 'Norway', NULL, 'NO', 'country', 'XE', 'ER'),
  ('default', 'Oman', NULL, 'OM', 'country', 'XA', 'AsR'),
  ('default', 'Pakistan', NULL, 'PK', 'country', 'XA', 'AsR'),
  ('default', 'Palau', NULL, 'PW', 'country', 'XO', 'OcR'),
  ('default', 'Palestine', NULL, 'PS', 'country', 'XA', 'AsR'),
  ('default', 'Panama', NULL, 'PA', 'country', 'XN', 'NAR'),
  ('default', 'Papua New Guinea', NULL, 'PG', 'country', 'XO', 'OcR'),
  ('default', 'Paraguay', NULL, 'PY', 'country', 'XS', 'SAR'),
  ('default', 'Peru', NULL, 'PE', 'country', 'XS', 'SAR'),
  ('default', 'Philippines', NULL, 'PH', 'country', 'XA', 'AsR'),
  ('default', 'Poland', NULL, 'PL', 'country', 'XE', 'ER'),
  ('default', 'Portugal', NULL, 'PT', 'country', 'XE', 'ER'),
  ('default', 'Qatar', NULL, 'QA', 'country', 'XA', 'AsR'),
  ('default', 'Republic of the Congo', NULL, 'CG', 'country', 'XF', 'AfR'),
  ('default', 'Romania', NULL, 'RO', 'country', 'XE', 'ER'),
  ('default', 'Russia', NULL, 'RU', 'country', 'XE', 'ER'),
  ('default', 'Rwanda', NULL, 'RW', 'country', 'XF', 'AfR'),
  ('default', 'Saint Kitts and Nevis', NULL, 'KN', 'country', 'XN', 'NAR'),
  ('default', 'Saint Lucia', NULL, 'LC', 'country', 'XN', 'NAR'),
  ('default', 'Saint Vincent and the Grenadines', NULL, 'VC', 'country', 'XN', 'NAR'),
  ('default', 'Samoa', NULL, 'WS', 'country', 'XO', 'OcR'),
  ('default', 'San Marino', NULL, 'SM', 'country', 'XE', 'ER'),
  ('default', 'São Tomé and Príncipe', NULL, 'ST', 'country', 'XF', 'AfR'),
  ('default', 'Saudi Arabia', NULL, 'SA', 'country', 'XA', 'AsR'),
  ('default', 'Senegal', NULL, 'SN', 'country', 'XF', 'AfR'),
  ('default', 'Serbia', NULL, 'RS', 'country', 'XE', 'ER'),
  ('default', 'Seychelles', NULL, 'SC', 'country', 'XF', 'AfR'),
  ('default', 'Sierra Leone', NULL, 'SL', 'country', 'XF', 'AfR'),
  ('default', 'Singapore', NULL, 'SG', 'country', 'XA', 'AsR'),
  ('default', 'Slovakia', NULL, 'SK', 'country', 'XE', 'ER'),
  ('default', 'Slovenia', NULL, 'SI', 'country', 'XE', 'ER'),
  ('default', 'Solomon Islands', NULL, 'SB', 'country', 'XO', 'OcR'),
  ('default', 'Somalia', NULL, 'SO', 'country', 'XF', 'AfR'),
  ('default', 'South Africa', NULL, 'ZA', 'country', 'XF', 'AfR'),
  ('default', 'South Korea', NULL, 'KR', 'country', 'XA', 'AsR'),
  ('default', 'South Sudan', NULL, 'SS', 'country', 'XF', 'AfR'),
  ('default', 'Spain', NULL, 'ES', 'country', 'XE', 'ER'),
  ('default', 'Sri Lanka', NULL, 'LK', 'country', 'XA', 'AsR'),
  ('default', 'Sudan', NULL, 'SD', 'country', 'XF', 'AfR'),
  ('default', 'Suriname', NULL, 'SR', 'country', 'XS', 'SAR'),
  ('default', 'Sweden', NULL, 'SE', 'country', 'XE', 'ER'),
  ('default', 'Switzerland', NULL, 'CH', 'country', 'XE', 'ER'),
  ('default', 'Syria', NULL, 'SY', 'country', 'XA', 'AsR'),
  ('default', 'Taiwan', NULL, 'TW', 'country', 'XA', 'AsR'),
  ('default', 'Tajikistan', NULL, 'TJ', 'country', 'XA', 'AsR'),
  ('default', 'Tanzania', NULL, 'TZ', 'country', 'XF', 'AfR'),
  ('default', 'Thailand', NULL, 'TH', 'country', 'XA', 'AsR'),
  ('default', 'Timor-Leste', NULL, 'TL', 'country', 'XA', 'AsR'),
  ('default', 'Togo', NULL, 'TG', 'country', 'XF', 'AfR'),
  ('default', 'Tonga', NULL, 'TO', 'country', 'XO', 'OcR'),
  ('default', 'Trinidad and Tobago', NULL, 'TT', 'country', 'XN', 'NAR'),
  ('default', 'Tunisia', NULL, 'TN', 'country', 'XF', 'AfR'),
  ('default', 'Turkmenistan', NULL, 'TM', 'country', 'XA', 'AsR'),
  ('default', 'Tuvalu', NULL, 'TV', 'country', 'XO', 'OcR'),
  ('default', 'Türkiye', NULL, 'TR', 'country', 'XE', 'ER'),
  ('default', 'Uganda', NULL, 'UG', 'country', 'XF', 'AfR'),
  ('default', 'Ukraine', NULL, 'UA', 'country', 'XE', 'ER'),
  ('default', 'United Arab Emirates', 'UAE', 'AE', 'country', 'XA', 'AsR'),
  ('default', 'United Kingdom', 'UK', 'GB', 'country', 'XE', 'ER'),
  ('default', 'United States', 'USA', 'US', 'country', 'XN', 'NAR'),
  ('default', 'Uruguay', NULL, 'UY', 'country', 'XS', 'SAR'),
  ('default', 'Uzbekistan', NULL, 'UZ', 'country', 'XA', 'AsR'),
  ('default', 'Vanuatu', NULL, 'VU', 'country', 'XO', 'OcR'),
  ('default', 'Vatican City', NULL, 'VA', 'country', 'XE', 'ER'),
  ('default', 'Venezuela', NULL, 'VE', 'country', 'XS', 'SAR'),
  ('default', 'Vietnam', NULL, 'VN', 'country', 'XA', 'AsR'),
  ('default', 'Yemen', NULL, 'YE', 'country', 'XA', 'AsR'),
  ('default', 'Zambia', NULL, 'ZM', 'country', 'XF', 'AfR'),
  ('default', 'Zimbabwe', NULL, 'ZW', 'country', 'XF', 'AfR'),
  ('default', 'Multiple Countries (Asia)', 'Asia', 'XA', 'super-region', NULL, 'AsR'),
  ('default', 'Multiple Countries (Europe)', 'Europe', 'XE', 'super-region', NULl, 'ER'),
  ('default', 'Multiple Countries (Africa)', 'Africa', 'XF', 'super-region', NULL, 'AfR'),
  ('default', 'Multiple Countries (Oceania)', 'Oceania', 'XO', 'super-region', NULL, 'OcR'),
  ('default', 'Multiple Countries (North America)', 'North America', 'XN', 'super-region', NULL, 'NAR'),
  ('default', 'Multiple Countries (South America)', 'South America', 'XS', 'super-region', NULL, 'SAR'),
  ('default', 'Multiple Countries (Americas)', 'Americas', 'XM', 'meta-region', NULL, NULL),
  ('default', 'Multiple Countries (World)', 'World', 'XW', 'meta-region', NULL, NULL);
--> statement-breakpoint
UPDATE "record_ranks"."settings" SET "organization_id" = 'default' WHERE "key" = 'video-based-results-contact-email';--> statement-breakpoint
UPDATE "record_ranks"."settings" SET "organization_id" = 'default' WHERE "key" = 'home-page-description';--> statement-breakpoint
UPDATE "record_ranks"."settings" SET "organization_id" = 'default' WHERE "key" = 'about-page-content';--> statement-breakpoint
UPDATE "record_ranks"."settings" SET "organization_id" = 'default' WHERE "key" = 'rules-page-content';--> statement-breakpoint
UPDATE "record_ranks"."settings" SET "organization_id" = 'default' WHERE "key" = 'moderator-instructions-page-content';--> statement-breakpoint
UPDATE "record_ranks"."settings" SET "organization_id" = 'default' WHERE "key" = 'moderator-instructions-description';--> statement-breakpoint
UPDATE "record_ranks"."settings" SET "organization_id" = 'default' WHERE "key" = 'video-based-results-instructions';--> statement-breakpoint
UPDATE "record_ranks"."settings" SET "organization_id" = 'default' WHERE "key" = 'member-request-instructions';--> statement-breakpoint
UPDATE "record_ranks"."settings" SET "organization_id" = 'default' WHERE "key" = 'contest-types';--> statement-breakpoint
-- }
ALTER TABLE "record_ranks"."contests" ADD CONSTRAINT "contests_region_code_fk" FOREIGN KEY ("organization_id","region_code") REFERENCES "record_ranks"."regions"("organization_id","code") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" ADD CONSTRAINT "persons_region_code_fk" FOREIGN KEY ("organization_id","region_code") REFERENCES "record_ranks"."regions"("organization_id","code") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."regions" ADD CONSTRAINT "regions_super_region_code_fk" FOREIGN KEY ("organization_id","super_region_code") REFERENCES "record_ranks"."regions"("organization_id","code") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_event_id_fk" FOREIGN KEY ("organization_id","event_id") REFERENCES "record_ranks"."events"("organization_id","event_id") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_region_code_fk" FOREIGN KEY ("organization_id","region_code") REFERENCES "record_ranks"."regions"("organization_id","code") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_super_region_code_fk" FOREIGN KEY ("organization_id","super_region_code") REFERENCES "record_ranks"."regions"("organization_id","code") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_competition_id_fk" FOREIGN KEY ("organization_id","competition_id") REFERENCES "record_ranks"."contests"("organization_id","competition_id") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" ADD CONSTRAINT "rounds_competition_id_fk" FOREIGN KEY ("organization_id","competition_id") REFERENCES "record_ranks"."contests"("organization_id","competition_id") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" ADD CONSTRAINT "rounds_event_id_fk" FOREIGN KEY ("organization_id","event_id") REFERENCES "record_ranks"."events"("organization_id","event_id") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."settings" ADD CONSTRAINT "settings_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id");--> statement-breakpoint
DROP TYPE "record_ranks"."record_type";--> statement-breakpoint
DROP TYPE "record_ranks"."super_region_code";--> statement-breakpoint
DROP TYPE "record_ranks"."super_region_record_type";