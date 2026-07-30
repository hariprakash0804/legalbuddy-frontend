"use client";
import React, { useState } from 'react';
import { signup } from '@/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ToastContext';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await signup(email, password);
            showToast('Registration successful! Please login.', 'success');
            router.push('/login');
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                showToast(detail.map(d => d.msg).join(', '), 'error');
            } else {
                showToast(detail || 'Registration failed. Please check your inputs.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGuestAccess = () => {
        router.push('/chat');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full py-8 px-4 bg-[#F6F7F9]">
            {/* Top Disclosure Banner */}
            <div className="w-full max-w-md mb-6 p-2.5 rounded-xl bg-[#FBF8F1] border border-[#EAE4D7] text-center text-xs text-[#2C3752] font-medium">
                <span className="text-[#0B5850] font-bold">ⓘ Lex Engine:</span> General legal research & statutory guidance
            </div>

            <div className="w-full max-w-md my-auto">
                <div className="lex-card p-8 sm:p-10 shadow-xl border border-[#D7DBE2] bg-white">
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#0E1B30] text-white flex items-center justify-center font-display font-semibold text-2xl mb-3 shadow-sm">
                            L
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#0E1B30]">Create your Lex Account</h1>
                        <p className="text-[#5B6472] text-xs sm:text-sm mt-1">Verifiable legal intelligence for citizens & professionals</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold text-[#0E1B30] uppercase tracking-wider">Email Address</label>
                            <input 
                                type="email" 
                                placeholder="name@email.com" 
                                className="w-full px-3.5 py-3 border border-[#D7DBE2] rounded-xl focus:outline-none focus:border-[#0B5850] bg-white text-[#0E1B30] placeholder-[#5B6472] text-sm font-sans"
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold text-[#0E1B30] uppercase tracking-wider">Password</label>
                            <div className="relative flex items-center">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Create a strong password" 
                                    className="w-full pl-3.5 pr-12 py-3 border border-[#D7DBE2] rounded-xl focus:outline-none focus:border-[#0B5850] bg-white text-[#0E1B30] placeholder-[#5B6472] text-sm font-sans"
                                    onChange={(e) => setPassword(e.target.value)} 
                                    minLength="8" 
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-xs text-[#0B5850] font-semibold px-1 py-0.5"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <p className="text-[10px] text-[#5B6472] mt-1 font-mono">Minimum 8 characters with mixed case & numbers.</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-3.5 px-4 rounded-xl bg-[#0E1B30] text-white hover:bg-[#1E2E4A] transition-all font-semibold text-sm shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                        >
                            {isSubmitting ? "Registering..." : "Create Account →"}
                        </button>
                    </form>

                    {/* Guest Quick Access */}
                    <div className="mt-4 pt-2">
                        <button
                            type="button"
                            onClick={handleGuestAccess}
                            className="w-full py-3 px-4 rounded-xl border border-[#0B5850]/20 bg-[#DCEFEC] hover:bg-[#0B5850] hover:text-white text-[#0B5850] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                            <span>🚀 Continue as Guest (No Registration Required)</span>
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#E7E9ED] text-center">
                        <p className="text-xs text-[#5B6472]">
                            Already a member? 
                            <Link href="/login" className="text-[#0B5850] ml-1 font-semibold hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
