"use client";
import React, { useState } from 'react';
import { signup } from '@/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await signup(email, password);
            alert('Registration successful! Please login.');
            router.push('/login');
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                alert(detail.map(d => d.msg).join('\n'));
            } else {
                alert(detail || 'Registration failed');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen animate-mesh relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }}></div>

            <div className="w-full max-w-md px-4 z-10">
                <div className="glass-panel p-10 rounded-[2.5rem] shadow-2xl border border-white/50">
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="bg-gradient-to-tr from-indigo-800 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-xl text-white mb-4 -rotate-2 hover:rotate-0 transition-transform">
                            ⚖️
                        </div>
                        <h2 className="text-3xl font-extrabold text-indigo-950 tracking-tight">Access LegalBuddy</h2>
                        <p className="text-indigo-800/60 text-sm mt-1 font-medium italic">Empowering your legal journey</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-indigo-900/70 ml-1 uppercase tracking-wider">Email Address</label>
                            <input 
                                type="email" 
                                placeholder="name@email.com" 
                                className="w-full p-4 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/50 bg-white/60 text-indigo-950 placeholder-indigo-300 transition-all shadow-sm"
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-indigo-900/70 ml-1 uppercase tracking-wider">Secure Password</label>
                            <input 
                                type="password" 
                                placeholder="Create a strong password" 
                                className="w-full p-4 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/50 bg-white/60 text-indigo-950 placeholder-indigo-300 transition-all shadow-sm"
                                onChange={(e) => setPassword(e.target.value)} 
                                minLength="8" 
                                required 
                            />
                            <p className="text-[10px] text-indigo-800/50 ml-1 mt-1 font-medium">Min 8 chars with mixed case, number & special char.</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-200 disabled:opacity-70 group flex items-center justify-center gap-2 mt-6"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-indigo-100/50 text-center">
                        <p className="text-sm text-indigo-800/60 font-medium">
                            Already a member? 
                            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 ml-2 font-bold underline-offset-4 hover:underline transition-all">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
