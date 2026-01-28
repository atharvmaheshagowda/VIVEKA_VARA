import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Video, X, Download, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generateImage, editImage, generateVideo, blobToBase64 } from '../services/geminiService';

interface CreativeStudioProps {
  onClose: () => void;
}

type Tab = 'create' | 'remix' | 'animate';

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null); // Clear previous result
    }
  };

  const handleAction = async () => {
    setIsLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      if (activeTab === 'create') {
        if (!prompt) throw new Error("Please enter a prompt");
        const base64Data = await generateImage(prompt, imageSize);
        if (base64Data) setResultUrl(base64Data);
        else throw new Error("Failed to generate image");

      } else if (activeTab === 'remix') {
        if (!selectedImage || !prompt) throw new Error("Image and prompt required");
        const base64Input = await blobToBase64(selectedImage);
        const resultBase64 = await editImage(base64Input, prompt);
        if (resultBase64) setResultUrl(resultBase64);
        else throw new Error("Failed to edit image");

      } else if (activeTab === 'animate') {
        if (!selectedImage) throw new Error("Image required");
        const base64Input = await blobToBase64(selectedImage);
        const videoUrl = await generateVideo(base64Input, aspectRatio);
        if (videoUrl) setResultUrl(videoUrl);
        else throw new Error("Failed to generate video");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[600px]">
        
        {/* Left: Controls */}
        <div className="w-full md:w-1/3 bg-[#1a1a1a] p-6 flex flex-col border-r border-white/5 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="text-purple-400" /> Studio
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-black/40 p-1 rounded-lg">
                {[
                    { id: 'create', icon: ImageIcon, label: 'Gen' },
                    { id: 'remix', icon: Wand2, label: 'Edit' },
                    { id: 'animate', icon: Video, label: 'Veo' }
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => { setActiveTab(t.id as Tab); setResultUrl(null); setError(null); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all
                            ${activeTab === t.id ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}
                        `}
                    >
                        <t.icon size={14} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Inputs */}
            <div className="flex-1 overflow-y-auto space-y-6">
                
                {/* Image Uploader (Remix/Animate) */}
                {(activeTab === 'remix' || activeTab === 'animate') && (
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Source Image</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="h-32 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-white/5 transition-colors overflow-hidden relative"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4">
                                    <Camera className="mx-auto text-gray-500 mb-2" />
                                    <span className="text-xs text-gray-500">Click to upload</span>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                        </div>
                    </div>
                )}

                {/* Text Prompt (Create/Remix) */}
                {(activeTab === 'create' || activeTab === 'remix') && (
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Prompt</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={activeTab === 'create' ? "A futuristic city in the clouds..." : "Add a neon glow, make it retro..."}
                            className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500 min-h-[100px] resize-none"
                        />
                    </div>
                )}

                {/* Config: Size (Create) */}
                {activeTab === 'create' && (
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Quality</label>
                        <div className="flex gap-2">
                            {['1K', '2K', '4K'].map((s) => (
                                <button 
                                    key={s} 
                                    onClick={() => setImageSize(s as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs border ${imageSize === s ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'border-gray-700 text-gray-400'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Config: Aspect Ratio (Animate) */}
                {activeTab === 'animate' && (
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Aspect Ratio</label>
                        <div className="flex gap-2">
                            {[
                                { val: '16:9', label: 'Landscape' }, 
                                { val: '9:16', label: 'Portrait' }
                            ].map((r) => (
                                <button 
                                    key={r.val} 
                                    onClick={() => setAspectRatio(r.val as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs border ${aspectRatio === r.val ? 'bg-green-500/20 border-green-500 text-green-300' : 'border-gray-700 text-gray-400'}`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                            Requires paid API key selection (Veo)
                        </p>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                disabled={isLoading}
                onClick={handleAction}
                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-4 transition-all
                    ${isLoading ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/20'}
                `}
            >
                {isLoading && <Loader2 className="animate-spin" size={16} />}
                {isLoading ? 'Processing...' : activeTab === 'create' ? 'Generate' : activeTab === 'remix' ? 'Edit Image' : 'Animate'}
            </button>
        </div>

        {/* Right: Preview */}
        <div className="w-full md:w-2/3 bg-black flex items-center justify-center p-8 relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            
            {resultUrl ? (
                <div className="relative group max-w-full max-h-full">
                    {activeTab === 'animate' ? (
                        <video src={resultUrl} autoPlay loop controls className="max-w-full max-h-[500px] rounded-lg shadow-2xl border border-white/10" />
                    ) : (
                        <img src={resultUrl} alt="Result" className="max-w-full max-h-[500px] rounded-lg shadow-2xl border border-white/10" />
                    )}
                    
                    <a 
                        href={resultUrl} 
                        download={`gemini-creation-${Date.now()}.${activeTab === 'animate' ? 'mp4' : 'png'}`}
                        className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    >
                        <Download size={20} />
                    </a>
                </div>
            ) : (
                <div className="text-center text-gray-600">
                    <Sparkles className="mx-auto mb-4 opacity-50" size={48} />
                    <p className="text-sm">Your masterpiece will appear here</p>
                </div>
            )}

            {error && (
                <div className="absolute bottom-6 left-6 right-6 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-xs text-center">
                    {error}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
