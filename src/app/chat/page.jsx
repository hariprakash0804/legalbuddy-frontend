"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { authHeader, logout, getApiUrl } from '@/services/auth';
import { useToast } from '@/components/ToastContext';

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

// Helper to format bot responses with Marginalia Citations & Paper Quoted Cards
function renderBotReportText(text, sources) {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let key = 0;
    let citeCounter = 1;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#0E1B30]">$1</strong>');
        line = line.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        line = line.replace(/_(.*?)_/g, '<em>$1</em>');

        if (line.startsWith('### ')) {
            elements.push(<h4 key={key++} className="font-sans font-semibold text-base mt-4 mb-2 text-[#0E1B30] border-b border-[#E7E9ED] pb-1 break-words" dangerouslySetInnerHTML={{ __html: line.slice(4) }} />);
        } else if (line.startsWith('## ')) {
            elements.push(<h3 key={key++} className="font-display font-semibold text-lg mt-5 mb-2 text-[#0E1B30] break-words" dangerouslySetInnerHTML={{ __html: line.slice(3) }} />);
        } else if (line.startsWith('# ')) {
            elements.push(<h2 key={key++} className="font-display font-bold text-xl mt-6 mb-3 text-[#0E1B30] break-words" dangerouslySetInnerHTML={{ __html: line.slice(2) }} />);
        } else if (line.match(/^[\s]*[-•]\s/)) {
            const currentCite = citeCounter++;
            const sourceItem = Array.isArray(sources) && sources[currentCite - 1];
            const sourceLabel = sourceItem ? (sourceItem.document || sourceItem.section || null) : null;

            elements.push(
                <div key={key++} className="marginalia-tick flex flex-col gap-0.5 my-2 text-sm">
                    <div className="flex gap-2.5 items-start">
                        <span className="font-mono text-xs text-[#0B5850] font-bold mt-0.5 flex-shrink-0">[{currentCite}]</span>
                        <span className="text-[#2C3752] leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: line.replace(/^[\s]*[-•]\s/, '') }} />
                    </div>
                    {sourceLabel && (
                        <div className="ml-6 text-[10px] font-mono text-[#0B5850] opacity-80 truncate">
                            Source: {sourceLabel}
                        </div>
                    )}
                </div>
            );
        } else if (line.match(/^[\s]*\d+\.\s/)) {
            const match = line.match(/^([\s]*\d+\.)\s(.*)/);
            if (match) {
                elements.push(
                    <div key={key++} className="flex gap-2.5 ml-1 my-2 items-start text-sm">
                        <span className="font-mono text-xs text-[#0B5850] font-bold bg-[#DCEFEC] px-2 py-0.5 rounded border border-[#0B5850]/20 flex-shrink-0">{match[1]}</span>
                        <span className="text-[#2C3752] leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: match[2] }} />
                    </div>
                );
            }
        } else if (line.toLowerCase().includes('section') || line.toLowerCase().includes('article')) {
            // Paper 100 Statute Card
            elements.push(
                <div key={key++} className="lex-paper p-3.5 my-3 text-xs text-[#0E1B30] leading-relaxed shadow-sm">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#0B5850] font-bold mb-1">📜 STATUTE / SECTION CITATION</div>
                    <div dangerouslySetInnerHTML={{ __html: line }} />
                </div>
            );
        } else if (line.trim() === '') {
            elements.push(<div key={key++} className="h-2" />);
        } else {
            elements.push(
                <p key={key++} className="my-2 text-sm leading-relaxed text-[#2C3752] break-words" dangerouslySetInnerHTML={{ __html: line }} />
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
    const [selectedState, setSelectedState] = useState('Karnataka');
    const [availableStates, setAvailableStates] = useState(['Karnataka', 'Delhi', 'Maharashtra', 'Tamil Nadu', 'All States']);
    const [isListening, setIsListening] = useState(false);
    const [speakingIndex, setSpeakingIndex] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [activeModalSources, setActiveModalSources] = useState(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const scrollRef = useRef();
    const textareaRef = useRef();
    const abortControllerRef = useRef(null);

    // Auto-resize input textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [input]);

    // Responsive listener
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
                if (res.data.states && res.data.states.length > 0) {
                    setAvailableStates(res.data.states);
                }
            } catch (err) { }
        };
        fetchStates();
    }, [mounted, isGuest]);

    useEffect(() => {
        if (!mounted) return;
        if (!isGuest) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages, STORAGE_KEY, searchTerm, mounted, isGuest]);

    const filteredMessages = messages.filter(m => m.text.toLowerCase().includes(searchTerm.toLowerCase()));
    const { showToast } = useToast();

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast("Speech recognition is not supported in this browser.", "warning");
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
        showToast('Legal response copied to clipboard', 'success');
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
                langCode: selectedLanguage,
                state: selectedState
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
        a.download = `Lex_Legal_Research_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
    };

    if (!mounted) return (
        <div className="flex h-screen items-center justify-center bg-[#F6F7F9]">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-3 border-[#0B5850] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-xs font-mono font-medium text-[#2C3752] tracking-wider uppercase">Loading Lex Design System...</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex flex-col text-[#0E1B30] overflow-hidden font-sans h-[100dvh] w-full bg-[#F6F7F9]">
            {/* 1. PERSISTENT DISCLOSURE BAR (Never Dismissible) */}
            <div className="disclosure-bar px-4 py-2 text-center flex items-center justify-center gap-2 flex-shrink-0">
                <span className="text-[#0B5850]">ⓘ</span>
                <span><strong>Lex</strong> provides general legal information for research purposes, not formal legal advice.</span>
            </div>

            <div className="flex-1 flex overflow-hidden w-full relative">
                {/* Mobile Backdrop */}
                {isMobile && sidebarOpen && (
                    <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
                )}

                {/* 2. SIDEBAR - Lex Clean White Panel */}
                <aside className={`transition-all duration-300 ease-in-out bg-white border-r border-[#D7DBE2] flex flex-col z-50 h-full
                    ${isMobile ? `mobile-sidebar ${sidebarOpen ? 'mobile-sidebar-visible' : 'mobile-sidebar-hidden'}` : (sidebarOpen ? 'w-[280px]' : 'w-0 opacity-0 overflow-hidden')}`}>
                    <div className="p-5 flex flex-col h-full overflow-hidden">
                        {/* Lex Brand Wordmark */}
                        <div className="flex items-center justify-between mb-6 px-1 flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#0E1B30] text-white flex items-center justify-center font-display font-semibold text-base shadow-sm">
                                    L
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display font-bold text-[#0E1B30] text-lg leading-none">Lex</span>
                                    <span className="text-[10px] font-mono text-[#5B6472] uppercase tracking-wider mt-0.5">Legal AI Engine</span>
                                </div>
                            </div>
                            {isMobile && (
                                <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-[#5B6472] hover:text-[#0E1B30] rounded-md transition-all">
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Jurisdiction Scope Travelling Indicator */}
                        <div className="mb-4 p-3 bg-[#DCEFEC] border border-[#0B5850]/20 rounded-xl flex flex-col gap-1 flex-shrink-0">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B5850] font-bold">Active Jurisdiction</span>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#0B5850] flex items-center gap-1.5">
                                    <span>📍</span> {selectedState === 'All States' ? 'India (National)' : `${selectedState}, IN`}
                                </span>
                                <select
                                    value={selectedState} onChange={e => setSelectedState(e.target.value)}
                                    className="text-[11px] font-semibold text-[#0B5850] bg-transparent border-none outline-none cursor-pointer underline"
                                >
                                    {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Primary Action Button */}
                        <button 
                            onClick={() => { setMessages([]); if (isMobile) setSidebarOpen(false); }} 
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#0E1B30] text-white hover:bg-[#1E2E4A] active:scale-[0.98] transition-all text-xs font-semibold shadow-sm mb-5 group"
                        >
                            <span className="text-base group-hover:rotate-90 transition-transform duration-200">+</span> New question
                        </button>

                        {/* Recent History Threads */}
                        <div className="flex-1 overflow-y-auto space-y-1.5 py-1 custom-scrollbar">
                            <div className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#5B6472] px-2 mb-2 flex items-center justify-between">
                                <span>Recent Queries</span>
                                <span className="text-[9px] bg-[#F6F7F9] text-[#2C3752] px-2 py-0.5 rounded border border-[#D7DBE2]">{messages.filter(m => m.role === 'user').length}</span>
                            </div>
                            {messages.filter(m => m.role === 'user').slice(-10).reverse().map((m, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => { if (isMobile) setSidebarOpen(false); }}
                                    className="px-3 py-2.5 text-xs text-[#2C3752] truncate hover:bg-[#F6F7F9] hover:text-[#0E1B30] rounded-lg cursor-pointer transition-all border border-transparent hover:border-[#D7DBE2] flex items-center gap-2 group"
                                >
                                    <span className="text-[#5B6472] group-hover:text-[#0B5850] font-mono text-[11px]">§</span>
                                    <span className="truncate">{m.text}</span>
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div className="px-3 py-6 text-center border border-dashed border-[#D7DBE2] rounded-xl">
                                    <p className="text-[11px] text-[#5B6472]">No active research history</p>
                                </div>
                            )}
                        </div>

                        {/* Footer & Account Status */}
                        <div className="pt-4 border-t border-[#D7DBE2] space-y-2 flex-shrink-0">
                            <button onClick={downloadChat} className="flex items-center gap-2 w-full p-2.5 rounded-lg hover:bg-[#F6F7F9] transition-all text-xs font-semibold text-[#2C3752]">
                                <span>📥</span> Export Research Memo
                            </button>
                            {isGuest ? (
                                <div className="p-3 rounded-xl bg-[#F6F7F9] border border-[#D7DBE2] space-y-2">
                                    <p className="text-[10px] text-[#5B6472] uppercase font-mono font-bold">Access Level: Guest</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => router.push('/login')} className="flex-1 py-2 rounded-lg bg-[#0E1B30] text-white text-xs font-semibold hover:bg-[#1E2E4A]">Sign in</button>
                                        <button onClick={() => router.push('/register')} className="flex-1 py-2 rounded-lg border border-[#D7DBE2] text-[#0E1B30] text-xs font-semibold hover:bg-white">Register</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-2.5 flex items-center gap-2.5 bg-[#F6F7F9] rounded-xl border border-[#D7DBE2]">
                                    <div className="w-8 h-8 rounded-lg bg-[#0E1B30] text-white flex items-center justify-center text-xs font-bold font-mono">
                                        {userEmail[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#0E1B30] truncate">{userEmail.split('@')[0]}</p>
                                        <p className="text-[9px] text-[#5B6472] truncate">{userEmail}</p>
                                    </div>
                                    <button onClick={logout} className="p-1.5 text-[#5B6472] hover:text-[#9C2A22] rounded transition-all" title="Logout">
                                        🚪
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* 3. MAIN WORKSPACE AREA */}
                <main className="flex-1 flex flex-col relative z-10 overflow-hidden h-full bg-[#F6F7F9]">
                    {/* Header Bar */}
                    <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-[#D7DBE2] sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-[#2C3752] hover:bg-[#F6F7F9] rounded-lg transition-all border border-transparent hover:border-[#D7DBE2]" aria-label="Toggle sidebar">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-[#0E1B30] text-base">Lex</span>
                                <span className="text-[10px] bg-[#DCEFEC] text-[#0B5850] px-2 py-0.5 rounded font-mono font-bold uppercase">Verifiable AI</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Jurisdiction Badge */}
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEFEC] border border-[#0B5850]/20 text-[11px] font-semibold text-[#0B5850]">
                                <span>📍 Scope: {selectedState === 'All States' ? 'India' : selectedState}</span>
                            </div>

                            <div className="flex-1 max-w-xs relative hidden md:block">
                                <input
                                    type="text" placeholder="Search research history..."
                                    value={searchTerm}
                                    className="w-full bg-[#F6F7F9] border border-[#D7DBE2] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0B5850] transition-all placeholder-[#5B6472]"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <button 
                                onClick={() => setShowMobileSearch(!showMobileSearch)} 
                                className="md:hidden p-2 rounded-lg bg-[#F6F7F9] border border-[#D7DBE2] text-xs"
                            >
                                🔍
                            </button>
                        </div>
                    </header>

                    {/* Mobile Search Overlay */}
                    {showMobileSearch && (
                        <div className="md:hidden p-3 bg-white border-b border-[#D7DBE2] z-20">
                            <input
                                type="text" placeholder="Search history..."
                                value={searchTerm}
                                className="w-full bg-[#F6F7F9] border border-[#D7DBE2] rounded-lg px-3 py-2 text-xs focus:outline-none"
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    {/* 4. MESSAGES / RESEARCH REPORT AREA */}
                    <div className="flex-1 overflow-y-auto pt-4 sm:pt-6 px-3 sm:px-6 custom-scrollbar">
                        <div className="max-w-3xl mx-auto w-full">
                            {/* EMPTY STATE - Capability Transparency */}
                            {messages.length === 0 && (
                                <div className="py-8 sm:py-12 px-4 text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEFEC] text-[#0B5850] text-xs font-mono font-semibold mb-6">
                                        ✦ Legal Information & Citation Engine
                                    </div>
                                    
                                    <h1 className="font-display font-semibold text-3xl sm:text-4xl text-[#0E1B30] mb-4 tracking-tight">
                                        Ask about your rights & legal obligations
                                    </h1>
                                    <p className="text-[#2C3752] max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-8">
                                        Lex delivers structured, verified answers backed by primary statutory citations across Indian Central and State laws.
                                    </p>

                                    {/* Topic Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
                                        {STARTER_QUERIES.map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setInput(q.query)}
                                                className="p-4 rounded-xl bg-white border border-[#D7DBE2] hover:border-[#0B5850] hover:shadow-md transition-all text-xs flex flex-col gap-1.5 group"
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="font-semibold text-[#0E1B30] flex items-center gap-2 text-sm">
                                                        <span>{q.icon}</span> {q.title}
                                                    </span>
                                                    <span className="text-[10px] font-mono bg-[#F6F7F9] text-[#5B6472] px-2 py-0.5 rounded border border-[#D7DBE2] uppercase group-hover:bg-[#DCEFEC] group-hover:text-[#0B5850] transition-colors">{q.category}</span>
                                                </div>
                                                <span className="text-[#5B6472] text-[12px] leading-normal">{q.query}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CHAT MESSAGES THREAD */}
                            <div className="space-y-6 pb-6">
                                {filteredMessages.map((m, i) => (
                                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        {/* USER TURN - Compact Ink 900 Bubble */}
                                        {m.role === 'user' ? (
                                            <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                                                <div className="text-[10px] font-mono text-[#5B6472] text-right uppercase tracking-wider">
                                                    You · {m.time}
                                                </div>
                                                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0E1B30] text-white text-sm leading-relaxed shadow-sm">
                                                    {m.text}
                                                </div>
                                            </div>
                                        ) : (
                                            /* AI TURN - Full-Width Report Card Format */
                                            <div className="w-full lex-card p-5 sm:p-6 space-y-4">
                                                {/* Header Chips */}
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7E9ED] pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-[#0E1B30] font-display flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-[#12786D]"></span> Lex AI Answer
                                                        </span>
                                                        <span className="text-[10px] font-mono bg-[#F6F7F9] text-[#5B6472] px-2 py-0.5 rounded border border-[#D7DBE2]">
                                                            General Information
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-[#0B5850] bg-[#DCEFEC] px-2.5 py-0.5 rounded-full border border-[#0B5850]/15">
                                                        📍 Jurisdiction: {m.state || selectedState}
                                                    </span>
                                                </div>

                                                {/* Answer Body with Marginalia Citations */}
                                                <div className="prose prose-slate max-w-none text-[#2C3752]">
                                                    {renderBotReportText(m.text, m.sources)}
                                                </div>

                                                {/* Primary Citation Sources Footer */}
                                                {m.sources && Array.isArray(m.sources) && m.sources.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-[#E7E9ED] space-y-2">
                                                        <div className="text-[11px] font-mono font-bold uppercase text-[#0B5850] tracking-wider flex items-center gap-1">
                                                            <span>📚 Verified Primary Sources</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {m.sources.slice(0, 4).map((s, idx) => (
                                                                <div key={idx} className="p-2.5 bg-[#F6F7F9] rounded-lg border border-[#D7DBE2] text-xs">
                                                                    <div className="font-semibold text-[#0E1B30] truncate">• {s.document || s.toString()}</div>
                                                                    <div className="text-[10px] font-mono text-[#5B6472] flex justify-between mt-1">
                                                                        <span>Section: {s.section || 'General'}</span>
                                                                        <span>Scope: {s.state || 'National'}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Bar (Including Signature Brass Escalation Button) */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E7E9ED]">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => copyToClipboard(m.text, i)}
                                                            className="px-3 py-1.5 rounded-lg border border-[#D7DBE2] hover:bg-[#F6F7F9] text-xs font-semibold text-[#2C3752] transition-colors flex items-center gap-1.5"
                                                        >
                                                            <span>{copiedIndex === i ? '✓' : '📋'}</span>
                                                            <span>{copiedIndex === i ? 'Copied' : 'Copy'}</span>
                                                        </button>

                                                        <button
                                                            onClick={() => speakMessage(m.text, i)}
                                                            className="px-3 py-1.5 rounded-lg border border-[#D7DBE2] hover:bg-[#F6F7F9] text-xs font-semibold text-[#0B5850] transition-colors flex items-center gap-1.5"
                                                        >
                                                            <span>🔈</span>
                                                            <span>{speakingIndex === i ? 'Speaking...' : 'Listen'}</span>
                                                        </button>

                                                        {m.chunks && (
                                                            <button
                                                                onClick={() => setActiveModalSources(m.sources)}
                                                                className="px-3 py-1.5 rounded-lg bg-[#DCEFEC] text-[#0B5850] border border-[#0B5850]/20 text-xs font-semibold hover:bg-[#0B5850] hover:text-white transition-colors"
                                                            >
                                                                {m.chunks} Sources
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* SIGNATURE ELEMENT: Escalation to Human Attorney (Brass 100 / Brass 800) */}
                                                    <a
                                                        href="https://barcouncilofindia.org"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-escalation px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                                                    >
                                                        <span>Talk to an attorney →</span>
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {loading && (
                                    <div className="w-full lex-card p-5 space-y-3 animate-pulse">
                                        <div className="h-4 bg-[#E7E9ED] rounded w-1/4"></div>
                                        <div className="h-3 bg-[#E7E9ED] rounded w-3/4"></div>
                                        <div className="h-3 bg-[#E7E9ED] rounded w-1/2"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div ref={scrollRef} />
                    </div>

                    {/* Sources Modal */}
                    {activeModalSources && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1B30]/40 backdrop-blur-sm p-4">
                            <div className="bg-white max-w-lg w-full rounded-2xl p-6 border border-[#D7DBE2] shadow-2xl space-y-4">
                                <div className="flex items-center justify-between border-b border-[#E7E9ED] pb-3">
                                    <h3 className="font-display font-semibold text-lg text-[#0E1B30]">Verified Legal Sources</h3>
                                    <button onClick={() => setActiveModalSources(null)} className="p-1 text-[#5B6472] hover:text-[#0E1B30]">✕</button>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto space-y-2 text-xs">
                                    {Array.isArray(activeModalSources) ? activeModalSources.map((s, idx) => (
                                        <div key={idx} className="p-3 bg-[#F6F7F9] rounded-lg border border-[#D7DBE2]">
                                            <div className="font-semibold text-[#0E1B30]">• {s.document || s.toString()}</div>
                                            <div className="text-[10px] font-mono text-[#0B5850] mt-1">Section: {s.section || 'N/A'} · Scope: {s.state || 'National'}</div>
                                        </div>
                                    )) : <div>{activeModalSources.toString()}</div>}
                                </div>
                                <button onClick={() => setActiveModalSources(null)} className="w-full py-2.5 bg-[#0E1B30] text-white text-xs font-semibold rounded-lg">Close</button>
                            </div>
                        </div>
                    )}

                    {/* 5. COMMAND CENTER INPUT DOCK */}
                    <div className="p-3 sm:p-4 flex-shrink-0 bg-white border-t border-[#D7DBE2] pb-safe">
                        <div className="max-w-3xl mx-auto w-full">
                            <div className="lex-input-container p-2.5 flex flex-col gap-2">
                                {/* Toolbar Controls Row */}
                                <div className="flex items-center justify-between gap-2 px-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}
                                            className="lex-select"
                                        >
                                            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.code === 'en' ? '🌐 English' : l.name}</option>)}
                                        </select>
                                        <select
                                            value={selectedState} onChange={e => setSelectedState(e.target.value)}
                                            className="lex-select"
                                        >
                                            {availableStates.map(s => <option key={s} value={s}>{s === 'All States' ? '📍 National' : `📍 ${s}`}</option>)}
                                        </select>
                                    </div>

                                    <button
                                        onClick={startListening}
                                        className={`p-1.5 rounded-lg border transition-all ${isListening ? 'bg-[#9C2A22] text-white border-[#9C2A22]' : 'bg-[#F6F7F9] text-[#0B5850] border-[#D7DBE2] hover:bg-[#DCEFEC]'}`}
                                        title="Voice Query"
                                    >
                                        {isListening ? '🎙️ Listening...' : '🎤 Voice'}
                                    </button>
                                </div>

                                {/* Text Input Row */}
                                <div className="flex items-end gap-2 px-1">
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                        placeholder={isListening ? "Listening carefully..." : "Ask a legal question (e.g. Notice period for tenant eviction in Karnataka)..."}
                                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm py-2 px-1 resize-none max-h-40 min-h-[44px] placeholder-[#5B6472] text-[#0E1B30] font-sans"
                                        rows={1}
                                    />

                                    <button
                                        onClick={loading ? stopGeneration : sendMessage}
                                        disabled={!input.trim() && !loading}
                                        className={`py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center flex-shrink-0 ${(input.trim() || loading) ? 'bg-[#0E1B30] text-white hover:bg-[#1E2E4A]' : 'bg-[#E7E9ED] text-[#5B6472] cursor-not-allowed'}`}
                                    >
                                        {loading ? 'Stopping...' : 'Send →'}
                                    </button>
                                </div>
                            </div>
                            <div className="text-[10px] text-center text-[#5B6472] mt-2 font-mono">
                                Lex AI can make mistakes — verify important claims against primary statutory sources.
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
