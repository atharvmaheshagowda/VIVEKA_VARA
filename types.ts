import React from 'react';

export enum Emotion {
  HAPPY = 'HAPPY',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
  FEAR = 'FEAR',
  CALM = 'CALM',
  SURPRISED = 'SURPRISED',
  NEUTRAL = 'NEUTRAL',
}

export enum EnvironmentType {
  FOREST = 'FOREST',
  OCEAN = 'OCEAN',
  CYBER = 'CYBER'
}

export type ParticleType = 'none' | 'rain' | 'birds' | 'ash' | 'fireflies' | 'fog' | 'embers' | 'digital-rain';

export type CameraEffect = 'none' | 'shake' | 'breathing' | 'pulse';

export interface EnvironmentPalette {
  sky: string;
  clouds: string;
  farHill: string;
  midHill: string;
  nearHill: string;
  heroObject: string;
  foreground: string;
  highlight: string; // Rim light color
  accent: string; // Flowers, neons, special details
}

export interface LightingConfig {
  globalIntensity: number;
  globalColor: string; // Hex/RGBA
  sunRayColor: string;
  sunRayIntensity: number; // 0 to 1
  rimLightIntensity: number; // 0 to 1
}

export interface FogConfig {
  color: string;
  opacityNear: number;
  opacityMid: number;
  opacityFar: number;
  speed: number;
}

export interface PostProcessConfig {
  bloomThreshold: number;
  bloomIntensity: number;
  vignetteIntensity: number; // 0 to 1
  grainOpacity: number; // 0 to 1
  saturation: number;
  contrast: number;
  brightness: number;
  tintColor: string;
  tintBlendMode: string;
}

export interface EmotionPreset {
  id: Emotion;
  ambienceDescription: string;
  palette: EnvironmentPalette;
  lighting: LightingConfig;
  fog: FogConfig;
  postProcess: PostProcessConfig;
  parallaxSpeedMultiplier: number;
  particleSystem: ParticleType;
  cameraEffect: CameraEffect;
}

export interface ParallaxLayerProps {
  speed: number;
  offsetY?: number;
  zIndex: number;
  children?: React.ReactNode;
  color?: string;
  opacity?: number;
  blur?: number; // px blur
}
