import React, { useState, useEffect, useRef } from 'react';
import { Emotion, EmotionPreset } from '../types';
import { EMOTION_PRESETS } from '../constants';
import WorldLayer from './WorldLayer';
import ParticleSystem from './ParticleSystem';
import PostProcessing from './PostProcessing';
import { SkyBackground } from './SkyBackground';
import { EmotionSensor } from './EmotionSensor';
import { AmbientAudio } from './AmbientAudio';
import { Sidebar } from './Sidebar';
import { CameraEmotionSync } from './CameraEmotionSync';
import { VoiceGuide } from './VoiceGuide';
import {
  DistantMountains,
  AlpinePeaks,
  DeepForestSilhouette,
  DenseForestSilhouette,
  HeroTrees,
  FloatingClouds,
  ForegroundGround,
  GodRays,
  MistLayer
} from './EnvironmentAssets';
import { analyzeEmotionFromText } from '../services/geminiService';

// --- UI COMPONENTS ---

const SunMoon = ({ emotion }: { emotion: Emotion }) => {
  const isNight = [Emotion.FEAR, Emotion.SAD, Emotion.ANGRY, Emotion.NEUTRAL].includes(emotion);

  return (
    <div className={`absolute transition-all duration-[3000ms] ease-in-out`}
      style={{
        top: isNight ? '10%' : '15%',
        right: isNight ? '15%' : '20%',
        transform: `scale(${isNight ? 0.8 : 1.0})`
      }}>
      {isNight ? (
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-slate-200 shadow-[0_0_60px_rgba(255,255,255,0.3)] relative overflow-hidden">
            <div className="absolute top-4 left-4 w-5 h-5 rounded-full bg-slate-300/50 shadow-inner" />
          </div>
          <div className="absolute inset-0 rounded-full bg-blue-100/10 blur-xl scale-150 animate-pulse-slow" />
        </div>
      ) : (
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100 via-yellow-300 to-orange-400 shadow-[0_0_100px_rgba(255,200,50,0.8)] relative z-10" />
          <div className="absolute inset-0 bg-yellow-200 opacity-30 blur-3xl scale-[2.0] animate-pulse-slow z-0" />
          {/* God Ray Emitter Source */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,255,200,0.1)_0%,transparent_70%)] pointer-events-none" />
        </div>
      )}
    </div>
  );
};

const SceneTitle = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);
  const [displayTitle, setDisplayTitle] = useState(text);

  useEffect(() => {
    setShow(false);
    const timer = setTimeout(() => {
      setDisplayTitle(text);
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    }, 500);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-[60] transition-opacity duration-1000 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col items-center">
        <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-white to-transparent mb-4 opacity-50" />
        <h1 className="text-4xl md:text-6xl font-light tracking-[0.3em] text-white uppercase text-center drop-shadow-2xl">
          {displayTitle}
        </h1>
        <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-white to-transparent mt-4 opacity-50" />
      </div>
    </div>
  );
};

interface SimulationViewProps {
  onExit: () => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ onExit }) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(Emotion.NEUTRAL);
  const [preset, setPreset] = useState<EmotionPreset>(EMOTION_PRESETS[Emotion.NEUTRAL]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSensor, setShowSensor] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Enable Audio by default
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });


  useEffect(() => {
    setPreset(EMOTION_PRESETS[currentEmotion]);
  }, [currentEmotion]);

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAnalysis = async (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    const emotion = await analyzeEmotionFromText(text);
    setCurrentEmotion(emotion);
    setIsAnalyzing(false);
  };

  const isWindy = currentEmotion === Emotion.ANGRY || currentEmotion === Emotion.SURPRISED;
  const palette = preset.palette;

  return (
    <div className="relative w-screen h-screen overflow-hidden transition-theme font-sans bg-black">

      <Sidebar
        currentEmotion={currentEmotion}
        onEmotionSelect={setCurrentEmotion}
        onOpenSensor={() => setShowSensor(true)}
        onAnalyze={handleAnalysis}
        onToggleCamera={() => setShowCamera(!showCamera)}
        onToggleVoice={() => setShowVoiceGuide(!showVoiceGuide)}
        onExit={onExit}
        isAnalyzing={isAnalyzing}
        isCameraActive={showCamera}
        isVoiceActive={showVoiceGuide}
      />

      {/* --- 2D WORLD CONTAINER --- */}
      <div className="absolute inset-0 w-full h-full">

        {/* Background & Sky */}
        <div className="absolute inset-0 w-full h-full">
          <SkyBackground gradient={palette.sky} />
        </div>

        <SunMoon emotion={currentEmotion} />

        <AmbientAudio emotion={currentEmotion} muted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />

        {/* --- LAYERS --- */}
        <WorldLayer baseSpeed={0.05} speedMultiplier={preset.parallaxSpeedMultiplier} zIndex={15} offsetY="5%">
          <div className="shrink-0 transition-colors duration-[2000ms]" style={{ color: palette.clouds }}>
            <FloatingClouds />
          </div>
        </WorldLayer>

        <WorldLayer baseSpeed={0.1} speedMultiplier={preset.parallaxSpeedMultiplier} zIndex={20} offsetY="15%">
          <div className="shrink-0 transition-colors duration-[1500ms]" style={{ color: palette.farHill }}>
            <DistantMountains />
          </div>
        </WorldLayer>

        {/* Fog Layer Far */}
        <WorldLayer baseSpeed={0.15} speedMultiplier={preset.fog.speed} zIndex={22} offsetY="0%">
          <div className="shrink-0 transition-all duration-[2000ms]" style={{ color: preset.fog.color, opacity: preset.fog.opacityFar }}>
            <MistLayer />
          </div>
        </WorldLayer>

        <WorldLayer baseSpeed={0.2} speedMultiplier={preset.parallaxSpeedMultiplier} zIndex={25} offsetY="12%">
          <div className="shrink-0 transition-colors duration-[1500ms]" style={{ color: palette.midHill }}>
            <AlpinePeaks />
          </div>
        </WorldLayer>

        <WorldLayer baseSpeed={0.3} speedMultiplier={preset.parallaxSpeedMultiplier} zIndex={28} offsetY="5%">
          <div className="shrink-0 transition-colors duration-[1500ms]" style={{ color: palette.nearHill }}>
            <DeepForestSilhouette />
          </div>
        </WorldLayer>

        {/* Fog Layer Mid */}
        <WorldLayer baseSpeed={0.35} speedMultiplier={preset.fog.speed * 1.5} zIndex={29} offsetY="10%">
          <div className="shrink-0 transition-all duration-[2000ms]" style={{ color: preset.fog.color, opacity: preset.fog.opacityMid }}>
            <MistLayer />
          </div>
        </WorldLayer>

        {/* God Rays */}
        <WorldLayer baseSpeed={0} speedMultiplier={0} zIndex={30} offsetY="0%">
          <div className="shrink-0 transition-all duration-[2000ms]" style={{ color: preset.lighting.sunRayColor, opacity: 1 }}>
            <GodRays opacity={preset.lighting.sunRayIntensity} />
          </div>
        </WorldLayer>

        <WorldLayer baseSpeed={0.4} speedMultiplier={preset.parallaxSpeedMultiplier} zIndex={31} offsetY="10%">
          <div className="shrink-0 transition-colors duration-[1500ms]" style={{ color: palette.nearHill }}>
            <DenseForestSilhouette />
          </div>
        </WorldLayer>

        <WorldLayer baseSpeed={0.6} speedMultiplier={preset.parallaxSpeedMultiplier} zIndex={35} offsetY="5%">
          <div className="shrink-0 transition-colors duration-[1500ms]" style={{ color: palette.heroObject }}>
            <HeroTrees swayAnimation={isWindy ? 'animate-sway-heavy' : 'animate-sway'} highlightColor={palette.highlight} />
          </div>
        </WorldLayer>

        {/* Atmosphere: Near Mist (Overlay) */}
        <div className="absolute bottom-0 w-full h-[30vh] z-[39] pointer-events-none transition-colors duration-[2000ms]"
          style={{
            background: `linear-gradient(to top, ${preset.fog.color}40, transparent)`,
            opacity: preset.fog.opacityNear
          }} />

        <WorldLayer baseSpeed={0.8} speedMultiplier={preset.parallaxSpeedMultiplier} zIndex={40} offsetY="0%">
          <div className="shrink-0 transition-colors duration-[1500ms]" style={{ color: palette.foreground }}>
            <ForegroundGround emotion={currentEmotion} />
          </div>
        </WorldLayer>

        {/* Effects */}
        <div className="pointer-events-none absolute inset-0">
          <ParticleSystem type={preset.particleSystem} width={windowSize.w} height={windowSize.h} />
        </div>

        <SceneTitle text={preset.ambienceDescription} />

      </div>

      <PostProcessing config={preset.postProcess} cameraEffect={preset.cameraEffect} />

      {/* --- OVERLAYS --- */}

      <VoiceGuide
        isActive={showVoiceGuide}
        emotion={currentEmotion}
        onClose={() => setShowVoiceGuide(false)}
        onEmotionUpdate={(e) => setCurrentEmotion(e)}
      />

      {showSensor && (
        <EmotionSensor
          onClose={() => setShowSensor(false)}
          onApplyEmotion={(e) => setCurrentEmotion(e)}
        />
      )}

      {showCamera && (
        <CameraEmotionSync
          onClose={() => setShowCamera(false)}
          onEmotionDetected={(emotion) => setCurrentEmotion(emotion)}
        />
      )}
    </div>
  );
};