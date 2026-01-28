import React from 'react';
import { Emotion } from '../types';

// --- SHARED DEFS ---
const AssetDefs = () => (
  <defs>
    <linearGradient id="fogGradient" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
      <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
    </linearGradient>
    
    <linearGradient id="treeGradient" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
      <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
      <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
    </linearGradient>

    <linearGradient id="rayGradient" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
        <stop offset="20%" stopColor="currentColor" stopOpacity="0.4" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
    </linearGradient>

    <linearGradient id="groundGradient" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
    </linearGradient>

    <filter id="cloudBlur">
        <feGaussianBlur stdDeviation="8" />
    </filter>
    
    <filter id="distantBlur">
        <feGaussianBlur stdDeviation="1.5" />
    </filter>

    <filter id="mistBlur">
        <feGaussianBlur stdDeviation="15" />
    </filter>
  </defs>
);

// --- COMPONENTS ---

export const GodRays = ({ opacity = 0.5 }) => (
    <svg viewBox="0 0 1200 800" className="w-[1200px] h-[100vh] flex-shrink-0 text-current fill-current overflow-visible" style={{ opacity, mixBlendMode: 'overlay' }}>
        <AssetDefs />
        <g transform="rotate(-20 600 0)">
            <rect x="200" y="-100" width="100" height="1200" fill="url(#rayGradient)" opacity="0.6" />
            <rect x="400" y="-100" width="150" height="1200" fill="url(#rayGradient)" opacity="0.4" />
            <rect x="650" y="-100" width="80" height="1200" fill="url(#rayGradient)" opacity="0.5" />
            <rect x="850" y="-100" width="200" height="1200" fill="url(#rayGradient)" opacity="0.3" />
        </g>
    </svg>
);

export const MistLayer = () => (
    <svg viewBox="0 0 1200 400" className="w-[1200px] h-[50vh] flex-shrink-0 text-current fill-current overflow-visible">
        <AssetDefs />
        <g filter="url(#mistBlur)" opacity="0.7">
            <path d="M0 200 Q 150 150, 300 200 T 600 180 T 900 220 T 1200 200 V 400 H 0 Z" fill="currentColor" />
            <ellipse cx="200" cy="250" rx="150" ry="50" fill="currentColor" opacity="0.5" />
            <ellipse cx="800" cy="220" rx="200" ry="60" fill="currentColor" opacity="0.5" />
        </g>
    </svg>
);

export const FloatingClouds = () => (
    <svg viewBox="0 0 1200 500" className="w-[1200px] h-[60vh] flex-shrink-0 text-current fill-current overflow-visible opacity-60">
        <AssetDefs />
        <g filter="url(#cloudBlur)">
            <path d="M100 250 Q 140 200, 200 240 Q 250 180, 320 230 Q 380 190, 450 240 Q 500 210, 550 250 V 500 H 100 Z" fill="currentColor" opacity="0.9"/>
            <path d="M600 200 Q 660 140, 750 190 Q 820 150, 900 200 Q 980 160, 1050 210 Q 1120 180, 1200 230 V 500 H 600 Z" fill="currentColor" opacity="0.7"/>
        </g>
    </svg>
);

export const DistantMountains = () => (
  <svg viewBox="0 0 1200 600" className="w-[1200px] h-[70vh] flex-shrink-0 text-current fill-current overflow-visible">
    <AssetDefs />
    <g opacity="0.8" filter="url(#distantBlur)">
        <path d="M0 600 V 300 
                 C 150 280, 250 350, 400 280 
                 C 550 210, 650 350, 800 260 
                 C 950 170, 1050 320, 1200 250 
                 V 600 Z" 
                 fill="currentColor" />
    </g>
  </svg>
);

export const AlpinePeaks = () => (
  <svg viewBox="0 0 1200 600" className="w-[1200px] h-[70vh] flex-shrink-0 text-current fill-current overflow-visible">
    <AssetDefs />
    <path 
        d="M0 600 
           L 0 400 
           L 100 250 L 200 350 
           L 350 150 L 500 380 
           L 650 200 L 800 350 
           L 950 180 L 1100 320 
           L 1200 400 V 600 Z" 
        fill="url(#fogGradient)" 
        strokeLinejoin="round"
    />
  </svg>
);

export const DeepForestSilhouette = () => (
    <svg viewBox="0 0 1200 500" className="w-[1200px] h-[60vh] flex-shrink-0 text-current fill-current overflow-visible">
        <AssetDefs />
        {/* Simplified organic shapes for distance */}
        <path d="M0 500 V 250 
                 Q 50 200, 100 250 T 200 230 T 300 260 T 400 220 
                 T 500 250 T 600 210 T 700 260 T 800 230
                 T 900 250 T 1000 220 T 1100 260 T 1200 230
                 V 500 Z" 
                 fill="currentColor" opacity="0.8" />
    </svg>
);

