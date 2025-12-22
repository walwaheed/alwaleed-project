import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BeforeAfterSlider({ beforeImage, afterImage, label, className = "" }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    // Use requestAnimationFrame for smoother updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    });
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl cursor-ew-resize select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onTouchMove={handleTouchMove}
      style={{ touchAction: 'none' }}
    >
      {/* After Image (Full) */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt="After"
          className="w-full h-full object-contain bg-black"
          draggable={false}
          style={{ pointerEvents: 'none' }}
        />
        <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none">
          After
        </div>
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden transition-all duration-0"
        style={{ 
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          willChange: 'clip-path'
        }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="w-full h-full object-contain bg-black"
          draggable={false}
          style={{ pointerEvents: 'none' }}
        />
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none">
          Before
        </div>
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-xl transition-all duration-0 pointer-events-none"
        style={{ 
          left: `${sliderPosition}%`,
          willChange: 'left'
        }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Label */}
      {label && (
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm text-white text-sm font-semibold px-3 py-2 rounded-lg text-center">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}