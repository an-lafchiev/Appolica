"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/auth/password";
import { generateRandomSessionToken, createSession } from "@/auth/session";
import { setSessionCookie } from "@/auth/cookie";
import { registerSchema } from "../validations/authSchema";
import {
  FormState,
  fromErrorToFormState,
  toFormState,
} from "../validations/formState";
import { revalidatePath } from "next/cache";
import { generateToken } from "@/lib/goCardlessClient";
import { saveToken } from "@/app/api/GoCardless/actions/token";

const signUp = async (formState: FormState, formData: FormData) => {
  try {
    const { firstName, lastName, email, password } = registerSchema.parse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
      },
    });

    const sessionToken = generateRandomSessionToken();
    const session = await createSession(sessionToken, user.id);

    const goCardlessToken = await generateToken();

    await saveToken(user.id, goCardlessToken);
    await setSessionCookie(sessionToken, session.expiresAt);

    revalidatePath("/");

    return toFormState("SUCCESS", "Sign up successful");
  } catch (error) {
    return fromErrorToFormState(error);
  }
};

export { signUp };
