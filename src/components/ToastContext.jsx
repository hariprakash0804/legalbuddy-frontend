"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const safeMessage = typeof message === 'string' 
            ? message 
            : (typeof message?.message === 'string' ? message.message : String(message || 'Notification'));
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message: safeMessage, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Mobile Optimized Lex Toast Notification Container */}
            <div className="fixed top-3 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-5 max-w-[calc(100vw-24px)] sm:max-w-sm w-full z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl border shadow-xl transition-all animate-in slide-in-from-top-4 duration-300 font-sans text-xs ${
                            toast.type === 'success' 
                                ? 'bg-white border-[#1F6B45]/30 text-[#1F6B45] shadow-[#1F6B45]/10' 
                                : toast.type === 'error'
                                ? 'bg-white border-[#9C2A22]/30 text-[#9C2A22] shadow-[#9C2A22]/10'
                                : toast.type === 'warning'
                                ? 'bg-white border-[#966016]/30 text-[#966016] shadow-[#966016]/10'
                                : 'bg-[#0E1B30] text-white border-[#0E1B30] shadow-[#0E1B30]/20'
                        }`}
                    >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <span className="text-base leading-none flex-shrink-0 mt-0.5">
                                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : toast.type === 'warning' ? '⚡' : 'ⓘ'}
                            </span>
                            <div className="leading-relaxed break-words font-medium flex-1">{toast.message}</div>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-[#5B6472] hover:text-[#0E1B30] p-1 rounded transition-colors text-sm font-bold flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
                            aria-label="Dismiss toast"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        return {
            showToast: (msg, type) => {
                if (typeof window !== 'undefined') console.log(`[Toast ${type}]: ${msg}`);
            }
        };
    }
    return context;
}
