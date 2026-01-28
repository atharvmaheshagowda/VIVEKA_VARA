import React, { useEffect, useRef, useState } from 'react';
import { Emotion } from '../types';
import { Volume2, VolumeX, ShieldAlert } from 'lucide-react';

interface AmbientAudioProps {
  emotion: Emotion;
  muted: boolean;
  onToggleMute: () => void;
}

export const AmbientAudio: React.FC<AmbientAudioProps> = ({ emotion, muted, onToggleMute }) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const stereoPannerRef = useRef<StereoPannerNode | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const whiteNoiseBufferRef = useRef<AudioBuffer | null>(null);
  const pinkNoiseBufferRef = useRef<AudioBuffer | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);

  // Initialize Audio Context and permanent nodes
  useEffect(() => {
    const initAudio = () => {
      try {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        const ctx = new AudioContextClass();
        ctxRef.current = ctx;

        // Monitoring state for UI feedback
        ctx.onstatechange = () => {
          console.log("[Audio] State changed to:", ctx.state);
          setIsSuspended(ctx.state === 'suspended');
        };
        setIsSuspended(ctx.state === 'suspended');

        const master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.8;
        masterGainRef.current = master;

        const panner = ctx.createStereoPanner();
        panner.pan.value = 0;
        stereoPannerRef.current = panner;

        master.connect(panner);
        panner.connect(ctx.destination);

        // Buffers
        const bufferSize = ctx.sampleRate * 2;
        const whiteBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const whiteData = whiteBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) whiteData[i] = Math.random() * 2 - 1;
        whiteNoiseBufferRef.current = whiteBuffer;

        const pinkBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const pinkData = pinkBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          pinkData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          pinkData[i] *= 0.11;
          b6 = white * 0.115926;
        }
        pinkNoiseBufferRef.current = pinkBuffer;

        console.log("Audio Engine Initialized (State: " + ctx.state + ")");
      } catch (e) {
        console.error("Failed to initialize audio:", e);
      }
    };

    if (!ctxRef.current) initAudio();

    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  // Handle Mute/Unmute
  useEffect(() => {
    if (masterGainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      masterGainRef.current.gain.cancelScheduledValues(now);
      // Fast fade for responsive feel
      masterGainRef.current.gain.setTargetAtTime(muted ? 0 : 0.8, now, 0.1);
    }
  }, [muted]);

  // Handle Emotion Changes
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const emotionGain = ctx.createGain();
    emotionGain.connect(master);
    emotionGain.gain.setValueAtTime(0, ctx.currentTime);
    emotionGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.0);

    const nodes: AudioNode[] = [];
    const intervals: number[] = [];

    const playNoise = (type: 'white' | 'pink', filterType: BiquadFilterType, freq: number, q: number = 1) => {
      const source = ctx.createBufferSource();
      source.buffer = type === 'white' ? whiteNoiseBufferRef.current : pinkNoiseBufferRef.current;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = freq;
      filter.Q.value = q;
      source.connect(filter);
      filter.connect(emotionGain);
      source.start();
      nodes.push(source, filter);
      return { source, filter };
    };

    console.log("[Audio] Switching to emotion:", emotion);

    switch (emotion) {
      case Emotion.HAPPY:
        // Forest ambience: Gentle high-frequency air
        const bg = playNoise('pink', 'highpass', 1500);
        const bgVol = ctx.createGain();
        bgVol.gain.value = 0.3;
        bg.filter.disconnect();
        bg.filter.connect(bgVol);
        bgVol.connect(emotionGain);
        nodes.push(bgVol);

        const playChirp = () => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          const f = 2000 + Math.random() * 1500;
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(f + 500, ctx.currentTime + 0.1);
          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          const pan = ctx.createStereoPanner();
          pan.pan.value = Math.random() * 2 - 1;
          osc.connect(g); g.connect(pan); pan.connect(emotionGain);
          osc.start(); osc.stop(ctx.currentTime + 0.3);
        };
        intervals.push(window.setInterval(() => { if (Math.random() > 0.4) playChirp(); }, 800));
        break;

      case Emotion.ANGRY:
        // Distant thunderous wind
        const wind = playNoise('pink', 'lowpass', 400);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.2;
        const lfoG = ctx.createGain();
        lfoG.gain.value = 100;
        lfo.connect(lfoG); lfoG.connect(wind.filter.frequency);
        lfo.start(); nodes.push(lfo, lfoG);

        const thunder = () => {
          const s = ctx.createBufferSource();
          s.buffer = pinkNoiseBufferRef.current;
          const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 120;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
          s.connect(f); f.connect(g); g.connect(emotionGain);
          s.start(); s.stop(ctx.currentTime + 3.5);
        };
        intervals.push(window.setInterval(() => { if (Math.random() > 0.8) thunder(); }, 2500));
        break;

      case Emotion.SAD:
        // Rain-like texture
        const rain = playNoise('white', 'lowpass', 800, 0.5);
        const rainVol = ctx.createGain(); rainVol.gain.value = 0.4;
        rain.filter.disconnect(); rain.filter.connect(rainVol); rainVol.connect(emotionGain);
        nodes.push(rainVol);
        break;

      case Emotion.FEAR:
        // Low-frequency drone and heartbeat
        const d1 = ctx.createOscillator(); d1.frequency.value = 50;
        const d2 = ctx.createOscillator(); d2.frequency.value = 55;
        const dg = ctx.createGain(); dg.gain.value = 0.4;
        d1.connect(dg); d2.connect(dg); dg.connect(emotionGain);
        d1.start(); d2.start(); nodes.push(d1, d2, dg);
        const beat = () => {
          const o = ctx.createOscillator(); o.frequency.value = 40;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.8, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          o.connect(g); g.connect(emotionGain);
          o.start(); o.stop(ctx.currentTime + 0.2);
        };
        intervals.push(window.setInterval(beat, 1000));
        break;

      default:
        // Neutral: Calm shifting background noise
        const n1 = playNoise('pink', 'lowpass', 600, 0.5);
        const nVol = ctx.createGain(); nVol.gain.value = 0.3;
        n1.filter.disconnect(); n1.filter.connect(nVol); nVol.connect(emotionGain);
        nodes.push(nVol);
        break;
    }

    cleanupRef.current = () => {
      const fade = 0.5;
      const now = ctx.currentTime;
      emotionGain.gain.cancelScheduledValues(now);
      emotionGain.gain.setTargetAtTime(0, now, 0.1);
      setTimeout(() => {
        nodes.forEach(n => { try { n.disconnect(); } catch (e) { } });
        emotionGain.disconnect();
      }, fade * 1000);
      intervals.forEach(id => clearInterval(id));
    };

  }, [emotion]);

  const resumeAudio = () => {
    if (ctxRef.current) {
      ctxRef.current.resume().then(() => {
        console.log("[Audio] Context resumed successfully");
        // Ping to confirm
        const o = ctxRef.current!.createOscillator();
        const g = ctxRef.current!.createGain();
        o.frequency.value = 440;
        g.gain.setValueAtTime(0.2, ctxRef.current!.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctxRef.current!.currentTime + 0.2);
        o.connect(g); g.connect(masterGainRef.current!);
        o.start(); o.stop(ctxRef.current!.currentTime + 0.3);
        setIsSuspended(false);
      });
    }
  };

  const handleToggle = () => {
    if (isSuspended) {
      resumeAudio();
    }
    onToggleMute();
  };

  return (
    <>
      {/* Interaction Overlay if blocked */}
      {isSuspended && !muted && (
        <div
          onClick={resumeAudio}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer group animate-in fade-in duration-500"
        >
          <div className="bg-white/10 p-8 rounded-3xl border border-white/20 flex flex-col items-center gap-6 group-hover:bg-white/20 transition-all duration-300">
            <Volume2 size={64} className="text-white animate-bounce" />
            <div className="text-center">
              <h2 className="text-2xl font-light tracking-widest uppercase mb-2">Sound Blocked</h2>
              <p className="text-white/60 text-sm">Click anywhere to activate the ambient reality</p>
            </div>
            <div className="px-6 py-2 bg-white text-black rounded-full font-bold text-xs tracking-tighter uppercase transition-transform group-hover:scale-105">
              Enable Audio
            </div>
          </div>
        </div>
      )}

      {/* Control Button */}
      <div className="fixed top-8 right-8 z-[150] flex items-center gap-4">
        {isSuspended && !muted && (
          <div className="text-[10px] uppercase tracking-widest text-red-400 animate-pulse font-bold bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20 flex items-center gap-2">
            <ShieldAlert size={10} />
            Audio Blocked
          </div>
        )}
        <button
          onClick={handleToggle}
          className={`
            p-3 rounded-full transition-all duration-300 border backdrop-blur-md
            ${muted ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-black/40 border-white/10 text-white hover:bg-white/20'}
            ${isSuspended && !muted ? 'ring-4 ring-white/20 scale-110' : ''}
          `}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </>
  );
};
