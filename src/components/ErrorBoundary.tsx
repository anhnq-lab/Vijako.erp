import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Log to error tracking service (e.g., Sentry)
        if (import.meta.env.PROD) {
            // TODO: Send to error tracking service
            // logErrorToService(error, errorInfo);
        }

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <span className="material-symbols-outlined text-red-600 text-4xl">error</span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                Oops! Đã có lỗi xảy ra
                            </h1>
                            <p className="text-slate-600">
                                Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
                            </p>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm font-semibold text-slate-700 mb-2">
                                    Error Details (Dev Mode):
                                </p>
                                <pre className="text-xs text-red-600 overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                            >
                                Về trang chủ
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                            <p className="text-sm text-slate-500">
                                Nếu lỗi tiếp tục xảy ra, vui lòng liên hệ{' '}
                                <a href="mailto:support@vijako.com" className="text-blue-600 hover:underline">
                                    support@vijako.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook version for functional components
export function useErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null);

    if (error) {
        throw error;
    }

    return setError;
}
