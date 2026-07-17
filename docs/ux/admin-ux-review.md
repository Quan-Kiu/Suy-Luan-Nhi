# Admin UI/UX review

## Goal

Make the administration area understandable to content editors, reviewers, and operators who are not developers. Technical capabilities remain available, but they must not dominate the primary workflow.

## Problems found

1. Navigation was a flat list of every admin route, regardless of role or task frequency.
2. Labels mixed Vietnamese with implementation terms such as CMS, slug, payload, snapshot, reviewer, publish, audit, media, and JSON.
3. The mission editor required users to edit raw payload and answer JSON.
4. Workflow state was visible as database enums rather than user-facing status labels.
5. Dashboards emphasized system counts instead of the next action a user should take.
6. Technical IDs, URLs, metadata, and configuration values were always visible.
7. Tables and icon-only actions were difficult to use on small screens.

## Design principles

- Organize navigation by real work: create content, review content, and operate the system.
- Show only routes available to the current role.
- Use plain Vietnamese labels first; place technical identifiers under expandable details.
- Replace raw JSON with structured fields for normal content workflows.
- Explain consequences at the point of action, especially review, publication, and data deletion.
- Keep previews and safety checks beside the content being edited.
- Preserve advanced configuration rather than removing it, but clearly mark it as advanced.

## Implemented information architecture

### Công việc chính

- Tổng quan
- Nhiệm vụ
- Duyệt nội dung

### Nội dung hiển thị

- Hình ảnh & âm thanh
- Nội dung giao diện
- Thế giới nhiệm vụ
- Độ tuổi & kỹ năng

### Theo dõi & vận hành

- Báo cáo
- Thành viên & quyền
- Yêu cầu dữ liệu
- Nhật ký thay đổi
- Cài đặt nâng cao

## Mission editor flow

1. Enter child-facing content.
2. Configure questions through fields tailored to each question type.
3. Preview the active question.
4. Confirm six child-safety criteria.
5. Save for later or send to a reviewer.

The former JSON editor is no longer part of the normal workflow. Advanced identifiers and asset paths are collapsed by default.

## Verification targets

- A content editor cannot see super-admin navigation.
- The mission editor exposes no payload or answer JSON fields.
- Every supported question type remains editable through structured controls.
- Statuses and roles are displayed with Vietnamese user-facing labels.
- Mobile navigation remains accessible and persistent layouts remain intact.
- Existing custom content registry values are preserved when defaults are synchronized.
