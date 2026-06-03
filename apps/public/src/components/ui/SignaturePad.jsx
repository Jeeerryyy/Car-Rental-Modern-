import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Premium Signature Pad Component
 * Handles mouse and touch events for digital signing.
 * Supports high-DPI displays and signature restoration.
 */
export default function SignaturePad({ onSave, onClear, defaultValue }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(!defaultValue);

  // Initialize canvas and handle high-DPI scaling
  const initializedRef = useRef(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || initializedRef.current) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    // Set internal resolution once
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827';

    drawGuideLine(ctx, rect.width, rect.height);
    
    // Restore signature if provided
    if (defaultValue) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setIsEmpty(false);
      };
      img.src = defaultValue;
    }

    initializedRef.current = true;
  }, [defaultValue]);

  const drawGuideLine = (ctx, width, height) => {
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();
    
    // Add "X" mark
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#D1D5DB';
    ctx.fillText('X', 25, height - 45);
    ctx.restore();
  };

  useEffect(() => {
    initCanvas();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventDefault = (e) => {
      if (isDrawingRef.current || e.target === canvas) {
        if (e.cancelable) e.preventDefault();
      }
    };

    canvas.addEventListener('touchstart', preventDefault, { passive: false });
    canvas.addEventListener('touchmove', preventDefault, { passive: false });
    canvas.addEventListener('touchend', preventDefault, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', preventDefault);
      canvas.removeEventListener('touchmove', preventDefault);
      canvas.removeEventListener('touchend', preventDefault);
    };
  }, [initCanvas]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const { x, y } = getPos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827';
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (isEmpty) {
      setIsEmpty(false);
    }
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const { x, y } = getPos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png', 1.0));
    }
  };


  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGuideLine(ctx, rect.width, rect.height);
    
    setIsEmpty(true);
    isDrawingRef.current = false;
    onClear();
  };


  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl border-2 border-dashed overflow-hidden cursor-crosshair select-none" style={{ background: '#E7E0D4', borderColor: '#DDE8DE' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-[180px] touch-none block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: '#E7E0D4' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#8B8B8B' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: '#8B8B8B' }}>Sign Here</p>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center px-1">
        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#8B8B8B' }}>Legal Digital Signature</p>
        <button
          type="button"
          onClick={clear}
          className="text-[10px] uppercase tracking-widest text-red-500 font-black flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>
    </div>
  );
}

