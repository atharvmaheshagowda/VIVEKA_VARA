import React, { useEffect, useState } from 'react';

interface SkyBackgroundProps {
  gradient: string;
}

export const SkyBackground: React.FC<SkyBackgroundProps> = ({ gradient }) => {
  const [gradient1, setGradient1] = useState(gradient);
  const [gradient2, setGradient2] = useState(gradient);
  const [activeLayer, setActiveLayer] = useState<1 | 2>(1);

  useEffect(() => {
    // When prop changes, update the inactive layer and swap
    if (activeLayer === 1) {
      if (gradient !== gradient1) {
        setGradient2(gradient);
        setActiveLayer(2);
      }
    } else {
      if (gradient !== gradient2) {
        setGradient1(gradient);
        setActiveLayer(1);
      }
    }
  }, [gradient, activeLayer, gradient1, gradient2]);

  return (
    <>
      <div 
        className="absolute inset-0 w-full h-full animate-sky-move transition-opacity duration-[2000ms] ease-in-out will-change-[opacity,background-position]"
        style={{ 
            background: gradient1, 
            backgroundSize: '100% 200%',
            opacity: activeLayer === 1 ? 1 : 0,
            zIndex: 0
        }} 
      />
      <div 
        className="absolute inset-0 w-full h-full animate-sky-move transition-opacity duration-[2000ms] ease-in-out will-change-[opacity,background-position]"
        style={{ 
            background: gradient2, 
            backgroundSize: '100% 200%',
            opacity: activeLayer === 2 ? 1 : 0,
            zIndex: 0
        }} 
      />
    </>
  );
};
