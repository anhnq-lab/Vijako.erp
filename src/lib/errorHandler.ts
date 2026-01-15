// API Error Handler Utility
export class APIError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export async function handleAPIError(error: any): Promise<never> {
    console.error('API Error:', error);

    // Supabase error
    if (error?.message) {
        throw new APIError(
            error.message,
            error.status || error.statusCode,
            error.code,
            error.details
        );
    }

    // Network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new APIError(
            'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
            0,
            'NETWORK_ERROR'
        );
    }

    // Generic error
    throw new APIError(
        error?.toString() || 'Đã có lỗi xảy ra',
        500,
        'UNKNOWN_ERROR'
    );
}

// Retry utility for failed requests
export async function retryAsync<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        delay?: number;
        backoff?: boolean;
    } = {}
): Promise<T> {
    const { maxRetries = 3, delay = 1000, backoff = true } = options;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = i === maxRetries - 1;

            if (isLastAttempt) {
                throw error;
            }

            const waitTime = backoff ? delay * Math.pow(2, i) : delay;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw new Error('Max retries reached');
}

// Safe async wrapper with error handling
export async function safeAsync<T>(
    promise: Promise<T>,
    errorMessage?: string
): Promise<[T | null, Error | null]> {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        console.error(errorMessage || 'Async operation failed:', error);
        return [null, error as Error];
    }
}

// Timeout wrapper
export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 30000
): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new APIError('Request timeout', 408, 'TIMEOUT'));
        }, timeoutMs);
    });

    return Promise.race([promise, timeout]);
}

// Log error to external service (placeholder for Sentry, etc.)
export function logError(error: Error, context?: Record<string, any>) {
    if (import.meta.env.PROD) {
        // TODO: Send to error tracking service
        console.error('Production Error:', {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
        });
    } else {
        console.error('Development Error:', error, context);
    }
}

// Format error message for user display
export function getUserFriendlyErrorMessage(error: any): string {
    if (error instanceof APIError) {
        return error.message;
    }

    if (error?.message) {
        // Map common Supabase errors to friendly messages
        const errorMap: Record<string, string> = {
            'JWT expired': 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
            'Invalid login credentials': 'Tên đăng nhập hoặc mật khẩu không đúng.',
            'duplicate key value': 'Dữ liệu đã tồn tại trong hệ thống.',
            'foreign key constraint': 'Không thể xóa do có dữ liệu liên quan.',
            'Network request failed': 'Không thể kết nối đến server.',
        };

        for (const [key, message] of Object.entries(errorMap)) {
            if (error.message.includes(key)) {
                return message;
            }
        }

        return error.message;
    }

    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}
