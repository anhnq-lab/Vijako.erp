
import React, { useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { MessageCircle, X } from 'lucide-react';

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-[400px] h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
                    <ChatWindow onClose={() => setIsOpen(false)} />
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
};
