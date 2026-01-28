import React, { useMemo } from 'react';
import { Emotion } from '../types';

interface CrystalPrismProps {
  emotion: Emotion;
  x: number;
  delay: number;
  scale?: number;
}

export const CrystalPrism: React.FC<CrystalPrismProps> = ({ emotion, x, delay, scale = 1 }) => {
  
  const properties = useMemo(() => {
    switch (emotion) {
      case Emotion.HAPPY:
        return { 
          color: '#00d2ff', // Cyan
          coreColor: '#ffffff',
          anim: 'animate-spin-slow',
          filter: 'drop-shadow(0 0 10px #00d2ff)'
        };
      case Emotion.SAD:
        return { 
          color: '#4a69bd', 
          coreColor: '#1e3799',
          anim: 'animate-float-slow', // Just floats
          filter: 'drop-shadow(0 0 5px #4a69bd)'
        };
      case Emotion.ANGRY:
        return { 
          color: '#ff4757', 
          coreColor: '#ff6b81',
          anim: 'animate-shake-subtle',
          filter: 'drop-shadow(0 0 15px #ff4757)'
        };
      case Emotion.FEAR:
        return { 
          color: '#a55eea', 
          coreColor: '#000000',
          anim: 'animate-pulse-erratic',
          filter: 'drop-shadow(0 0 8px #a55eea)'
        };
      case Emotion.CALM:
        return { 
          color: '#2ed573', 
          coreColor: '#7bed9f',
          anim: 'animate-float-calm',
          filter: 'drop-shadow(0 0 12px #2ed573)'
        };
      case Emotion.SURPRISED:
        return { 
          color: '#ffa502', 
          coreColor: '#ffffff',
          anim: 'animate-bounce-slight',
          filter: 'drop-shadow(0 0 20px #ffa502)'
        };
      default:
        return { 
          color: '#ffffff', 
          coreColor: '#f1f2f6',
          anim: 'animate-spin-slow',
          filter: 'drop-shadow(0 0 10px white)'
        };
    }
  }, [emotion]);

  return (
    <div 
      className={`absolute bottom-[25vh] z-10 transition-all duration-[2000ms] ease-in-out`}
      style={{
        left: x,
        transform: `scale(${scale})`,
        animationDelay: `${delay}s`
      }}
    >
        {/* The Prism Body */}
        <div className={`relative w-24 h-32 ${properties.anim}`}>
             <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
                {/* Glow Filter */}
                <defs>
                    <filter id={`glow-${x}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <g filter={`drop-shadow(0 0 5px ${properties.color})`} className="transition-all duration-1000">
                    {/* Wireframe Back */}
                    <path d="M50 10 L10 40 L50 110 L90 40 Z" fill="none" stroke={properties.color} strokeWidth="1" opacity="0.4" />
                    
                    {/* Inner Core */}
                    <path d="M50 35 L25 50 L50 90 L75 50 Z" fill={properties.coreColor} opacity="0.8" className="animate-pulse-fast" />

                    {/* Wireframe Front */}
                    <path d="M50 0 L0 40 L50 120 L100 40 Z" fill="none" stroke={properties.color} strokeWidth="1.5" />
                    <path d="M0 40 L100 40" stroke={properties.color} strokeWidth="1" opacity="0.6" />
                    <path d="M50 0 L50 120" stroke={properties.color} strokeWidth="1" opacity="0.6" />
                </g>
             </svg>
        </div>
    </div>
  );
};
