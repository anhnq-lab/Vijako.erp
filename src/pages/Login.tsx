import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Building2 } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { refreshUser } = useAuth();

    // Get redirect path
    const from = location.state?.from?.pathname || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await authService.signIn(email, password);
            await refreshUser(); // Fetch user profile
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center">
            <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm"></div>

            <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                        <Building2 className="w-10 h-10 text-blue-700" />
                        <div>
                            <span className="text-2xl font-bold text-red-600">VI</span>
                            <span className="text-2xl font-bold text-blue-700">JAKO</span>
                        </div>
                    </div>
                </div>

                <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
                    Hệ thống Quản trị Doanh nghiệp
                </h2>
                <p className="mt-2 text-center text-sm text-blue-100">
                    Đăng nhập để truy cập không gian làm việc của bạn
                </p>
            </div>

            <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                    placeholder="nhanvien@vijako.com.vn"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mật khẩu
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Đăng nhập <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        </div>



                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail('admin@vijako.com.vn');
                                    setPassword('123456');
                                }}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                Auto Fill (Admin)
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!email || !password) {
                                        setError('Vui lòng nhập Email và Mật khẩu để đăng ký');
                                        return;
                                    }
                                    try {
                                        setIsLoading(true);
                                        await authService.signUp(email, password);
                                        // Auto login after signup in some cases, or just notify
                                        // For simplicity, try to login immediately or say "Success"
                                        setError('Đăng ký thành công! Đang đăng nhập...');
                                        await authService.signIn(email, password);
                                        await refreshUser();
                                        navigate(from, { replace: true });
                                    } catch (err: any) {
                                        setError('Đăng ký thất bại: ' + (err.message || 'Lỗi không xác định'));
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                className="w-full flex justify-center py-2 px-4 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                Đăng ký mới
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Hỗ trợ kỹ thuật: it@vijako.com.vn
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default LoginPage;
