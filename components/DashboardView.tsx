import React, { useState, useEffect } from 'react';
import { Play, Activity, Globe, Clock, Cloud, Layers, Zap, ArrowRight, Image as ImageIcon, Video, Settings, Database, Terminal, Cpu, Sparkles, X, Search, Bell, MessageSquarePlus, LogOut, User, BrainCircuit } from 'lucide-react';
import { EmotionSensor } from './EmotionSensor';
import { FeedbackModal } from './FeedbackModal';
import { SettingsModal } from './SettingsModal';

interface DashboardViewProps {
    onLaunch: () => void;
    onLogout: () => void;
}

const StatCard = ({ icon: Icon, label, value, trend, color, delay }: any) => (
    <div className={`bg-white/5 backdrop-blur-md border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all duration-500 hover:border-white/20 cursor-default group animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards opacity-0`} style={{ animationDelay: `${delay}ms` }}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${color} bg-opacity-20 text-white group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {trend === 'up' ? '+12%' : 'Active'}
            </span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-white/40 font-medium tracking-wide uppercase">{label}</div>
    </div>
);

const SystemLog = () => {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const messages = [
            "Initializing neural pathways...",
            "Neural Core connected.",
            "Loading environment assets [Forest_v2]",
            "Audio context synchronized.",
            "Checking Veo video generation credits...",
            "System optimized for 60fps.",
            "Waiting for user input...",
            "Ambient sensors active."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < messages.length) {
                setLogs(prev => [...prev.slice(-5), `[${new Date().toLocaleTimeString()}] ${messages[i]}`]);
                i++;
            }
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="font-mono text-[10px] text-green-400/80 space-y-1 overflow-hidden h-full">
            {logs.map((log, i) => (
                <div key={i} className="animate-fade-in truncate border-l-2 border-green-500/30 pl-2">
                    {log}
                </div>
            ))}
            <div className="animate-pulse">_</div>
        </div>
    );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ onLaunch, onLogout }) => {
    const [showSensor, setShowSensor] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [activeNav, setActiveNav] = useState('Overview');
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full h-full bg-[#030303] text-white flex flex-col overflow-hidden relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030303] to-[#030303]">

            {/* Background Detail */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

            {/* --- NAVIGATION BAR --- */}
            <div className="h-16 border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl z-20 flex items-center justify-between px-6 flex-shrink-0">

                {/* Left: Brand */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Cpu size={16} className="text-white" />
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-sm font-bold tracking-tight leading-none">Viveka <span className="text-blue-500">Vara</span></h1>
                        <div className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Console</div>
                    </div>
                </div>

                {/* Center: Main Navigation */}
                <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
                    {['Overview'].map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveNav(item)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${activeNav === item
                                ? 'bg-white text-black shadow-lg'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3">

                    {/* Search Bar - REMOVED */}

                    <div className="h-6 w-[1px] bg-white/10 hidden lg:block mx-2" />

                    {/* Action Icons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowFeedback(true)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors tooltip-trigger"
                            title="Send Feedback"
                        >
                            <MessageSquarePlus size={16} />
                        </button>
                        <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors relative"
                            title="Notifications"
                        >
                            <Bell size={16} />
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-black" />
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            title="Settings"
                        >
                            <Settings size={16} />
                        </button>
                    </div>

                    {/* Profile Dropdown Trigger */}
                    <div className="flex items-center gap-3 pl-2 ml-2 border-l border-white/10">
                        <div className="text-right hidden xl:block">
                            <div className="text-xs font-bold text-white">Operator</div>
                            <div className="text-[10px] text-white/40">Pro License</div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/20 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform group"
                            title="Logout"
                        >
                            <User size={14} className="text-white group-hover:hidden" />
                            <LogOut size={14} className="text-red-400 hidden group-hover:block" />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- SCROLLABLE CONTENT --- */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto pb-12">

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard icon={Activity} label="Neural Load" value="42%" color="bg-blue-500" trend="up" delay={0} />
                        <StatCard icon={Globe} label="Environments" value="07" color="bg-purple-500" trend="flat" delay={100} />
                        <StatCard icon={Clock} label="Uptime" value="12:40" color="bg-green-500" trend="flat" delay={200} />
                        <StatCard icon={Cloud} label="AI Connection" value="Stable" color="bg-yellow-500" trend="up" delay={300} />
                    </div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">

                        {/* 1. Main Action: Simulation (Spans 2 cols) */}
                        <div
                            onClick={onLaunch}
                            className="lg:col-span-2 min-h-[300px] relative group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-gray-900 transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-blue-900/20"
                        >
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                            <div className="absolute top-6 left-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold tracking-wider">LIVE ENVIRONMENT</span>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h2 className="text-4xl font-bold mb-3 text-white group-hover:text-blue-200 transition-colors">Enter Simulation</h2>
                                <p className="text-white/60 max-w-lg text-sm mb-6 leading-relaxed">
                                    Immerse yourself in a reactive 2D world. Experience real-time emotion analysis and dynamic atmospheric shifts.
                                </p>
                                <button className="px-6 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 group-hover:gap-4 transition-all hover:bg-blue-50">
                                    LAUNCH
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* 2. Side Column: Quick Tools */}
                        <div className="space-y-6 flex flex-col">

                            {/* Neural Interface Card (Was Creative Studio) */}
                            <div
                                onClick={() => setShowSensor(true)}
                                className="flex-1 bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-white/10 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-all"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <BrainCircuit size={100} />
                                </div>
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                                            <Activity size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold mb-1">Neural Interface</h3>
                                        <p className="text-xs text-white/40">Calibrate sensors & analyze patterns</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mt-4 group-hover:translate-x-1 transition-transform">
                                        INITIATE SCAN <ArrowRight size={12} />
                                    </div>
                                </div>
                            </div>

                            {/* System Log / Terminal */}
                            <div className="h-40 bg-[#050505] border border-white/10 rounded-3xl p-5 relative overflow-hidden flex flex-col">
                                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                                    <Terminal size={12} className="text-white/40" />
                                    <span className="text-[10px] font-mono text-white/40 uppercase">System Log</span>
                                </div>
                                <SystemLog />
                            </div>

                        </div>

                        {/* 3. Bottom Row: Secondary Options */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Archives */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <Database size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Archives</h4>
                                    <p className="text-xs text-white/40">View saved generations</p>
                                </div>
                            </div>

                            {/* Neural Config */}
                            <div
                                onClick={() => setShowSettings(true)}
                                className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                                    <Settings size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Neural Config</h4>
                                    <p className="text-xs text-white/40">Adjust AI parameters</p>
                                </div>
                            </div>


                        </div>

                    </div>
                </div>
            </div>

            {/* Render Modals */}
            {showSensor && (
                <EmotionSensor
                    onClose={() => setShowSensor(false)}
                    onApplyEmotion={() => setShowSensor(false)}
                />
            )}

            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} />
            )}

            {showFeedback && (
                <FeedbackModal onClose={() => setShowFeedback(false)} />
            )}
        </div>
    );
};