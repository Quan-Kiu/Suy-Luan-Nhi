# SLN MCP Gateway

SLN MCP Gateway là sidecar server cho phép MCP clients kiểm tra hệ thống, đọc taxonomy, tạo/sửa mission draft, quản lý tài nguyên phụ huynh và upload media mà không bỏ qua validation, audit log hoặc storage adapter của SLN-GPT.

## Tool hiện có

- `system_health`: database, storage, actor, process và số lượng nội dung.
- `taxonomy_list`: world, skill, badge, nhóm tuổi và category hỗ trợ.
- `mission_list`, `mission_get`, `mission_create_draft`, `mission_update_draft`.
- `resource_list`, `resource_get`, `resource_create`, `resource_update`.
- `media_list`, `media_upload`.

Mission MCP chỉ tạo hoặc cập nhật draft. Submit review, approve và publish vẫn thực hiện trong admin để giữ review boundary.

## Chạy local

```bash
npm run mcp:dev
```

Endpoint mặc định:

```text
http://127.0.0.1:8787/mcp
```

Kiểm tra giao thức đọc và dry-run:

```bash
npm run mcp:smoke
```

Kiểm tra upload thật và tự cleanup:

```bash
npm run mcp:write-smoke
```

Chạy bằng stdio cho MCP Inspector hoặc local MCP client:

```bash
npm run mcp:stdio
```

Ví dụ cấu hình local client:

```json
{
  "mcpServers": {
    "sln-gpt": {
      "command": "npm",
      "args": ["run", "mcp:stdio"],
      "cwd": "/home/quan-linux-mint/Workspace/Develop/Projects/SLN-GPT"
    }
  }
}
```

## Xác thực

`MCP_AUTH_MODE=token` là mặc định. Ở local development, nếu chưa đặt `MCP_API_TOKEN`, gateway dẫn xuất token từ `BETTER_AUTH_SECRET`. Production bắt buộc cung cấp token riêng tối thiểu 32 ký tự.

`MCP_AUTH_MODE=none` chỉ được phép khi `MCP_HOST` là loopback. Chế độ này dành cho Secure MCP Tunnel hoặc một reverse proxy riêng đã xác thực request; gateway sẽ từ chối khởi động nếu dùng `none` cùng `0.0.0.0` hoặc host public.

Actor mặc định local là `admin@demo.local`. Production nên đặt `MCP_ACTOR_EMAIL` thành tài khoản `content_admin` hoặc `super_admin` chuyên dụng. Tài khoản bị banned hoặc sai role sẽ làm gateway từ chối khởi động.

Các biến chính:

```env
MCP_AUTH_MODE=token
MCP_API_TOKEN=replace-with-a-long-random-token
MCP_ACTOR_EMAIL=admin@demo.local
MCP_HOST=127.0.0.1
MCP_PORT=8787
MCP_ALLOWED_HOSTS=localhost,127.0.0.1
MCP_READ_ONLY=false
MCP_MAX_REMOTE_BYTES=10000000
MCP_REMOTE_TIMEOUT_MS=10000
MCP_RATE_LIMIT_PER_MINUTE=120
```

## Kết nối ChatGPT

ChatGPT không kết nối trực tiếp tới MCP server local. Cần deploy endpoint HTTPS từ xa hoặc dùng Secure MCP Tunnel để chuyển tiếp endpoint loopback mà không mở server trực tiếp ra Internet.

Với workspace ChatGPT hỗ trợ custom MCP app:

1. Bật Developer mode trong workspace settings.
2. Mở Apps → Create.
3. Nhập endpoint HTTPS kết thúc bằng `/mcp`.
4. Chọn cơ chế xác thực phù hợp.
5. Chọn **Scan Tools** và xác nhận 12 tool được phát hiện.
6. Giữ các write tool ở trạng thái cần approval trong giai đoạn thử nghiệm.

Full MCP write/modify hiện phụ thuộc gói ChatGPT hỗ trợ developer mode tương ứng. Tài khoản chưa có quyền này vẫn có thể kiểm thử gateway bằng MCP Inspector, Codex/Claude MCP client hoặc OpenAI API remote MCP với custom headers.

## Quy tắc upload

- Chấp nhận đúng một trong `sourceUrl` hoặc `fileData`.
- URL từ xa phải là HTTPS.
- DNS được resolve trước mỗi request và mỗi redirect.
- Localhost, private IP, link-local, multicast và reserved ranges bị chặn.
- Tối đa hai redirect, timeout và byte limit có cấu hình.
- File tiếp tục đi qua magic-byte validation hiện có.
- MCP response không chứa `storageKey`, storage metadata hoặc uploader ID.

## Dry-run

`mission_create_draft`, `mission_update_draft`, `resource_create`, `resource_update` và `media_upload` hỗ trợ `dryRun=true`. Dry-run vẫn chạy schema/file validation nhưng không ghi database hoặc storage.
