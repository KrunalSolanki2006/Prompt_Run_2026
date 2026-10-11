import React, { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, type SignInFormData } from '@/features/auth/schemas'
import { useAuth } from '@/features/auth/AuthContext'
import { Logo } from '@/components/Logo'
import { ConsequenceChain } from '@/components/ConsequenceChain'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Clock } from 'lucide-react'

export const SignIn: React.FC = () => {
  useDocumentTitle('Sign In')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const { user, signIn, lockoutRemainingSeconds } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
  })

  // Redirect if already authenticated
  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app'
    return <Navigate to={from} replace />
  }

  const onSubmit = async (data: SignInFormData) => {
    setAuthError(null)
    const result = await signIn(data.email, data.password)
    if (!result.success) {
      setAuthError(result.error ?? 'Email or password is incorrect.')
    } else {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app'
      navigate(from, { replace: true })
    }
  }

  const isLocked = lockoutRemainingSeconds > 0

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#16140F] flex flex-col">
      {/* Top bar */}
      <header className="px-6 py-4 border-b border-[#E6DFD2] bg-[#FBF8F3]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <Link
            to="/sign-up"
            className="text-xs font-semibold text-[#5E5A52] hover:text-[#16140F]"
          >
            Don't have an account? <span className="underline">Create one</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-4xl bg-white border border-[#E6DFD2] rounded-[18px] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Form Side */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="mb-8">
                <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block mb-1">
                  Local Browser Session
                </span>
                <h1 className="font-['Bricolage_Grotesque_Variable'] text-2xl sm:text-3xl font-extrabold text-[#16140F]">
                  Welcome back to RUNWAY
                </h1>
                <p className="text-xs text-[#5E5A52] mt-1.5">
                  Sign in with your local account credentials to access your 30-day cycle.
                </p>
              </div>

              {/* Lockout Banner */}
              {isLocked && (
                <div
                  className="mb-4 p-3 rounded-lg bg-[#A15C07]/10 border border-[#A15C07]/30 text-xs text-[#A15C07] flex items-center gap-2"
                  role="alert"
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    Too many failed attempts. Temporary lockout active: wait{' '}
                    <strong>{lockoutRemainingSeconds}s</strong>.
                  </span>
                </div>
              )}

              {/* Error summary live region */}
              <div aria-live="polite" aria-atomic="true" className="mb-4">
                {authError && (
                  <div
                    className="p-3 rounded-lg bg-[#B42318]/10 border border-[#B42318]/30 text-xs text-[#B42318] flex items-center gap-2"
                    role="alert"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}
                {Object.keys(errors).length > 0 && !authError && (
                  <div
                    className="p-3 rounded-lg bg-[#B42318]/10 border border-[#B42318]/30 text-xs text-[#B42318] flex items-center gap-2"
                    role="alert"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Please enter a valid email and password.</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-xs font-semibold text-[#16140F]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#5E5A52] absolute left-3 top-3 pointer-events-none" />
                    <Input
                      id="signin-email"
                      type="email"
                      autoComplete="email"
                      placeholder="alex@example.com"
                      className="pl-9 h-11 text-base bg-[#FBF8F3] border-[#E6DFD2] rounded-[10px]"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'signin-email-err' : undefined}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p id="signin-email-err" className="text-[11px] font-semibold text-[#B42318]">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="signin-password" className="text-xs font-semibold text-[#16140F]">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5E5A52] absolute left-3 top-3 pointer-events-none" />
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Your password"
                      className="pl-9 pr-10 h-11 text-base bg-[#FBF8F3] border-[#E6DFD2] rounded-[10px]"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'signin-pass-err' : undefined}
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
                  {errors.password && (
                    <p id="signin-pass-err" className="text-[11px] font-semibold text-[#B42318]">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLocked}
                    className="w-full h-11 text-base font-bold bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 rounded-[10px]"
                  >
                    {isSubmitting ? 'Signing in...' : isLocked ? `Locked (${lockoutRemainingSeconds}s)` : 'Sign In'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Footnote */}
            <div className="mt-8 pt-4 border-t border-[#E6DFD2] text-[11px] text-[#5E5A52] leading-relaxed">
              Your account and data live only in this browser. Clearing site data removes them.
            </div>
          </div>

          {/* Visual Side */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#FBF8F3] border-l border-[#E6DFD2] p-8 flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block mb-2">
                Simulated Cockpit
              </span>
              <h2 className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F] mb-3">
                Cash flow with foresight
              </h2>
              <ConsequenceChain />
            </div>

            <div className="text-[11px] text-[#5E5A52] pt-4 border-t border-[#E6DFD2]">
              Need to initialize a new 30-day cycle?{' '}
              <Link to="/sign-up" className="font-semibold text-[#16140F] underline">
                Sign up here
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
export default SignIn
