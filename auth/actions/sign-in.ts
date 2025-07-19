"use server";

import { prisma } from "@/lib/prisma";
import { verifyPasswordHash } from "@/auth/password";
import { generateRandomSessionToken, createSession } from "@/auth/session";
import { setSessionCookie } from "@/auth/cookie";
import {
  FormState,
  fromErrorToFormState,
  toFormState,
} from "../validations/formState";
import { loginSchema } from "../validations/authSchema";
import { revalidatePath } from "next/cache";
import {
  deleteToken,
  getTokenInfo,
  getValidAccessToken,
  saveToken,
} from "@/app/api/GoCardless/actions/token";
import { generateToken } from "@/lib/goCardlessClient";
import {
  deleteXeroToken,
  getValidXeroToken,
  getXeroTokenInfo,
} from "@/app/api/Xero/setupXeroAuth";

const signIn = async (formState: FormState, formData: FormData) => {
  try {
    const { email, password } = loginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const user = await prisma.user.findUnique({
      where: { email },
      include: {},
    });

    if (!user) {
      return fromErrorToFormState(new Error("Incorrect email or password"));
    }

    const validPassword = await verifyPasswordHash(user.passwordHash, password);

    if (!validPassword) {
      return fromErrorToFormState(new Error("Incorrect email or password"));
    }

    const sessionToken = generateRandomSessionToken();
    const session = await createSession(sessionToken, user.id);

    await setSessionCookie(sessionToken, session.expiresAt);
    const goCardlessToken = await getTokenInfo(user.id);
    const xeroToken = await getXeroTokenInfo(user.id);

    revalidatePath("/");

    if (!goCardlessToken) {
      const token = await generateToken();
      await saveToken(user.id, token);

      return toFormState("SUCCESS", "Login successful");
    }

    if (!goCardlessToken.refreshValid) {
      await deleteToken(user.id);
    }

    if (!goCardlessToken.accessValid || goCardlessToken.accessExpiringSoon) {
      await getValidAccessToken(user.id);
    }

    if (!xeroToken) {
      return toFormState("SUCCESS", "buildXeroConsent");
    }

    if (!xeroToken.refreshValid) {
      await deleteXeroToken(user.id);
    }

    if (!xeroToken.accessValid || xeroToken.accessExpiringSoon) {
      await getValidXeroToken(user.id);
    }

    return toFormState("SUCCESS", "Login successful");
  } catch (error) {
    return fromErrorToFormState(error);
  }
};

export { signIn };
