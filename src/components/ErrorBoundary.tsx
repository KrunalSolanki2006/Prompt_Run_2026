import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { Button } from './ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[300px] p-6 flex items-center justify-center bg-[#FBF8F3]">
          <div className="max-w-md w-full bg-white border border-[#E6DFD2] rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#B42318]/10 text-[#B42318] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#16140F]">Something went wrong loading this section</h2>
            <p className="text-xs text-[#5E5A52] leading-relaxed">
              {this.state.error?.message || 'A network error or asset update occurred while loading this view.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                onClick={this.handleReload}
                className="bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 text-xs font-bold rounded-lg h-9 px-4 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload View</span>
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="border-[#E6DFD2] text-[#16140F] text-xs font-semibold rounded-lg h-9 px-4 flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
export default ErrorBoundary
