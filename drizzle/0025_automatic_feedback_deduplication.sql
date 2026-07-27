ALTER TABLE "system_feedback" ADD COLUMN IF NOT EXISTS "fingerprint" text;
ALTER TABLE "system_feedback" ADD COLUMN IF NOT EXISTS "occurrence_count" integer DEFAULT 1;
ALTER TABLE "system_feedback" ADD COLUMN IF NOT EXISTS "first_seen_at" timestamp with time zone;
ALTER TABLE "system_feedback" ADD COLUMN IF NOT EXISTS "last_seen_at" timestamp with time zone;

UPDATE "system_feedback"
SET
  "occurrence_count" = COALESCE("occurrence_count", 1),
  "first_seen_at" = COALESCE("first_seen_at", "created_at"),
  "last_seen_at" = COALESCE("last_seen_at", "created_at");

UPDATE "system_feedback"
SET "fingerprint" = md5(
  concat_ws(
    chr(31),
    lower(regexp_replace(trim(COALESCE("page_path", '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(COALESCE("context" #>> '{error,name}', '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(COALESCE("context" #>> '{error,message}', '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(COALESCE("context" #>> '{error,digest}', '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(COALESCE("context" #>> '{error,details,method}', '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(COALESCE("context" #>> '{error,details,path}', '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(COALESCE("context" #>> '{error,details,status}', '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(COALESCE("context" #>> '{error,details,code}', '')), '\s+', ' ', 'g'))
  )
)
WHERE "context" ->> 'reportKind' = 'automatic_error'
  AND "fingerprint" IS NULL;

WITH duplicate_groups AS (
  SELECT
    "fingerprint",
    (array_agg("id" ORDER BY "created_at", "id"))[1] AS canonical_id,
    SUM("occurrence_count")::integer AS total_occurrences,
    MIN("first_seen_at") AS first_seen,
    MAX("last_seen_at") AS last_seen,
    CASE
      WHEN bool_or("status" = 'new') THEN 'new'::system_feedback_status
      WHEN bool_or("status" = 'in_progress') THEN 'in_progress'::system_feedback_status
      WHEN bool_or("status" = 'resolved') THEN 'resolved'::system_feedback_status
      ELSE 'dismissed'::system_feedback_status
    END AS merged_status
  FROM "system_feedback"
  WHERE "fingerprint" IS NOT NULL
  GROUP BY "fingerprint"
  HAVING COUNT(*) > 1
), latest_reports AS (
  SELECT DISTINCT ON (feedback."fingerprint")
    feedback."fingerprint",
    feedback."content",
    feedback."page_path",
    feedback."page_title",
    feedback."context",
    feedback."user_id"
  FROM "system_feedback" feedback
  INNER JOIN duplicate_groups groups ON groups."fingerprint" = feedback."fingerprint"
  ORDER BY feedback."fingerprint", feedback."last_seen_at" DESC, feedback."created_at" DESC
)
UPDATE "system_feedback" canonical
SET
  "content" = latest."content",
  "page_path" = latest."page_path",
  "page_title" = latest."page_title",
  "context" = latest."context",
  "user_id" = latest."user_id",
  "occurrence_count" = groups.total_occurrences,
  "first_seen_at" = groups.first_seen,
  "last_seen_at" = groups.last_seen,
  "status" = groups.merged_status,
  "handled_by" = CASE WHEN groups.merged_status IN ('new', 'in_progress') THEN NULL ELSE canonical."handled_by" END,
  "handled_at" = CASE WHEN groups.merged_status IN ('new', 'in_progress') THEN NULL ELSE canonical."handled_at" END,
  "updated_at" = groups.last_seen
FROM duplicate_groups groups
INNER JOIN latest_reports latest ON latest."fingerprint" = groups."fingerprint"
WHERE canonical."id" = groups.canonical_id;

WITH ranked AS (
  SELECT
    "id",
    row_number() OVER (PARTITION BY "fingerprint" ORDER BY "created_at", "id") AS duplicate_rank
  FROM "system_feedback"
  WHERE "fingerprint" IS NOT NULL
)
DELETE FROM "system_feedback" feedback
USING ranked
WHERE feedback."id" = ranked."id"
  AND ranked.duplicate_rank > 1;

ALTER TABLE "system_feedback" ALTER COLUMN "occurrence_count" SET DEFAULT 1;
ALTER TABLE "system_feedback" ALTER COLUMN "occurrence_count" SET NOT NULL;
ALTER TABLE "system_feedback" ALTER COLUMN "first_seen_at" SET DEFAULT now();
ALTER TABLE "system_feedback" ALTER COLUMN "first_seen_at" SET NOT NULL;
ALTER TABLE "system_feedback" ALTER COLUMN "last_seen_at" SET DEFAULT now();
ALTER TABLE "system_feedback" ALTER COLUMN "last_seen_at" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "system_feedback_fingerprint_unique"
  ON "system_feedback" USING btree ("fingerprint");
