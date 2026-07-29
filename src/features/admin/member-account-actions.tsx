"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, KeyRound, LoaderCircle, LockKeyhole, X } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { membersApi } from "@/api/admin/members";
import { PasswordField, TextField } from "@/components/form";
import { parentPinValueSchema } from "@/domain/parent-pin";
import type { MemberItem } from "@/features/admin/member-row";
import { usePendingRouter } from "@/hooks/use-pending-router";

const passwordFormSchema = z
  .object({
    mode: z.enum(["email_link", "temporary_password"]),
    temporaryPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((values, context) => {
    if (values.mode !== "temporary_password") return;
    if (values.temporaryPassword.length < 10) {
      context.addIssue({
        code: "custom",
        path: ["temporaryPassword"],
        message: "Mật khẩu tạm thời cần ít nhất 10 ký tự",
      });
    }
    if (values.temporaryPassword !== values.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Mật khẩu nhập lại chưa khớp",
      });
    }
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const pinFormSchema = z
  .object({
    mode: z.enum(["clear", "temporary_pin"]),
    temporaryPin: z.string(),
    confirmPin: z.string(),
  })
  .superRefine((values, context) => {
    if (values.mode !== "temporary_pin") return;
    const pin = parentPinValueSchema.safeParse(values.temporaryPin);
    if (!pin.success) {
      context.addIssue({
        code: "custom",
        path: ["temporaryPin"],
        message: pin.error.issues[0]?.message ?? "Mã PIN chưa hợp lệ",
      });
    }
    if (values.temporaryPin !== values.confirmPin) {
      context.addIssue({
        code: "custom",
        path: ["confirmPin"],
        message: "Mã PIN nhập lại chưa khớp",
      });
    }
  });

type PinFormValues = z.infer<typeof pinFormSchema>;

type DialogFrameProps = {
  open: boolean;
  title: string;
  description: string;
  pending: boolean;
  children: React.ReactNode;
  onClose: () => void;
};

function DialogFrame({ open, title, description, pending, children, onClose }: DialogFrameProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;
  return (
    <dialog
      ref={ref}
      aria-labelledby="member-account-dialog-title"
      aria-describedby="member-account-dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(92vw,34rem)] overflow-y-auto rounded-[28px] border border-[#eadfc9] bg-[#fffdf8] p-0 shadow-2xl backdrop:bg-black/45"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#fff0df] text-[#b9470d]">
            <LockKeyhole size={23} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="member-account-dialog-title" className="type-section-title">
              {title}
            </h2>
            <p id="member-account-dialog-description" className="type-supporting mt-2 text-[#6f6558]">
              {description}
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng hộp thoại"
            disabled={pending}
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#eadfc9] disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

function Choice({
  checked,
  disabled,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-3 has-checked:border-[#d26727] has-checked:bg-[#fff8ef] has-disabled:cursor-not-allowed has-disabled:opacity-60">
      <input type="radio" checked={checked} disabled={disabled} onChange={onChange} className="mt-1 size-4" />
      <span>
        <strong className="type-label block">{title}</strong>
        <span className="type-caption mt-1 block text-[#6f6558]">{description}</span>
      </span>
    </label>
  );
}

function DialogActions({
  pending,
  submitLabel,
  pendingLabel,
  onClose,
}: {
  pending: boolean;
  submitLabel: string;
  pendingLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        disabled={pending}
        onClick={onClose}
        className="min-h-12 rounded-2xl border border-[#d9c9ae] bg-white px-4 font-black text-[#4f463b] disabled:opacity-50"
      >
        Hủy
      </button>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#b9470d] px-4 font-black text-white shadow-[0_5px_0_rgba(82,45,20,0.3)] disabled:opacity-60"
      >
        {pending ? <LoaderCircle size={18} className="animate-spin" /> : null}
        {pending ? pendingLabel : submitLabel}
      </button>
    </div>
  );
}

function PasswordResetDialog({
  item,
  open,
  onClose,
}: {
  item: MemberItem;
  open: boolean;
  onClose: () => void;
}) {
  const navigation = usePendingRouter();
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { mode: "email_link", temporaryPassword: "", confirmPassword: "" },
  });
  const mode = useWatch({ control: form.control, name: "mode" });
  const mutation = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      membersApi.resetPassword(
        item.id,
        values.mode === "email_link"
          ? { mode: "email_link" }
          : { mode: "temporary_password", temporaryPassword: values.temporaryPassword },
      ),
    onSuccess: (_, values) => {
      toast.success(
        values.mode === "email_link"
          ? "Đã gửi email đặt lại mật khẩu"
          : "Đã đặt mật khẩu tạm thời và đăng xuất tài khoản khỏi các thiết bị",
      );
      form.reset();
      onClose();
      navigation.refresh();
    },
  });
  const pending = mutation.isPending || navigation.isPending;

  return (
    <DialogFrame
      open={open}
      title={`Đặt lại mật khẩu cho ${item.name}`}
      description="Tài khoản sẽ không cần cung cấp mật khẩu hiện tại. Luồng email an toàn hơn; mật khẩu tạm thời chỉ nên dùng khi hệ thống email chưa hoạt động."
      pending={pending}
      onClose={onClose}
    >
      <form className="mt-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <div className="grid gap-3">
          <Choice
            checked={mode === "email_link"}
            title="Gửi liên kết qua email"
            description="Liên kết dùng một lần và tự hết hạn. Các phiên cũ bị thu hồi sau khi đổi mật khẩu."
            onChange={() => form.setValue("mode", "email_link", { shouldValidate: true })}
          />
          <Choice
            checked={mode === "temporary_password"}
            title="Đặt mật khẩu tạm thời"
            description="Thu hồi toàn bộ phiên hiện tại và bắt buộc người dùng đổi mật khẩu ở lần đăng nhập tiếp theo."
            onChange={() => form.setValue("mode", "temporary_password", { shouldValidate: true })}
          />
        </div>
        {mode === "temporary_password" ? (
          <div className="mt-4 grid gap-4">
            <PasswordField
              label="Mật khẩu tạm thời"
              autoComplete="new-password"
              registration={form.register("temporaryPassword")}
              error={form.formState.errors.temporaryPassword?.message}
            />
            <PasswordField
              label="Nhập lại mật khẩu tạm thời"
              autoComplete="new-password"
              registration={form.register("confirmPassword")}
              error={form.formState.errors.confirmPassword?.message}
            />
          </div>
        ) : null}
        {mutation.isError ? (
          <p role="alert" className="type-label mt-4 rounded-xl bg-red-50 p-3 text-red-800">
            {mutation.error.message}
          </p>
        ) : null}
        <DialogActions
          pending={pending}
          submitLabel={mode === "email_link" ? "Gửi liên kết" : "Đặt mật khẩu tạm"}
          pendingLabel="Đang xử lý..."
          onClose={onClose}
        />
      </form>
    </DialogFrame>
  );
}

function PinResetDialog({ item, open, onClose }: { item: MemberItem; open: boolean; onClose: () => void }) {
  const navigation = usePendingRouter();
  const form = useForm<PinFormValues>({
    resolver: zodResolver(pinFormSchema),
    defaultValues: { mode: "clear", temporaryPin: "", confirmPin: "" },
  });
  const mode = useWatch({ control: form.control, name: "mode" });
  const mutation = useMutation({
    mutationFn: (values: PinFormValues) =>
      membersApi.resetParentPin(
        item.id,
        values.mode === "clear"
          ? { mode: "clear" }
          : { mode: "temporary_pin", temporaryPin: values.temporaryPin },
      ),
    onSuccess: (_, values) => {
      toast.success(
        values.mode === "clear"
          ? "Đã xóa mã PIN. Phụ huynh sẽ thiết lập lại khi truy cập lần tới."
          : "Đã đặt mã PIN tạm thời và vô hiệu hóa quyền mở khóa cũ.",
      );
      form.reset();
      onClose();
      navigation.refresh();
    },
  });
  const pending = mutation.isPending || navigation.isPending;

  return (
    <DialogFrame
      open={open}
      title={`Đặt lại mã PIN cho ${item.name}`}
      description="Thao tác này làm mất hiệu lực mọi Parent Gate đã mở bằng mã PIN cũ và đặt lại số lần nhập sai."
      pending={pending}
      onClose={onClose}
    >
      <form className="mt-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <div className="grid gap-3">
          <Choice
            checked={mode === "clear"}
            title="Xóa mã PIN hiện tại"
            description="Phụ huynh tự thiết lập mã PIN mới ở lần truy cập tiếp theo."
            onChange={() => form.setValue("mode", "clear", { shouldValidate: true })}
          />
          <Choice
            checked={mode === "temporary_pin"}
            title="Đặt mã PIN tạm thời"
            description="Quản trị viên cung cấp mã PIN 6 chữ số để phụ huynh đăng nhập lại."
            onChange={() => form.setValue("mode", "temporary_pin", { shouldValidate: true })}
          />
        </div>
        {mode === "temporary_pin" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Mã PIN tạm thời"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={6}
              registration={form.register("temporaryPin")}
              error={form.formState.errors.temporaryPin?.message}
            />
            <TextField
              label="Nhập lại mã PIN"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={6}
              registration={form.register("confirmPin")}
              error={form.formState.errors.confirmPin?.message}
            />
          </div>
        ) : null}
        {mutation.isError ? (
          <p role="alert" className="type-label mt-4 rounded-xl bg-red-50 p-3 text-red-800">
            {mutation.error.message}
          </p>
        ) : null}
        <DialogActions
          pending={pending}
          submitLabel={mode === "clear" ? "Xóa mã PIN" : "Đặt mã PIN tạm"}
          pendingLabel="Đang xử lý..."
          onClose={onClose}
        />
      </form>
    </DialogFrame>
  );
}

