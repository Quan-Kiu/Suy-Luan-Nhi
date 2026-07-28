"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, KeyRound, Laptop, LogOut, ShieldCheck, Smartphone, Tablet, Wifi } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { accountSecurityApi } from "@/api/account-security";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormStatus } from "@/components/form";
import { Button, Card, Pill } from "@/components/ui";
import { contentTemplate, contentText, useContent } from "@/content/client";
import type { AccountSecurityOverview, AccountSecuritySession } from "@/domain/account-security";
import { queryKeys } from "@/lib/query/keys";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ConfirmAction = { kind: "session"; session: AccountSecuritySession } | { kind: "others" } | null;

function DeviceIcon({ type }: { type: AccountSecuritySession["deviceType"] }) {
  if (type === "mobile") return <Smartphone size={22} aria-hidden="true" />;
  if (type === "tablet") return <Tablet size={22} aria-hidden="true" />;
  return <Laptop size={22} aria-hidden="true" />;
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function AccountSecurityPanel({ initialData }: { initialData: AccountSecurityOverview }) {
  const content = useContent("parent");
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const query = useQuery({
    queryKey: queryKeys.account.security,
    queryFn: accountSecurityApi.getOverview,
    initialData,
    staleTime: 30_000,
  });
  const updateOverview = (overview: AccountSecurityOverview) => {
    queryClient.setQueryData(queryKeys.account.security, overview);
    setConfirmAction(null);
  };
  const revokeMutation = useMutation({
    mutationFn: accountSecurityApi.revokeSession,
    onSuccess: (overview) => {
      updateOverview(overview);
      toast.success(contentText(content, "settings.security.sessionRevoked", "Đã đăng xuất thiết bị"));
    },
  });
  const revokeOthersMutation = useMutation({
    mutationFn: accountSecurityApi.revokeOtherSessions,
    onSuccess: (overview) => {
      updateOverview(overview);
      toast.success(
        contentText(content, "settings.security.othersRevoked", "Đã đăng xuất các thiết bị khác"),
      );
    },
  });

  const overview = query.data;
  const otherSessions = overview.sessions.filter((item) => !item.current);
  const pending = revokeMutation.isPending || revokeOthersMutation.isPending;
  const mutationError = revokeMutation.error ?? revokeOthersMutation.error;

  return (
    <section aria-labelledby="account-security-title" className="mt-5 space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="type-label font-black text-[#9b5615]">
              {contentText(content, "settings.security.eyebrow", "Bảo mật tài khoản")}
            </p>
            <h2 id="account-security-title" className="type-section-title mt-1">
              {contentText(content, "settings.security.title", "Tài khoản và thiết bị đăng nhập")}
            </h2>
            <p className="type-supporting mt-2 max-w-2xl text-[#6f6558]">
              {contentText(
                content,
                "settings.security.description",
                "Kiểm tra các thiết bị đang đăng nhập và đăng xuất ngay những phiên ba/mẹ không nhận ra.",
              )}
            </p>
          </div>
          {otherSessions.length ? (
            <Button
              type="button"
              disabled={pending}
              onClick={() => setConfirmAction({ kind: "others" })}
              className="bg-red-700 shadow-[0_6px_0_#8f1d1d]"
            >
              <LogOut size={18} aria-hidden="true" />
              {contentText(content, "settings.security.revokeOthers", "Đăng xuất thiết bị khác")}
            </Button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
          <div className="rounded-2xl border border-[#eadfc9] bg-[#fffaf0] p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e7f3df] text-[#517d3f]">
                <ShieldCheck size={22} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="type-label font-black">{overview.account.name}</p>
                <p className="type-supporting break-all text-[#6f6558]">{overview.account.email}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>
                <CheckCircle2 size={15} aria-hidden="true" />
                {overview.account.emailVerified
                  ? contentText(content, "settings.security.emailVerified", "Email đã xác minh")
                  : contentText(content, "settings.security.emailPending", "Email chưa xác minh")}
              </Pill>
              <Pill>
                <KeyRound size={15} aria-hidden="true" />
                {overview.account.twoFactorEnabled
                  ? contentText(content, "settings.security.twoFactorOn", "Đã bật xác thực hai lớp")
                  : contentText(content, "settings.security.twoFactorOff", "Chưa bật xác thực hai lớp")}
              </Pill>
            </div>
          </div>
          <div className="rounded-2xl border border-[#eadfc9] bg-white p-4">
            <p className="type-label font-black">
              {contentText(content, "settings.security.signInMethods", "Cách đăng nhập")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {overview.account.signInMethods.length ? (
                overview.account.signInMethods.map((method) => <Pill key={method.id}>{method.label}</Pill>)
              ) : (
                <p className="type-supporting text-[#6f6558]">
                  {contentText(
                    content,
                    "settings.security.signInMethodsUnknown",
                    "Chưa xác định được cách đăng nhập.",
                  )}
                </p>
              )}
            </div>
            <p className="type-caption mt-3 text-[#786348]">
              {contentTemplate(content, "settings.security.accountCreatedAt", "Tạo tài khoản lúc {time}", {
                time: formatDate(overview.account.createdAt),
              })}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="type-section-title">
              {contentText(content, "settings.security.sessionsTitle", "Thiết bị đang đăng nhập")}
            </h2>
            <p className="type-supporting mt-1 text-[#6f6558]">
              {contentTemplate(
                content,
                "settings.security.sessionCount",
                "{count} phiên còn hiệu lực. Hệ thống không lưu vị trí chính xác của thiết bị.",
                { count: overview.sessions.length },
              )}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {overview.sessions.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4"
              aria-label={`${item.browser} trên ${item.operatingSystem}`}
              data-account-session
              data-current={String(item.current)}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff0df] text-[#b9470d]">
                    <DeviceIcon type={item.deviceType} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="type-label font-black">
                        {item.browser} · {item.operatingSystem}
                      </p>
                      {item.current ? (
                        <Pill className="border-green-200 bg-green-50 text-green-800">
                          {contentText(content, "settings.security.currentSession", "Phiên hiện tại")}
                        </Pill>
                      ) : null}
                    </div>
                    <div className="type-caption mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[#6f6558]">
                      <span>
                        {contentTemplate(
                          content,
                          "settings.security.updatedAt",
                          "Cập nhật gần nhất: {time}",
                          {
                            time: formatDate(item.updatedAt),
                          },
                        )}
                      </span>
                      <span>
                        {contentTemplate(content, "settings.security.expiresAt", "Hết hạn: {time}", {
                          time: formatDate(item.expiresAt),
                        })}
                      </span>
                      <span className="inline-flex min-w-0 items-center gap-1 break-all">
                        <Wifi size={14} aria-hidden="true" />{" "}
                        {contentTemplate(content, "settings.security.ipAddress", "IP: {value}", {
                          value:
                            item.ipAddress ??
                            contentText(content, "settings.security.unknown", "Chưa xác định"),
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {!item.current ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setConfirmAction({ kind: "session", session: item })}
                    className="type-action inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 font-black text-red-700 disabled:opacity-50"
                  >
                    <LogOut size={17} aria-hidden="true" />
                    {contentText(content, "settings.security.revokeSession", "Đăng xuất")}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        <FormStatus
          status={query.isError || mutationError ? "error" : "idle"}
          message={query.error?.message ?? mutationError?.message}
          className="mt-4"
        />
      </Card>

      <ConfirmDialog
        open={confirmAction?.kind === "session"}
        title={contentText(content, "settings.security.revokeTitle", "Đăng xuất thiết bị này?")}
        description={
          confirmAction?.kind === "session"
            ? contentTemplate(
                content,
                "settings.security.revokeDescription",
                "{browser} trên {operatingSystem} sẽ phải đăng nhập lại.",
                {
                  browser: confirmAction.session.browser,
                  operatingSystem: confirmAction.session.operatingSystem,
                },
              )
            : ""
        }
        confirmLabel={contentText(content, "settings.security.revokeConfirm", "Đăng xuất thiết bị")}
        pendingLabel={contentText(content, "settings.security.revoking", "Đang đăng xuất...")}
        tone="danger"
        pending={revokeMutation.isPending}
        errorMessage={revokeMutation.error?.message}
        onClose={() => {
          if (!revokeMutation.isPending) {
            revokeMutation.reset();
            setConfirmAction(null);
          }
        }}
        onConfirm={() => {
          if (confirmAction?.kind === "session") revokeMutation.mutate(confirmAction.session.id);
        }}
      />
      <ConfirmDialog
        open={confirmAction?.kind === "others"}
        title={contentText(content, "settings.security.revokeOthersTitle", "Đăng xuất tất cả thiết bị khác?")}
        description={contentText(
          content,
          "settings.security.revokeOthersDescription",
          "Phiên đang dùng vẫn được giữ lại. Tất cả thiết bị khác sẽ phải đăng nhập lại.",
        )}
        confirmLabel={contentText(content, "settings.security.revokeOthersConfirm", "Đăng xuất tất cả")}
        pendingLabel={contentText(content, "settings.security.revoking", "Đang đăng xuất...")}
        tone="danger"
        pending={revokeOthersMutation.isPending}
        errorMessage={revokeOthersMutation.error?.message}
        onClose={() => {
          if (!revokeOthersMutation.isPending) {
            revokeOthersMutation.reset();
            setConfirmAction(null);
          }
        }}
        onConfirm={() => revokeOthersMutation.mutate()}
      />
    </section>
  );
}
