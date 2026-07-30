"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { authHeader, logout, getApiUrl } from '@/services/auth';

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'ur', name: 'Urdu (اردو)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'as', name: 'Assamese (অসমীয়া)' },
    { code: 'mai', name: 'Maithili (मैथिली)' },
    { code: 'sa', name: 'Sanskrit (संस्कृतम्)' },
    { code: 'ne', name: 'Nepali (नेपाली)' },
    { code: 'sd', name: 'Sindhi (سنڌي)' },
    { code: 'ks', name: 'Kashmiri (कॉशुर)' },
    { code: 'doi', name: 'Dogri (डोगरी)' },
    { code: 'kok', name: 'Konkani (कोंकणी)' },
    { code: 'mni-Mtei', name: 'Manipuri (মৈতৈলোন্)' },
    { code: 'bo', name: 'Bodo (बड़ो)' },
    { code: 'sat', name: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)' },
];

const STARTER_QUERIES = [
    { 
        category: "Police Rights", 
        icon: "🚓", 
        title: "Traffic & Police Stop", 
        query: "What are my legal rights if stopped by traffic police in India?" 
    },
    { 
        category: "Property", 
        icon: "🏠", 
        title: "Tenant Eviction Laws", 
        query: "What is the legal procedure and notice period for tenant eviction in India?" 
    },
    { 
        category: "Criminal Code", 
        icon: "⚖️", 
        title: "IPC 302 vs 304 Guide", 
        query: "Explain the difference between IPC Section 302 and Section 304 with examples." 
    },
    { 
        category: "Consumer", 
        icon: "🛒", 
        title: "Consumer Court Filing", 
        query: "How do I file a consumer court complaint for defective products or poor services?" 
    }
];

function renderBotText(text) {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        line = line.replace(/_(.*?)_/g, '<em>$1</em>');

        if (line.startsWith('### ')) {
            elements.push(<h4 key={key++} className="font-bold text-base mt-4 mb-2 text-indigo-950 flex items-center gap-1.5 break-words" dangerouslySetInnerHTML={{ __html: line.slice(4) }} />);
        } else if (line.startsWith('## ')) {
            elements.push(<h3 key={key++} className="font-extrabold text-lg mt-5 mb-2 text-indigo-950 border-b border-indigo-100 pb-1 break-words" dangerouslySetInnerHTML={{ __html: line.slice(3) }} />);
        } else if (line.startsWith('# ')) {
            elements.push(<h2 key={key++} className="font-black text-xl mt-6 mb-3 text-indigo-950 break-words" dangerouslySetInnerHTML={{ __html: line.slice(2) }} />);
        } else if (line.match(/^[\s]*[-•]\s/)) {
            elements.push(
                <div key={key++} className="flex gap-3 ml-1 sm:ml-2 my-1.5 items-start">
                    <span className="text-indigo-500 mt-1 text-xs flex-shrink-0">✦</span>
                    <span className="text-slate-700 break-words" dangerouslySetInnerHTML={{ __html: line.replace(/^[\s]*[-•]\s/, '') }} />
                </div>
            );
        } else if (line.match(/^[\s]*\d+\.\s/)) {
            const match = line.match(/^([\s]*\d+\.)\s(.*)/);
            if (match) {
                elements.push(
                    <div key={key++} className="flex gap-2.5 ml-1 sm:ml-2 my-1.5 items-start">
                        <span className="text-indigo-600 font-black text-xs bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 flex-shrink-0">{match[1]}</span>
                        <span className="text-slate-700 break-words" dangerouslySetInnerHTML={{ __html: match[2] }} />
                    </div>
                );
            }
        } else if (line.toLowerCase().includes('section') || line.toLowerCase().includes('article')) {
            elements.push(
                <div key={key++} className="border-l-4 border-indigo-600 bg-indigo-50/80 p-3 rounded-r-xl my-2 shadow-sm font-medium text-slate-800 break-words overflow-x-auto" dangerouslySetInnerHTML={{ __html: line }} />
            );
        } else if (line.trim() === '') {
            elements.push(<div key={key++} className="h-2.5" />);
        } else {
            elements.push(
                <p key={key++} className="my-1.5 break-words" dangerouslySetInnerHTML={{ __html: line }} />
            );
        }
    }
    return elements;
}

