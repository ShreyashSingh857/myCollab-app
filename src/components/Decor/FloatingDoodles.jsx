import React, { useEffect, useRef } from 'react';

// Simple floating gradient blobs ("doodles") background
export default function FloatingDoodles({ count = 6 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const nodes = [];
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'doodle-blob';
      const size = 160 + Math.random() * 180; // 160 - 340px
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.left = Math.random() * 90 + '%';
      el.style.top = Math.random() * 90 + '%';
      el.style.animationDuration = 35 + Math.random() * 25 + 's';
      el.style.animationDelay = -Math.random() * 20 + 's';
      el.style.filter = `blur(${4 + Math.random() * 4}px)`;

      const hue = Math.floor(200 + Math.random() * 80); // blues / purples
      const hue2 = hue + 40 + Math.random() * 30;
      el.style.background = `radial-gradient(circle at 30% 30%, hsl(${hue} 92% 65% / 0.9), hsl(${hue2} 82% 45% / 0.55))`;

      container.appendChild(el);
      nodes.push(el);
    }

    return () => {
      nodes.forEach(n => n.remove());
    };
  }, [count]);

  return <div ref={containerRef} className="floating-doodles" aria-hidden="true" />;
}
