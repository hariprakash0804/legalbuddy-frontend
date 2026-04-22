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
        
        // Strip markdown symbols before speaking
        const cleanText = text
            .replace(/\*\*/g, '')      // Remove bold **
            .replace(/\*/g, '')        // Remove italic *
            .replace(/#/g, '')         // Remove headers #
            .replace(/__/g, '')        // Remove underline __
            .replace(/> /g, '')        // Remove blockquotes >
            .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links but keep label

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
            const res = await axios.post(`${getApiUrl()}/chat/query`,
                { question: input, target_language: selectedLanguage, state_filter: selectedState === 'All States' ? null : selectedState, top_k: 20, max_tokens: 4000, temperature: 0.2 },
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
            // Show login prompt for guests after first response
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
        <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans">
            {/* Mobile Overlay Backdrop */}
            {isMobile && sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar — slides over on mobile, inline on desktop */}
            <div className={`transition-all duration-300 ease-in-out bg-slate-50 border-r border-slate-200 flex flex-col
                ${isMobile ? `mobile-sidebar ${sidebarOpen ? 'mobile-sidebar-visible' : 'mobile-sidebar-hidden'}` : (sidebarOpen ? 'w-[260px]' : 'w-0 opacity-0 overflow-hidden')}`}>
                <div className="p-4 flex flex-col h-full">
                    <button onClick={() => { setMessages([]); if (isMobile) setSidebarOpen(false); }} className="flex items-center gap-3 w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-sm font-medium mb-4">
                        <span className="text-lg">+</span> New Chat
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-2 py-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 mb-2">Recent Queries</div>
                        {messages.filter(m => m.role === 'user').slice(-8).reverse().map((m, i) => (
                            <div key={i} className="px-3 py-2 text-xs text-slate-600 truncate hover:bg-slate-200 rounded-md cursor-pointer transition-colors">
                                💬 {m.text}
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-slate-200 space-y-1">
                        <button onClick={downloadChat} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                            📥 Export History
                        </button>
                        {isGuest ? (
                            <div className="p-3 space-y-2">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Guest Mode</p>
                                <button onClick={() => { router.push('/login'); if (isMobile) setSidebarOpen(false); }} className="flex items-center gap-2 w-full p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-sm text-white font-medium">
                                    🔐 Login to Save Chats
                                </button>
                                <button onClick={() => { router.push('/register'); if (isMobile) setSidebarOpen(false); }} className="flex items-center gap-2 w-full p-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-xs text-slate-600 font-medium">
                                    ✨ Create Account
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                    {userEmail[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">{userEmail}</p>
                                </div>
                                <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col relative h-full transition-all duration-300`}>
                {/* Header */}
                <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-4 sticky top-0 bg-white/80 backdrop-blur-sm z-20">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" aria-label="Toggle sidebar">
                            {sidebarOpen && !isMobile ? '◂' : '☰'}
                        </button>
                        <h1 className="font-bold text-indigo-950 flex items-center gap-1.5">
                            <span className="text-lg md:text-xl">⚖️</span>
                            <span className="text-sm md:text-base">LegalBuddy <span className="text-[9px] md:text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase ml-1">AI PRO</span></span>
                        </h1>
                    </div>

                    <div className="flex-1 max-w-sm mx-4 relative hidden md:block">
                        <input
                            type="text" placeholder="Search conversation..."
                            className="w-full bg-slate-100 border-none rounded-full px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 underline-offset-0"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* Messages Column (ChatGPT Inspired Centered View) */}
                <div className="flex-1 overflow-y-auto pt-4 pb-32">
                    <div className="max-w-3xl mx-auto px-4 md:px-0">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm border border-indigo-100 animate-bounce">⚖️</div>
                                <h2 className="text-2xl font-bold text-indigo-950 mb-3">How can I assist your legal research?</h2>
                                <p className="text-slate-500 max-w-md text-sm leading-relaxed mb-8">
                                    I am your intelligent legal companion, trained on Indian state and central laws to provide accurate, multi-lingual guidance.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                                    {['What is Section 302 IPC?', 'Explain 498A guidelines', 'Kerala local building rules', 'Rights under RTI Act'].map(q => (
                                        <button key={q} onClick={() => setInput(q)} className="p-4 bg-white border border-slate-100 rounded-2xl text-left text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all shadow-sm">
                                            {q} →
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-8">
                            {filteredMessages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex gap-4 w-full ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-indigo-950 text-white' : 'bg-slate-100 text-indigo-600 border border-slate-200'
                                            }`}>
                                            {m.role === 'user' ? 'U' : '⚖️'}
                                        </div>
                                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 px-1 flex items-center gap-2">
                                                {m.role === 'user' ? (
                                                    <span className="text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-full">YOU</span>
                                                ) : (
                                                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full italic">AI COUNSEL</span>
                                                )}
                                                <span className="text-[9px] font-medium">• {m.time}</span>
                                            </div>
                                            <div className={`text-[16px] leading-[1.8] py-1 selection:bg-indigo-100 selection:text-indigo-900 ${m.role === 'user' ? 'font-medium text-slate-800' : 'prose-legal text-slate-700'}`}>
                                                {m.role === 'bot' ? renderBotText(m.text) : <p className="whitespace-pre-wrap">{m.text}</p>}
                                            </div>

                                            {m.role === 'bot' && (m.sources || m.language || m.chunks) && (
                                                <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                                                    <div className="flex items-center gap-2 mr-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Legal Evidence:</span>
                                                    </div>
                                                    
                                                    {m.chunks && (
                                                        <div className="group relative">
                                                            <span className="bg-white hover:bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-200 hover:border-emerald-200 shadow-sm cursor-help transition-all flex items-center gap-2 group">
                                                                <span className="text-emerald-500">📄</span>
                                                                {m.chunks} Verified Citations
                                                                <span className="text-slate-300 group-hover:text-emerald-400 transition-colors ml-1">ⓘ</span>
                                                            </span>
                                                            {/* Tooltip for sources */}
                                                            {m.sources && (
                                                                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-white rounded-xl shadow-2xl border border-slate-100 text-[10px] leading-relaxed text-slate-600 hidden group-hover:block animate-in fade-in slide-in-from-bottom-2 z-30">
                                                                    <div className="font-bold text-indigo-900 mb-1 border-b border-indigo-50 pb-1">Primary Documents:</div>
                                                                    <div className="max-h-32 overflow-y-auto pr-1">
                                                                        {Array.isArray(m.sources)
                                                                            ? m.sources.map((s, idx) => (
                                                                                <div key={idx} className="mb-0.5 last:mb-0 truncate">• {s.document || s.toString()} <span className="text-[8px] text-slate-400">({s.state || 'General'})</span></div>
                                                                            ))
                                                                            : typeof m.sources === 'string'
                                                                                ? m.sources.split(',').map((s, idx) => (
                                                                                    <div key={idx} className="mb-0.5 last:mb-0 truncate">• {s.trim()}</div>
                                                                                ))
                                                                                : null
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {/* Speaker Button */}
                                                    <button 
                                                        onClick={() => speakMessage(m.text)}
                                                        className={`p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all group flex items-center gap-2 ${isSpeaking ? 'bg-indigo-50 border-indigo-300' : 'bg-white'}`}
                                                        title="Read Aloud"
                                                    >
                                                        <span className={`text-xs ${isSpeaking ? 'animate-pulse text-indigo-600' : 'text-slate-400'}`}>
                                                            {isSpeaking ? '🔊' : '🔈'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-500">Listen</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-4 animate-pulse">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200"></div>
                                    <div className="flex-1 space-y-4 py-1">
                                        <div className="h-2 bg-slate-100 rounded w-1/4"></div>
                                        <div className="space-y-3">
                                            <div className="h-2 bg-slate-50 rounded"></div>
                                            <div className="h-2 bg-slate-50 rounded w-5/6"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div ref={scrollRef} />
                </div>

                {/* The "Command Center" Floating Input Pill */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-8 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
                    <div className="max-w-3xl mx-auto w-full pointer-events-auto">
                        {/* Selectors row — above input on mobile, inside on desktop */}
                        <div className="flex items-center gap-2 mb-2 md:hidden px-1 input-tools-row">
                            <select
                                value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}
                                className="legal-select text-indigo-600 flex-1"
                            >
                                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.code === 'en' ? '🌐 Global' : l.name}</option>)}
                            </select>
                            <select
                                value={selectedState} onChange={e => setSelectedState(e.target.value)}
                                className="legal-select text-slate-600 flex-1"
                            >
                                {availableStates.map(s => <option key={s} value={s}>{s === 'All States' ? '📍 All India' : s}</option>)}
                            </select>
                            <button 
                                onClick={startListening}
                                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isListening ? 'bg-red-50 text-red-600 shadow-inner' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
                                title="Voice Input"
                            >
                                <span className={isListening ? 'animate-pulse' : ''}>{isListening ? '🎙️' : '🎤'}</span>
                            </button>
                        </div>

                        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl md:rounded-[1.75rem] p-2 flex items-end gap-2 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">

                            {/* Desktop-only inline selectors */}
                            <div className="hidden md:flex items-center gap-1 self-center pl-2">
                                <select
                                    value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}
                                    className="legal-select text-indigo-600 uppercase tracking-tight text-[11px]"
                                >
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.code === 'en' ? '🌐 Global' : l.name}</option>)}
                                </select>
                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                <select
                                    value={selectedState} onChange={e => setSelectedState(e.target.value)}
                                    className="legal-select text-slate-500 text-[11px]"
                                >
                                    {availableStates.map(s => <option key={s} value={s}>{s === 'All States' ? '📍 All India' : s}</option>)}
                                </select>
                                
                                {/* Microphone Button */}
                                <button 
                                    onClick={startListening}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-50 text-red-600 shadow-inner' : 'hover:bg-slate-100 text-slate-400'}`}
                                    title="Voice Input"
                                >
                                    <span className={isListening ? 'animate-pulse' : ''}>{isListening ? '🎙️' : '🎤'}</span>
                                </button>
                            </div>

                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                placeholder={isListening ? "Listening..." : "Consult LegalBuddy AI..."}
                                className="flex-1 bg-transparent border-none outline-none text-sm md:text-[15px] pt-3 pb-3 px-2 resize-none max-h-40 min-h-[44px]"
                                rows={Math.min(input.split('\n').length, 5)}
                            />

                            <button 
                                onClick={loading ? stopGeneration : sendMessage} 
                                disabled={!input.trim() && !loading}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 mb-0.5 mr-0.5 ${
                                    (input.trim() || loading) ? 'bg-indigo-950 text-white shadow-md scale-100 hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-300 scale-90'
                                }`}
                                title={loading ? "Stop Generating" : "Send Query"}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 bg-white rounded-sm animate-pulse shadow-sm"></div>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                                )}
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                            LegalBuddy AI provides educational legal guidance based on official records. Verify critical matters with a qualified lawyer.
                        </p>
                        {showLoginPrompt && isGuest && (
                            <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in">
                                <span className="text-[11px] text-amber-700">💡 Login to save your chat history</span>
                                <button onClick={() => router.push('/login')} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline">Login</button>
                                <button onClick={() => setShowLoginPrompt(false)} className="text-slate-400 hover:text-slate-600 text-xs ml-1">✕</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
