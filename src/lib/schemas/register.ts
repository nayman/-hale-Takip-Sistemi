import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(1, "Ad soyad zorunludur"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
