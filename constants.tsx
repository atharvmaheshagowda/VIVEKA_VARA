import React from 'react';
import { Emotion, EmotionPreset } from './types';

export const EMOTION_PRESETS: Record<Emotion, EmotionPreset> = {
  [Emotion.HAPPY]: {
    id: Emotion.HAPPY,
    ambienceDescription: 'Sunlit Valley',
    palette: {
      sky: 'linear-gradient(to bottom, #38bdf8, #bae6fd, #e0f2fe)',
      clouds: '#ffffff',
      farHill: '#60a5fa',
      midHill: '#3b82f6',
      nearHill: '#1e40af',
      heroObject: '#15803d',
      foreground: '#14532d',
      highlight: '#fbbf24', // Golden rim
      accent: '#ec4899' // Pink flowers
    },
    lighting: {
      globalIntensity: 1.1,
      globalColor: '#ffffff',
      sunRayColor: '#fef08a',
      sunRayIntensity: 0.6,
      rimLightIntensity: 0.8
    },
    fog: {
      color: '#e0f2fe',
      opacityNear: 0.0,
      opacityMid: 0.1,
      opacityFar: 0.3,
      speed: 1.0
    },
    postProcess: {
      bloomThreshold: 0.8,
      bloomIntensity: 1.2,
      vignetteIntensity: 0.2,
      grainOpacity: 0.03,
      saturation: 1.3,
      contrast: 1.1,
      brightness: 1.05,
      tintColor: 'rgba(255, 200, 50, 0.1)',
      tintBlendMode: 'overlay'
    },
    parallaxSpeedMultiplier: 1.0,
    particleSystem: 'birds',
    cameraEffect: 'none'
  },

  [Emotion.SAD]: {
    id: Emotion.SAD,
    ambienceDescription: 'Weeping Forest',
    palette: {
      sky: 'linear-gradient(to bottom, #334155, #475569, #94a3b8)',
      clouds: '#64748b',
      farHill: '#475569',
      midHill: '#334155',
      nearHill: '#1e293b',
      heroObject: '#0f172a',
      foreground: '#020617',
      highlight: '#94a3b8', // Dull grey rim
      accent: '#334155'
    },
    lighting: {
      globalIntensity: 0.7,
      globalColor: '#94a3b8',
      sunRayColor: '#cbd5e1',
      sunRayIntensity: 0.1,
      rimLightIntensity: 0.2
    },
    fog: {
      color: '#cbd5e1',
      opacityNear: 0.2,
      opacityMid: 0.4,
      opacityFar: 0.8,
      speed: 0.5
    },
    postProcess: {
      bloomThreshold: 1.0,
      bloomIntensity: 0.0,
      vignetteIntensity: 0.4,
      grainOpacity: 0.08,
      saturation: 0.6,
      contrast: 0.9,
      brightness: 0.9,
      tintColor: 'rgba(20, 30, 50, 0.3)',
      tintBlendMode: 'multiply'
    },
    parallaxSpeedMultiplier: 0.5,
    particleSystem: 'rain',
    cameraEffect: 'none'
  },

  [Emotion.ANGRY]: {
    id: Emotion.ANGRY,
    ambienceDescription: 'Inferno Grove',
    palette: {
      sky: 'linear-gradient(to bottom, #450a0a, #7f1d1d, #1c1917)',
      clouds: '#292524',
      farHill: '#7f1d1d',
      midHill: '#991b1b',
      nearHill: '#450a0a',
      heroObject: '#292524',
      foreground: '#000000',
      highlight: '#f87171', // Red rim
      accent: '#ef4444'
    },
    lighting: {
      globalIntensity: 1.0,
      globalColor: '#fea5a5',
      sunRayColor: '#fca5a5',
      sunRayIntensity: 0.0,
      rimLightIntensity: 1.0
    },
    fog: {
      color: '#7f1d1d',
      opacityNear: 0.1,
      opacityMid: 0.3,
      opacityFar: 0.6,
      speed: 2.5
    },
    postProcess: {
      bloomThreshold: 0.6,
      bloomIntensity: 1.5,
      vignetteIntensity: 0.5,
      grainOpacity: 0.15,
      saturation: 1.4,
      contrast: 1.4,
      brightness: 0.9,
      tintColor: 'rgba(100, 0, 0, 0.2)',
      tintBlendMode: 'color-burn'
    },
    parallaxSpeedMultiplier: 1.5,
    particleSystem: 'ash',
    cameraEffect: 'shake'
  },

  [Emotion.FEAR]: {
    id: Emotion.FEAR,
    ambienceDescription: 'Shadow Realm',
    palette: {
      sky: 'linear-gradient(to bottom, #020617, #000000, #172554)',
      clouds: '#0f172a',
      farHill: '#1e1b4b',
      midHill: '#172554',
      nearHill: '#020617',
      heroObject: '#000000',
      foreground: '#000000',
      highlight: '#4c1d95', // Purple rim
      accent: '#581c87'
    },
    lighting: {
      globalIntensity: 0.4,
      globalColor: '#312e81',
      sunRayColor: '#000000',
      sunRayIntensity: 0.0,
      rimLightIntensity: 0.1
    },
    fog: {
      color: '#020617',
      opacityNear: 0.4,
      opacityMid: 0.7,
      opacityFar: 0.95,
      speed: 0.2
    },
    postProcess: {
      bloomThreshold: 0.9,
      bloomIntensity: 0.3,
      vignetteIntensity: 0.8, // Heavy vignette
      grainOpacity: 0.2, // Heavy grain
      saturation: 0.4,
      contrast: 1.3,
      brightness: 0.7,
      tintColor: 'rgba(0, 0, 10, 0.6)',
      tintBlendMode: 'multiply'
    },
    parallaxSpeedMultiplier: 0.8,
    particleSystem: 'fog',
    cameraEffect: 'breathing'
  },

  [Emotion.CALM]: {
    id: Emotion.CALM,
    ambienceDescription: 'Twilight Haven',
    palette: {
      sky: 'linear-gradient(to bottom, #0f766e, #2dd4bf, #fcd34d)',
      clouds: '#ccfbf1',
      farHill: '#2dd4bf',
      midHill: '#0d9488',
      nearHill: '#115e59',
      heroObject: '#0f766e',
      foreground: '#134e4a',
      highlight: '#fcd34d', // Soft sunset rim
      accent: '#a7f3d0'
    },
    lighting: {
      globalIntensity: 0.9,
      globalColor: '#f0fdf4',
      sunRayColor: '#fde68a',
      sunRayIntensity: 0.4,
      rimLightIntensity: 0.5
    },
    fog: {
      color: '#ccfbf1',
      opacityNear: 0.1,
      opacityMid: 0.2,
      opacityFar: 0.4,
      speed: 0.6
    },
    postProcess: {
      bloomThreshold: 0.7,
      bloomIntensity: 1.0,
      vignetteIntensity: 0.2,
      grainOpacity: 0.04,
      saturation: 1.1,
      contrast: 1.0,
      brightness: 1.0,
      tintColor: 'rgba(200, 255, 200, 0.1)',
      tintBlendMode: 'soft-light'
    },
    parallaxSpeedMultiplier: 0.6,
    particleSystem: 'fireflies',
    cameraEffect: 'none'
  },

  [Emotion.SURPRISED]: {
    id: Emotion.SURPRISED,
    ambienceDescription: 'Neon Rift',
    palette: {
      sky: 'linear-gradient(to bottom, #6366f1, #a855f7, #ec4899)',
      clouds: '#fbcfe8',
      farHill: '#a855f7',
      midHill: '#d946ef',
      nearHill: '#7c3aed',
      heroObject: '#4f46e5',
      foreground: '#2e1065',
      highlight: '#ffffff',
      accent: '#22d3ee'
    },
    lighting: {
      globalIntensity: 1.2,
      globalColor: '#fae8ff',
      sunRayColor: '#ffffff',
      sunRayIntensity: 0.8,
      rimLightIntensity: 1.0
    },
    fog: {
      color: '#e879f9',
      opacityNear: 0.0,
      opacityMid: 0.1,
      opacityFar: 0.2,
      speed: 0.0
    },
    postProcess: {
      bloomThreshold: 0.4,
      bloomIntensity: 2.0,
      vignetteIntensity: 0.0,
      grainOpacity: 0.0,
      saturation: 1.5,
      contrast: 1.1,
      brightness: 1.1,
      tintColor: 'rgba(255, 255, 255, 0.2)',
      tintBlendMode: 'screen'
    },
    parallaxSpeedMultiplier: 0.0,
    particleSystem: 'fireflies',
    cameraEffect: 'pulse'
  },

  [Emotion.NEUTRAL]: {
    id: Emotion.NEUTRAL,
    ambienceDescription: 'Silent Woods',
    palette: {
      sky: 'linear-gradient(to bottom, #1e293b, #334155, #64748b)',
      clouds: '#94a3b8',
      farHill: '#475569',
      midHill: '#334155',
      nearHill: '#1e293b',
      heroObject: '#0f172a',
      foreground: '#020617',
      highlight: '#64748b',
      accent: '#94a3b8'
    },
    lighting: {
      globalIntensity: 0.8,
      globalColor: '#f1f5f9',
      sunRayColor: '#e2e8f0',
      sunRayIntensity: 0.2,
      rimLightIntensity: 0.3
    },
    fog: {
      color: '#64748b',
      opacityNear: 0.05,
      opacityMid: 0.2,
      opacityFar: 0.5,
      speed: 0.8
    },
    postProcess: {
      bloomThreshold: 1.0,
      bloomIntensity: 0.0,
      vignetteIntensity: 0.3,
      grainOpacity: 0.05,
      saturation: 0.9,
      contrast: 1.0,
      brightness: 1.0,
      tintColor: 'transparent',
      tintBlendMode: 'normal'
    },
    parallaxSpeedMultiplier: 1.0,
    particleSystem: 'none',
    cameraEffect: 'none'
  }
};
