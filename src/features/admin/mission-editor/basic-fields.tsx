"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CheckboxField, SelectField, TextField } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import type { ContentVariableDefinition } from "@/domain/content-variables";
import { ContentTemplateField } from "@/features/admin/content-template-field";
import { MediaUploadField } from "@/features/admin/media-upload-field";
import type { MissionEditorTaxonomy } from "@/features/admin/mission-editor/types";
import { createSlug } from "@/lib/slug";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

const ageGroups = ["6-8", "9-10", "11-12"] as const;

export function MissionBasicFields({
  taxonomy,
  templateVariables,
}: {
  taxonomy: MissionEditorTaxonomy;
  templateVariables: ContentVariableDefinition[];
}) {
  const content = useContent("admin");
  const form = useFormContext<AdminMissionDraft>();
  const title = useWatch({ control: form.control, name: "title" });
  const coverUrl = useWatch({ control: form.control, name: "coverUrl" });
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
        {contentText(content, "missionEditor.basicTitle", "1. Nội dung hiển thị")}
      </h2>
      <p className="mt-1 text-sm text-[#6f6558]">
        Nhập những gì trẻ và phụ huynh sẽ nhìn thấy. Có thể dùng tag để gọi tên bé hoặc chèn dữ liệu hồ sơ.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Controller
          control={form.control}
          name="title"
          render={({ field }) => (
            <ContentTemplateField
              id="mission-title"
              label={contentText(content, "missionEditor.title", "Tên nhiệm vụ")}
              placeholder="Ví dụ: Thám tử dấu chân"
              description="Tên ngắn, dễ hiểu và gợi cảm giác khám phá."
              value={field.value}
              onBlur={field.onBlur}
              onValueChange={(value) => {
                field.onChange(value);
                if (!form.formState.dirtyFields.slug) {
                  form.setValue("slug", createSlug(value.replace(/{{.*?}}/g, "")), { shouldValidate: true });
                }
              }}
              variables={templateVariables}
              error={form.formState.errors.title?.message}
              containerClassName="md:col-span-2"
            />
          )}
        />
        <Controller
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <ContentTemplateField
              id="mission-subtitle"
              label={contentText(content, "missionEditor.subtitle", "Câu giới thiệu ngắn")}
              placeholder="Ví dụ: {{name}} cùng quan sát thật tinh nhé"
              description="Hiển thị ngay dưới tên nhiệm vụ."
              value={field.value}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              variables={templateVariables}
              error={form.formState.errors.subtitle?.message}
              containerClassName="md:col-span-2"
            />
          )}
        />
        <Controller
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <ContentTemplateField
              id="mission-short-description"
              label={contentText(content, "missionEditor.shortDescription", "Mô tả trên thẻ nhiệm vụ")}
              placeholder="{{name}} sẽ làm gì trong nhiệm vụ này?"
              description="Viết một câu giúp phụ huynh và trẻ hiểu nhanh nội dung."
              value={field.value}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              variables={templateVariables}
              error={form.formState.errors.shortDescription?.message}
              containerClassName="md:col-span-2"
            />
          )}
        />
        <Controller
          control={form.control}
          name="storyIntro"
          render={({ field }) => (
            <ContentTemplateField
              id="mission-story-intro"
              label={contentText(content, "missionEditor.storyIntro", "Câu chuyện mở đầu")}
              placeholder="Kể ngắn gọn tình huống để {{name}} muốn bắt đầu khám phá..."
              description="Dùng ngôn ngữ tích cực, đơn giản và phù hợp nhóm tuổi."
              value={field.value}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              variables={templateVariables}
              error={form.formState.errors.storyIntro?.message}
              multiline
              rows={5}
              containerClassName="md:col-span-2"
            />
          )}
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

      <details className="mt-5 rounded-2xl border bg-[#fbf8f2] p-4">
        <summary className="cursor-pointer font-black">Thiết lập nâng cao</summary>
        <p className="mt-1 text-sm text-[#6f6558]">
          Các mục này thường được hệ thống tự tạo. Chỉ thay đổi khi bạn hiểu rõ ảnh hưởng.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField
            label={contentText(content, "missionEditor.slug", "Mã đường dẫn (nâng cao)")}
            placeholder="tham-tu-dau-chan"
            description="Dùng trong đường dẫn nội bộ và không hiển thị cho trẻ."
            registration={form.register("slug", {
              onChange: (event) => {
                event.target.value = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
              },
            })}
            error={form.formState.errors.slug?.message}
          />
          <MediaUploadField
            label={contentText(content, "missionEditor.cover", "Ảnh bìa nhiệm vụ")}
            value={coverUrl}
            onChange={(url) => form.setValue("coverUrl", url, { shouldDirty: true, shouldValidate: true })}
            category="mission-cover"
            altText={title || "Ảnh bìa nhiệm vụ"}
            error={form.formState.errors.coverUrl?.message}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <CheckboxField
            label={contentText(content, "missionEditor.allowReplay", "Cho phép chơi lại")}
            registration={form.register("allowReplay")}
          />
          <CheckboxField
            label={contentText(content, "missionEditor.randomize", "Đổi thứ tự đáp án khi chơi")}
            registration={form.register("randomizeAnswers")}
          />
        </div>
      </details>
    </Card>
  );
}
