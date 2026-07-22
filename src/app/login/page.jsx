"use client";
import React, { useState, useEffect } from 'react';
import { login } from '@/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('token')) {
            router.push('/chat');
        }
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = await login(email, password);
            if (data && data.access_token) {
                router.push('/chat');
            }
        } catch (err) {
            alert("Login failed. Please check your credentials.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGuestAccess = () => {
        router.push('/chat');
    };

    return (
        <div className="flex items-center justify-center min-h-[100dvh] w-full py-8 px-4 animate-mesh relative overflow-x-hidden overflow-y-auto">
            {/* Ambient Animated Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-indigo-300/30 rounded-full blur-[120px] blob-animate pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-300/30 rounded-full blur-[120px] blob-animate-delay pointer-events-none"></div>
            <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-blue-200/20 rounded-full blur-[90px] blob-animate-delay-2 pointer-events-none"></div>

            <div className="w-full max-w-md my-auto z-10 transition-all duration-700 ease-out">
                {/* Hero Badge Pill */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 border border-white/80 shadow-sm backdrop-blur-md text-[11px] font-bold text-indigo-900 uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Trusted Indian Legal Assistant
                    </div>
                </div>

                <div className="glass-panel p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-white/60 relative">
                    <div className="flex flex-col items-center mb-6 sm:mb-8">
                        <div className="relative mb-3 sm:mb-4">
                            <div className="absolute inset-0 bg-indigo-600/30 rounded-2xl blur-lg animate-pulse"></div>
                            <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-xl text-white relative z-10 rotate-3 hover:rotate-0 transition-transform duration-300">
                                ⚖️
                            </div>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">Welcome to LegalBuddy</h2>
                        <p className="text-indigo-800/60 text-xs sm:text-sm mt-1 font-medium">Empowering your legal intelligence</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-indigo-950/80 ml-1 uppercase tracking-wider">Email Address</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-slate-400 text-sm pointer-events-none">✉️</span>
                                <input 
                                    type="email" 
                                    placeholder="name@company.com" 
                                    className="w-full pl-11 pr-4 py-3.5 sm:py-4 border border-indigo-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/70 text-indigo-950 placeholder-indigo-300 transition-all shadow-sm text-base sm:text-sm font-medium"
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-indigo-950/80 ml-1 uppercase tracking-wider">Password</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-slate-400 text-sm pointer-events-none">🔒</span>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    className="w-full pl-11 pr-11 py-3.5 sm:py-4 border border-indigo-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/70 text-indigo-950 placeholder-indigo-300 transition-all shadow-sm text-base sm:text-sm font-medium"
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-xs text-indigo-600 hover:text-indigo-900 font-bold px-1.5 py-1 rounded-md transition-colors"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full shimmer-btn bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white py-3.5 sm:py-4 px-6 rounded-xl hover:from-black hover:to-indigo-950 active:scale-[0.98] transition-all font-bold shadow-lg shadow-indigo-950/20 disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-2 mt-4 text-base sm:text-sm"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In to Account</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Guest Quick Access Button */}
                    <div className="mt-4 pt-3">
                        <button
                            type="button"
                            onClick={handleGuestAccess}
                            className="w-full py-3 px-4 rounded-xl border border-indigo-200/80 bg-indigo-50/50 hover:bg-white text-indigo-900 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <span>🚀 Explore as Guest (Instant Access)</span>
                        </button>
                    </div>

                    <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-indigo-100/60 text-center">
                        <p className="text-xs sm:text-sm text-indigo-800/70 font-medium">
                            Don&apos;t have an account yet? 
                            <Link href="/register" className="text-indigo-700 hover:text-indigo-950 ml-1.5 font-bold underline-offset-4 hover:underline transition-all">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
