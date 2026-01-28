import React, { useMemo } from 'react';
import { Emotion } from '../types';

interface SpiritLanternProps {
  emotion: Emotion;
  x: number;
  delay: number;
  scale?: number;
}

export const SpiritLantern: React.FC<SpiritLanternProps> = ({ emotion, x, delay, scale = 1 }) => {
  
  const properties = useMemo(() => {
    switch (emotion) {
      case Emotion.HAPPY:
        return { color: '#fbbf24', glow: 'shadow-[0_0_30px_#fbbf24]', anim: 'animate-float-calm' };
      case Emotion.SAD:
        return { color: '#60a5fa', glow: 'shadow-[0_0_15px_#60a5fa]', anim: 'animate-float-slow' };
      case Emotion.ANGRY:
        return { color: '#ef4444', glow: 'shadow-[0_0_40px_#ef4444]', anim: 'animate-shake-subtle' };
      case Emotion.FEAR:
        return { color: '#a855f7', glow: 'shadow-[0_0_10px_#a855f7]', anim: 'animate-pulse-erratic' };
      case Emotion.CALM:
        return { color: '#34d399', glow: 'shadow-[0_0_25px_#34d399]', anim: 'animate-float-calm' };
      case Emotion.SURPRISED:
        return { color: '#f472b6', glow: 'shadow-[0_0_50px_#f472b6]', anim: 'animate-bounce-slight' };
      default:
        return { color: '#ffffff', glow: 'shadow-[0_0_20px_#ffffff]', anim: 'animate-float-calm' };
    }
  }, [emotion]);

  return (
    <div 
      className={`absolute bottom-[20vh] z-10 transition-all duration-[2000ms] ease-in-out`}
      style={{
        left: x,
        transform: `scale(${scale})`,
        animationDelay: `${delay}s`
      }}
    >
        {/* Tether line */}
        <div className="absolute top-6 left-1/2 w-[1px] h-[30vh] bg-gradient-to-b from-white/50 to-transparent -translate-x-1/2 opacity-30" />

        {/* The Lantern Body */}
        <div className={`relative ${properties.anim}`}>
             {/* Core Light */}
             <div 
                className={`w-4 h-12 rounded-full blur-[2px] transition-colors duration-1000 ${properties.glow}`}
                style={{ backgroundColor: properties.color }}
             />
             
             {/* Geometric Cage (SVG) */}
             <svg width="40" height="60" viewBox="0 0 40 60" className="absolute -top-1 -left-[12px] opacity-80">
                <path d="M20 0 L40 15 L20 60 L0 15 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/60" />
                <path d="M20 0 L40 15" stroke="currentColor" strokeWidth="1" className="text-white/40" />
                <path d="M20 60 L0 15" stroke="currentColor" strokeWidth="1" className="text-white/40" />
                <rect x="18" y="15" width="4" height="30" fill={properties.color} className="blur-sm opacity-50 transition-colors duration-1000" />
             </svg>
        </div>
    </div>
  );
};
