"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { CheckboxField, SelectField, TextareaField, TextField } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import type { MissionEditorTaxonomy } from "@/features/admin/mission-editor/types";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

const ageGroups = ["2-3", "4-5", "6-8"] as const;

export function MissionBasicFields({ taxonomy }: { taxonomy: MissionEditorTaxonomy }) {
  const content = useContent("admin");
  const form = useFormContext<AdminMissionDraft>();
  const selectedAgeGroups = useWatch({ control: form.control, name: "ageGroups" });
  const secondarySkillIds = useWatch({ control: form.control, name: "secondarySkillIds" });

  function toggleArrayValue<T extends string>(
    name: "ageGroups" | "secondarySkillIds",
    values: readonly T[],
    value: T,
  ) {
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
    form.setValue(name, next as never, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <Card className="rounded-2xl p-5 shadow-sm">
      <h2 className="text-xl font-black">
        {contentText(content, "missionEditor.basicTitle", "1. Thông tin cơ bản")}
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextField
          label={contentText(content, "missionEditor.title", "Tiêu đề")}
          placeholder="Ví dụ: Thám tử dấu chân"
          registration={form.register("title")}
          error={form.formState.errors.title?.message}
        />
        <TextField
          label={contentText(content, "missionEditor.slug", "Slug")}
          placeholder="tham-tu-dau-chan"
          registration={form.register("slug", {
            onChange: (event) => {
              event.target.value = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
            },
          })}
          error={form.formState.errors.slug?.message}
        />
        <TextField
          label={contentText(content, "missionEditor.subtitle", "Phụ đề")}
          placeholder="Một câu phụ đề ngắn gọn"
          registration={form.register("subtitle")}
          error={form.formState.errors.subtitle?.message}
          containerClassName="md:col-span-2"
        />
        <TextField
          label={contentText(content, "missionEditor.shortDescription", "Mô tả ngắn")}
          placeholder="Mô tả ngắn hiển thị trên thẻ nhiệm vụ"
          registration={form.register("shortDescription")}
          error={form.formState.errors.shortDescription?.message}
          containerClassName="md:col-span-2"
        />
        <TextareaField
          label={contentText(content, "missionEditor.storyIntro", "Câu chuyện dẫn dắt")}
          placeholder="Câu chuyện dẫn dắt bé vào nhiệm vụ..."
          rows={5}
          registration={form.register("storyIntro")}
          error={form.formState.errors.storyIntro?.message}
          containerClassName="md:col-span-2"
        />
        <SelectField
          label={contentText(content, "missionEditor.world", "Thế giới")}
          registration={form.register("worldId")}
          error={form.formState.errors.worldId?.message}
          options={taxonomy.worlds.map((world) => ({ value: world.id, label: world.title }))}
        />
        <SelectField
          label={contentText(content, "missionEditor.primarySkill", "Kỹ năng chính")}
          registration={form.register("primarySkillId")}
          error={form.formState.errors.primarySkillId?.message}
          options={taxonomy.skills.map((skill) => ({ value: skill.id, label: skill.title }))}
        />
        <SelectField
          label={contentText(content, "missionEditor.reward", "Phần thưởng")}
          registration={form.register("rewardBadgeId", {
            setValueAs: (value) => (value === "" ? null : value),
          })}
          options={[
            { value: "", label: contentText(content, "missionEditor.noReward", "Không có huy hiệu") },
            ...taxonomy.badges.map((badge) => ({ value: badge.id, label: badge.name })),
          ]}
        />
        <TextField
          type="number"
          min={1}
          max={30}
          label={contentText(content, "missionEditor.minutes", "Thời gian (phút)")}
          registration={form.register("estimatedMinutes", { valueAsNumber: true })}
          error={form.formState.errors.estimatedMinutes?.message}
        />
        <SelectField
          label={contentText(content, "missionEditor.difficulty", "Độ khó")}
          registration={form.register("difficulty", { valueAsNumber: true })}
          options={[1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: `Mức ${value}` }))}
        />
        <TextField
          label={contentText(content, "missionEditor.cover", "Ảnh bìa URL")}
          placeholder="/assets/cards/mission-cover.png"
          registration={form.register("coverUrl")}
          error={form.formState.errors.coverUrl?.message}
          containerClassName="md:col-span-2"
        />
      </div>
      <fieldset className="mt-4">
        <legend className="text-sm font-black">
          {contentText(content, "missionEditor.ageGroups", "Nhóm tuổi")}
        </legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {ageGroups.map((ageGroup) => (
            <label
              key={ageGroup}
              className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 font-bold"
            >
              <input
                type="checkbox"
                checked={selectedAgeGroups.includes(ageGroup)}
                onChange={() => toggleArrayValue("ageGroups", selectedAgeGroups, ageGroup)}
              />
              {ageGroup} tuổi
            </label>
          ))}
        </div>
        {form.formState.errors.ageGroups?.message ? (
          <p role="alert" className="mt-2 text-sm font-bold text-red-700">
            {form.formState.errors.ageGroups.message}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-sm font-black">
          {contentText(content, "missionEditor.secondarySkills", "Kỹ năng phụ")}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {taxonomy.skills.map((skill) => (
            <label
              key={skill.id}
              className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-bold"
            >
              <input
                type="checkbox"
                checked={secondarySkillIds.includes(skill.id)}
                onChange={() => toggleArrayValue("secondarySkillIds", secondarySkillIds, skill.id)}
              />
              {skill.title}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-wrap gap-4">
        <CheckboxField
          label={contentText(content, "missionEditor.allowReplay", "Cho phép chơi lại")}
          registration={form.register("allowReplay")}
        />
        <CheckboxField
          label={contentText(content, "missionEditor.randomize", "Đảo đáp án khi chơi")}
          registration={form.register("randomizeAnswers")}
        />
      </div>
    </Card>
  );
}
