import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { db, pool } from "@/db/client";
import { account, session, user } from "@/db/schema";
import { appRoleSchema, staffRoles } from "@/auth/roles";

const email = process.env.STAFF_EMAIL?.trim().toLowerCase();
const confirmation = process.env.CONFIRM_STAFF_PASSWORD_RESET;
const generatedPassword = `Sln-${randomBytes(18).toString("base64url")}!`;
const newPassword = process.env.STAFF_PASSWORD ?? generatedPassword;

if (!email) throw new Error("STAFF_EMAIL is required.");
const targetEmail = email;
if (confirmation !== "YES") {
  throw new Error("Set CONFIRM_STAFF_PASSWORD_RESET=YES to continue.");
}
if (newPassword.length < 10) {
  throw new Error("STAFF_PASSWORD must contain at least 10 characters.");
}

async function main() {
  const target = await db.query.user.findFirst({ where: eq(user.email, targetEmail) });
  if (!target) throw new Error(`Staff account not found: ${targetEmail}`);

  const parsedRole = appRoleSchema.safeParse(target.role);
  if (!parsedRole.success || !staffRoles.includes(parsedRole.data)) {
    throw new Error(`Refusing to reset a non-staff account: ${targetEmail}`);
  }

  const credential = await db.query.account.findFirst({
    where: and(eq(account.userId, target.id), eq(account.providerId, "credential")),
  });
  if (!credential) throw new Error(`Credential account not found: ${targetEmail}`);

  const passwordHash = await hashPassword(newPassword);

  await db.transaction(async (tx) => {
    await tx
      .update(account)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(account.id, credential.id));

    await tx
      .update(user)
      .set({
        emailVerified: true,
        banned: false,
        banReason: null,
        banExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, target.id));

    await tx.delete(session).where(eq(session.userId, target.id));
  });

  const updatedCredential = await db.query.account.findFirst({
    where: eq(account.id, credential.id),
  });
  if (!updatedCredential?.password) throw new Error("Password update did not persist.");

  const valid = await verifyPassword({
    hash: updatedCredential.password,
    password: newPassword,
  });
  if (!valid) throw new Error("Password verification failed after reset.");

  console.log(`Staff password reset for ${targetEmail}.`);
  if (!process.env.STAFF_PASSWORD) console.log(`Generated password: ${newPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
