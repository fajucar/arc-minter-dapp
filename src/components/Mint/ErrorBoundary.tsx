import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class MintPageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MintPage Error:', error)
    console.error('Error Info:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mint Your <span className="text-cyan-400">Arc NFTs</span>
            </h1>
          </div>
          <div className="bg-slate-900/50 border border-yellow-500/25 rounded-xl p-8 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-white">Page Error</h2>
            <p className="text-slate-300 mb-4 max-w-2xl mx-auto">
              An error occurred loading this page. Please refresh or check your configuration.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

