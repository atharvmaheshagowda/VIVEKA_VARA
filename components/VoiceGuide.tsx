import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Emotion } from '../types';
import { Sparkles, X, Mic, Volume2, Loader2 } from 'lucide-react';
import { analyzeEmotionFromText, analyzeSentimentContext } from '../services/geminiService';
import { DAKSHINAMURTHY_STOTRA, StotraVerse } from '../data/stotra';

interface VoiceGuideProps {
  emotion: Emotion;
  isActive: boolean;
  onClose: () => void;
  onEmotionUpdate: (emotion: Emotion) => void;
}

type GuideState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

export const VoiceGuide: React.FC<VoiceGuideProps> = ({ emotion, isActive, onClose, onEmotionUpdate }) => {
  const [guideState, setGuideState] = useState<GuideState>('IDLE');
  const [realtimeTranscript, setRealtimeTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentEmotionRef = useRef<Emotion>(emotion);

  // Constants
  const SILENCE_THRESHOLD = 2000; // 2 seconds of silence triggers response

  // Sync ref
  useEffect(() => {
    currentEmotionRef.current = emotion;
  }, [emotion]);

  // --- Core Wisdom Logic ---
  // --- Core Wisdom Logic (Semantic Intent) ---
  const getWisdom = (userText: string, currentEmotion: Emotion, detectedEmotion?: Emotion) => {
    // We now have access to deep context if we analyze it here again
    // For performance, we'll re-run the fast local analysis
    const context = analyzeSentimentContext(userText);
    const { intent, themes, metrics } = context;

    // Default to the detected emotion's verses
    const primaryEmotion = detectedEmotion || currentEmotion;
    let verses = DAKSHINAMURTHY_STOTRA[primaryEmotion] || DAKSHINAMURTHY_STOTRA['GENERAL'];

    // --- Semantic Intent Re-Routing ---
    // If the user is "Seeking Peace" (Intent), we might pull from CALM verses even if they sound SAD.
    if (intent === 'SEEKING_PEACE' && primaryEmotion !== Emotion.CALM) {
      verses = [...verses, ...DAKSHINAMURTHY_STOTRA[Emotion.CALM]];
    }
    // If the user is "Burdened" (Themes of heaviness), pull from Sad/Compassion verses
    if (intent === 'BURDENED' && primaryEmotion !== Emotion.SAD) {
      verses = [...verses, ...DAKSHINAMURTHY_STOTRA[Emotion.SAD]];
    }
    // If "Confused", pull from Anger/Clarity (removing ignorance)
    if (intent === 'CONFUSED') {
      verses = [...verses, ...DAKSHINAMURTHY_STOTRA[Emotion.ANGRY]]; // Anger verses often deal with "Who am I?"
    }

    // Find best matching verse based on THEMATIC overlap + Keywords
    let bestVerse: StotraVerse | null = null;
    let maxScore = -1;

    for (const verse of verses) {
      let score = 0;
      const verseText = (verse.meaning + verse.translation).toLowerCase();

      // 1. Keyword Match (Legacy)
      const userWords = userText.toLowerCase().split(' ');
      score += verse.keywords.filter(k => userText.toLowerCase().includes(k)).length * 2;

      // 2. Theme Match (New)
      // Check if verse contains themes relevant to user's detected themes
      themes.forEach(theme => {
        if (verseText.includes(theme.toLowerCase())) score += 3;
      });

      // 3. Intent Match
      // If verse mentions "peace" and user is seeking peace
      if (intent === 'SEEKING_PEACE' && (verseText.includes('peace') || verseText.includes('silence'))) score += 5;
      if (intent === 'BURDENED' && (verseText.includes('heals') || verseText.includes('sorrow'))) score += 5;

      if (score > maxScore) {
        maxScore = score;
        bestVerse = verse;
      }
    }

    // Fallback logic
    if (!bestVerse || maxScore <= 0) {
      // If low confidence/no match, pick random from the PRIMARY emotion
      const safeVerses = DAKSHINAMURTHY_STOTRA[primaryEmotion] || DAKSHINAMURTHY_STOTRA['GENERAL'];
      bestVerse = safeVerses[Math.floor(Math.random() * safeVerses.length)];
    }

    // Context-Aware Speech Rate
    let speechRate = 0.85; // Default "calm" speed
    if (intent === 'BURDENED') speechRate = 0.75; // Slower, more compassionate
    if (intent === 'CELEBRATING') speechRate = 0.95; // Slightly more energetic
    if (intent === 'CONFUSED') speechRate = 0.9; // Clear, normal speed

    return {
      intro: `I sense ${intent.toLowerCase().replace('_', ' ')}.`,
      sanskrit: bestVerse.voiceover || bestVerse.sanskrit,
      meaning: `${bestVerse.meaning}. ${bestVerse.translation}`,
      rate: speechRate
    };
  };

  // --- Speech Output (Multi-Stage) ---
  const speak = useCallback(async (parts: { intro: string, sanskrit: string, meaning: string, rate?: number }) => {
    if (!synthRef.current) return;

    setGuideState('SPEAKING');
    synthRef.current.cancel();

    // Helper to speak one part with specific voice/lang
    const speakPart = (text: string, langHint: 'en' | 'hi', rateOverride?: number): Promise<void> => {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = synthRef.current.getVoices();

        let voice;
        if (langHint === 'hi') {
          // Try literal Hindi voice for Sanskrit
          voice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi') || v.name.includes('India'));
        } else {
          // Indian English for general text
          voice = voices.find(v => v.lang === "en-IN" || v.name.includes("India"));
        }

        // Fallback
        if (!voice) voice = voices.find(v => v.lang.startsWith('en'));

        if (voice) utterance.voice = voice;
        utterance.pitch = langHint === 'hi' ? 0.85 : 0.9;
        utterance.rate = rateOverride || 0.85; // Use override or default

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve(); // Proceed even if error

        synthRef.current.speak(utterance);
      });
    };

    // Sequential Speaking
    try {
      await speakPart(parts.intro, 'en', parts.rate); // Use intent-based rate
      await new Promise(r => setTimeout(r, 300)); // Pause
      await speakPart(parts.sanskrit, 'hi', parts.rate);
      await new Promise(r => setTimeout(r, 500)); // Pause
      await speakPart(parts.meaning, 'en', parts.rate);
    } finally {
      setGuideState('LISTENING');
      startListening();
    }
  }, []);

  // --- Speech Recognition Control ---
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      initRecognition();
    }
    try {
      recognitionRef.current?.start();
      setGuideState('LISTENING');
    } catch (e) {
      // Already started or error, ensure state is correct
      console.log("Listening start warning:", e);
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (e) { }
  }, []);

  const initRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // We keep it continuous to capture full sentences, but we manually stop/start for turn taking
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      // If we are speaking, ignore input (prevent self-loop)
      if (guideState === 'SPEAKING' || guideState === 'PROCESSING') return;

      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');

      setRealtimeTranscript(transcript);

      // Debounce Logic: If user stops talking for X seconds, consider it "done"
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      silenceTimerRef.current = setTimeout(() => {
        handleUserDoneSpeaking(transcript);
      }, SILENCE_THRESHOLD);
    };

    recognition.onerror = (e: any) => {
      console.error('[Viveka] Error:', e.error);
      if (e.error === 'not-allowed') {
        // Handle permission denied
        setGuideState('IDLE');
      }
    };

    // If it stops unexpectedly while we should be listening, restart it
    recognition.onend = () => {
      if (guideState === 'LISTENING') {
        try { recognition.start(); } catch (e) { }
      }
    };

    recognitionRef.current = recognition;
  };

  const handleUserDoneSpeaking = async (fullText: string) => {
    if (!fullText.trim()) return;

    stopListening();
    setGuideState('PROCESSING');

    try {
      // 1. Immediate State Injection: Get the heart check result first
      const detected = await analyzeEmotionFromText(fullText);

      // 2. Force update the Ref and the UI immediately
      currentEmotionRef.current = detected;
      onEmotionUpdate(detected);

      // 3. Sync Ref Check: Ensure getWisdom uses the NEW emotion
      const wisdom = getWisdom(fullText, detected, detected);

      setRealtimeTranscript('');

      // 4. Async Handling: Ensure we await the wisdom generation/prep if needed (though getWisdom is sync)
      // but ensure speak is triggered correctly
      speak(wisdom);
    } catch (e) {
      console.error("Error processing user speech:", e);
      setGuideState('LISTENING');
      startListening();
    }
  };

  // --- Lifecycle ---
  useEffect(() => {
    if (isActive) {
      initRecognition();

      // Initial Greeting
      setGuideState('SPEAKING'); // Block mic initially
      const utterance = new SpeechSynthesisUtterance("I am here. Speak your heart.");
      utterance.pitch = 0.8;
      utterance.onend = () => {
        setGuideState('LISTENING');
        startListening();
      };
      synthRef.current.speak(utterance);

    } else {
      stopListening();
      synthRef.current.cancel();
      setGuideState('IDLE');
    }

    return () => {
      stopListening();
      synthRef.current.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isActive]);


  if (!isActive) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[160] flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4">

      {/* Orb Visual */}
      <div className="relative group">
        <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-1000 
            ${guideState === 'SPEAKING' ? 'bg-indigo-500 scale-150 opacity-60' :
            guideState === 'PROCESSING' ? 'bg-purple-500 scale-125 opacity-40 animate-pulse' :
              guideState === 'LISTENING' ? 'bg-cyan-400 scale-110 opacity-30' : 'bg-gray-500 opacity-10'}
        `} />

        <div className={`
                w-20 h-20 rounded-full bg-gradient-to-br from-slate-900 to-black border border-white/20 
                flex items-center justify-center shadow-2xl relative z-10 overflow-hidden backdrop-blur-md
                transition-all duration-500
                ${guideState === 'SPEAKING' ? 'scale-110 border-indigo-400/50' : 'scale-100'}
            `}>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

          {guideState === 'LISTENING' && (
            <Mic className="text-cyan-400 animate-pulse" size={24} />
          )}
          {guideState === 'PROCESSING' && (
            <Loader2 className="text-purple-400 animate-spin" size={24} />
          )}
          {guideState === 'SPEAKING' && (
            <div className="flex gap-1 items-center justify-center h-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-1 bg-indigo-300 rounded-full animate-pulse" style={{ height: Math.random() * 20 + 5 + 'px', animationDuration: `${0.2 + Math.random() * 0.3}s` }} />
              ))}
            </div>
          )}

        </div>

        <button onClick={onClose} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-20">
          <X size={12} />
        </button>
      </div>

      {/* Status Badge */}
      <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-sm font-mono text-white/90 shadow-lg flex flex-col items-center gap-1 min-w-[200px] text-center">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={12} className={guideState === 'SPEAKING' ? "text-indigo-400" : "text-white/40"} />
          <span className="uppercase tracking-widest text-[10px] text-white/50">
            {guideState}
          </span>
        </div>

        {/* Caption Area */}
        <div className="min-h-[20px] transition-all">
          {realtimeTranscript ? (
            <span className="text-white/80 italic">"{realtimeTranscript}..."</span>
          ) : guideState === 'LISTENING' ? (
            <span className="text-white/30">Listening...</span>
          ) : guideState === 'SPEAKING' ? (
            <span className="text-indigo-300">Viveka is speaking...</span>
          ) : (
            <span className="text-white/30">...</span>
          )}
        </div>
      </div>
    </div>
  );
};