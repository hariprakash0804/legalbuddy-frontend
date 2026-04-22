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
    { code: 'as', name: 'Assamese (অसमীয়া)' },
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
            elements.push(<h4 key={key++} className="font-bold text-base mt-4 mb-2 text-indigo-900" dangerouslySetInnerHTML={{ __html: line.slice(4) }} />);
        } else if (line.startsWith('## ')) {
            elements.push(<h3 key={key++} className="font-bold text-lg mt-5 mb-2 text-indigo-950" dangerouslySetInnerHTML={{ __html: line.slice(3) }} />);
        } else if (line.startsWith('# ')) {
            elements.push(<h2 key={key++} className="font-bold text-xl mt-6 mb-3 text-indigo-950" dangerouslySetInnerHTML={{ __html: line.slice(2) }} />);
        } else if (line.match(/^[\s]*[-•]\s/)) {
            elements.push(
                <div key={key++} className="flex gap-3 ml-3 my-1">
                    <span className="text-indigo-400 mt-1 flex-shrink-0">✦</span>
                    <span className="text-slate-700" dangerouslySetInnerHTML={{ __html: line.replace(/^[\s]*[-•]\s/, '') }} />
                </div>
            );
        } else if (line.match(/^[\s]*\d+\.\s/)) {
            const match = line.match(/^([\s]*\d+\.)\s(.*)/);
            if (match) {
                elements.push(
                    <div key={key++} className="flex gap-2 ml-3 my-1">
                        <span className="text-indigo-600 font-bold min-w-[24px]">{match[1]}</span>
                        <span className="text-slate-700" dangerouslySetInnerHTML={{ __html: match[2] }} />
                    </div>
                );
            }
        } else if (line.trim() === '') {
            elements.push(<div key={key++} className="h-3" />);
        } else {
            elements.push(
                <p key={key++} className="my-1.5" dangerouslySetInnerHTML={{ __html: line }} />
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
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const scrollRef = useRef();
    const abortControllerRef = useRef(null);

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

    const speakMessage = (text) => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
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
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
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
            if (isGuest && messages.length === 0) {
                setShowLoginPrompt(true);
            }
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

    if (!mounted) return <div className="flex h-screen items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="fixed inset-0 flex text-slate-900 overflow-hidden font-sans pt-12">
            {/* Background Layer with Animation */}
            <div className="fixed inset-0 animate-mesh-dark -z-10"></div>

            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-300/20 rounded-full blur-[120px] blob-animate pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-purple-300/20 rounded-full blur-[120px] blob-animate-delay pointer-events-none -z-10"></div>
            <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-blue-300/10 rounded-full blur-[100px] blob-animate-delay-2 pointer-events-none -z-10"></div>

            {/* Mobile Overlay Backdrop */}
            {isMobile && sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar — slides over on mobile, inline on desktop */}
            <aside className={`transition-all duration-500 ease-in-out glass-sidebar flex flex-col z-50 h-full
                ${isMobile ? `mobile-sidebar ${sidebarOpen ? 'mobile-sidebar-visible' : 'mobile-sidebar-hidden'}` : (sidebarOpen ? 'w-[280px]' : 'w-0 opacity-0 overflow-hidden')}`}>
                <div className="p-6 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center gap-3 mb-8 px-2 flex-shrink-0">
                        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-white">⚖️</div>
                        <span className="font-bold text-indigo-950 text-lg tracking-tight">LegalBuddy</span>
                    </div>

                    <button onClick={() => { setMessages([]); if (isMobile) setSidebarOpen(false); }} className="flex items-center justify-center gap-2 w-full p-3.5 rounded-xl bg-indigo-950 text-white hover:bg-black transition-all text-sm font-bold shadow-lg mb-8 group">
                        <span className="text-xl group-hover:scale-110 transition-transform">+</span> New Chat
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-3 py-2 custom-scrollbar">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-900/40 px-2 mb-2">History</div>
                        {messages.filter(m => m.role === 'user').slice(-10).reverse().map((m, i) => (
                            <div key={i} className="px-4 py-3 text-xs text-slate-600 truncate hover:bg-white/40 hover:text-indigo-900 rounded-xl cursor-pointer transition-all border border-transparent hover:border-white/50 shadow-sm">
                                💬 {m.text}
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <div className="px-4 py-8 text-center border-2 border-dashed border-indigo-100 rounded-2xl">
                                <p className="text-[11px] text-indigo-300 font-medium">No recent queries</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-indigo-100/50 space-y-2">
                        <button onClick={downloadChat} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/40 transition-all text-sm font-medium text-slate-700">
                            📥 Export History
                        </button>
                        {isGuest ? (
                            <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 space-y-3">
                                <p className="text-[10px] text-indigo-900/40 uppercase font-black tracking-widest">Guest Account</p>
                                <button onClick={() => { router.push('/login'); if (isMobile) setSidebarOpen(false); }} className="w-full p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all text-sm text-white font-bold shadow-md shadow-indigo-200">
                                    Sign In
                                </button>
                                <button onClick={() => { router.push('/register'); if (isMobile) setSidebarOpen(false); }} className="w-full p-3 rounded-xl border border-indigo-200 hover:bg-white transition-all text-xs text-indigo-700 font-bold">
                                    Create Account
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 flex items-center gap-3 bg-white/40 rounded-2xl border border-white/60">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                                    {userEmail[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-indigo-950 truncate uppercase tracking-tighter">{userEmail.split('@')[0]}</p>
                                    <p className="text-[9px] text-indigo-400 truncate">{userEmail}</p>
                                </div>
                                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Logout">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Header */}
                <header className="h-16 md:h-20 flex-shrink-0 flex items-center justify-between px-4 md:px-8 glass-header sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 hover:bg-white/50 rounded-xl text-indigo-900 transition-all border border-transparent hover:border-white/60" aria-label="Toggle sidebar">
                            {sidebarOpen && !isMobile ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                            )}
                        </button>
                        <div className="flex flex-col">
                            <h1 className="font-black text-indigo-950 text-base md:text-lg tracking-tight flex items-center gap-2 uppercase">
                                LegalBuddy <span className="text-[9px] bg-indigo-950 text-white px-2 py-0.5 rounded-md tracking-[0.1em] font-black">PRO</span>
                            </h1>
                            <p className="text-[10px] text-indigo-400 font-bold tracking-widest hidden md:block">INDIAN LEGAL INTELLIGENCE</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-sm relative hidden lg:block">
                            <input
                                type="text" placeholder="Search insights..."
                                className="w-64 bg-white/40 border border-white/60 rounded-xl px-4 py-2.5 text-xs focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder-indigo-300"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/40 border border-white/60 flex items-center justify-center text-indigo-900 shadow-sm cursor-help">
                            <span className="text-sm">✨</span>
                        </div>
                    </div>
                </header>

                {/* Messages Column */}
                <div className="flex-1 overflow-y-auto pt-4 md:pt-8 px-4 scroll-smooth custom-scrollbar">
                    <div className="max-w-4xl mx-auto w-full">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center pt-12 md:pt-24 text-center animate-in fade-in zoom-in duration-700">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/60 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-4xl md:text-5xl mb-8 shadow-2xl border border-white/80 rotate-3 hover:rotate-0 transition-all duration-500">⚖️</div>
                                <h2 className="text-3xl md:text-4xl font-black text-indigo-950 mb-4 tracking-tighter leading-tight">
                                    Welcome back, <span className="text-indigo-600">{userEmail.split('@')[0]}</span>.<br />
                                    How can I guide your legal research?
                                </h2>
                                <p className="text-slate-500 max-w-lg text-sm md:text-base leading-relaxed mb-10 font-medium">
                                    I am an AI trained on Central and State acts. Ask about IPC sections, local rules, or procedural guidelines in 22 languages.
                                </p>
                            </div>
                        )}

                        <div className="space-y-10">
                            {filteredMessages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                    <div className={`flex gap-4 w-full ${m.role === 'user' ? 'flex-row-reverse max-w-[85%]' : 'max-w-[92%]'}`}>
                                        <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${m.role === 'user' ? 'bg-indigo-950 text-white rotate-2' : 'bg-white/80 text-indigo-600 border border-white shadow-md -rotate-2'
                                            }`}>
                                            {m.role === 'user' ? 'U' : '⚖️'}
                                        </div>
                                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                                            <div className={`flex items-center gap-3 px-1 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                <span className="text-[10px] font-black text-indigo-900/30 uppercase tracking-[0.2em]">
                                                    {m.role === 'user' ? 'Citizen' : 'AI Counsel'}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-indigo-100"></span>
                                                <span className="text-[10px] font-bold text-indigo-200 uppercase">{m.time}</span>
                                            </div>
                                            <div className={`p-5 md:p-6 rounded-[1.75rem] shadow-sm leading-relaxed text-[15px] md:text-[16px] ${m.role === 'user' ? 'glass-bubble-user rounded-tr-none font-medium' : 'glass-bubble-bot rounded-tl-none text-slate-700'
                                                }`}>
                                                {m.role === 'bot' ? renderBotText(m.text) : <p className="whitespace-pre-wrap">{m.text}</p>}
                                            </div>

                                            {m.role === 'bot' && (m.sources || m.language || m.chunks) && (
                                                <div className="flex flex-wrap items-center gap-3 mt-4 animate-in fade-in duration-1000">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/40 border border-white/60 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                                        <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">Verification</span>
                                                    </div>

                                                    {m.chunks && (
                                                        <div className="group relative">
                                                            <span className="bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black border border-emerald-100/50 shadow-sm cursor-help transition-all flex items-center gap-2">
                                                                <span className="text-emerald-500">✅</span>
                                                                {m.chunks} Citations Found
                                                            </span>
                                                            {m.sources && (
                                                                <div className="absolute bottom-full left-0 mb-3 w-72 p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white text-[11px] leading-relaxed text-slate-600 hidden group-hover:block animate-in fade-in slide-in-from-bottom-2 z-30">
                                                                    <div className="font-black text-indigo-950 mb-2 border-b border-indigo-50 pb-2 flex items-center gap-2">
                                                                        <span className="text-indigo-600">📜</span> PRIMARY RECORDS
                                                                    </div>
                                                                    <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                                        {Array.isArray(m.sources)
                                                                            ? m.sources.map((s, idx) => (
                                                                                <div key={idx} className="mb-2 p-2 bg-indigo-50/40 rounded-lg border border-indigo-100/50">
                                                                                    <div className="font-bold text-indigo-900 truncate">• {s.document || s.toString()}</div>
                                                                                    <div className="text-[9px] text-indigo-400 flex justify-between mt-1 uppercase font-bold tracking-tighter">
                                                                                        <span>Section {s.section || 'N/A'}</span>
                                                                                        <span>Jurisdiction: {s.state || 'National'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                            : <div className="p-2 bg-indigo-50 rounded-lg">• {m.sources}</div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => speakMessage(m.text)}
                                                        className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${isSpeaking ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' : 'bg-white/50 border-white/80 text-indigo-900 hover:bg-white'
                                                            }`}
                                                        title="Read Aloud"
                                                    >
                                                        <span className={isSpeaking ? 'animate-pulse' : ''}>{isSpeaking ? '🔊' : '🔈'}</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{isSpeaking ? 'Reading...' : 'Listen'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-4 animate-pulse max-w-[50%]">
                                    <div className="w-10 h-10 rounded-2xl bg-white/60 border border-white"></div>
                                    <div className="flex-1 space-y-4 py-2">
                                        <div className="h-2.5 bg-white/60 rounded-full w-1/3"></div>
                                        <div className="space-y-3">
                                            <div className="h-2 bg-white/40 rounded-full"></div>
                                            <div className="h-2 bg-white/40 rounded-full w-5/6"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div ref={scrollRef} />
                </div>

                {/* The "Command Center" Input Area */}
                <div className="p-3 md:p-6 flex-shrink-0">
                    <div className="max-w-4xl mx-auto w-full">
                        {/* Desktop Input Layout */}
                        <div className="glass-input rounded-[2.5rem] p-3 flex flex-col gap-2 group focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all">
                            {/* Input Tools Row */}
                            <div className="flex items-center gap-2 px-3 pt-1">
                                <div className="flex items-center gap-2 bg-white/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm">
                                    <select
                                        value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}
                                        className="legal-select text-indigo-600 !border-none !bg-transparent !h-8 !py-0"
                                    >
                                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.code === 'en' ? '🌐 English' : l.name}</option>)}
                                    </select>
                                    <div className="w-px h-4 bg-indigo-100"></div>
                                    <select
                                        value={selectedState} onChange={e => setSelectedState(e.target.value)}
                                        className="legal-select text-slate-500 !border-none !bg-transparent !h-8 !py-0"
                                    >
                                        {availableStates.map(s => <option key={s} value={s}>{s === 'All States' ? '📍 National' : s}</option>)}
                                    </select>
                                </div>

                                <div className="flex-1"></div>

                                <button
                                    onClick={startListening}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                                        }`}
                                    title="Voice Query"
                                >
                                    <span className="text-lg">{isListening ? '🎙️' : '🎤'}</span>
                                </button>
                            </div>

                            {/* Text Input Row */}
                            <div className="flex items-end gap-3 px-2 pb-1">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                    placeholder={isListening ? "Listening carefully..." : "Type your legal question (e.g. Rights during traffic stop...)"}
                                    className="flex-1 bg-transparent border-none outline-none text-sm md:text-base py-3 px-2 resize-none max-h-40 min-h-[50px] placeholder-indigo-200 text-indigo-950 font-medium"
                                    rows={Math.min(input.split('\n').length, 5)}
                                />

                                <button
                                    onClick={loading ? stopGeneration : sendMessage}
                                    disabled={!input.trim() && !loading}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 shadow-lg ${(input.trim() || loading) ? 'bg-indigo-950 text-white hover:bg-black hover:-rotate-3 active:scale-90 scale-100' : 'bg-indigo-100 text-indigo-300 scale-95 opacity-50'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* CSS Injected here for extra polish if needed, but globals.css handles most */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(30, 27, 75, 0.05);
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(30, 27, 75, 0.1);
                }
            `}</style>
        </div>
    );
}
