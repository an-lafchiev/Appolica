"use server";

import { redirect } from "next/navigation";
import { getAuth, deleteSessionCookie } from "@/auth/cookie";
import { invalidateSession } from "@/auth/session";

export const signOut = async () => {
  const { session } = await getAuth();

  if (!session) {
    redirect("/sign-in");
  }

  await invalidateSession(session.id);
  await deleteSessionCookie();

  redirect("/sign-in");
};
