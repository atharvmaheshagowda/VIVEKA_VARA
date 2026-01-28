import React, { useState } from 'react';
import { Emotion } from '../types';
import { Sun, CloudRain, Flame, Eye, Wind, Zap, Circle, Sparkles, BrainCircuit, Send, Mic, LogOut, Camera, Headphones } from 'lucide-react';

interface SidebarProps {
  currentEmotion: Emotion;
  onEmotionSelect: (emotion: Emotion) => void;
  onOpenSensor: () => void;
  onAnalyze: (text: string) => void;
  onToggleCamera: () => void;
  onToggleVoice: () => void;
  onExit: () => void;
  isAnalyzing: boolean;
  isCameraActive: boolean;
  isVoiceActive: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentEmotion,
  onEmotionSelect,
  onOpenSensor,
  onAnalyze,
  onToggleCamera,
  onToggleVoice,
  onExit,
  isAnalyzing,
  isCameraActive,
  isVoiceActive
}) => {
  const [showAiInput, setShowAiInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<{ label: string, top: number } | null>(null);

  const moods = [
    { id: Emotion.HAPPY, icon: Sun, label: 'Happy', color: 'text-yellow-400', glow: 'shadow-yellow-500/50' },
    { id: Emotion.CALM, icon: Wind, label: 'Calm', color: 'text-teal-400', glow: 'shadow-teal-500/50' },
    { id: Emotion.NEUTRAL, icon: Circle, label: 'Neutral', color: 'text-gray-400', glow: 'shadow-gray-500/50' },
    { id: Emotion.SAD, icon: CloudRain, label: 'Sad', color: 'text-blue-400', glow: 'shadow-blue-500/50' },
    { id: Emotion.ANGRY, icon: Flame, label: 'Angry', color: 'text-red-500', glow: 'shadow-red-500/50' },
    { id: Emotion.FEAR, icon: Eye, label: 'Fear', color: 'text-purple-500', glow: 'shadow-purple-500/50' },
    { id: Emotion.SURPRISED, icon: Zap, label: 'Surprised', color: 'text-pink-400', glow: 'shadow-pink-500/50' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAnalyze(inputText);
      setInputText('');
      setShowAiInput(false);
    }
  };

  const handleMouseEnter = (label: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({ label, top: rect.top + rect.height / 2 });
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  const getSidebarStyle = (emotion: Emotion) => {
    switch (emotion) {
      case Emotion.HAPPY: return "bg-yellow-900/30 border-yellow-500/20 shadow-[5px_0_30px_rgba(234,179,8,0.2)]";
      case Emotion.SAD: return "bg-slate-900/40 border-slate-500/20 shadow-[5px_0_30px_rgba(100,116,139,0.2)]";
      case Emotion.ANGRY: return "bg-red-900/30 border-red-500/20 shadow-[5px_0_30px_rgba(239,68,68,0.2)]";
      case Emotion.FEAR: return "bg-purple-900/40 border-purple-500/20 shadow-[5px_0_30px_rgba(168,85,247,0.2)]";
      case Emotion.CALM: return "bg-teal-900/30 border-teal-500/20 shadow-[5px_0_30px_rgba(20,184,166,0.2)]";
      case Emotion.SURPRISED: return "bg-pink-900/30 border-pink-500/20 shadow-[5px_0_30px_rgba(236,72,153,0.2)]";
      default: return "bg-[#050505]/80 border-white/10 shadow-[5px_0_30px_rgba(0,0,0,0.5)]";
    }
  };

  const currentStyle = getSidebarStyle(currentEmotion);

  return (
    <div className={`fixed left-0 top-0 h-full w-20 backdrop-blur-xl border-r z-[100] flex flex-col items-center py-6 gap-6 transition-all duration-1000 ${currentStyle}`}>

      {/* Brand Indicator */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/5 shadow-inner flex-shrink-0 mb-2">
        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isAnalyzing ? 'animate-pulse bg-purple-400 shadow-[0_0_10px_#c084fc]' : 'bg-green-500/50'}`} />
      </div>

      {/* Divider */}
      <div className="w-8 h-[1px] bg-white/10 flex-shrink-0" />

      {/* Moods List */}
      <div
        className="flex-1 w-full flex flex-col items-center gap-4 overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {moods.map((m) => {
          const isActive = currentEmotion === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onEmotionSelect(m.id)}
              onMouseEnter={(e) => handleMouseEnter(m.label, e)}
              onMouseLeave={handleMouseLeave}
              className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0
                ${isActive
                  ? `bg-white/10 border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]`
                  : 'hover:bg-white/5 border border-transparent text-white/30 hover:text-white/70'
                }
              `}
            >
              <Icon
                size={20}
                className={`transition-all duration-500 ${isActive ? m.color : ''} ${isActive ? 'scale-110' : 'scale-100'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Active Indicator Dot */}
              {isActive && (
                <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full bg-current ${m.color} blur-[1px]`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tools Section */}
      <div className="w-full flex flex-col gap-4 pt-6 pb-2 px-2 flex-shrink-0 border-t border-white/5 bg-transparent">

        {/* Voice Guide Toggle */}
        <button
          onClick={onToggleVoice}
          onMouseEnter={(e) => handleMouseEnter(isVoiceActive ? 'Stop Voice' : 'Spirit Guide', e)}
          onMouseLeave={handleMouseLeave}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border group relative mx-auto
            ${isVoiceActive ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'hover:bg-white/5 border-transparent text-white/30 hover:text-white'}
          `}
        >
          <Headphones size={20} className={isVoiceActive ? 'animate-pulse' : ''} />
        </button>

        {/* Analysis Toggle */}
        <div className="relative group flex justify-center">
          <button
            onClick={() => setShowAiInput(!showAiInput)}
            onMouseEnter={(e) => !showAiInput && handleMouseEnter('Describe Mood', e)}
            onMouseLeave={handleMouseLeave}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border
              ${showAiInput ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'hover:bg-white/5 border-transparent text-white/30 hover:text-white'}
            `}
          >
            {isAnalyzing ? <Mic className="animate-pulse text-purple-400" size={20} /> : <Sparkles size={20} />}
          </button>

          {/* Input Popover */}
          {showAiInput && (
            <div className={`absolute left-full bottom-0 ml-4 w-72 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl animate-in slide-in-from-left-4 fade-in z-[200] ${currentStyle}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white/60 tracking-wider">ANALYSIS</span>
                <Sparkles size={12} className="text-blue-400" />
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="How does the world feel? (e.g., 'A quiet melancholic forest')"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-white/20 resize-none h-20"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputText}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>ANALYZE</span>
                  <Send size={12} />
                </button>
              </form>
              {/* Arrow */}
              <div className={`absolute left-0 bottom-6 -translate-x-1 w-2 h-2 border-l border-b transform rotate-45 ${currentStyle.split(' ')[1] || 'border-white/10'} bg-transparent`} />
            </div>
          )}
        </div>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          onMouseEnter={(e) => handleMouseEnter(isCameraActive ? 'Close Camera' : 'Camera Sync', e)}
          onMouseLeave={handleMouseLeave}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border group relative mx-auto
            ${isCameraActive ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'hover:bg-white/5 border-transparent text-white/30 hover:text-white'}
          `}
        >
          <Camera size={20} />
        </button>

        {/* Neural Sensor (Was Studio) */}
        <button
          onClick={onOpenSensor}
          onMouseEnter={(e) => handleMouseEnter('Neural Sensor', e)}
          onMouseLeave={handleMouseLeave}
          className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/5 border border-transparent hover:border-white/10 text-white/30 hover:text-white transition-all duration-300 mx-auto group relative"
        >
          <BrainCircuit size={20} />
        </button>

        {/* Exit Button */}
        <button
          onClick={onExit}
          onMouseEnter={(e) => handleMouseEnter('Return to Base', e)}
          onMouseLeave={handleMouseLeave}
          className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-white/30 hover:text-red-400 transition-all duration-300 mx-auto group relative"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Global Fixed Tooltip to avoid clipping in scrollable areas */}
      {activeTooltip && (
        <div
          className="fixed left-20 ml-4 px-3 py-1.5 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg text-white text-xs font-medium z-[200] shadow-xl flex items-center animate-in fade-in slide-in-from-left-2 duration-150 pointer-events-none"
          style={{ top: activeTooltip.top, transform: 'translateY(-50%)' }}
        >
          {activeTooltip.label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-black/90 border-l border-b border-white/10 transform rotate-45" />
        </div>
      )}
    </div>
  );
};