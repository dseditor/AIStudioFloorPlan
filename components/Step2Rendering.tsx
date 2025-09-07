/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from 'react';
import { generateAIRendering } from '../services/geminiService';
import DrawingCanvas, { DrawingCanvasRef } from './DrawingCanvas';
import { Language, getTranslation } from '../lib/i18n';

interface ImageHistory {
    url: string;
    timestamp: number;
}

interface Step2RenderingProps {
    originalImage: string;
    onRenderingComplete?: (renderedImage: string) => void;
    language: Language;
}

const Step2Rendering: React.FC<Step2RenderingProps> = ({ originalImage, onRenderingComplete, language }) => {
    const [renderedImage, setRenderedImage] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showEditingControls, setShowEditingControls] = useState(false);
    const [correctionInput, setCorrectionInput] = useState('');
    const [imageHistory, setImageHistory] = useState<ImageHistory[]>([]);
    const [currentMask, setCurrentMask] = useState<string>('');
    
    const canvasRef = useRef<DrawingCanvasRef>(null);

    const generateInitialRendering = async () => {
        if (!originalImage) return;
        
        setIsGenerating(true);
        setShowConfirmation(false);
        setShowEditingControls(false);
        
        try {
            const result = await generateAIRendering(originalImage);
            setRenderedImage(result);
            setShowConfirmation(true);
            
            if (onRenderingComplete) {
                onRenderingComplete(result);
            }
        } catch (error) {
            console.error('Failed to generate AI rendering:', error);
            alert(getTranslation('renderingFailed', language));
        } finally {
            setIsGenerating(false);
        }
    };

    const acceptRendering = () => {
        setShowConfirmation(false);
        setShowEditingControls(true);
    };

    const rejectRendering = () => {
        setShowConfirmation(false);
        setImageHistory([]); // Clear history for fresh start
        generateInitialRendering(); // Regenerate from original
    };

    const submitCorrection = async () => {
        if (!correctionInput.trim()) {
            alert(getTranslation('enterCorrectionAlert', language));
            return;
        }
        
        if (!canvasRef.current) {
            alert(getTranslation('markAreaAlert', language));
            return;
        }
        
        const maskBase64 = canvasRef.current.getMaskBase64();
        if (!maskBase64) {
            alert(getTranslation('markAreaAlert', language));
            return;
        }
        
        setIsGenerating(true);
        
        try {
            // Add current image to history before editing
            if (renderedImage) {
                setImageHistory(prev => [...prev, { url: renderedImage, timestamp: Date.now() }]);
            }
            
            const result = await generateAIRendering(renderedImage, correctionInput, maskBase64);
            setRenderedImage(result);
            setCorrectionInput('');
            
            // Clear the canvas
            if (canvasRef.current) {
                canvasRef.current.clearCanvas();
            }
            
            if (onRenderingComplete) {
                onRenderingComplete(result);
            }
        } catch (error) {
            console.error('Failed to apply correction:', error);
            alert(getTranslation('correctionFailed', language));
        } finally {
            setIsGenerating(false);
        }
    };

    const applyAutoMaterial = async () => {
        const autoMaterialPrompt = `Enhance this architectural rendering with realistic materials and textures:

FLOORING MATERIALS:
- Apply appropriate flooring for each room type (hardwood for living areas, tiles for bathrooms/kitchens, carpet for bedrooms)
- Ensure consistent material flow and realistic transitions

WALL FINISHES:
- Add realistic wall textures (painted drywall, concrete, brick where appropriate)
- Maintain clean, professional appearance
- Use neutral color palette suitable for interior spaces

LIGHTING & SHADOWS:
- Add realistic natural lighting from windows
- Include subtle shadows and depth
- Enhance overall photorealism

MAINTAIN PRECISION:
- Keep all architectural elements exactly as they are
- Do not alter room layouts, wall positions, or openings
- Focus only on material enhancement, not structural changes

IMPORTANT: Generate a photorealistic architectural visualization with enhanced materials.`;

        setIsGenerating(true);
        
        try {
            // Add current image to history
            if (renderedImage) {
                setImageHistory(prev => [...prev, { url: renderedImage, timestamp: Date.now() }]);
            }
            
            const result = await generateAIRendering(renderedImage, autoMaterialPrompt);
            setRenderedImage(result);
            
            if (onRenderingComplete) {
                onRenderingComplete(result);
            }
        } catch (error) {
            console.error('Failed to apply auto material:', error);
            alert(getTranslation('autoMaterialFailed', language));
        } finally {
            setIsGenerating(false);
        }
    };

    const restorePrevious = () => {
        if (imageHistory.length === 0) return;
        
        const previous = imageHistory[imageHistory.length - 1];
        setRenderedImage(previous.url);
        setImageHistory(prev => prev.slice(0, -1));
        
        if (onRenderingComplete) {
            onRenderingComplete(previous.url);
        }
    };

    const downloadImage = () => {
        if (!renderedImage) return;
        
        const link = document.createElement('a');
        link.href = renderedImage;
        link.download = 'ai-generated-plan.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearMask = () => {
        if (canvasRef.current) {
            canvasRef.current.clearCanvas();
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-slate-900">
                {getTranslation('step2Title', language)}
            </h2>
            <p className="text-center text-slate-500 mb-6 max-w-2xl mx-auto">
                {getTranslation('step2Description', language)}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Original Plan Reference */}
                <div>
                    <h3 className="font-bold text-lg mb-2 text-center">{getTranslation('originalPlanReference', language)}</h3>
                    <div className="border-2 border-slate-200 rounded-lg p-2 bg-white">
                        {originalImage ? (
                            <img 
                                src={originalImage} 
                                alt="原始平面圖" 
                                className="w-full h-auto rounded-md"
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className="w-full h-48 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                                <span>{getTranslation('pleaseUploadFirst', language)}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* AI Generated Rendering */}
                <div>
                    <h3 className="font-bold text-lg mb-2 text-center">{getTranslation('aiRenderingArea', language)}</h3>
                    <div className="border-2 border-slate-200 rounded-lg p-2 bg-slate-50 min-h-[300px] relative">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                                <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 animate-spin mb-3"></div>
                                <p className="font-semibold text-slate-600">{getTranslation('aiGenerating', language)}</p>
                            </div>
                        ) : renderedImage ? (
                            <DrawingCanvas 
                                ref={canvasRef}
                                imageUrl={renderedImage}
                                onMaskChange={setCurrentMask}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                                <p className="text-center mb-4">{getTranslation('startAIRendering', language)}</p>
                                <button 
                                    onClick={generateInitialRendering}
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {getTranslation('startAIRendering', language)}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Confirmation Panel */}
            {showConfirmation && (
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">{getTranslation('confirmRenderingTitle', language)}</h3>
                    <p className="text-blue-700 mb-6">{getTranslation('confirmRenderingDescription', language)}</p>
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={acceptRendering}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {getTranslation('acceptRendering', language)}
                        </button>
                        <button 
                            onClick={rejectRendering}
                            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                            {getTranslation('regenerateRendering', language)}
                        </button>
                    </div>
                </div>
            )}
            
            {/* Editing Controls */}
            {showEditingControls && (
                <div className="mt-8 space-y-4">
                    <div>
                        <label htmlFor="correction-input" className="block font-semibold mb-3 text-slate-700">
                            {getTranslation('correctionInputLabel', language)}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <input 
                                type="text" 
                                id="correction-input"
                                value={correctionInput}
                                onChange={(e) => setCorrectionInput(e.target.value)}
                                className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                placeholder={getTranslation('correctionInputPlaceholder', language)}
                            />
                            <button 
                                onClick={submitCorrection}
                                disabled={isGenerating}
                                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                                {getTranslation('submitCorrection', language)}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 pt-2">
                        <button 
                            onClick={applyAutoMaterial}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {getTranslation('autoMaterial', language)}
                        </button>
                        <button 
                            onClick={restorePrevious}
                            disabled={imageHistory.length === 0 || isGenerating}
                            className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            {getTranslation('restore', language)}
                        </button>
                        <button 
                            onClick={clearMask}
                            className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                            {getTranslation('clearMask', language)}
                        </button>
                        <button 
                            onClick={downloadImage}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {getTranslation('downloadImage', language)}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step2Rendering;