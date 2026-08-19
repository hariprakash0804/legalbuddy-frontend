"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { login, getStoredToken } from '@/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ToastContext';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState({ email: false, password: false });
    const [submitted, setSubmitted] = useState(false);

    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined' && getStoredToken()) {
            router.push('/chat');
        }
    }, [router]);

    // Live validation computations
    const emailValidation = useMemo(() => validateEmail(email), [email]);
    const passwordValidation = useMemo(() => validatePassword(password, false), [password]);

    const emailError = (touched.email || submitted) ? emailValidation.error : null;
    const passwordError = (touched.password || submitted) ? passwordValidation.error : null;
    const isFormValid = emailValidation.isValid && passwordValidation.isValid;

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTouched({ email: true, password: true });

        if (!emailValidation.isValid) {
            showToast(emailValidation.error || "Please enter a valid email address.", "warning");
            return;
        }

        if (!passwordValidation.isValid) {
            showToast(passwordValidation.error || "Please enter your password.", "warning");
            return;
        }

        setIsSubmitting(true);
        const trimmedEmail = email.trim();

        try {
            const data = await login(trimmedEmail, password);
            if (data && data.access_token) {
                showToast('Login successful! Welcome back.', 'success');
                router.push('/chat');
            } else {
                showToast("Login failed. Please check your credentials.", "error");
            }
        } catch (err) {
            const errorMsg = typeof err.response?.data?.detail === 'string' 
                ? err.response.data.detail 
                : (err.response?.data?.message || "Login failed. Please check your credentials.");
            showToast(errorMsg, "error");
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
                <span className="text-[#0B5850] font-bold">ⓘ LegalBuddy AI Engine:</span> General legal research & statutory guidance
            </div>

            <div className="w-full max-w-md my-auto">
                <div className="lex-card p-8 sm:p-10 shadow-xl border border-[#D7DBE2] bg-white">
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#0E1B30] text-white flex items-center justify-center font-display font-semibold text-2xl mb-3 shadow-sm">
                            ⚖️
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#0E1B30]">Welcome to LegalBuddy AI</h1>
                        <p className="text-[#5B6472] text-xs sm:text-sm mt-1">Verifiable legal intelligence for citizens & professionals</p>
                    </div>

                    <form onSubmit={handleLogin} noValidate className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="login-email" className="text-xs font-mono font-bold text-[#0E1B30] uppercase tracking-wider">
                                    Email Address
                                </label>
                                {touched.email && emailValidation.isValid && (
                                    <span className="text-[11px] text-[#1F6B45] font-medium flex items-center gap-1 font-mono">
                                        ✓ Valid email
                                    </span>
                                )}
                            </div>
                            <input 
                                id="login-email"
                                type="email" 
                                autoComplete="email"
                                placeholder="name@company.com" 
                                className={`w-full px-3.5 py-3 border rounded-xl bg-white text-[#0E1B30] placeholder-[#5B6472] text-sm font-sans transition-colors focus:outline-none ${
                                    emailError 
                                        ? 'border-[#9C2A22] focus:border-[#9C2A22] focus:ring-2 focus:ring-[#9C2A22]/20 bg-[#FDF7F7]' 
                                        : (touched.email && emailValidation.isValid)
                                        ? 'border-[#1F6B45]/50 focus:border-[#1F6B45] focus:ring-2 focus:ring-[#1F6B45]/20'
                                        : 'border-[#D7DBE2] focus:border-[#0B5850] focus:ring-2 focus:ring-[#0B5850]/20'
                                }`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => handleBlur('email')}
                                aria-invalid={!!emailError}
                                aria-describedby={emailError ? "login-email-error" : undefined}
                                maxLength={120}
                            />
                            {emailError && (
                                <p id="login-email-error" role="alert" className="text-xs text-[#9C2A22] font-medium flex items-center gap-1 mt-1">
                                    <span>⚠️</span> {emailError}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="login-password" className="text-xs font-mono font-bold text-[#0E1B30] uppercase tracking-wider">
                                    Password
                                </label>
                                {touched.password && passwordValidation.isValid && (
                                    <span className="text-[11px] text-[#1F6B45] font-medium flex items-center gap-1 font-mono">
                                        ✓
                                    </span>
                                )}
                            </div>
                            <div className="relative flex items-center">
                                <input 
                                    id="login-password"
                                    type={showPassword ? "text" : "password"} 
                                    autoComplete="current-password"
                                    placeholder="••••••••" 
                                    className={`w-full pl-3.5 pr-12 py-3 border rounded-xl bg-white text-[#0E1B30] placeholder-[#5B6472] text-sm font-sans transition-colors focus:outline-none ${
                                        passwordError 
                                            ? 'border-[#9C2A22] focus:border-[#9C2A22] focus:ring-2 focus:ring-[#9C2A22]/20 bg-[#FDF7F7]' 
                                            : (touched.password && passwordValidation.isValid)
                                            ? 'border-[#1F6B45]/50 focus:border-[#1F6B45] focus:ring-2 focus:ring-[#1F6B45]/20'
                                            : 'border-[#D7DBE2] focus:border-[#0B5850] focus:ring-2 focus:ring-[#0B5850]/20'
                                    }`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    aria-invalid={!!passwordError}
                                    aria-describedby={passwordError ? "login-password-error" : undefined}
                                    maxLength={128}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-xs text-[#0B5850] hover:text-[#12786D] font-semibold px-1.5 py-1 rounded"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {passwordError && (
                                <p id="login-password-error" role="alert" className="text-xs text-[#9C2A22] font-medium flex items-center gap-1 mt-1">
                                    <span>⚠️</span> {passwordError}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mt-2 ${
                                isSubmitting 
                                    ? 'bg-[#0E1B30]/70 cursor-wait' 
                                    : 'bg-[#0E1B30] hover:bg-[#1E2E4A] active:scale-[0.99]'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign in to account →</span>
                            )}
                        </button>
                    </form>

                    {/* Guest Quick Access */}
                    <div className="mt-4 pt-2">
                        <button
                            type="button"
                            onClick={handleGuestAccess}
                            className="w-full py-3 px-4 rounded-xl border border-[#0B5850]/20 bg-[#DCEFEC] hover:bg-[#0B5850] hover:text-white text-[#0B5850] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                            <span>🚀 Explore as Guest (Instant Access)</span>
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#E7E9ED] text-center">
                        <p className="text-xs text-[#5B6472]">
                            Don&apos;t have an account yet? 
                            <Link href="/register" className="text-[#0B5850] ml-1 font-semibold hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


