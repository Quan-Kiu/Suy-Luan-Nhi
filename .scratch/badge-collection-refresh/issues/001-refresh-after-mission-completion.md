# Bộ sưu tập chưa cập nhật sau khi nhận huy hiệu

Payload Server Component của `/badges` có thể đã được client router prefetch trước khi mutation hoàn thành nhiệm vụ ghi `child_badges`. Vì mutation chỉ làm mới cache bản đồ nhiệm vụ, lần điều hướng đầu tiên tới bộ sưu tập vẫn hiển thị dữ liệu cũ và chỉ đúng sau khi reload.

Chuyển dữ liệu bộ sưu tập sang query theo Child Profile, đồng thời invalidate và prefetch query đó sau khi hoàn thành nhiệm vụ.
