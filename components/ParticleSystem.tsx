import React, { useRef, useEffect } from 'react';
import { ParticleType } from '../types';

interface ParticleSystemProps {
  type: ParticleType;
  width: number;
  height: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
  color: string;
  phase: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ type, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const requestRef = useRef<number | null>(null);

  const initParticle = (p: Particle, type: ParticleType, w: number, h: number, respawn = false) => {
    // Shared defaults
    p.life = Math.random() * 100;
    p.maxLife = 100 + Math.random() * 100;
    p.phase = Math.random() * Math.PI * 2;
    p.alpha = Math.random();

    // Default position (overwritten by specific types if needed)
    if (!respawn) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
    }

    switch (type) {
      case 'rain':
        if (respawn) {
            p.x = Math.random() * w;
            p.y = -30;
        }
        p.vx = -0.5 - Math.random(); 
        p.vy = 20 + Math.random() * 10; // Faster rain
        p.size = 1 + Math.random();
        p.color = 'rgba(174, 194, 224, 0.5)';
        break;

      case 'fog':
        if (respawn) {
            // Fog wraps, but if force respawned, place randomly
            p.x = Math.random() * w;
            p.y = Math.random() * h;
        }
        p.vx = 0.2 + Math.random() * 0.3; // Slow right drift
        p.vy = (Math.random() - 0.5) * 0.1;
        p.size = 100 + Math.random() * 150; // Much larger
        p.color = 'rgba(200, 220, 230, 0.08)'; 
        break;

      case 'birds':
        if (respawn) {
            p.x = -50;
            p.y = Math.random() * (h * 0.4);
        } else if (!respawn) {
             p.y = Math.random() * (h * 0.4);
        }
        p.vx = 3 + Math.random() * 2; // Faster birds
        p.vy = (Math.random() - 0.5) * 1;
        p.size = 3 + Math.random() * 2;
        p.color = '#1a1a1a';
        break;

      case 'ash':
        if (respawn) {
            p.x = Math.random() * w;
            p.y = h + 10;
        }
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = -(1 + Math.random() * 2); 
        p.size = 1.5 + Math.random() * 2.5;
        // Mix of ember and ash colors
        const isEmber = Math.random() > 0.85;
        p.color = isEmber ? `rgba(255, 100, 50, ${0.7 + Math.random()*0.3})` : `rgba(60, 60, 60, ${0.5 + Math.random()*0.3})`;
        break;

      case 'fireflies':
        p.vx = (Math.random() - 0.5) * 0.6;
        p.vy = (Math.random() - 0.5) * 0.6;
        p.size = 2 + Math.random() * 2;
        p.color = 'rgba(255, 240, 100, 1)';
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine count based on type
    let count = 0;
    switch(type) {
        case 'rain': count = 800; break;
        case 'ash': count = 150; break;
        case 'fog': count = 25; break;
        case 'birds': count = 20; break;
        case 'fireflies': count = 60; break;
        default: count = 0;
    }

    // Initialize array
    particles.current = Array.from({ length: count }).map(() => ({
      x: 0, y: 0, vx: 0, vy: 0, size: 0, life: 0, maxLife: 0, alpha: 0, color: '', phase: 0
    }));

    // Initial Spawn setup
    particles.current.forEach(p => initParticle(p, type, width, height, false));

    const update = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      if (type === 'none') {
         requestRef.current = requestAnimationFrame(update);
         return;
      }

      // Optimize rendering state
      if (type === 'rain') {
         ctx.lineWidth = 1.5;
         ctx.lineCap = 'round';
      }

      particles.current.forEach(p => {
        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        
        // Dynamic Movement Modifiers
        if (type === 'ash') {
            p.x += Math.sin(time * 0.002 + p.phase) * 0.5; // Wobble
        }
        if (type === 'birds') {
            p.y += Math.sin(time * 0.004 + p.phase) * 0.3; // Gentle bobbing
        }

        // Boundary / Respawn Logic
        let respawn = false;
        
        if (type === 'rain') {
            if (p.y > height) respawn = true;
        } else if (type === 'ash') {
            if (p.y < -20) respawn = true;
        } else if (type === 'birds') {
            if (p.x > width + 50) respawn = true;
        } else if (type === 'fog' || type === 'fireflies') {
            // Wrap around logic
            if (p.x < -200) p.x = width + 200;
            if (p.x > width + 200) p.x = -200;
            if (p.y < -200) p.y = height + 200;
            if (p.y > height + 200) p.y = -200;
        }

        if (respawn) {
            initParticle(p, type, width, height, true);
        }

        // Rendering Logic
        if (type === 'rain') {
            ctx.strokeStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            // Draw a streak based on velocity
            ctx.lineTo(p.x + p.vx * 1.5, p.y + p.vy * 1.5);
            ctx.stroke();
        } else if (type === 'birds') {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            // Wing flap animation
            const wingOffset = Math.sin(time * 0.015 + p.phase) * 4;
            // Simple V/Bird shape
            ctx.moveTo(p.x + 6, p.y); // Beak
            ctx.lineTo(p.x - 4, p.y - wingOffset); // Top wing
            ctx.lineTo(p.x - 2, p.y + 2); // Body center
            ctx.lineTo(p.x - 4, p.y + wingOffset); // Bottom wing
            ctx.fill();
        } else if (type === 'ash') {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        } else if (type === 'fireflies') {
            // Pulsing opacity
            const glow = (Math.sin(time * 0.003 + p.phase) + 1) / 2; // 0 to 1
            // Inject alpha into color string (assuming rgba format ending in '1)')
            // Or just use globalAlpha, but that affects performance less if we use fillStyle string manipulation or just set generic color
            ctx.fillStyle = p.color.replace('1)', `${0.3 + glow * 0.7})`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'fog') {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
      });

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [type, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0 pointer-events-none z-20" />;
};

export default ParticleSystem;