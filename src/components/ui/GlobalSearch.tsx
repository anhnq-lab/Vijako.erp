import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    id: string;
    type: 'project' | 'document' | 'contract' | 'employee' | 'alert';
    title: string;
    subtitle?: string;
    icon: string;
    path: string;
}

// Mock search function - replace with actual API call
const performSearch = async (query: string): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockResults: SearchResult[] = [
        {
            id: '1',
            type: 'project',
            title: 'Trường Tiểu học Tiên Sơn',
            subtitle: 'PR2500062685 • Đang thi công',
            icon: 'domain',
            path: '/projects/1'
        },
        {
            id: '2',
            type: 'project',
            title: 'The Nine - Khu đô thị',
            subtitle: 'PR2500001234 • Hoàn thiện',
            icon: 'domain',
            path: '/projects/2'
        },
        {
            id: '3',
            type: 'document',
            title: 'Bản vẽ thi công Tầng 1.pdf',
            subtitle: 'Dự án: Trường Tiểu học Tiên Sơn',
            icon: 'description',
            path: '/documents?filter=1'
        },
        {
            id: '4',
            type: 'contract',
            title: 'Hợp đồng Nhà thầu phụ Thảm',
            subtitle: 'HĐ-2024-001 • 2.5 tỷ VNĐ',
            icon: 'contract',
            path: '/finance?tab=contracts'
        },
    ];

    return mockResults.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase())
    );
};

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    // Search debounced
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            const searchResults = await performSearch(query);
            setResults(searchResults);
            setLoading(false);
            setSelectedIndex(0);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
            }
        }
    }, [results, selectedIndex]);

    const handleSelect = (result: SearchResult) => {
        navigate(result.path);
        onClose();
        setQuery('');
    };

    const getTypeColor = (type: string) => {
        const colors = {
            project: 'text-blue-600 bg-blue-50',
            document: 'text-green-600 bg-green-50',
            contract: 'text-purple-600 bg-purple-50',
            employee: 'text-orange-600 bg-orange-50',
            alert: 'text-red-600 bg-red-50',
        };
        return colors[type as keyof typeof colors] || 'text-slate-600 bg-slate-50';
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            project: 'Dự án',
            document: 'Tài liệu',
            contract: 'Hợp đồng',
            employee: 'Nhân viên',
            alert: 'Cảnh báo',
        };
        return labels[type as keyof typeof labels] || type;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                    <span className="material-symbols-outlined text-slate-400 text-[24px]">search</span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tìm kiếm dự án, tài liệu, hợp đồng..."
                        className="flex-1 text-base outline-none placeholder:text-slate-400"
                        autoFocus
                    />
                    {loading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-primary" />
                    )}
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-slate-100 text-slate-600 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {query && results.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div className="bg-slate-100 p-4 rounded-full mb-3">
                                <span className="material-symbols-outlined text-[32px] text-slate-400">search_off</span>
                            </div>
                            <p className="text-sm font-medium text-slate-600">Không tìm thấy kết quả</p>
                            <p className="text-xs text-slate-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
                        </div>
                    )}

                    {!query && (
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Tìm kiếm gần đây
                            </h3>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-left transition-colors">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">history</span>
                                    <span className="text-sm text-slate-700">Trường Tiểu học Tiên Sơn</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-left transition-colors">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">history</span>
                                    <span className="text-sm text-slate-700">Hợp đồng nhà thầu</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="p-2">
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-all ${index === selectedIndex
                                            ? 'bg-primary/5 ring-2 ring-primary/20'
                                            : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                                        <span className="material-symbols-outlined text-[20px]">{result.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {result.title}
                                            </p>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getTypeColor(result.type)}`}>
                                                {getTypeLabel(result.type)}
                                            </span>
                                        </div>
                                        {result.subtitle && (
                                            <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                                        )}
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 text-[18px]">
                                        arrow_forward
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↓</kbd>
                            <span className="ml-1">di chuyển</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↵</kbd>
                            <span className="ml-1">chọn</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">ESC</kbd>
                        <span className="ml-1">đóng</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Hook to use global search with keyboard shortcut
export const useGlobalSearch = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            // ESC to close
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return { isOpen, setIsOpen };
};
