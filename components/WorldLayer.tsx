import React, { useRef, useEffect } from 'react';

interface WorldLayerProps {
  speedMultiplier: number; // Global emotion speed modifier
  baseSpeed: number; // Layer intrinsic speed
  zIndex: number;
  bgImage?: string; // Optional image URL
  color?: string; // Optional CSS color
  opacity?: number;
  offsetY?: string; // vertical alignment
  scale?: number;
  children?: React.ReactNode;
}

const WorldLayer: React.FC<WorldLayerProps> = ({ 
  speedMultiplier, 
  baseSpeed, 
  zIndex, 
  bgImage, 
  color, 
  opacity = 1,
  offsetY = '0%',
  scale = 1,
  children
}) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      // If speed is 0 (Surprised), don't update position
      if (speedMultiplier !== 0) {
        positionRef.current -= baseSpeed * speedMultiplier;
        
        // Reset for infinite scroll effect (assuming pattern repeats)
        // Asset width is 1200px. We use 2400px (2 tiles) as the wrap point 
        // to ensure visual continuity on wider screens.
        const wrapWidth = 2400; 
        if (positionRef.current <= -wrapWidth) {
          positionRef.current += wrapWidth;
        }
      }

      if (layerRef.current) {
        // Simple 2D transform
        layerRef.current.style.transform = `translateX(${positionRef.current}px) translateY(${offsetY}) scale(${scale})`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [baseSpeed, speedMultiplier, offsetY, scale]);

  return (
    <div 
      className="absolute top-0 left-0 h-full w-[6000px] pointer-events-none transition-opacity duration-1000"
      style={{ 
        zIndex, 
        opacity,
      }}
    >
      <div 
        ref={layerRef}
        className="w-full h-full flex flex-row items-end"
      >
        {/* We repeat the content to allow scrolling */}
        {children}
        {children}
        {children}
        {children}
      </div>
    </div>
  );
};

export default WorldLayer;