export const DenseForestSilhouette = () => (
    <svg viewBox="0 0 1200 400" className="w-[1200px] h-[50vh] flex-shrink-0 text-current fill-current overflow-visible">
        <AssetDefs />
        <path d="M0 400 V 250 
                 L 20 220 L 40 250 L 60 210 L 80 250 
                 L 110 190 L 140 250 
                 L 180 180 L 220 250 
                 L 260 200 L 300 250
                 L 350 170 L 400 260
                 L 450 190 L 500 260
                 L 560 160 L 620 260
                 L 680 190 L 740 260
                 L 800 170 L 860 260
                 L 920 180 L 980 260
                 L 1050 160 L 1120 260
                 L 1200 200
                 V 400 Z" 
                 fill="currentColor" opacity="0.95" />
    </svg>
);

export const HeroTrees = ({ swayAnimation, highlightColor = 'transparent' }: { swayAnimation: string, highlightColor?: string }) => (
    <svg viewBox="0 0 1200 700" className={`w-[1200px] h-[80vh] flex-shrink-0 text-current fill-current ${swayAnimation} overflow-visible`}>
        <AssetDefs />
        {Array.from({ length: 5 }).map((_, i) => {
             const x = i * 250 + 50;
             const h = 450 + (i % 3) * 60; 
             const w = 140 + (i % 2) * 30;
             const tiers = 5;
             
             return (
                 <g key={i} transform={`translate(${x}, 700)`}>
                    {/* Trunk */}
                    <path d={`M${w/2 - 10} 0 L${w/2 - 4} -${h*0.9} L${w/2 + 4} -${h*0.9} L${w/2 + 10} 0 Z`} fill="currentColor" />
                    
                    {/* Foliage */}
                    {Array.from({ length: tiers }).map((_, t) => {
                        const tierHeight = h / (tiers + 1);
                        const yBase = - (t * tierHeight * 0.8) - (h * 0.2);
                        const tierW = w * (1 - t/tiers);
                        const curve = 20;

                        return (
                             <g key={t}>
                                {/* Base Shape */}
                                <path 
                                    d={`M ${w/2} ${yBase - tierHeight * 1.2} 
                                        Q ${w/2 - tierW/2 - curve} ${yBase - tierHeight * 0.2}, ${w/2 - tierW/2} ${yBase} 
                                        L ${w/2 + tierW/2} ${yBase} 
                                        Q ${w/2 + tierW/2 + curve} ${yBase - tierHeight * 0.2}, ${w/2} ${yBase - tierHeight * 1.2} Z`}
                                    fill="url(#treeGradient)"
                                />
                                {/* Rim Light Highlight (Left Side) */}
                                <path 
                                    d={`M ${w/2} ${yBase - tierHeight * 1.2} 
                                        Q ${w/2 - tierW/2 - curve} ${yBase - tierHeight * 0.2}, ${w/2 - tierW/2} ${yBase} 
                                        L ${w/2 - tierW/2 + 10} ${yBase} 
                                        Q ${w/2 - tierW/2 + 10} ${yBase - tierHeight * 0.5}, ${w/2} ${yBase - tierHeight * 1.2} Z`}
                                    fill={highlightColor}
                                    style={{ mixBlendMode: 'overlay', opacity: 0.6 }}
                                />
                             </g>
                        );
                    })}
                 </g>
             );
        })}
    </svg>
);

