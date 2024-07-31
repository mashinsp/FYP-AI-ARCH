import * as z from "zod"

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, {
        message: "Password is requied"
    })
})

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, {
        message: "Minimum 6 characters are required"
    }),
    name: z.string().min(1, {
        message: "Name is requied"
    }),
})