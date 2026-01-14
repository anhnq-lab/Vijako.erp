import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 m-4 shadow-xl">
                    <h4 className="font-black text-lg mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        Đã xảy ra lỗi hệ thống
                    </h4>
                    <p className="font-bold mb-4 p-3 bg-red-100/50 rounded border border-red-200">
                        {this.state.error?.message || 'Lỗi không xác định'}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">Stack Trace:</p>
                            <pre className="p-4 bg-slate-900 text-slate-300 text-[10px] rounded overflow-auto max-h-40 leading-relaxed font-mono">
                                {this.state.error?.stack}
                            </pre>
                        </div>

                        {this.state.errorInfo && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">Component Stack:</p>
                                <pre className="p-4 bg-slate-900 text-slate-300 text-[10px] rounded overflow-auto max-h-40 leading-relaxed font-mono">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                        >
                            Tải lại trang
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-white border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
