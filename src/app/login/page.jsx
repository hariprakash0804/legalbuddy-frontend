"use client";
import React, { useState, useEffect } from 'react';
import { login } from '@/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    return (
        <div className="flex items-center justify-center min-h-screen animate-mesh relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md px-4 z-10 transition-all duration-700 ease-out translate-y-0 opacity-100">
                <div className="glass-panel p-10 rounded-[2rem] shadow-2xl border border-white/40">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-xl text-white mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
                            ⚖️
                        </div>
                        <h2 className="text-3xl font-extrabold text-indigo-950 tracking-tight">LegalBuddy</h2>
                        <p className="text-indigo-800/60 text-sm mt-1 font-medium">Your AI Legal Companion</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-indigo-900/70 ml-1 uppercase tracking-wider">Email Address</label>
                            <input 
                                type="email" 
                                placeholder="name@company.com" 
                                className="w-full p-4 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/50 text-indigo-950 placeholder-indigo-300 transition-all shadow-sm"
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-indigo-900/70 ml-1 uppercase tracking-wider">Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="w-full p-4 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/50 text-indigo-950 placeholder-indigo-300 transition-all shadow-sm"
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-indigo-950 text-white p-4 rounded-xl hover:bg-black transition-all font-bold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-2 mt-4"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-indigo-100/50 text-center">
                        <p className="text-sm text-indigo-800/60 font-medium">
                            Don't have an account? 
                            <Link href="/register" className="text-indigo-700 hover:text-indigo-900 ml-2 font-bold underline-offset-4 hover:underline transition-all">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
