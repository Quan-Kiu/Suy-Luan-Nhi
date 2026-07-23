# Khôi phục mã PIN phụ huynh

## Mục tiêu

Cho phép phụ huynh tạo lại mã PIN khi quên, thông qua email của tài khoản và không làm suy yếu lớp bảo vệ khu vực phụ huynh.

## Tiêu chí chấp nhận

- Màn hình nhập PIN có liên kết “Quên mã PIN?”.
- Phụ huynh đã đăng nhập có thể yêu cầu liên kết khôi phục gửi tới email tài khoản được che bớt trên giao diện.
- Liên kết chỉ dùng được một lần và hết hạn sau 15 phút.
- Hệ thống giới hạn tần suất yêu cầu và thử token.
- PIN mới phải gồm 6 chữ số, khớp xác nhận và không thuộc nhóm mã phổ biến.
- Đổi PIN làm mất hiệu lực quyền mở khu vực phụ huynh đã cấp bằng PIN cũ trên thiết bị khác.
- Không lưu PIN hoặc token dạng rõ; không trả `pinHash` qua API; các thao tác được ghi audit.
