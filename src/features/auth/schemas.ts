import { z } from 'zod'
import { cleanText } from '@/lib/sanitize'

export const signUpSchema = z
  .object({
    name: z
      .string()
      .transform(cleanText(60))
      .refine((v) => v.length >= 1, 'Name must be at least 1 character')
      .refine((v) => v.length <= 60, 'Name must be at most 60 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, 'Email must be at most 254 characters')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must include at least one letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
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
    .max(254, 'Email must be at most 254 characters')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SignInFormData = z.infer<typeof signInSchema>
