import { Component, ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 800 }}>
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            {this.state.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm transition-colors border-none cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
