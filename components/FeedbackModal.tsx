import React, { useState } from 'react';
import { X, MessageSquare, Star, Send } from 'lucide-react';

interface FeedbackModalProps {
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(onClose, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
            <X size={20} />
        </button>

        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Send Feedback</h2>
                    <p className="text-xs text-white/40">Help us improve Viveka Vara</p>
                </div>
            </div>

            {submitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-4">
                        <Send size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Feedback Sent!</h3>
                    <p className="text-white/40 text-sm mt-2">Thank you for your contribution.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Experience Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star 
                                        size={24} 
                                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-white/20 hover:text-white/40"} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text Area */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Your Message</label>
                        <textarea 
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Tell us what you like or what could be better..."
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none placeholder-white/20"
                            required
                        />
                    </div>

                    {/* Footer */}
                    <div className="pt-2">
                        <button 
                            type="submit"
                            disabled={isSubmitting || !rating}
                            className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                            {!isSubmitting && <ArrowRightIcon />}
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);
