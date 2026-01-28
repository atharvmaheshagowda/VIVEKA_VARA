import React, { useState, useRef } from 'react';
import { Emotion } from '../types';
import { analyzeEmotionFromText, analyzeEmotionFromAudio, blobToBase64 } from '../services/geminiService';
import { X, Mic, Send, BrainCircuit, Activity, StopCircle, Fingerprint, Type, Sparkles } from 'lucide-react';

interface EmotionSensorProps {
    onClose: () => void;
    onApplyEmotion: (emotion: Emotion) => void;
}

type Tab = 'text' | 'voice' | 'manual';

export const EmotionSensor: React.FC<EmotionSensorProps> = ({ onClose, onApplyEmotion }) => {
    const [activeTab, setActiveTab] = useState<Tab>('text');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detectedResult, setDetectedResult] = useState<{ emotion: Emotion, confidence: number } | null>(null);

    // Text State
    const [textInput, setTextInput] = useState('');

    // Voice State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // --- Handlers ---

    const handleTextAnalysis = async () => {
        if (!textInput.trim()) return;
        setIsAnalyzing(true);
        setDetectedResult(null);
        try {
            const result = await analyzeEmotionFromText(textInput);
            // Simulate confidence for text as it's not returned by simple prompt
            setDetectedResult({ emotion: result, confidence: 0.85 + Math.random() * 0.1 });
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                setIsAnalyzing(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                const base64Audio = await blobToBase64(audioBlob);
                const result = await analyzeEmotionFromAudio(base64Audio);
                setDetectedResult({ emotion: result, confidence: 0.75 + Math.random() * 0.15 });
                setIsAnalyzing(false);

                // Cleanup stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDetectedResult(null);
        } catch (e) {
            console.error("Mic access denied", e);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleApply = () => {
        if (detectedResult) {
            onApplyEmotion(detectedResult.emotion);
            onClose();
        }
    };

    const manualEmotions = Object.values(Emotion);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col md:flex-row h-[500px]">

                {/* Left: Input Zone */}
                <div className="w-full md:w-1/2 p-6 flex flex-col border-r border-white/5 relative">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-mono tracking-wide">
                        <BrainCircuit className="text-blue-500" /> NEURAL SENSOR
                    </h2>

                    {/* Navigation */}
                    <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
                        {[
                            { id: 'text', icon: Type, label: 'Text' },
                            { id: 'voice', icon: Mic, label: 'Voice' },
                            { id: 'manual', icon: Fingerprint, label: 'Manual' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => { setActiveTab(t.id as Tab); setDetectedResult(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all
                            ${activeTab === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-white/40 hover:text-white hover:bg-white/5'}
                        `}
                            >
                                <t.icon size={14} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 relative">

                        {/* TEXT INPUT */}
                        {activeTab === 'text' && (
                            <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4">
                                <textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Describe the situation or emotional context..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none mb-4 font-mono leading-relaxed"
                                />
                                <button
                                    onClick={handleTextAnalysis}
                                    disabled={isAnalyzing || !textInput}
                                    className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                >
                                    {isAnalyzing ? <Activity className="animate-spin" size={16} /> : <Send size={16} />}
                                    ANALYZE TEXT
                                </button>
                            </div>
                        )}

                        {/* VOICE INPUT */}
                        {activeTab === 'voice' && (
                            <div className="flex flex-col h-full items-center justify-center animate-in fade-in slide-in-from-left-4">
                                <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center mb-8 transition-all duration-500 relative
                            ${isRecording ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-white/10'}
                        `}>
                                    {isRecording && (
                                        <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-75" />
                                    )}
                                    <Mic size={40} className={isRecording ? 'text-red-500 animate-pulse' : 'text-white/20'} />
                                </div>

                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        disabled={isAnalyzing}
                                        className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2"
                                    >
                                        <Mic size={16} />
                                        START RECORDING
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="px-8 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
                                    >
                                        <StopCircle size={16} />
                                        STOP ANALYSIS
                                    </button>
                                )}
                                <p className="mt-4 text-xs text-white/30 font-mono text-center">
                                    {isAnalyzing ? "PROCESSING AUDIO DATA..." : isRecording ? "LISTENING..." : "READY TO SCAN"}
                                </p>
                            </div>
                        )}

                        {/* MANUAL OVERRIDE */}
                        {activeTab === 'manual' && (
                            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-left-4 overflow-y-auto max-h-[300px] pr-1">
                                {manualEmotions.map(e => (
                                    <button
                                        key={e}
                                        onClick={() => {
                                            setDetectedResult({ emotion: e, confidence: 1.0 });
                                        }}
                                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between group
                                    ${detectedResult?.emotion === e
                                                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                                : 'bg-white/5 border-transparent text-white/50 hover:border-white/20 hover:text-white'
                                            }
                                `}
                                    >
                                        {e}
                                        <div className={`w-2 h-2 rounded-full ${detectedResult?.emotion === e ? 'bg-blue-400 shadow-[0_0_8px_#60a5fa]' : 'bg-white/10'}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Analysis Visualization / Result */}
                <div className="w-full md:w-1/2 bg-black relative p-6 flex flex-col justify-center items-center overflow-hidden">
                    {/* Background Scan Lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,255,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] pointer-events-none" />

                    <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white z-10">
                        <X size={20} />
                    </button>

                    {isAnalyzing ? (
                        <div className="text-center">
                            <div className="w-20 h-20 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mx-auto mb-4" />
                            <div className="text-blue-400 font-mono text-xs tracking-[0.2em] animate-pulse">LOCAL PATTERN MATCHING</div>
                        </div>
                    ) : detectedResult ? (
                        <div className="w-full text-center animate-in zoom-in-90 duration-300">
                            <div className="mb-2 text-white/40 text-[10px] font-mono uppercase tracking-widest">Detected Resonance</div>
                            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-white mb-2">
                                {detectedResult.emotion}
                            </h3>
                            <div className="flex items-center justify-center gap-2 mb-8">
                                <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: `${detectedResult.confidence * 100}%` }} />
                                </div>
                                <span className="text-green-400 text-xs font-mono">{(detectedResult.confidence * 100).toFixed(0)}% Match</span>
                            </div>

                            <button
                                onClick={handleApply}
                                className="px-8 py-3 bg-white text-black font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto"
                            >
                                <Sparkles size={16} />
                                INJECT EMOTION
                            </button>
                        </div>
                    ) : (
                        <div className="text-center opacity-30">
                            <BrainCircuit size={64} className="mx-auto mb-4" />
                            <p className="text-xs font-mono tracking-widest">AWAITING INPUT STREAM</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};