import React from 'react'
import { Link } from 'react-router'
import { Logo } from '@/components/Logo'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ArrowLeft, Home, Compass } from 'lucide-react'

export const NotFound: React.FC = () => {
  useDocumentTitle('404 Page Not Found')

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#16140F] flex flex-col justify-between p-6">
      <header className="max-w-4xl mx-auto w-full">
        <Logo />
      </header>

      <main className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#E6DFD2] flex items-center justify-center mx-auto mb-6 shadow-xs text-[#5E5A52]">
          <Compass className="w-8 h-8 text-[#16140F]" />
        </div>

        <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wider block mb-2">
          404 Error · Off The Runway
        </span>

        <h1 className="font-['Bricolage_Grotesque_Variable'] text-3xl sm:text-4xl font-extrabold text-[#16140F] mb-3">
          Page not found
        </h1>

        <p className="text-sm text-[#5E5A52] leading-relaxed mb-8">
          The requested coordinate does not exist on this 30-day runway. Check your URL or return to the main cockpit.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/app"
            className="w-full sm:w-auto bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 font-bold text-sm px-5 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Open Today Cockpit</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto bg-white border border-[#E6DFD2] hover:border-[#16140F] text-[#16140F] font-semibold text-sm px-5 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing</span>
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-[#5E5A52]">
        RUNWAY · 30-Day Cash Flow Simulator
      </footer>
    </div>
  )
}
export default NotFound
