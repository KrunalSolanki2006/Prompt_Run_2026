import React, { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUpSchema, type SignUpFormData } from '@/features/auth/schemas'
import { Logo } from '@/components/Logo'
import { ConsequenceChain } from '@/components/ConsequenceChain'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Lock, User, Mail, ShieldAlert, Check } from 'lucide-react'

export const SignUp: React.FC = () => {
  useDocumentTitle('Create Account')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  })

  const passwordVal = watch('password') || ''

  // Live password strength calculation
  const hasMinLength = passwordVal.length >= 8
  const hasUppercase = /[A-Z]/.test(passwordVal)
  const hasNumber = /[0-9]/.test(passwordVal)
  const strengthScore = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length

  const onSubmit = async (_data: SignUpFormData) => {
    // STAGE-2: Real client-side account creation in localStorage
    // Password will be salted and hashed with PBKDF2/SHA-256 before storing in runway:v1:accounts
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#16140F] flex flex-col">
      {/* Top bar */}
      <header className="px-6 py-4 border-b border-[#E6DFD2] bg-[#FBF8F3]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <Link
            to="/sign-in"
            className="text-xs font-semibold text-[#5E5A52] hover:text-[#16140F]"
          >
            Already have an account? <span className="underline">Sign in</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl bg-white border border-[#E6DFD2] rounded-[18px] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Form Side */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="mb-8">
                <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block mb-1">
                  Step 1 of 2 · Account Setup
                </span>
                <h1 className="font-['Bricolage_Grotesque_Variable'] text-2xl sm:text-3xl font-extrabold text-[#16140F]">
                  Start your 30-day runway
                </h1>
                <p className="text-xs text-[#5E5A52] mt-1.5">
                  Set up your local profile to start testing financial decisions before spending.
                </p>
              </div>

              {/* Error summary live region */}
              <div
                aria-live="polite"
                aria-atomic="true"
                className="mb-4"
              >
                {Object.keys(errors).length > 0 && (
                  <div
                    className="p-3 rounded-lg bg-[#B42318]/10 border border-[#B42318]/30 text-xs text-[#B42318] flex items-center gap-2"
                    role="alert"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Please fix the highlighted fields below to continue.</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-xs font-semibold text-[#16140F]">
                    Your Name
                  </Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#5E5A52] absolute left-3 top-3 pointer-events-none" />
                    <Input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Alex Sharma"
                      className="pl-9 h-11 text-base bg-[#FBF8F3] border-[#E6DFD2] rounded-[10px]"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'signup-name-err' : undefined}
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p id="signup-name-err" className="text-[11px] font-semibold text-[#B42318]">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-semibold text-[#16140F]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#5E5A52] absolute left-3 top-3 pointer-events-none" />
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      placeholder="alex@example.com"
                      className="pl-9 h-11 text-base bg-[#FBF8F3] border-[#E6DFD2] rounded-[10px]"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'signup-email-err' : undefined}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p id="signup-email-err" className="text-[11px] font-semibold text-[#B42318]">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-pass" className="text-xs font-semibold text-[#16140F]">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5E5A52] absolute left-3 top-3 pointer-events-none" />
                    <Input
                      id="signup-pass"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className="pl-9 pr-10 h-11 text-base bg-[#FBF8F3] border-[#E6DFD2] rounded-[10px]"
                      aria-invalid={!!errors.password}
                      aria-describedby="signup-pass-strength"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#5E5A52] hover:text-[#16140F]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  <div id="signup-pass-strength" className="pt-1.5 space-y-1">
                    <div className="flex gap-1 h-1.5 w-full">
                      <div
                        className={`flex-1 rounded-full ${
                          strengthScore >= 1 ? 'bg-[#A15C07]' : 'bg-[#E6DFD2]'
                        }`}
                      />
                      <div
                        className={`flex-1 rounded-full ${
                          strengthScore >= 2 ? 'bg-[#D4F23A]' : 'bg-[#E6DFD2]'
                        }`}
                      />
                      <div
                        className={`flex-1 rounded-full ${
                          strengthScore === 3 ? 'bg-[#1D7A53]' : 'bg-[#E6DFD2]'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#5E5A52] pt-0.5">
                      <span className={hasMinLength ? 'text-[#1D7A53] font-semibold flex items-center gap-0.5' : ''}>
                        {hasMinLength && <Check className="w-3 h-3" />} 8+ chars
                      </span>
                      <span className={hasUppercase ? 'text-[#1D7A53] font-semibold flex items-center gap-0.5' : ''}>
                        {hasUppercase && <Check className="w-3 h-3" />} Uppercase
                      </span>
                      <span className={hasNumber ? 'text-[#1D7A53] font-semibold flex items-center gap-0.5' : ''}>
                        {hasNumber && <Check className="w-3 h-3" />} Number
                      </span>
                    </div>
                  </div>

                  {errors.password && (
                    <p className="text-[11px] font-semibold text-[#B42318]">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm" className="text-xs font-semibold text-[#16140F]">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5E5A52] absolute left-3 top-3 pointer-events-none" />
                    <Input
                      id="signup-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      className="pl-9 pr-10 h-11 text-base bg-[#FBF8F3] border-[#E6DFD2] rounded-[10px]"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? 'signup-confirm-err' : undefined}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-3 text-[#5E5A52] hover:text-[#16140F]"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="signup-confirm-err" className="text-[11px] font-semibold text-[#B42318]">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 text-base font-bold bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 rounded-[10px]"
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Local Account'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Footnote */}
            <div className="mt-6 pt-4 border-t border-[#E6DFD2] text-[11px] text-[#5E5A52] leading-relaxed">
              Your account and data live only in this browser. Clearing site data removes them. No email is sent.
            </div>
          </div>

          {/* Brand Visual Side (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#FBF8F3] border-l border-[#E6DFD2] p-8 flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block mb-2">
                Pure Cash-Flow Engine
              </span>
              <h2 className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F] mb-3">
                Decisions have visible ripples
              </h2>
              <p className="text-xs text-[#5E5A52] leading-relaxed mb-6">
                When you simulate an expense or commitment, RUNWAY recalculates your 30-day runway immediately.
              </p>
              <ConsequenceChain />
            </div>

            <div className="bg-white border border-[#E6DFD2] rounded-xl p-3.5 text-[11px] text-[#5E5A52]">
              <span className="font-bold text-[#16140F] block mb-0.5">Stage 1 Notice</span>
              Forms are strictly validated via Zod. Local authentication storage binds in Stage 2.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
export default SignUp
