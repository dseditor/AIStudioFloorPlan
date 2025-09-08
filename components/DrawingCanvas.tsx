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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        setContext(ctx);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Set canvas to the native resolution of the image to ensure mask aligns perfectly.
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            // Clear any previous drawings when a new image is loaded.
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        img.src = imageUrl;
    }, [imageUrl]);

    const getScaledCoords = (e: React.PointerEvent<HTMLCanvasElement>): { x: number, y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!context) return;
        const coords = getScaledCoords(e);
        if (!coords) return;

        e.preventDefault();
        setIsDrawing(true);
        context.beginPath();
        context.moveTo(coords.x, coords.y);
    };

    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !context || !canvasRef.current) return;
        const coords = getScaledCoords(e);
        if (!coords) return;
        e.preventDefault();

        context.lineTo(coords.x, coords.y);
        // Use a semi-transparent red for user feedback; this won't be in the final mask.
        context.strokeStyle = 'rgba(220, 38, 38, 0.7)';
        // Scale brush size relative to image resolution for a consistent feel.
        context.lineWidth = 30 * (canvasRef.current.width / 1000);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (onMaskChange) {
            onMaskChange(getMaskBase64());
        }
    };

    const clearCanvas = () => {
        if (context && canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            if (onMaskChange) {
                onMaskChange('');
            }
        }
    };

    const getMaskBase64 = (): string => {
        const canvas = canvasRef.current;
        if (!canvas) return '';

        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        
        // Check if anything has been drawn
        const isCanvasBlank = !ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0);
        if (isCanvasBlank) return '';

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) return '';

        // Draw the user's marks (which are red and semi-transparent).
        maskCtx.drawImage(canvas, 0, 0);

        // Use 'source-in' to replace the color of the drawn parts with solid white.
        // This preserves the shape and anti-aliasing but makes it a solid color.
        maskCtx.globalCompositeOperation = 'source-in';
        maskCtx.fillStyle = 'white';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        // Use 'destination-over' to draw a black background behind the white shapes.
        maskCtx.globalCompositeOperation = 'destination-over';
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        
        return maskCanvas.toDataURL('image/png').split(',')[1];
    };

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
                className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
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