import React from 'react';
import { CameraEffect, PostProcessConfig } from '../types';

interface PostProcessingProps {
  config: PostProcessConfig;
  cameraEffect: CameraEffect;
}

const PostProcessing: React.FC<PostProcessingProps> = ({ 
  config,
  cameraEffect 
}) => {
  const animationClass = 
    cameraEffect === 'shake' ? 'animate-shake' : 
    cameraEffect === 'pulse' ? 'animate-pulse-fast' : 
    cameraEffect === 'breathing' ? 'animate-breathing' : '';

  // CSS Filter string construction
  const filterString = `
    saturate(${config.saturation}) 
    contrast(${config.contrast}) 
    brightness(${config.brightness})
  `.trim();

  // Bloom approximation using drop-shadows on the container is hard, 
  // so we use backdrop-filter brightness for bloom-like washout if intensity is high
  const bloomFilter = config.bloomIntensity > 0 
    ? `drop-shadow(0 0 ${20 * config.bloomIntensity}px rgba(255,255,255,${0.3 * config.bloomIntensity}))` 
    : '';

  return (
    <>
      {/* 1. Global Color Grading & Tint */}
      <div 
        className={`absolute inset-0 pointer-events-none z-[50] transition-theme ${animationClass}`}
        style={{
          backgroundColor: config.tintColor,
          mixBlendMode: config.tintBlendMode as any,
          filter: filterString,
        }}
      />

      {/* 2. Vignette (Radial Gradient) */}
      <div 
        className="absolute inset-0 pointer-events-none z-[51] transition-opacity duration-1000"
        style={{
            background: `radial-gradient(circle at center, transparent 40%, black 100%)`,
            opacity: config.vignetteIntensity
        }}
      />

      {/* 3. Film Grain (Base64 Noise) */}
      <div 
        className="absolute inset-0 pointer-events-none z-[52] opacity-0"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
            opacity: config.grainOpacity,
            mixBlendMode: 'overlay',
            filter: 'contrast(1.5)'
        }}
      />
    </>
  );
};

export default PostProcessing;
