"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { RegisterSchema } from "@/schemas";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";

export const register = async (value: z.infer<typeof RegisterSchema>) => {
  
  const ValidateFields = RegisterSchema.safeParse(value);

  if(!ValidateFields.success) {
    return { error: "Invalid Fields" };
  }

  const { email, password, name } = ValidateFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const exixtingUser = await getUserByEmail(email);
  if(exixtingUser) {
    return { error: "Email already in use" };
  }

  await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  })

  return { success: "User created" };

};