import { z } from 'zod'
import { cleanText } from '@/lib/sanitize'

export const signUpSchema = z
  .object({
    name: z
      .string()
      .transform(cleanText(50))
      .refine((v) => v.length >= 2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[0-9]/, 'Must include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SignInFormData = z.infer<typeof signInSchema>
