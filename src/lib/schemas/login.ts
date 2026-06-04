import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre zorunludur"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
