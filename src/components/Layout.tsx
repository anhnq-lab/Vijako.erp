import React, { useState } from 'react';
import { ResponsiveSidebar } from './layout/ResponsiveSidebar';
import { GlobalSearch, useGlobalSearch } from './ui/GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { ChatWidget } from './AIChat/ChatWidget';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isOpen: isSearchOpen, setIsOpen: setSearchOpen } = useGlobalSearch();
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full">
            {/* Global Search */}
            <GlobalSearch isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />

            {/* Responsive Sidebar */}
            <ResponsiveSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light">
                {/* Mobile Header with Hamburger */}
                <div className="lg:hidden h-16 glass border-b border-slate-200/50 flex items-center px-6 z-10">
                    <button
                        onClick={toggleSidebar}
                        className="size-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-premium"
                    >
                        <span className="material-symbols-outlined text-slate-700">menu</span>
                    </button>

                    <div className="flex items-center gap-3 ml-4">
                        <div className="size-8 mesh-gradient text-white rounded-lg flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-[18px]">apartment</span>
                        </div>
                        <h1 className="text-lg font-black tracking-tighter text-slate-900">
                            VIJAKO
                        </h1>
                    </div>

                    {/* Search Button on Mobile */}
                    <div className="ml-auto flex items-center gap-2">
                        <NotificationBell />
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="size-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-premium"
                        >
                            <span className="material-symbols-outlined text-slate-700">search</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="size-10 flex items-center justify-center hover:bg-red-50 text-red-600 rounded-xl transition-premium"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Desktop User/Logout Header (Optional - if Sidebar doesn't have it) */}
                {/* For now, just render children, assuming Sidebar has nav, but maybe we want a top bar on desktop too? 
            The original design didn't seem to have a top bar on desktop, just sidebar.
            I will add a logout button to the Sidebar or here? 
            Let's keep it simple. If we need logout on desktop, we should check where to put it.
            Usually it's in the sidebar or a top right user menu.
            For now I'll just add it to the mobile header above.
        */}

                {children}
            </main>

            <ChatWidget />
        </div>
    );
};