const ACCOUNT_MENU_VIEWPORT_GAP = 8;
const ACCOUNT_MENU_MIN_WIDTH = 256;
const ACCOUNT_MENU_ESTIMATED_HEIGHT = 144;

type AccountMenuPosition = {
  top: number;
  left: number;
  width: number;
};

function resolveAccountMenuPosition(triggerRect: DOMRect, menuHeight: number): AccountMenuPosition {
  const maxWidth = Math.max(window.innerWidth - ACCOUNT_MENU_VIEWPORT_GAP * 2, 0);
  const width = Math.min(Math.max(triggerRect.width, ACCOUNT_MENU_MIN_WIDTH), maxWidth);
  const maxLeft = Math.max(window.innerWidth - width - ACCOUNT_MENU_VIEWPORT_GAP, ACCOUNT_MENU_VIEWPORT_GAP);
  const left = Math.min(Math.max(triggerRect.left, ACCOUNT_MENU_VIEWPORT_GAP), maxLeft);
  const spaceBelow = window.innerHeight - triggerRect.bottom - ACCOUNT_MENU_VIEWPORT_GAP;
  const openAbove = spaceBelow < menuHeight && triggerRect.top > spaceBelow;
  const requestedTop = openAbove
    ? triggerRect.top - menuHeight - ACCOUNT_MENU_VIEWPORT_GAP
    : triggerRect.bottom + ACCOUNT_MENU_VIEWPORT_GAP;
  const maxTop = Math.max(
    window.innerHeight - menuHeight - ACCOUNT_MENU_VIEWPORT_GAP,
    ACCOUNT_MENU_VIEWPORT_GAP,
  );

  return {
    top: Math.min(Math.max(requestedTop, ACCOUNT_MENU_VIEWPORT_GAP), maxTop),
    left,
    width,
  };
}

