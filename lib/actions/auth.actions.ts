"use server";

import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import type { ActionResponse } from "@/lib/errors";

export async function loginAction(
  phone: string,
  password: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    return { success: true, data: { message: "Login successful" } };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Invalid phone number or password",
        code: "AUTH_ERROR",
      };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
}

export async function getSession() {
  return auth();
}
