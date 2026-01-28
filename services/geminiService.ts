import { Emotion } from "../types";
import { localEmotionBridge } from "./LocalEmotionBridge";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// Check both Vite-standard and Custom-defined environment variables
const API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  (globalThis as any).process?.env?.GEMINI_API_KEY ||
  (globalThis as any).process?.env?.API_KEY ||
  "";

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Local Sentiment Analysis (Rule-based with Scoring & Negation)
 */
// --- Advanced Local NLP Types ---
export interface AnalysisResult {
  emotion: Emotion;
  intent: 'SEEKING_PEACE' | 'BURDENED' | 'CELEBRATING' | 'CONFUSED' | 'OBSERVING';
  metrics: { energy: number; valence: number; confidence: number };
  themes: string[];
}

// ... (rest of the local analysis code remains the same for context output)
// --- Thematic Dictionaries (Metaphors & Context) ---
const THEMES = {
  HEAVINESS: ['weight', 'heavy', 'stone', 'burden', 'carry', 'drown', 'sink', 'pressure', 'tired', 'chain', 'drag', 'melancholy', 'grief', 'crushed', 'defeat', 'despair', 'hopeless', 'empty', 'cry', 'tears', 'sorrow', 'blue', 'grim', 'mourning', 'loss', 'regret', 'shame', 'guilty', 'fail', 'failure', 'depressed', 'gloomy', 'miserable', 'upset', 'disappointed', 'heartbroken'],
  VOID: ['empty', 'nothing', 'hollow', 'void', 'abyss', 'gone', 'missing', 'lost', 'dark', 'black', 'silence', 'nowhere', 'blank', 'numb', 'dead', 'death', 'grave'],
  LIGHT: ['shine', 'bright', 'sun', 'glow', 'light', 'clear', 'see', 'vision', 'awake', 'morning', 'star', 'sparkle', 'ray', 'beam', 'illuminate', 'radiant', 'brilliant', 'dazzle'],
  FLOW: ['river', 'stream', 'flow', 'move', 'dance', 'wind', 'breeze', 'float', 'drift', 'easy', 'smooth', 'glide', 'sail', 'fly', 'soar', 'bloom', 'grow'],
  CHAOS: ['storm', 'fire', 'burn', 'scream', 'noise', 'loud', 'mess', 'broken', 'shatter', 'fight', 'trap', 'rage', 'furious', 'mad', 'annoy', 'irritate', 'yell', 'hate', 'conflict', 'argument', 'strike', 'punch', 'destroy', 'smash', 'crash', 'ruin', 'violent'],
  STILLNESS: ['quiet', 'still', 'silence', 'pause', 'wait', 'stop', 'calm', 'peace', 'rest', 'relax', 'meditate', 'breath', 'tranquil', 'serene', 'gentle', 'soft', 'slow', 'content', 'soothe', 'comfort'],
  FEAR: ['scared', 'afraid', 'terrified', 'horror', 'panic', 'dread', 'worry', 'anxious', 'nervous', 'tense', 'unease', 'shake', 'tremble', 'nightmare', 'danger', 'threat', 'hunt', 'run', 'hide']
};

const MODIFIERS = {
  AMPLIFIERS: ['very', 'so', 'too', 'really', 'extremely', 'totally', 'absolutely', 'deeply'],
  DIMINISHERS: ['little', 'bit', 'kinda', 'sorta', 'maybe', 'slightly']
};

/**
 * Advanced Local Sentiment Analysis
 */
