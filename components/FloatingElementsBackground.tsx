'use client';

import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface ScribbleStroke {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  points: Point[];
  segmentLengths: number[];
  totalLength: number;
  life: number;
  maxLife: number;
  drawDuration: number;
  fadeDuration: number;
  maxOpacity: number;
  lineWidth: number;
}

export default function FloatingElementsBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate chaotic, organic hand-drawn pen scribbles (doodles, scratches, loose zigzags, messy loops)
    const generateScribblePoints = (): Point[] => {
      const scribbleType = Math.floor(Math.random() * 5);
      const pts: Point[] = [];

      if (scribbleType === 0) {
        // Quick zigzag / scratch (3-5 nervous sharp turns)
        const turns = Math.floor(Math.random() * 3 + 3);
        let currX = (Math.random() - 0.5) * 10;
        let currY = (Math.random() - 0.5) * 10;
        pts.push({ x: currX, y: currY });

        const dirX = Math.random() > 0.5 ? 1 : -1;
        const dirY = (Math.random() - 0.5) * 1.5;

        for (let i = 0; i < turns; i++) {
          const stepX = (Math.random() * 14 + 10) * (i % 2 === 0 ? dirX : -dirX * 0.7);
          const stepY = (Math.random() * 12 + 6) * dirY + (Math.random() - 0.5) * 8;
          currX += stepX;
          currY += stepY;
          pts.push({ x: currX, y: currY });
        }
      } else if (scribbleType === 1) {
        // Messy curve / loose loop / swirl
        const numPts = Math.floor(Math.random() * 3 + 4);
        const radius = Math.random() * 16 + 12;
        const startAngle = Math.random() * Math.PI * 2;
        const arc = (Math.random() * 1.8 + 1.2) * (Math.random() > 0.5 ? 1 : -1);

        for (let i = 0; i < numPts; i++) {
          const a = startAngle + (arc * i) / (numPts - 1);
          const r = radius * (1 + (Math.random() - 0.5) * 0.45);
          pts.push({
            x: Math.cos(a) * r + (Math.random() - 0.5) * 6,
            y: Math.sin(a) * r + (Math.random() - 0.5) * 6,
          });
        }
      } else if (scribbleType === 2) {
        // Hand tremor wavy squiggle (4-6 wobbly points)
        const length = Math.random() * 35 + 20;
        const numPts = 5;
        for (let i = 0; i < numPts; i++) {
          const progress = i / (numPts - 1);
          const x = (progress - 0.5) * length;
          const wobble = (Math.random() - 0.5) * 16;
          pts.push({ x, y: wobble });
        }
      } else if (scribbleType === 3) {
        // Dynamic whip scratch with abrupt hook
        pts.push({ x: -20 + (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 8 });
        pts.push({ x: -5 + (Math.random() - 0.5) * 6, y: 12 + (Math.random() - 0.5) * 6 });
        pts.push({ x: 15 + (Math.random() - 0.5) * 8, y: -8 + (Math.random() - 0.5) * 8 });
        pts.push({ x: 28 + (Math.random() - 0.5) * 6, y: -2 + (Math.random() - 0.5) * 6 });
      } else {
        // Quick 3-stroke pen tick / check mark doodle
        pts.push({ x: -14 + (Math.random() - 0.5) * 4, y: -6 + (Math.random() - 0.5) * 4 });
        pts.push({ x: 0 + (Math.random() - 0.5) * 4, y: 8 + (Math.random() - 0.5) * 4 });
        pts.push({ x: 22 + (Math.random() - 0.5) * 6, y: -16 + (Math.random() - 0.5) * 6 });
      }

      return pts;
    };

    const createScribble = (initialStagger = false): ScribbleStroke => {
      const points = generateScribblePoints();

      // Compute individual segment lengths and total path length
      const segmentLengths: number[] = [];
      let totalLength = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i + 1].x - points[i].x;
        const dy = points[i + 1].y - points[i].y;
        const len = Math.hypot(dx, dy);
        segmentLengths.push(len);
        totalLength += len;
      }

      const maxOpacity = Math.random() * 0.16 + 0.12; // 0.12 to 0.28 delicate pen ink opacity
      const speed = Math.random() * 0.45 + 0.2; // slow organic floating
      const moveAngle = Math.random() * Math.PI * 2;
      const maxLife = Math.floor(Math.random() * 180 + 220); // 4-7s lifecycle
      const drawDuration = Math.floor(Math.random() * 20 + 20); // 0.35s - 0.65s to quickly sketch
      const fadeDuration = Math.floor(Math.random() * 30 + 35); // 0.6s to fade out

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(moveAngle) * speed,
        vy: Math.sin(moveAngle) * speed,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.012,
        points,
        segmentLengths,
        totalLength,
        life: initialStagger ? Math.floor(Math.random() * maxLife) : 0,
        maxLife,
        drawDuration,
        fadeDuration,
        maxOpacity,
        lineWidth: Math.random() * 0.4 + 1.1, // 1.1 to 1.5px organic pen tip
      };
    };

    const scribbleCount = 55;
    const scribbles: ScribbleStroke[] = Array.from({ length: scribbleCount }, () =>
      createScribble(true)
    );

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      scribbles.forEach((s, index) => {
        s.life++;

        // Floating drift & subtle slow spin
        s.x += s.vx;
        s.y += s.vy;
        s.angle += s.vAngle;

        // Wrap around screen margins
        if (s.x < -100) s.x = width + 100;
        if (s.x > width + 100) s.x = -100;
        if (s.y < -100) s.y = height + 100;
        if (s.y > height + 100) s.y = -100;

        // Respawn when life expires
        if (s.life >= s.maxLife) {
          scribbles[index] = createScribble(false);
          return;
        }

        // Calculate draw-on progress & current opacity
        let progress = 1;
        let opacity = s.maxOpacity;

        if (s.life < s.drawDuration) {
          // Drawing phase with natural pen acceleration/deceleration
          const t = s.life / s.drawDuration;
          progress = 1 - Math.pow(1 - t, 2.2);
          opacity = s.maxOpacity;
        } else if (s.life > s.maxLife - s.fadeDuration) {
          // Fading phase
          const fadeProgress = (s.maxLife - s.life) / s.fadeDuration;
          opacity = s.maxOpacity * Math.max(0, fadeProgress);
        }

        if (opacity <= 0.01 || s.points.length < 2) return;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = s.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw the organic curved path up to current progress distance
        const targetDist = s.totalLength * progress;
        let accumDist = 0;
        let penTipX = s.points[0].x;
        let penTipY = s.points[0].y;

        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);

        for (let i = 0; i < s.segmentLengths.length; i++) {
          const p0 = s.points[i];
          const p1 = s.points[i + 1];
          const segLen = s.segmentLengths[i];

          if (accumDist + segLen <= targetDist) {
            // Full segment drawn (use smooth midpoint curves for natural hand-drawn feel)
            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;
            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
            accumDist += segLen;
            penTipX = midX;
            penTipY = midY;
          } else {
            // Partial segment drawn up to pen position
            const remaining = targetDist - accumDist;
            const segRatio = segLen > 0 ? remaining / segLen : 0;
            const curX = p0.x + (p1.x - p0.x) * segRatio;
            const curY = p0.y + (p1.y - p0.y) * segRatio;
            ctx.lineTo(curX, curY);
            penTipX = curX;
            penTipY = curY;
            break;
          }
        }

        ctx.stroke();

        // Active pen tip dot while stroke is being scribbled in real-time
        if (s.life < s.drawDuration) {
          ctx.beginPath();
          ctx.arc(penTipX, penTipY, s.lineWidth * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45] w-full h-full"
      style={{ opacity: 0.95 }}
    />
  );
}
