INSERT INTO "world_age_groups" ("world_id", "age_group")
SELECT DISTINCT "missions"."world_id", "mission_age_groups"."age_group"
FROM "missions"
INNER JOIN "mission_age_groups"
  ON "mission_age_groups"."mission_id" = "missions"."id"
ON CONFLICT ("world_id", "age_group") DO NOTHING;
