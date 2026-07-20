DELETE FROM "mission_age_groups" AS mag
USING "missions" AS m
WHERE mag."mission_id" = m."id"
  AND m."slug" IN (
    'footprint-detective', 'lantern-rhythm', 'forest-shelves',
    'seed-to-tree', 'rainy-picnic', 'train-clues',
    'planet-groups', 'rocket-countdown', 'alien-signal',
    'clown-umbrella', 'picnic-order', 'missing-punchline'
  );--> statement-breakpoint

INSERT INTO "mission_age_groups" ("mission_id", "age_group")
SELECT m."id", mapping."age_group"::"age_group_code"
FROM "missions" AS m
JOIN (
  VALUES
    ('footprint-detective', '6-8'),
    ('footprint-detective', '9-10'),
    ('footprint-detective', '11-12'),
    ('lantern-rhythm', '6-8'),
    ('forest-shelves', '6-8'),
    ('forest-shelves', '9-10'),
    ('forest-shelves', '11-12'),
    ('seed-to-tree', '6-8'),
    ('seed-to-tree', '9-10'),
    ('seed-to-tree', '11-12')
) AS mapping("slug", "age_group") ON mapping."slug" = m."slug"
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "mission_age_groups" ("mission_id", "age_group")
SELECT m."id", mapping."age_group"::"age_group_code"
FROM "missions" AS m
JOIN (
  VALUES
    ('rainy-picnic', '6-8'),
    ('train-clues', '9-10'),
    ('train-clues', '11-12'),
    ('planet-groups', '6-8'),
    ('planet-groups', '9-10'),
    ('planet-groups', '11-12'),
    ('rocket-countdown', '6-8'),
    ('rocket-countdown', '9-10'),
    ('rocket-countdown', '11-12'),
    ('alien-signal', '9-10'),
    ('alien-signal', '11-12'),
    ('clown-umbrella', '6-8'),
    ('clown-umbrella', '9-10'),
    ('clown-umbrella', '11-12'),
    ('picnic-order', '6-8'),
    ('picnic-order', '9-10'),
    ('picnic-order', '11-12'),
    ('missing-punchline', '9-10'),
    ('missing-punchline', '11-12')
) AS mapping("slug", "age_group") ON mapping."slug" = m."slug"
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "world_age_groups" ("world_id", "age_group")
SELECT w."id", ages."age_group"::"age_group_code"
FROM "mission_worlds" AS w
CROSS JOIN (VALUES ('6-8'), ('9-10'), ('11-12')) AS ages("age_group")
WHERE w."slug" IN ('pattern-detective', 'cause-train', 'space-crew', 'logic-laughs')
ON CONFLICT DO NOTHING;--> statement-breakpoint

UPDATE "parent_resources"
SET "age_groups" = '["6-8", "9-10", "11-12"]'::jsonb,
    "updated_at" = now()
WHERE "slug" IN (
  'dong-hanh-khi-be-chua-trung',
  'cau-hoi-mo-cho-tre',
  'khong-tao-ap-luc-thanh-tich'
);--> statement-breakpoint

UPDATE "mission_versions" AS mv
SET "snapshot" = jsonb_set(mv."snapshot", '{ageGroups}', normalized."age_groups", true)
FROM (
  SELECT mag."mission_id",
    jsonb_agg(
      mag."age_group"::text
      ORDER BY CASE mag."age_group"::text WHEN '6-8' THEN 1 WHEN '9-10' THEN 2 ELSE 3 END
    ) AS "age_groups"
  FROM "mission_age_groups" AS mag
  GROUP BY mag."mission_id"
) AS normalized
WHERE normalized."mission_id" = mv."mission_id";--> statement-breakpoint