export const analyzeSentimentContext = (text: string): AnalysisResult => {
  const normalized = text.toLowerCase();
  const words = normalized.split(/[\s,!.?]+/);

  // 1. Calculate Metrics
  let energy = 0.5;
  let valence = 0.0;

  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const ellipsisCount = (text.match(/\.\.\./g) || []).length;

  if (exclamationCount > 0) energy += 0.2;
  if (ellipsisCount > 0) energy -= 0.2;
  if (words.length < 5) energy -= 0.1;

  const detectedThemes: string[] = [];
  const POSITIVE = ['good', 'great', 'love', 'happy', 'joy', 'smile', 'yes', 'hope', 'peace', 'calm', 'wonderful', 'perfect', 'nice', 'splendid', 'awesome', 'excited', 'amazing', 'fantastic', 'excellent', 'brilliant', 'beautiful', 'lovely'];
  const NEGATIVE = ['bad', 'sad', 'hate', 'angry', 'pain', 'hurt', 'no', 'fear', 'scared', 'cry', 'wrong', 'terrible', 'awful', 'misery', 'gloomy', 'depressed', 'melancholy', 'grief', 'broken', 'lonely', 'lost', 'fail', 'failure', 'stress', 'worst', 'horrible', 'stupid', 'idiot', 'useless', 'weak', 'pathetic'];

  let posCount = 0;
  let negCount = 0;

  // Filter out empty words and sanitize
  const cleanWords = words.map(w => w.trim()).filter(w => w.length > 0);

  cleanWords.forEach(w => {
    // Check for exact matches first to avoid partial conflicts
    if (POSITIVE.some(k => w === k || w.startsWith(k))) {
      valence += 0.5; // Even more aggressive
      posCount++;
    }
    if (NEGATIVE.some(k => w === k || w.startsWith(k))) {
      valence -= 0.5; // Even more aggressive
      negCount++;
    }

    Object.entries(THEMES).forEach(([theme, keywords]) => {
      if (keywords.some(k => w.includes(k))) {
        if (!detectedThemes.includes(theme)) detectedThemes.push(theme);
      }
    });
  });

  energy = Math.max(0, Math.min(1, energy));
  valence = Math.max(-1, Math.min(1, valence));

  let emotion = Emotion.NEUTRAL;
  let intent: AnalysisResult['intent'] = 'OBSERVING';
  let confidence = 0.5;

  // Decision Tree with lower thresholds for clear keywords
  // Force picking a theme if detectedThemes is not empty
  if (detectedThemes.includes('FEAR')) {
    emotion = Emotion.FEAR;
    intent = 'CONFUSED'; // Or a new Intent 'FEARFUL' if supported, defaulting to HIGH AROUSAL
    confidence = 0.9;
  } else if (detectedThemes.includes('CHAOS') || (energy > 0.7 && valence < -0.15) || (negCount > 0 && energy > 0.6)) {
    emotion = Emotion.ANGRY;
    intent = 'CONFUSED';
    confidence = 0.8;
  } else if (detectedThemes.includes('HEAVINESS') || detectedThemes.includes('VOID') || (valence < -0.1 && energy < 0.8) || (negCount > 0 && valence < 0)) {
    emotion = Emotion.SAD;
    intent = 'BURDENED';
    confidence = 0.85;
  } else if (detectedThemes.includes('LIGHT') || detectedThemes.includes('FLOW') || (valence > 0.1 && energy > 0.2) || (posCount > 0 && valence > 0)) {
    emotion = Emotion.HAPPY;
    intent = 'CELEBRATING';
    confidence = 0.8;
  } else if (detectedThemes.includes('STILLNESS') || (energy < 0.4 && valence >= 0)) {
    emotion = Emotion.CALM;
    intent = 'SEEKING_PEACE';
    confidence = 0.9;
  } else if (detectedThemes.length > 0) {
    // Prohibit Neutral if any theme is detected but didn't hit specific branches
    // Default to the first theme detected if no other branch hit
    const primaryTheme = detectedThemes[0];
    if (primaryTheme === 'FEAR') {
      emotion = Emotion.FEAR;
      intent = 'CONFUSED';
    } else if (primaryTheme === 'HEAVINESS' || primaryTheme === 'VOID') {
      emotion = Emotion.SAD;
      intent = 'BURDENED';
    } else if (primaryTheme === 'CHAOS') {
      emotion = Emotion.ANGRY;
      intent = 'CONFUSED';
    } else if (primaryTheme === 'LIGHT' || primaryTheme === 'FLOW') {
      emotion = Emotion.HAPPY;
      intent = 'CELEBRATING';
    } else {
      emotion = Emotion.CALM;
      intent = 'SEEKING_PEACE';
    }
    confidence = 0.6; // Lowered confidence but forced non-neutral
  } else if (questionCount > 0) {
    emotion = Emotion.NEUTRAL;
    intent = 'CONFUSED';
    confidence = 0.7;
  }

  if (emotion === Emotion.CALM && valence < -0.1) {
    emotion = Emotion.SAD;
    intent = 'BURDENED';
  }

  const result = {
    emotion,
    intent,
    metrics: { energy, valence, confidence },
    themes: detectedThemes
  };

  console.log("VOICE_DECISION:", result);
  return result;
};

