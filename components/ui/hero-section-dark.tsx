import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronRight, X, Volume2 } from "lucide-react"
import { SparklesCore } from "./sparkles"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: string
  ctaHref?: string
  onCtaClick?: () => void
  bottomImage?: {
    light: string
    dark: string
  }
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lightLineColor?: string
    darkLineColor?: string
  }
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "gray",
  darkLineColor = "gray",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "Build products for everyone",
      subtitle = {
        regular: "Designing your projects faster with ",
        gradient: "the largest figma UI kit.",
      },
      description = "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.",
      ctaText = "Browse courses",
      ctaHref = "#",
      onCtaClick,
      bottomImage,
      gridOptions,
      children,
      ...props
    },
    ref,
  ) => {
    const [showShloka, setShowShloka] = React.useState(false);

    const playShloka = React.useCallback(() => {
      const synth = window.speechSynthesis;
      synth.cancel();

      const getVoice = (lang: string) => {
        const voices = synth.getVoices();
        // Prioritize specific voices, then general language match, then any voice for the language
        const preferredVoice = voices.find(v =>
          (lang === 'hi' && (v.name.includes('Hindi') || v.lang.includes('hi-IN'))) ||
          (lang === 'en' && (v.name.includes('Google US English') || v.lang.includes('en-US') || v.lang.includes('en-GB')))
        );
        if (preferredVoice) return preferredVoice;

        // Fallback to any voice matching the language
        const genericVoice = voices.find(v => v.lang.startsWith(lang));
        if (genericVoice) return genericVoice;

        // Final fallback: just return the first available voice if nothing else matches
        return voices.length > 0 ? voices[0] : null;
      };

      const speakPart = (text: string, lang: 'en' | 'hi', rate: number = 0.9) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getVoice(lang);
        if (voice) utterance.voice = voice;
        utterance.rate = rate;
        utterance.pitch = lang === 'hi' ? 0.85 : 1.0;
        synth.speak(utterance);
      };

      // Part 1: App Summary (English)
      speakPart(
        "Welcome to Viveka Vara. This is a generative reality that responds to your emotions. By analyzing your voice and expressions, the environment shifts to reflect your inner state, guiding you towards clarity.",
        'en',
        1.0
      );

      // Part 2: Shloka (Sanskrit - Hindi Voice)
      const shloka = "विश्वं दर्पणदृश्यमाननगरीतुल्यं निजान्तर्गतं पश्यन्नात्मनि मायया बहिरिवोद्भूतं यथा निद्रया । यः साक्षात् कुरुते प्रबोधसमये स्वात्मानमेवाद्वयं तस्मै श्रीगुरुमूर्तये नम इदं श्रीदक्षिणामूर्तये";
      speakPart(shloka, 'hi', 0.85);

      // Part 3: Meaning (English)
      speakPart(
        "Just as a city is reflected in a mirror, the universe exists within oneself. To that Guru, who is the embodiment of the Self, I offer my salutations.",
        'en',
        0.95
      );
    }, []);

    React.useEffect(() => {
      if (showShloka) {
        // Ensure voices are loaded before trying to speak
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            setTimeout(playShloka, 500);
          };
        } else {
          setTimeout(playShloka, 500);
        }
      } else {
        window.speechSynthesis.cancel();
      }
    }, [showShloka, playShloka]);

    return (
      <div className={cn("relative overflow-hidden h-full bg-black", className)} ref={ref} {...props}>
        <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 dark:bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        {/* Sparkles Background */}
        <div className="absolute inset-0 z-[1] w-full h-full">
          <SparklesCore
            id="tsparticleshero"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>

        <section className="relative max-w-full mx-auto z-10 h-full overflow-y-auto">
          <RetroGrid {...gridOptions} />
          <div className="max-w-screen-xl z-20 mx-auto px-4 py-28 gap-12 md:px-8 flex flex-col items-center relative">
            <div className="space-y-5 max-w-3xl leading-0 lg:leading-5 mx-auto text-center mb-12">
              <button
                onClick={() => setShowShloka(true)}
                className="text-sm text-gray-600 dark:text-gray-400 group font-sans mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/5 dark:border-white/5 rounded-3xl w-fit flex items-center hover:bg-white/5 transition-colors cursor-pointer"
              >
                {title}
                <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
              </button>

              <h2 className="text-4xl tracking-tighter font-sans bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
                {subtitle.regular}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">
                  {subtitle.gradient}
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
                {description}
              </p>
              <div className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0">
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-gray-950 text-xs font-medium backdrop-blur-3xl">
                    <a
                      href={ctaHref}
                      onClick={(e) => {
                        if (onCtaClick) {
                          e.preventDefault();
                          onCtaClick();
                        }
                      }}
                      className="inline-flex rounded-full text-center group items-center w-full justify-center bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent dark:hover:from-zinc-300/10 dark:hover:via-purple-400/30 transition-all sm:w-auto py-4 px-10"
                    >
                      {ctaText}
                    </a>
                  </div>
                </span>
              </div>
            </div>

            {/* Custom Children / Options */}
            {children && (
              <div className="w-full max-w-5xl z-10 animate-fade-in-up">
                {children}
              </div>
            )}

            {bottomImage && (
              <div className="mt-32 mx-10 relative z-10">
                <img
                  src={bottomImage.light}
                  className="w-full shadow-lg rounded-lg border border-gray-200 dark:hidden"
                  alt="Dashboard preview"
                />
                <img
                  src={bottomImage.dark}
                  className="hidden w-full shadow-lg rounded-lg border border-gray-800 dark:block"
                  alt="Dashboard preview"
                />
              </div>
            )}
          </div>
        </section>

        {/* Shloka Modal */}
        {showShloka && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
              <button
                onClick={() => setShowShloka(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="p-8 md:p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mb-6 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                  <Volume2 size={32} className="animate-pulse" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Sri Dakshinamurthy Stotram</h2>
                <h3 className="text-sm font-mono text-orange-400 uppercase tracking-widest mb-8">Verse 1</h3>

                <div className="prose prose-invert">
                  <p className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed mb-8">
                    "विश्वं दर्पणदृश्यमाननगरीतुल्यं निजान्तर्गतं <br />
                    पश्यन्नात्मनि मायया बहिरिवोद्भूतं यथा निद्रया । <br />
                    यः साक्षात् कुरुते प्रबोधसमये स्वात्मानमेवाद्वयं <br />
                    तस्मै श्रीगुरुमूर्तये नम इदं श्रीदक्षिणामूर्तये"
                  </p>

                  <p className="text-sm text-white/50 italic max-w-lg mx-auto border-t border-white/10 pt-6 mt-6">
                    "The entire universe is like a city seen within a mirror, essentially existing within oneself... To that Guru, who is the embodiment of the Self, I offer this salutation."
                  </p>
                </div>

                <button
                  onClick={playShloka}
                  className="mt-8 px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 text-xs font-mono text-white/60 transition-colors flex items-center gap-2"
                >
                  <Volume2 size={12} /> REPLAY CHANT
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }
