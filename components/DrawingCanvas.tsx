/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface DrawingCanvasProps {
    imageUrl: string;
    onMaskChange?: (maskDataUrl: string) => void;
    className?: string;
}

export interface DrawingCanvasRef {
    clearCanvas: () => void;
    getMaskBase64: () => string;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ imageUrl, onMaskChange, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setContext(ctx);
        
        // Load and display the base image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Set canvas size to match image display size
            const container = containerRef.current;
            if (container) {
                const rect = container.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                setImageLoaded(true);
            }
        };
        img.src = imageUrl;
    }, [imageUrl]);

    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!context || !imageLoaded) return;
        
        e.preventDefault();
        setIsDrawing(true);
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        context.beginPath();
        context.moveTo(x, y);
    };

    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !context) return;
        
        e.preventDefault();
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        context.lineTo(x, y);
        context.strokeStyle = 'rgba(220, 38, 38, 0.6)';
        context.lineWidth = 15;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        
        setIsDrawing(false);
        
        // Notify parent component of mask changes
        const canvas = canvasRef.current;
        if (canvas && onMaskChange) {
            const maskDataUrl = canvas.toDataURL();
            onMaskChange(maskDataUrl);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !context) return;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        if (onMaskChange) {
            onMaskChange('');
        }
    };

    const getMaskBase64 = (): string => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        
        return canvas.toDataURL().split(',')[1];
    };

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
        clearCanvas,
        getMaskBase64
    }));

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <img 
                src={imageUrl} 
                alt="Base" 
                className="w-full h-auto object-contain rounded-md block"
                crossOrigin="anonymous"
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
            />
        </div>
    );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;