export const ForegroundGround = ({ emotion }: { emotion: Emotion }) => {
    // Determine opacities/states based on emotion
    const isWet = emotion === Emotion.SAD;
    const isCracked = emotion === Emotion.ANGRY || emotion === Emotion.FEAR;
    const isLush = !isWet && !isCracked;

    // Calculate exact ground height Y for a given X based on the path geometry
    // Path: M0 150 V 60 Q 150 50, 300 65 T 600 55 T 900 65 T 1200 60 V 150 Z
    const getGroundY = (x: number) => {
        let t = 0;
        if (x <= 300) {
             // Q 150 50, 300 65 (Start 0,60)
             t = x / 300;
             return Math.pow(1-t, 2) * 60 + 2 * (1-t) * t * 50 + Math.pow(t, 2) * 65;
        } else if (x <= 600) {
             // T 600 55 (Implicit Control: 450, 80)
             t = (x - 300) / 300;
             return Math.pow(1-t, 2) * 65 + 2 * (1-t) * t * 80 + Math.pow(t, 2) * 55;
        } else if (x <= 900) {
             // T 900 65 (Implicit Control: 750, 30)
             t = (x - 600) / 300;
             return Math.pow(1-t, 2) * 55 + 2 * (1-t) * t * 30 + Math.pow(t, 2) * 65;
        } else {
             // T 1200 60 (Implicit Control: 1050, 100)
             t = Math.min((x - 900) / 300, 1);
             return Math.pow(1-t, 2) * 65 + 2 * (1-t) * t * 100 + Math.pow(t, 2) * 60;
        }
    };

    return (
        <svg viewBox="0 0 1200 150" className="w-[1200px] h-[20vh] flex-shrink-0 text-current fill-current overflow-visible" preserveAspectRatio="none">
            <AssetDefs />
            <defs>
               <filter id="groundNoise">
                 <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                 <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0" />
               </filter>
               <clipPath id="groundPathClip">
                    <path d="M0 150 V 60 Q 150 50, 300 65 T 600 55 T 900 65 T 1200 60 V 150 Z" />
               </clipPath>
            </defs>
    
            {/* Base Shape */}
            <path 
                d="M0 150 V 60 
                   Q 150 50, 300 65 T 600 55 T 900 65 T 1200 60 
                   V 150 Z" 
                fill="url(#groundGradient)" 
            />
            
            {/* Base Noise Texture */}
            <rect x="0" y="0" width="1200" height="150" filter="url(#groundNoise)" opacity="0.2" clipPath="url(#groundPathClip)" style={{ mixBlendMode: 'overlay' }} />

            {/* --- EMOTION SPECIFIC TEXTURES --- */}

            {/* 1. CRACKS (Angry/Fear) */}
            <g className="transition-opacity duration-[2000ms]" style={{ opacity: isCracked ? 0.8 : 0, mixBlendMode: 'multiply' }} clipPath="url(#groundPathClip)">
                 {Array.from({ length: 6 }).map((_, i) => (
                    <path 
                        key={`crack-${i}`}
                        d={`M${i*200 + 50} 60 L${i*200 + 70} 90 L${i*200 + 40} 110 L${i*200 + 80} 140`} 
                        stroke="black" 
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.4"
                    />
                 ))}
                 <rect x="0" y="0" width="1200" height="150" filter="url(#groundNoise)" opacity="0.4" />
            </g>

            {/* 2. PUDDLES (Sad/Wet) */}
            <g className="transition-opacity duration-[2000ms]" style={{ opacity: isWet ? 1 : 0 }} clipPath="url(#groundPathClip)">
                 {Array.from({ length: 8 }).map((_, i) => (
                    <ellipse 
                        key={`puddle-${i}`}
                        cx={i * 150 + 80} 
                        cy={100 + (i%3)*15} 
                        rx={40 + (i%2)*20} 
                        ry={5 + (i%2)*3} 
                        fill="white" 
                        opacity="0.15"
                        style={{ mixBlendMode: 'overlay' }}
                    />
                 ))}
                 {Array.from({ length: 8 }).map((_, i) => (
                    <ellipse 
                        key={`reflect-${i}`}
                        cx={i * 150 + 90} 
                        cy={100 + (i%3)*15 - 2} 
                        rx={10} 
                        ry={2} 
                        fill="white" 
                        opacity="0.3"
                        style={{ mixBlendMode: 'soft-light' }}
                    />
                 ))}
            </g>

            {/* 3. GRASS (Happy/Calm/Neutral) */}
            <g className="transition-opacity duration-[2000ms]" style={{ opacity: isLush ? 1 : 0 }}>
                {Array.from({ length: 30 }).map((_, i) => {
                     const x = i * 40 + (Math.random() * 30);
                     const y = getGroundY(x); // Use precise calculation
                     const scale = 0.8 + Math.random() * 0.6;
                     return (
                         <g key={`grass-${i}`} transform={`translate(${x}, ${y - 2}) scale(${scale})`}>
                             <path d="M0 0 Q -3 -15, -6 -2" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
                             <path d="M2 2 Q 5 -20, 10 0" stroke="currentColor" strokeWidth="2.5" fill="none" />
                         </g>
                     );
                })}
            </g>
            
            {/* Rocks (Always present) */}
            <g clipPath="url(#groundPathClip)">
                {Array.from({ length: 18 }).map((_, i) => {
                     const x = Math.random() * 1150 + 20;
                     const yBase = 70 + Math.random() * 70; 
                     const w = 3 + Math.random() * 5;
                     const h = 2 + Math.random() * 4;
                     return (
                         <ellipse key={`rock-${i}`} cx={x} cy={yBase} rx={w} ry={h} fill="currentColor" opacity="0.4" />
                     );
                })}
            </g>
        </svg>
    );
};