/**
 * Gemini-based Emotion Analysis
 */
/**
 * Gemini-based Emotion Analysis
 */
let lastDetectedEmotion: Emotion = Emotion.NEUTRAL;

/**
 * Gemini-based Emotion Analysis
 * System Prompt: "Spirit Guide" Emotional Core
 * Model: gemini-2.0-flash
 * Strategy: Subtext Analysis > Keyword Detection
 */
export const analyzeEmotionFromText = async (text: string): Promise<Emotion> => {
  const maskedKey = API_KEY ? `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}` : "MISSING";

  if (!API_KEY || API_KEY.includes("API_KEY") || API_KEY.includes("key_here") || API_KEY.length < 20) {
    console.warn("[GeminiService] API Key invalid or missing. Using local heuristic engine.");
    // Fallback to local
    const localResult = analyzeSentimentContext(text).emotion;
    lastDetectedEmotion = localResult;
    return localResult;
  }

  // Fallback function with "Emotional Momentum"
  const useFallback = (reason: string) => {
    console.warn(`[GeminiService] ${reason}. Maintaining Emotional Momentum.`);
    console.log(`[GeminiService] Returning previous state: ${lastDetectedEmotion}`);
    return lastDetectedEmotion;
  };

  try {
    const fetchWithTimeout = (promise: Promise<any>, ms: number) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('TIMEOUT')), ms);
        promise.then((res) => {
          clearTimeout(timer);
          resolve(res);
        }).catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
      });
    };

    const callGemini = async () => {
      // UPGRADE: Using gemini-2.0-flash for sub-second latency
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const prompt = `
        You are the emotional core of a Spirit Guide. Your task is to detect the latent emotion and spiritual intent behind user speech.

        Categorize into: NEUTRAL, HAPPY, SAD, ANGRY, FEAR, CALM, DISGUST.

        Critical Rule: Recognize that failure (exams, jobs), loss (death, breakups), and stagnation (boredom, stuck) are SAD. Recognize that friction, injustice, and noise are ANGRY.

        Input: "${text}"

        JSON Response Schema: Force the model to return a strict JSON object: { "emotion": "SAD", "intensity": 0.8, "intent": "BURDENED" }.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    };

    // Low Latency Requirement: 2.5s timeout (slightly tighter than before)
    const responseText = await fetchWithTimeout(callGemini(), 2500) as string;

    // Parse JSON
    const data = JSON.parse(responseText);

    console.log("[GeminiService] Spirit Guide Analysis:", data);

    let emotionStr = data.emotion?.toUpperCase();

    // Map Adapter
    if (emotionStr === 'DISGUST') emotionStr = 'ANGRY'; // Map extra emotion to Enum

    if (Object.values(Emotion).includes(emotionStr as Emotion)) {
      lastDetectedEmotion = emotionStr as Emotion; // Update momentum
      return lastDetectedEmotion;
    }

    return useFallback("Unrecognized emotion returned");

  } catch (error: any) {
    if (error.message === 'TIMEOUT') {
      return useFallback("API Timeout (2.5s)");
    }
    console.error("[GeminiService] API Error:", error);
    return useFallback("API Error");
  }
};

/**
 * Image Analysis using Local Bridge (Camera scan result)
 */
export const analyzeEmotionFromImage = async (_base64Image: string): Promise<Emotion> => {
  const state = localEmotionBridge.getLatestState();
  return state.emotion;
}

/**
 * Audio Analysis using Local keywords (Wait for STT result usually)
 */
export const analyzeEmotionFromAudio = async (_base64Audio: string): Promise<Emotion> => {
  return Emotion.NEUTRAL;
};

/**
 * Placeholder for Image Generation (Returns high-quality local assets)
 */
export const generateImage = async (_prompt: string, _size: '1K' | '2K' | '4K' = '1K'): Promise<string | null> => {
  return "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000";
};

/**
 * Placeholder for Image Editing
 */
export const editImage = async (base64Image: string, _prompt: string): Promise<string | null> => {
  return base64Image;
};

/**
 * Placeholder for Video Generation
 */
export const generateVideo = async (_base64Image: string, _aspectRatio: '16:9' | '9:16'): Promise<string | null> => {
  return null;
};

// Utils kept for compatibility
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};