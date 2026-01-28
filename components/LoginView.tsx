import React, { useState } from 'react';
import { Fingerprint, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { SparklesCore } from './ui/sparkles';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(!username) return;
    
    setLoading(true);
    // Simulate auth
    setTimeout(() => {
        onLogin();
    }, 1500);
  };

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
        {/* Background Grid & Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none z-0" />

        {/* Sparkles Layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
            <SparklesCore
                id="tsparticleslogin"
                background="transparent"
                minSize={0.6}
                maxSize={1.4}
                particleDensity={100}
                className="w-full h-full"
                particleColor="#4aa3ff"
            />
        </div>

        <div className="relative z-10 w-full max-w-md p-8">
             {/* Logo / Header */}
             <div className="text-center mb-12 animate-fade-in">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-6 border border-white/10">
                    <Cpu className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-mono">Viveka <span className="text-blue-500">Vara</span></h1>
                <p className="text-blue-300/50 text-xs tracking-[0.3em] mt-2">EMOTION RESPONSE SYSTEM V1.0</p>
             </div>

             {/* Login Form */}
             <form onSubmit={handleLogin} className="space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(59,130,246,0.25)] hover:border-white/20">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 
                 <div className="space-y-2 relative z-10">
                    <label className="text-xs text-blue-200/60 font-semibold tracking-wider uppercase pl-1">Identity</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="OPERATOR ID"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 pl-10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all font-mono text-sm"
                            autoFocus
                        />
                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    </div>
                 </div>

                 <div className="space-y-2 relative z-10">
                    <label className="text-xs text-blue-200/60 font-semibold tracking-wider uppercase pl-1">Access Key</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            placeholder="••••••••••••"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 pl-10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all font-mono text-sm"
                        />
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    </div>
                 </div>

                 <button 
                    type="submit"
                    disabled={loading || !username}
                    className="w-full relative overflow-hidden rounded-xl group/btn bg-white text-black font-bold py-3.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? 'AUTHENTICATING...' : 'INITIALIZE SYSTEM'}
                        {!loading && <ArrowRight size={16} />}
                    </span>
                 </button>
             </form>
             
             <div className="mt-8 flex justify-center gap-4 text-[10px] text-white/20 font-mono">
                 <span>SECURE CONNECTION</span>
                 <span>•</span>
                 <span>ENCRYPTED</span>
                 <span>•</span>
                 <span>GEMINI AI ENABLED</span>
             </div>
        </div>
    </div>
  );
};