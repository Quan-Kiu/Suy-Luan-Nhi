import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { PasswordField } from "@/components/form/password-field";

type FormValues = { password: string; confirmPassword: string };

function PasswordForm({ onSubmit = vi.fn() }: { onSubmit?: (values: FormValues) => void }) {
  const form = useForm<FormValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <PasswordField label="Mật khẩu" registration={form.register("password")} />
      <PasswordField
        label="Nhập lại mật khẩu"
        autoComplete="new-password"
        registration={form.register("confirmPassword")}
      />
      <button type="submit">Lưu</button>
    </form>
  );
}

describe("PasswordField", () => {
  it("starts hidden with password-manager and mobile-safe attributes", () => {
    render(<PasswordForm />);

    const password = screen.getByLabelText("Mật khẩu");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(password).toHaveAttribute("autocapitalize", "none");
    expect(password).toHaveAttribute("autocorrect", "off");
    expect(password).toHaveAttribute("spellcheck", "false");
    expect(screen.getByLabelText("Nhập lại mật khẩu")).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByRole("button", { name: "Hiện hoặc ẩn mật khẩu" }).closest("label")).toBeNull();
    expect(screen.getByRole("button", { name: "Hiện hoặc ẩn nhập lại mật khẩu" })).toHaveAttribute(
      "aria-controls",
      "confirmPassword",
    );
  });

  it("reveals and hides without losing the entered value", async () => {
    const user = userEvent.setup();
    render(<PasswordForm />);

    const password = screen.getByLabelText("Mật khẩu");
    const toggle = screen.getByRole("button", { name: "Hiện hoặc ẩn mật khẩu" });
    await user.type(password, "StrongPass123!");
    await user.click(toggle);

    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("StrongPass123!");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveAttribute("title", "Ẩn mật khẩu");
    await waitFor(() => expect(password).toHaveFocus());

    await user.click(toggle);
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveValue("StrongPass123!");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("does not submit the form and keeps each field state independent", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PasswordForm onSubmit={onSubmit} />);

    const passwordToggle = screen.getByRole("button", { name: "Hiện hoặc ẩn mật khẩu" });
    const password = screen.getByLabelText("Mật khẩu");
    const confirmation = screen.getByLabelText("Nhập lại mật khẩu");
    await user.click(passwordToggle);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(password).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "password");
  });
});
