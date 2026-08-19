"use client";
import React, { useState, useMemo } from 'react';
import { signup } from '@/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ToastContext';
import { 
    validateEmail, 
    validatePassword, 
    getPasswordStrength, 
    validateConfirmPassword, 
    validateTerms 
} from '@/utils/validation';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [touched, setTouched] = useState({
        email: false,
        password: false,
        confirmPassword: false,
        terms: false,
    });
    const [submitted, setSubmitted] = useState(false);

    const router = useRouter();
    const { showToast } = useToast();

    // Live validation computations
    const emailValidation = useMemo(() => validateEmail(email), [email]);
    const passwordValidation = useMemo(() => validatePassword(password, true), [password]);
    const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
    const confirmValidation = useMemo(() => validateConfirmPassword(password, confirmPassword), [password, confirmPassword]);
    const termsValidation = useMemo(() => validateTerms(acceptTerms), [acceptTerms]);

    const emailError = (touched.email || submitted) ? emailValidation.error : null;
    const passwordError = (touched.password || submitted) ? passwordValidation.error : null;
    const confirmError = (touched.confirmPassword || submitted) ? confirmValidation.error : null;
    const termsError = (touched.terms || submitted) ? termsValidation.error : null;

    const isFormValid = emailValidation.isValid && 
                         passwordValidation.isValid && 
                         confirmValidation.isValid && 
                         termsValidation.isValid;

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTouched({ email: true, password: true, confirmPassword: true, terms: true });

        if (!emailValidation.isValid) {
            showToast(emailValidation.error || "Please enter a valid email address.", "warning");
            return;
        }

        if (!passwordValidation.isValid) {
            showToast(passwordValidation.error || "Please enter a valid password.", "warning");
            return;
        }

        if (!confirmValidation.isValid) {
            showToast(confirmValidation.error || "Passwords do not match.", "warning");
            return;
        }

        if (!termsValidation.isValid) {
            showToast(termsValidation.error || "Please accept the legal guidance disclaimer.", "warning");
            return;
        }

        setIsSubmitting(true);
        const trimmedEmail = email.trim();

        try {
            await signup(trimmedEmail, password);
            showToast('Registration successful! Please login with your credentials.', 'success');
            router.push('/login');
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                const message = detail.map(d => typeof d?.msg === 'string' ? d.msg : 'Invalid input').join(', ');
                showToast(message, 'error');
            } else if (typeof detail === 'string') {
                showToast(detail, 'error');
            } else {
                showToast('Registration failed. Please check your inputs.', 'error');
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
                <span className="text-[#0B5850] font-bold">ⓘ LegalBuddy AI Engine:</span> General legal research & statutory guidance
            </div>

            <div className="w-full max-w-md my-auto">
                <div className="lex-card p-6 sm:p-8 shadow-xl border border-[#D7DBE2] bg-white">
                    <div className="flex flex-col items-center mb-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#0E1B30] text-white flex items-center justify-center font-display font-semibold text-2xl mb-3 shadow-sm">
                            ⚖️
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#0E1B30]">Create Account</h1>
                        <p className="text-[#5B6472] text-xs sm:text-sm mt-1">Verifiable legal intelligence for citizens & professionals</p>
                    </div>

                    <form onSubmit={handleRegister} noValidate className="space-y-4">
                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="reg-email" className="text-xs font-mono font-bold text-[#0E1B30] uppercase tracking-wider">
                                    Email Address
                                </label>
                                {touched.email && emailValidation.isValid && (
                                    <span className="text-[11px] text-[#1F6B45] font-medium flex items-center gap-1 font-mono">
                                        ✓ Valid email
                                    </span>
                                )}
                            </div>
                            <input 
                                id="reg-email"
                                type="email" 
                                autoComplete="email"
                                placeholder="name@email.com" 
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
                                aria-describedby={emailError ? "reg-email-error" : undefined}
                                maxLength={120}
                            />
                            {emailError && (
                                <p id="reg-email-error" role="alert" className="text-xs text-[#9C2A22] font-medium flex items-center gap-1 mt-1">
                                    <span>⚠️</span> {emailError}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="reg-password" className="text-xs font-mono font-bold text-[#0E1B30] uppercase tracking-wider">
                                    Password
                                </label>
                                {password && (
                                    <span 
                                        className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                                        style={{ color: passwordStrength.color, backgroundColor: `${passwordStrength.color}15` }}
                                    >
                                        Strength: {passwordStrength.label}
                                    </span>
                                )}
                            </div>
                            <div className="relative flex items-center">
                                <input 
                                    id="reg-password"
                                    type={showPassword ? "text" : "password"} 
                                    autoComplete="new-password"
                                    placeholder="Create a strong password" 
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
                                    aria-describedby={passwordError ? "reg-password-error" : undefined}
                                    minLength={8} 
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

                            {/* Dynamic Password Strength Progress Bar */}
                            {password.length > 0 && (
                                <div className="space-y-2 pt-1">
                                    <div className="w-full bg-[#E7E9ED] h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full transition-all duration-300 rounded-full"
                                            style={{ 
                                                width: passwordStrength.barWidth, 
                                                backgroundColor: passwordStrength.color 
                                            }}
                                        />
                                    </div>

                                    {/* Password Requirements Checklist */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                        {passwordStrength.requirements.map(req => (
                                            <div 
                                                key={req.key}
                                                className={`text-[11px] flex items-center gap-1.5 transition-colors ${
                                                    req.met ? 'text-[#1F6B45] font-medium' : 'text-[#5B6472]'
                                                }`}
                                            >
                                                <span>{req.met ? '✓' : '○'}</span>
                                                <span className="truncate">{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {passwordError && (
                                <p id="reg-password-error" role="alert" className="text-xs text-[#9C2A22] font-medium flex items-center gap-1 mt-1">
                                    <span>⚠️</span> {passwordError}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="reg-confirm-password" className="text-xs font-mono font-bold text-[#0E1B30] uppercase tracking-wider">
                                    Confirm Password
                                </label>
                                {confirmPassword && (
                                    <span className={`text-[11px] font-mono font-medium flex items-center gap-1 ${
                                        confirmValidation.isValid ? 'text-[#1F6B45]' : 'text-[#9C2A22]'
                                    }`}>
                                        {confirmValidation.isValid ? '✓ Match' : '✗ Does not match'}
                                    </span>
                                )}
                            </div>
                            <div className="relative flex items-center">
                                <input 
                                    id="reg-confirm-password"
                                    type={showConfirmPassword ? "text" : "password"} 
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password" 
                                    className={`w-full pl-3.5 pr-12 py-3 border rounded-xl bg-white text-[#0E1B30] placeholder-[#5B6472] text-sm font-sans transition-colors focus:outline-none ${
                                        confirmError 
                                            ? 'border-[#9C2A22] focus:border-[#9C2A22] focus:ring-2 focus:ring-[#9C2A22]/20 bg-[#FDF7F7]' 
                                            : (touched.confirmPassword && confirmValidation.isValid)
                                            ? 'border-[#1F6B45]/50 focus:border-[#1F6B45] focus:ring-2 focus:ring-[#1F6B45]/20'
                                            : 'border-[#D7DBE2] focus:border-[#0B5850] focus:ring-2 focus:ring-[#0B5850]/20'
                                    }`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    onBlur={() => handleBlur('confirmPassword')}
                                    aria-invalid={!!confirmError}
                                    aria-describedby={confirmError ? "reg-confirm-error" : undefined}
                                    maxLength={128}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 text-xs text-[#0B5850] hover:text-[#12786D] font-semibold px-1.5 py-1 rounded"
                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {confirmError && (
                                <p id="reg-confirm-error" role="alert" className="text-xs text-[#9C2A22] font-medium flex items-center gap-1 mt-1">
                                    <span>⚠️</span> {confirmError}
                                </p>
                            )}
                        </div>

                        {/* Legal Disclaimer & Terms Checkbox */}
                        <div className="pt-2">
                            <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <input 
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => {
                                        setAcceptTerms(e.target.checked);
                                        setTouched(prev => ({ ...prev, terms: true }));
                                    }}
                                    className="mt-1 w-4 h-4 rounded border-[#D7DBE2] text-[#0B5850] focus:ring-[#0B5850] cursor-pointer"
                                />
                                <span className="text-xs text-[#5B6472] leading-relaxed">
                                    I understand LegalBuddy AI provides statutory guidance & legal information for research purposes, and not formal legal advice or representation.
                                </span>
                            </label>
                            {termsError && (
                                <p role="alert" className="text-xs text-[#9C2A22] font-medium flex items-center gap-1 mt-1.5 ml-6">
                                    <span>⚠️</span> {termsError}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mt-4 ${
                                isSubmitting 
                                    ? 'bg-[#0E1B30]/70 cursor-wait' 
                                    : 'bg-[#0E1B30] hover:bg-[#1E2E4A] active:scale-[0.99]'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <span>Create Account →</span>
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
                            <span>🚀 Continue as Guest (No Registration Required)</span>
                        </button>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[#E7E9ED] text-center">
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