const VOICE_LANG_MAP = {
    'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN', 'ta': 'ta-IN',
    'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 'or': 'or-IN', 'pa': 'pa-IN',
    'as': 'as-IN', 'mai': 'hi-IN', 'sa': 'hi-IN', 'ne': 'ne-NP', 'sd': 'sd-IN', 'ks': 'ks-IN',
    'doi': 'hi-IN', 'kok': 'kok-IN', 'mni-Mtei': 'mni-IN', 'bo': 'hi-IN', 'sat': 'hi-IN',
};

export default function ChatPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userEmail, setUserEmail] = useState('Guest');
    const [isGuest, setIsGuest] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [selectedState, setSelectedState] = useState('All States');
    const [availableStates, setAvailableStates] = useState(['All States']);
    const [isListening, setIsListening] = useState(false);
    const [speakingIndex, setSpeakingIndex] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [activeModalSources, setActiveModalSources] = useState(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const scrollRef = useRef();
    const textareaRef = useRef();
    const abortControllerRef = useRef(null);

    // Dynamic Textarea Height Adjustment
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [input]);

    // Detect mobile and auto-manage sidebar
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(true);
            else setSidebarOpen(false);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const email = localStorage.getItem('userEmail') || 'User';
            setUserEmail(email);
            setIsGuest(false);
            const storageKey = `chat_history_${email}`;
            const saved = localStorage.getItem(storageKey);
            if (saved) { try { setMessages(JSON.parse(saved)); } catch { } }
        } else {
            setIsGuest(true);
            setUserEmail('Guest');
        }
        setMounted(true);
    }, [router]);

    const STORAGE_KEY = `chat_history_${userEmail}`;

    useEffect(() => {
        if (!mounted) return;
        const fetchStates = async () => {
            try {
                const headers = isGuest ? {} : authHeader();
                const res = await axios.get(`${getApiUrl()}/chat/states`, { headers });
                setAvailableStates(res.data.states || ['All States']);
            } catch (err) { }
        };
        fetchStates();
    }, [mounted, isGuest]);

    useEffect(() => {
        if (!mounted) return;
        if (!isGuest) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
        if (!searchTerm) { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }
    }, [messages, STORAGE_KEY, searchTerm, mounted, isGuest]);

    const filteredMessages = messages.filter(m => m.text.toLowerCase().includes(searchTerm.toLowerCase()));

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = VOICE_LANG_MAP[selectedLanguage] || 'en-IN';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? " " : "") + transcript);
        };
        recognition.start();
    };

    const speakMessage = (text, index) => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            if (speakingIndex === index) {
                setSpeakingIndex(null);
                return;
            }
        }

        const cleanText = text
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/#/g, '')
            .replace(/__/g, '')
            .replace(/> /g, '')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = VOICE_LANG_MAP[selectedLanguage] || 'en-IN';
        utterance.onstart = () => setSpeakingIndex(index);
        utterance.onend = () => setSpeakingIndex(null);
        utterance.onerror = () => setSpeakingIndex(null);
        window.speechSynthesis.speak(utterance);
    };

    const copyToClipboard = (text, index) => {
        const cleanText = text.replace(/\*\*/g, '').replace(/### /g, '').replace(/## /g, '');
        navigator.clipboard.writeText(cleanText);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2500);
    };

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        const langLabel = LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'English';
        const userMsg = { role: 'user', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), language: langLabel, state: selectedState };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const headers = isGuest ? {} : authHeader();
            const history = messages.slice(-6).map(m => ({
                role: m.role === 'bot' ? 'assistant' : 'user',
                text: m.text
            }));

            const res = await axios.post(`${getApiUrl()}/chat/query`,
                { 
                    question: input, 
                    target_language: selectedLanguage, 
                    state_filter: selectedState === 'All States' ? null : selectedState, 
                    top_k: 20, 
                    max_tokens: 4000, 
                    temperature: 0.2,
                    history: history
                },
                { headers, signal: controller.signal }
            );
            const botMsg = {
                role: 'bot',
                text: res.data.answer,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sources: res.data.sources,
                chunks: res.data.chunks_found,
                language: langLabel,
                langCode: selectedLanguage
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            if (axios.isCancel(err)) {
                setMessages(prev => [...prev, { role: 'error', text: '⏹️ Generation stopped by user.', time: new Date().toLocaleTimeString() }]);
            } else if (err.response?.status === 401 && !isGuest) {
                logout(); return;
            } else {
                setMessages(prev => [...prev, { role: 'error', text: `⚠️ ${err.response?.data?.detail || 'Connection failed.'}`, time: new Date().toLocaleTimeString() }]);
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const downloadChat = () => {
        const chatText = messages.map(m => `[${m.time}] ${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LegalBuddy_History.txt`;
        a.click();
    };

    if (!mounted) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-xs font-bold text-indigo-900 tracking-widest uppercase">Initializing Legal AI...</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex text-slate-900 overflow-hidden font-sans h-[100dvh] w-full">
            {/* Ambient Mesh Background Layer */}
            <div className="fixed inset-0 animate-mesh-dark -z-10"></div>

            {/* Glowing Decorative Orbs */}
            <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-indigo-300/20 rounded-full blur-[130px] blob-animate pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-300/20 rounded-full blur-[130px] blob-animate-delay pointer-events-none -z-10"></div>
            <div className="absolute top-[35%] left-[35%] w-[35%] h-[35%] bg-blue-300/15 rounded-full blur-[100px] blob-animate-delay-2 pointer-events-none -z-10"></div>

            {/* Mobile Overlay Backdrop */}
            {isMobile && sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar — Glassmorphism 2.0 */}
            <aside className={`transition-all duration-500 ease-in-out glass-sidebar flex flex-col z-50 h-full
                ${isMobile ? `mobile-sidebar ${sidebarOpen ? 'mobile-sidebar-visible' : 'mobile-sidebar-hidden'}` : (sidebarOpen ? 'w-[280px]' : 'w-0 opacity-0 overflow-hidden')}`}>
                <div className="p-5 sm:p-6 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-6 px-1 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-600/30 rounded-xl blur-sm animate-pulse"></div>
                                <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-white relative z-10">⚖️</div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-indigo-950 text-base tracking-tight">LegalBuddy</span>
                                <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">AI Intelligence</span>
                            </div>
                        </div>
                        {isMobile && (
                            <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 bg-white/60 rounded-xl transition-all" title="Close Drawer">
                                ✕
                            </button>
                        )}
                    </div>

                    <button 
                        onClick={() => { setMessages([]); if (isMobile) setSidebarOpen(false); }} 
                        className="shimmer-btn flex items-center justify-center gap-2 w-full p-3.5 rounded-2xl bg-indigo-950 text-white hover:bg-black active:scale-[0.98] transition-all text-sm font-bold shadow-lg mb-6 group"
                    >
                        <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span> New Chat
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-2 py-1 custom-scrollbar">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-950/60 px-2 mb-2 flex items-center justify-between">
                            <span>History</span>
                            <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 font-bold">{messages.filter(m => m.role === 'user').length}</span>
                        </div>
                        {messages.filter(m => m.role === 'user').slice(-10).reverse().map((m, i) => (
                            <div 
                                key={i} 
                                onClick={() => { if (isMobile) setSidebarOpen(false); }}
                                className="px-3.5 py-3 text-xs text-slate-700 truncate hover:bg-white/70 hover:text-indigo-950 rounded-xl cursor-pointer transition-all border border-transparent hover:border-white/80 shadow-sm flex items-center gap-2.5 group"
                            >
                                <span className="text-indigo-400 group-hover:text-indigo-600">💬</span>
                                <span className="truncate">{m.text}</span>
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <div className="px-4 py-8 text-center border-2 border-dashed border-indigo-100/80 rounded-2xl">
                                <p className="text-[11px] text-indigo-500 font-medium">No recent queries</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-indigo-100/60 space-y-2 flex-shrink-0">
                        <button onClick={downloadChat} className="flex items-center gap-2.5 w-full p-3 rounded-xl hover:bg-white/60 transition-all text-xs font-bold text-slate-700 active:scale-[0.98]">
                            <span>📥</span> Export Conversation
                        </button>
                        {isGuest ? (
                            <div className="mt-2 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/70 space-y-2.5">
                                <p className="text-[10px] text-indigo-950/60 uppercase font-black tracking-widest">Guest Account</p>
                                <button onClick={() => { router.push('/login'); if (isMobile) setSidebarOpen(false); }} className="w-full p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all text-xs text-white font-bold shadow-md shadow-indigo-200">
                                    Sign In
                                </button>
                                <button onClick={() => { router.push('/register'); if (isMobile) setSidebarOpen(false); }} className="w-full p-2.5 rounded-xl border border-indigo-200 hover:bg-white transition-all text-xs text-indigo-700 font-bold">
                                    Create Account
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 flex items-center gap-3 bg-white/70 rounded-2xl border border-white/80 shadow-sm">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
                                    {userEmail[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-indigo-950 truncate uppercase tracking-tighter">{userEmail.split('@')[0]}</p>
                                    <p className="text-[9px] text-indigo-600 truncate">{userEmail}</p>
                                </div>
                                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Logout">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Workspace Area */}
            <main className="flex-1 flex flex-col relative z-10 overflow-hidden h-full">
                {/* Header Bar */}
                <header className="min-h-[56px] sm:min-h-[64px] py-2 sm:py-3 flex-shrink-0 flex items-center justify-between px-3 sm:px-6 md:px-8 glass-header sticky top-0 z-20 pt-safe">
                    <div className="flex items-center gap-2.5 sm:gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 sm:p-2.5 hover:bg-white/70 rounded-xl text-indigo-950 transition-all border border-transparent hover:border-white/60 min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Toggle sidebar">
                            {sidebarOpen && !isMobile ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                            )}
                        </button>
                        <div className="flex flex-col">
                            <h1 className="font-black text-indigo-950 text-sm sm:text-base md:text-lg tracking-tight flex items-center gap-1.5 sm:gap-2 uppercase">
                                LegalBuddy <span className="text-[8px] sm:text-[9px] bg-gradient-to-r from-indigo-950 to-blue-950 text-white px-2 py-0.5 rounded-md tracking-[0.1em] font-black shadow-sm">PRO</span>
                            </h1>
                            <p className="text-[9px] sm:text-[10px] text-indigo-600 font-extrabold tracking-widest hidden sm:block">INDIAN LEGAL INTELLIGENCE</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Live RAG Engine Status Pill */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/90 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">RAG Engine Online • 50K+ Acts</span>
                        </div>

                        <div className="flex-1 max-w-xs sm:max-w-sm relative hidden md:block">
                            <input
                                type="text" placeholder="Search history..."
                                value={searchTerm}
                                className="w-full bg-white/60 border border-white/80 rounded-xl px-3.5 py-2 text-xs focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder-indigo-400 font-medium"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Mobile Search Icon Toggle */}
                        <button 
                            onClick={() => setShowMobileSearch(!showMobileSearch)} 
                            className="md:hidden p-2.5 rounded-xl bg-white/60 border border-white/80 text-indigo-950 text-xs min-w-[40px] min-h-[40px] flex items-center justify-center shadow-sm"
                            title="Search History"
                        >
                            🔍
                        </button>

                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/60 border border-white/80 flex items-center justify-center text-indigo-950 shadow-sm cursor-help">
                            <span className="text-sm">✨</span>
                        </div>
                    </div>
                </header>

                {/* Mobile Search Input Overlay */}
                {showMobileSearch && (
                    <div className="md:hidden p-3 bg-white/95 backdrop-blur-md border-b border-indigo-100/80 animate-in fade-in slide-in-from-top-2 z-20 shadow-md">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search conversation history..."
                                value={searchTerm}
                                className="flex-1 bg-white border border-indigo-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none text-indigo-950 placeholder-indigo-400 font-medium"
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <button onClick={() => { setSearchTerm(''); setShowMobileSearch(false); }} className="text-xs text-indigo-600 font-bold px-2 py-1">
                                Done
                            </button>
                        </div>
                    </div>
                )}

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto pt-3 sm:pt-6 md:pt-8 px-3 sm:px-6 scroll-smooth custom-scrollbar">
                    <div className="max-w-4xl mx-auto w-full">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center pt-4 sm:pt-10 md:pt-14 text-center animate-in fade-in zoom-in duration-700 px-2">
                                <div className="relative mb-4 sm:mb-8">
                                    <div className="absolute inset-0 bg-indigo-500/20 rounded-[2.5rem] blur-2xl animate-pulse"></div>
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/80 backdrop-blur-2xl rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center text-3xl sm:text-4xl md:text-5xl shadow-2xl border border-white rotate-3 hover:rotate-0 transition-all duration-500 relative z-10">⚖️</div>
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-950 mb-3 tracking-tight leading-tight">
                                    Welcome, <span className="text-indigo-600">{userEmail.split('@')[0]}</span>.<br />
                                    How can I assist your legal research today?
                                </h2>
                                <p className="text-slate-600 max-w-lg text-xs sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-10 font-medium">
                                    Trained on Indian Constitution, IPC, BNS, and State Regulations across 22 national languages.
                                </p>

                                {/* Categorized Quick Starter Cards Grid */}
                                <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                    {STARTER_QUERIES.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setInput(q.query)}
                                            className="suggestion-card p-4 rounded-2xl border border-white/80 hover:border-indigo-300 text-xs text-slate-700 transition-all flex flex-col gap-1.5 active:scale-[0.98] group"
                                        >
                                            <div className="flex items-center justify-between w-full min-w-0">
                                                <span className="font-bold text-indigo-950 flex items-center gap-2 text-xs sm:text-sm truncate">
                                                    <span>{q.icon}</span> <span className="truncate">{q.title}</span>
                                                </span>
                                                <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">{q.category}</span>
                                            </div>
                                            <span className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{q.query}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-6 sm:space-y-8 pb-4">
                            {filteredMessages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                    <div className={`flex gap-2.5 sm:gap-4 w-full ${m.role === 'user' ? 'flex-row-reverse max-w-[92%] sm:max-w-[85%]' : 'max-w-[98%] sm:max-w-[92%]'}`}>
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex-shrink-0 flex items-center justify-center text-xs sm:text-sm shadow-lg transition-transform hover:scale-110 ${m.role === 'user' ? 'bg-gradient-to-br from-indigo-950 to-slate-900 text-white rotate-2' : 'bg-white/90 text-indigo-600 border border-white shadow-md -rotate-2'
                                            }`}>
                                            {m.role === 'user' ? 'U' : '⚖️'}
                                        </div>
                                        <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0">
                                            <div className={`flex items-center gap-2 sm:gap-3 px-1 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                <span className="text-[9px] sm:text-[10px] font-black text-indigo-950/60 uppercase tracking-[0.15em]">
                                                    {m.role === 'user' ? 'Citizen' : 'AI Legal Counsel'}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-indigo-300"></span>
                                                <span className="text-[9px] sm:text-[10px] font-bold text-indigo-500 uppercase">{m.time}</span>
                                            </div>

                                            <div className={`p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-[1.75rem] shadow-sm leading-relaxed text-sm sm:text-[15px] md:text-[16px] ${m.role === 'user' ? 'glass-bubble-user rounded-tr-none font-medium' : 'glass-bubble-bot rounded-tl-none text-slate-800'
                                                }`}>
                                                {m.role === 'bot' ? renderBotText(m.text) : <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                                            </div>

                                            {/* Bot Action Bar */}
                                            {m.role === 'bot' && (
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3 animate-in fade-in duration-700">
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/50 border border-white/70 rounded-full shadow-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                        <span className="text-[8px] sm:text-[9px] font-black text-indigo-950 uppercase tracking-widest">Verified Answer</span>
                                                    </div>

                                                    {/* Copy Button */}
                                                    <button
                                                        onClick={() => copyToClipboard(m.text, i)}
                                                        className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold active:scale-95 touch-active ${copiedIndex === i ? 'bg-emerald-600 border-emerald-700 text-white shadow-md' : 'bg-white/60 border-white/80 text-slate-700 hover:bg-white'}`}
                                                    >
                                                        <span>{copiedIndex === i ? '✓' : '📋'}</span>
                                                        <span>{copiedIndex === i ? 'Copied!' : 'Copy'}</span>
                                                    </button>

                                                    {/* Audio Listen Button */}
                                                    <button
                                                        onClick={() => speakMessage(m.text, i)}
                                                        className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border transition-all flex items-center gap-2 text-[10px] sm:text-[11px] font-bold active:scale-95 touch-active ${speakingIndex === i ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' : 'bg-white/60 border-white/80 text-indigo-900 hover:bg-white'}`}
                                                    >
                                                        {speakingIndex === i ? (
                                                            <div className="flex items-end gap-0.5 h-3">
                                                                <span className="w-1 bg-white rounded-full sound-bar-1"></span>
                                                                <span className="w-1 bg-white rounded-full sound-bar-2"></span>
                                                                <span className="w-1 bg-white rounded-full sound-bar-3"></span>
                                                            </div>
                                                        ) : (
                                                            <span>🔈</span>
                                                        )}
                                                        <span>{speakingIndex === i ? 'Speaking...' : 'Listen'}</span>
                                                    </button>

                                                    {/* Citations Button */}
                                                    {m.chunks && (
                                                        <button
                                                            onClick={() => m.sources && setActiveModalSources(m.sources)}
                                                            className="bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold border border-emerald-200/90 shadow-sm transition-all flex items-center gap-1.5 touch-active"
                                                        >
                                                            <span className="text-emerald-600">✅</span>
                                                            <span>{m.chunks} Citations</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-3 animate-pulse max-w-[70%] sm:max-w-[50%]">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/70 border border-white flex-shrink-0"></div>
                                    <div className="flex-1 space-y-3 py-1">
                                        <div className="h-2.5 bg-white/70 rounded-full w-1/3"></div>
                                        <div className="space-y-2">
                                            <div className="h-2 bg-white/50 rounded-full"></div>
                                            <div className="h-2 bg-white/50 rounded-full w-5/6"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div ref={scrollRef} />
                </div>

                {/* Mobile Citation Sheet Modal */}
                {activeModalSources && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-indigo-950/40 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
                        <div className="bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-white max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-100">
                                <div className="font-black text-indigo-950 flex items-center gap-2 text-sm sm:text-base">
                                    <span className="text-indigo-600 text-lg">📜</span> Primary Legal Records & Acts
                                </div>
                                <button onClick={() => setActiveModalSources(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 font-bold text-sm min-w-[32px] min-h-[32px] flex items-center justify-center">
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar text-xs">
                                {Array.isArray(activeModalSources) ? (
                                    activeModalSources.map((s, idx) => (
                                        <div key={idx} className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100">
                                            <div className="font-bold text-indigo-950 mb-1">• {s.document || s.toString()}</div>
                                            <div className="text-[10px] text-indigo-600 flex justify-between uppercase font-bold tracking-tight">
                                                <span>Section: {s.section || 'N/A'}</span>
                                                <span>State: {s.state || 'National'}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 text-slate-800">
                                        {activeModalSources.toString()}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setActiveModalSources(null)} className="mt-4 w-full py-3 rounded-xl bg-indigo-950 text-white font-bold text-xs shadow-md active:scale-[0.98]">
                                Close Citations
                            </button>
                        </div>
                    </div>
                )}

                {/* Command Center Input Dock */}
                <div className="p-2.5 sm:p-4 md:p-6 flex-shrink-0 pb-safe">
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="glass-input rounded-2xl sm:rounded-[2.5rem] p-2 sm:p-3 flex flex-col gap-1.5 sm:gap-2 group">
                            {/* Input Tools Row */}
                            <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-3 pt-1 flex-wrap sm:flex-nowrap">
                                <div className="flex items-center gap-1 sm:gap-2 bg-white/60 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/60 shadow-sm flex-1 sm:flex-initial min-w-0">
                                    <select
                                        value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}
                                        className="legal-select text-indigo-600 !border-none !bg-transparent !h-8 !py-0 flex-1 min-w-0 truncate text-[11px] sm:text-xs px-1 font-bold"
                                    >
                                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.code === 'en' ? '🌐 English' : l.name}</option>)}
                                    </select>
                                    <div className="w-px h-4 bg-indigo-100 flex-shrink-0"></div>
                                    <select
                                        value={selectedState} onChange={e => setSelectedState(e.target.value)}
                                        className="legal-select text-slate-700 !border-none !bg-transparent !h-8 !py-0 flex-1 min-w-0 truncate text-[11px] sm:text-xs px-1 font-bold"
                                    >
                                        {availableStates.map(s => <option key={s} value={s}>{s === 'All States' ? '📍 National' : s}</option>)}
                                    </select>
                                </div>

                                <div className="flex-1 hidden sm:block"></div>

                                {/* Character Counter */}
                                {input.trim() && (
                                    <span className="text-[10px] text-indigo-500 font-bold hidden sm:inline ml-auto">
                                        {input.length} chars
                                    </span>
                                )}

                                {/* Voice Mic Button */}
                                <button
                                    onClick={startListening}
                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ml-auto sm:ml-0 touch-active ${isListening ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'}`}
                                    title="Voice Query"
                                >
                                    <span className="text-base sm:text-lg">{isListening ? '🎙️' : '🎤'}</span>
                                </button>
                            </div>

                            {/* Text Input Row */}
                            <div className="flex items-end gap-2 sm:gap-3 px-1.5 sm:px-2 pb-1">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                    placeholder={isListening ? "Listening carefully..." : "Ask your legal question (e.g. Rights during traffic stop...)"}
                                    className="flex-1 min-w-0 w-full bg-transparent border-none outline-none text-sm sm:text-base py-2.5 sm:py-3 px-1.5 sm:px-2 resize-none max-h-40 min-h-[44px] sm:min-h-[50px] placeholder-indigo-400 text-indigo-950 font-medium"
                                    rows={1}
                                />

                                <button
                                    onClick={loading ? stopGeneration : sendMessage}
                                    disabled={!input.trim() && !loading}
                                    className={`shimmer-btn w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all flex-shrink-0 shadow-lg touch-active ${(input.trim() || loading) ? 'bg-indigo-950 text-white hover:bg-black active:scale-95 scale-100' : 'bg-indigo-100 text-indigo-300 scale-95 opacity-50'}`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
