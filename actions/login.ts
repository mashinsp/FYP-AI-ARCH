"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_ROUTE } from "@/routes";
import { AuthError } from "next-auth";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  // Validate the input using Zod
  const validateFields = LoginSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Invalid Fields" };
  }
  const { email, password } = validateFields.data;

  try {
    // IMPORTANT: Set redirect to false so that signIn returns a result instead of redirecting immediately.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // If the result indicates an error, return it.
    if (result?.error) {
      return { error: result.error };
    }
    // Otherwise, return success.
    return { success: "Successfully Logged In!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid Credentials" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
};
