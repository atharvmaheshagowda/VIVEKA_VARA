import React, { useMemo } from 'react';
import { Emotion } from '../types';

interface InteractivePlantProps {
  emotion: Emotion;
  x: number;
  delay: number;
}

export const InteractivePlant: React.FC<InteractivePlantProps> = ({ emotion, x, delay }) => {
  
  const properties = useMemo(() => {
    switch (emotion) {
      case Emotion.HAPPY:
        return {
          scale: 1.2,
          color: '#2ecc71', // Vibrant Green
          flowerColor: '#e91e63', // Pink
          flowerSize: 1,
          rotation: 0,
          animation: 'animate-sway',
          leafDroop: 0,
        };
      case Emotion.SAD:
        return {
          scale: 0.8,
          color: '#7f8c8d', // Greyish
          flowerColor: 'transparent',
          flowerSize: 0,
          rotation: 15, // Droop
          animation: 'transition-all duration-[2000ms]',
          leafDroop: 20,
        };
      case Emotion.ANGRY:
        return {
          scale: 1.1,
          color: '#8e44ad', // Purple/Dark
          flowerColor: '#c0392b', // Red
          flowerSize: 0.5,
          rotation: 0,
          animation: 'animate-shake',
          leafDroop: -10, // Spiky up
        };
      case Emotion.FEAR:
        return {
          scale: 0.5,
          color: '#f1c40f', // Pale yellow/green
          flowerColor: 'transparent',
          flowerSize: 0,
          rotation: 0,
          animation: 'animate-pulse-fast',
          leafDroop: 10,
        };
      case Emotion.CALM:
        return {
          scale: 1.0,
          color: '#27ae60', // Calm Green
          flowerColor: '#fff',
          flowerSize: 0.8,
          rotation: 0,
          animation: 'animate-sway',
          leafDroop: 0,
        };
      case Emotion.SURPRISED:
        return {
          scale: 1.4,
          color: '#00d2ff', // Cyan
          flowerColor: '#f39c12',
          flowerSize: 1.2,
          rotation: 0,
          animation: 'transition-transform duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bounce
          leafDroop: -20, // Upward
        };
      default: // NEUTRAL
        return {
          scale: 1.0,
          color: '#2ecc71',
          flowerColor: '#ecf0f1',
          flowerSize: 0.5,
          rotation: 0,
          animation: '',
          leafDroop: 0,
        };
    }
  }, [emotion]);

  return (
    <div 
      className={`absolute bottom-[14vh] z-10 transition-theme ${properties.animation}`}
      style={{
        left: x,
        transform: `scale(${properties.scale}) rotate(${properties.rotation}deg)`,
        transformOrigin: 'bottom center',
        animationDelay: `${delay}s`,
        filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))'
      }}
    >
      <svg width="60" height="100" viewBox="0 0 60 100" className="overflow-visible">
        {/* Stem */}
        <path 
          d="M30,100 Q30,60 30,30" 
          stroke={properties.color} 
          strokeWidth="4" 
          fill="none" 
          className="transition-theme"
        />
        
        {/* Left Leaf */}
        <path 
          d={`M30,70 Q10,${60 + properties.leafDroop} 5,${50 + properties.leafDroop} Q15,${65 + properties.leafDroop} 30,70`} 
          fill={properties.color} 
          className="transition-theme origin-bottom-right"
        />

        {/* Right Leaf */}
        <path 
          d={`M30,50 Q50,${40 + properties.leafDroop} 55,${30 + properties.leafDroop} Q45,${45 + properties.leafDroop} 30,50`} 
          fill={properties.color} 
          className="transition-theme origin-bottom-left"
        />

        {/* Flower Head */}
        <g 
            style={{ 
                transform: `translate(30px, 30px) scale(${properties.flowerSize})`, 
                transformOrigin: 'center', 
                opacity: properties.flowerSize > 0 ? 1 : 0 
            }}
            className="transition-theme"
        >
            <circle cx="0" cy="0" r="10" fill={properties.flowerColor} />
            <circle cx="-8" cy="-8" r="8" fill={properties.flowerColor} opacity="0.8" />
            <circle cx="8" cy="-8" r="8" fill={properties.flowerColor} opacity="0.8" />
            <circle cx="-8" cy="8" r="8" fill={properties.flowerColor} opacity="0.8" />
            <circle cx="8" cy="8" r="8" fill={properties.flowerColor} opacity="0.8" />
            <circle cx="0" cy="0" r="5" fill="#fff" />
        </g>
      </svg>
    </div>
  );
};