export function MemberAccountActions({ item, currentUserId }: { item: MemberItem; currentUserId: string }) {
  const [dialog, setDialog] = useState<"password" | "pin" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<AccountMenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const self = item.id === currentUserId;
  const hasCredential = item.accountProviders.includes("credential");
  const passwordDisabled = self || !hasCredential;
  const pinDisabled = self || item.role !== "parent" || !item.parentProfileId;
  const passwordReason = self
    ? "Không thể tự đặt lại mật khẩu tại đây."
    : !hasCredential
      ? "Tài khoản Google-only quản lý mật khẩu qua Google."
      : null;
  const pinReason = self
    ? "Không thể tự đặt lại mã PIN tại đây."
    : item.role !== "parent" || !item.parentProfileId
      ? "Chỉ tài khoản phụ huynh có hồ sơ gia đình mới có mã PIN."
      : null;

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const menuHeight = menuRef.current?.offsetHeight ?? ACCOUNT_MENU_ESTIMATED_HEIGHT;
    setMenuPosition(resolveAccountMenuPosition(trigger.getBoundingClientRect(), menuHeight));
  }, []);

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
      return;
    }
    const trigger = triggerRef.current;
    if (trigger) {
      setMenuPosition(
        resolveAccountMenuPosition(trigger.getBoundingClientRect(), ACCOUNT_MENU_ESTIMATED_HEIGHT),
      );
    }
    setMenuOpen(true);
  };

  useLayoutEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
    const frame = requestAnimationFrame(updateMenuPosition);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [menuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return;
    const frame = requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)')?.focus();
    });
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        closeMenu();
      }
    };
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        closeMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, menuOpen]);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)') ?? [],
    );
    if (items.length === 0) return;
    event.preventDefault();
    const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? (currentIndex + 1 + items.length) % items.length
            : (currentIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          onClick={toggleMenu}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (!menuOpen) toggleMenu();
            }
          }}
          className="type-action flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2 text-[#493f34]"
        >
          <KeyRound size={16} aria-hidden="true" />
          Thao tác tài khoản
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>
        {menuOpen ? (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={`Thao tác tài khoản của ${item.name}`}
            onKeyDown={handleMenuKeyDown}
            style={menuPosition ?? { visibility: "hidden" }}
            className="fixed z-[100] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-2xl border border-[#e3d5bf] bg-white p-2 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              disabled={passwordDisabled}
              onClick={() => {
                closeMenu();
                setDialog("password");
              }}
              className="type-label flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left hover:bg-[#fff7ec] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <LockKeyhole size={17} /> Đặt lại mật khẩu
            </button>
            {passwordReason ? (
              <p className="type-caption px-3 pb-2 text-[#806d54]">{passwordReason}</p>
            ) : null}
            <button
              type="button"
              role="menuitem"
              disabled={pinDisabled}
              onClick={() => {
                closeMenu();
                setDialog("pin");
              }}
              className="type-label flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left hover:bg-[#fff7ec] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <KeyRound size={17} /> Đặt lại mã PIN
            </button>
            {pinReason ? <p className="type-caption px-3 pb-2 text-[#806d54]">{pinReason}</p> : null}
          </div>
        ) : null}
      </div>
      <PasswordResetDialog item={item} open={dialog === "password"} onClose={() => setDialog(null)} />
      <PinResetDialog item={item} open={dialog === "pin"} onClose={() => setDialog(null)} />
    </>
  );
}
