/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, ChangeEvent } from 'react';
import { generateAIRendering, suggestPlanImprovements } from '../services/geminiService';
import DrawingCanvas, { DrawingCanvasRef } from './DrawingCanvas';
// FIX: Corrected import path for i18n module.
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
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [numberOfImages, setNumberOfImages] = useState(1);
    const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
    
    const canvasRef = useRef<DrawingCanvasRef>(null);

    const previewSelection = (url: string) => {
        setSelectedCandidate(url);
    };

    const confirmSelection = () => {
        if (!selectedCandidate) return;

        // Add the previous image to history before replacing it with the new selection.
        if (renderedImage && !imageHistory.some(h => h.url === renderedImage)) {
             setImageHistory(prev => [...prev, { url: renderedImage, timestamp: Date.now() }]);
        }
        
        setRenderedImage(selectedCandidate);
        setGeneratedOptions([]);
        setIsSelecting(false);
        setSelectedCandidate(null);
        setShowConfirmation(false);
        setShowEditingControls(true);
        if (onRenderingComplete) {
            onRenderingComplete(selectedCandidate);
        }
    };

    const cancelSelection = () => {
        setSelectedCandidate(null);
    };

    const handleInitialGeneration = async () => {
        if (!originalImage) return;
        
        setIsGenerating(true);
        setShowConfirmation(false);
        setShowEditingControls(false);
        setIsSelecting(false);
        setGeneratedOptions([]);
        setSelectedCandidate(null);
        
        try {
            const results = await generateAIRendering(originalImage, undefined, undefined, numberOfImages);
            
            if (results.length === 1) {
                setRenderedImage(results[0]);
                setShowConfirmation(true);
                if (onRenderingComplete) {
                    onRenderingComplete(results[0]);
                }
            } else {
                setGeneratedOptions(results);
                setIsSelecting(true);
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
        handleInitialGeneration();
    };

    const submitCorrection = async () => {
        const maskBase64 = canvasRef.current ? canvasRef.current.getMaskBase64() : '';

        if (!correctionInput.trim()) {
            alert(getTranslation('enterCorrectionAlert', language));
            return;
        }
        
        setIsGenerating(true);
        setIsSelecting(false);
        setGeneratedOptions([]);
        setSelectedCandidate(null);
        
        try {
            const results = await generateAIRendering(
                renderedImage, 
                correctionInput, 
                maskBase64,
                numberOfImages
            );

            if (results.length === 1) {
                if (renderedImage) {
                    setImageHistory(prev => [...prev, { url: renderedImage, timestamp: Date.now() }]);
                }
                setRenderedImage(results[0]);
                if (onRenderingComplete) {
                    onRenderingComplete(results[0]);
                }
            } else {
                setGeneratedOptions(results);
                setIsSelecting(true);
            }
            
            setCorrectionInput('');
            if (canvasRef.current) {
                canvasRef.current.clearCanvas();
            }

        } catch (error) {
            console.error('Failed to apply correction:', error);
            alert(getTranslation('correctionFailed', language));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSuggestImprovement = async () => {
        if (!renderedImage) return;
    
        setIsSuggesting(true);
        try {
            const suggestion = await suggestPlanImprovements(renderedImage);
            setCorrectionInput(suggestion);
        } catch (error) {
            console.error('Failed to get suggestion:', error);
            alert(getTranslation('suggestionFailed', language));
        } finally {
            setIsSuggesting(false);
        }
    };

    const applyAutoMaterial = async () => {
        const autoMaterialPrompt = `Enhance this architectural rendering with realistic materials and textures:

SYMBOL INTERPRETATION:
- A rectangle or square with a large 'X' drawn through it is a system cabinet (系統櫃). Render this as a built-in system cabinet with a top-down view.

FURNITURE & FIXTURES:
- For any furniture like beds, sofas, wardrobes, and cabinets, apply varied and distinct colors and materials for each individual piece. For example, if there are two sofas, render them in different colors to create a more dynamic and diverse interior.

FLOORING MATERIALS:
- Apply appropriate flooring for each room type (hardwood for living areas, tiles for bathrooms/kitchens, carpet for bedrooms)
- Ensure consistent material flow and realistic transitions

WALL FINISHES:
- Add realistic wall textures (painted drywall, concrete, brick where appropriate)
- Maintain clean, professional appearance
- Use a neutral color palette suitable for interior spaces

LIGHTING & SHADOWS:
- Add realistic natural lighting from windows
- Include subtle shadows and depth
- Enhance overall photorealism

MAINTAIN PRECISION:
- Keep all architectural elements exactly as they are
- Do not alter room layouts, wall positions, or openings
- Focus only on material enhancement, not structural changes

IMPORTANT: Generate a photorealistic architectural visualization with enhanced materials, ensuring correct interpretation of symbols and color diversity for furniture.`;

        setIsGenerating(true);
        setIsSelecting(false);
        setGeneratedOptions([]);
        setSelectedCandidate(null);
        
        try {
            const results = await generateAIRendering(renderedImage, autoMaterialPrompt, undefined, numberOfImages);
            
            if (results.length === 1) {
                if (renderedImage) {
                    setImageHistory(prev => [...prev, { url: renderedImage, timestamp: Date.now() }]);
                }
                setRenderedImage(results[0]);
                if (onRenderingComplete) {
                    onRenderingComplete(results[0]);
                }
            } else {
                setGeneratedOptions(results);
                setIsSelecting(true);
            }
        } catch (error) {
            console.error('Failed to apply auto material:', error);
            alert(getTranslation('autoMaterialFailed', language));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDollhouseGeneration = async () => {
        if (!renderedImage) return;
    
        setIsGenerating(true);
        setIsSelecting(false);
        setGeneratedOptions([]);
        setSelectedCandidate(null);
    
        const dollhousePrompt = `Transform this top-down 3D floor plan into a photorealistic, fully furnished, and decorated 3D dollhouse view. The final image MUST be rendered from a 45-degree axonometric perspective (isometric view), providing a clear 3D representation of the space.

REQUIREMENTS:
- **Full Furnishing:** Add appropriate and stylish furniture to all rooms (beds, sofas, tables, etc.), consistent with the room's purpose.
- **Rich Decoration:** Include decorative elements like rugs, plants, artwork, and lighting fixtures to create a lived-in, aesthetically pleasing atmosphere.
- **Detailed Textures:** Apply realistic textures to all surfaces, including floors, walls, and furniture.
- **Realistic Lighting:** Implement natural lighting with soft shadows that enhance the 3D depth and realism of the scene.
- **Architectural Integrity:** Maintain the original wall layout, window, and door placements from the source plan.
- **Aesthetics:** The final output should be a beautiful, high-quality interior design visualization.`;
    
        try {
            const results = await generateAIRendering(renderedImage, dollhousePrompt, undefined, numberOfImages);
            
            if (results.length === 1) {
                if (renderedImage) {
                    setImageHistory(prev => [...prev, { url: renderedImage, timestamp: Date.now() }]);
                }
                setRenderedImage(results[0]);
                if (onRenderingComplete) {
                    onRenderingComplete(results[0]);
                }
            } else {
                setGeneratedOptions(results);
                setIsSelecting(true);
            }
        } catch (error) {
            console.error('Failed to generate dollhouse view:', error);
            alert(getTranslation('dollhouseGenerationFailed', language));
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
    
    const NumberOfImagesSelector = () => (
        <div className="mb-4">
            <label className="block text-center font-semibold mb-2 text-slate-700">{getTranslation('numberOfImagesLabel', language)}</label>
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4].map(num => (
                    <button
                        key={num}
                        onClick={() => setNumberOfImages(num)}
                        className={`px-4 py-2 rounded-lg font-semibold border-2 transition-colors ${numberOfImages === num ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'}`}
                    >
                        {`${num} ${num > 1 ? getTranslation('images', language) : getTranslation('image', language)}`}
                    </button>
                ))}
            </div>
        </div>
    );

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
                        {isGenerating && !isSelecting ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                                <div className="loader border-4 border-indigo-200 border-t-indigo-600 rounded-full w-12 h-12 animate-spin mb-3"></div>
                                <p className="font-semibold text-slate-600">{getTranslation('aiGenerating', language)}</p>
                            </div>
                        ) : renderedImage && !isSelecting ? (
                            <DrawingCanvas 
                                ref={canvasRef}
                                imageUrl={renderedImage}
                                onMaskChange={setCurrentMask}
                            />
                        ) : !isSelecting ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                                <p className="text-center mb-4">{getTranslation('initialRenderingPrompt', language)}</p>
                                <NumberOfImagesSelector />
                                <div className="flex justify-center mt-2">
                                    <button 
                                        onClick={handleInitialGeneration}
                                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors w-48 text-center"
                                    >
                                        {getTranslation('startRenderingButton', language)}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Image Selection Panel */}
            {isSelecting && (
                <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
                    {selectedCandidate ? (
                        <div>
                            <h3 className="text-lg font-semibold text-indigo-800 mb-3 text-center">{getTranslation('selectionConfirmationTitle', language)}</h3>
                            <img src={selectedCandidate} alt="Selected candidate for confirmation" className="w-full max-w-lg mx-auto h-auto rounded-lg mb-4 border-4 border-indigo-500 shadow-lg" />
                            <div className="flex justify-center gap-4">
                                <button onClick={confirmSelection} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                                    {getTranslation('confirmSelectionButton', language)}
                                </button>
                                <button onClick={cancelSelection} className="px-6 py-2 bg-slate-500 text-white font-semibold rounded-lg hover:bg-slate-600">
                                    {getTranslation('backToSelectionButton', language)}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg font-semibold text-indigo-800 mb-3">{getTranslation('chooseRenderingTitle', language)}</h3>
                            <p className="text-indigo-700 mb-6">{getTranslation('chooseRenderingDescription', language)}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {generatedOptions.map((url, index) => (
                                    <div key={index} className="relative group cursor-pointer" onClick={() => previewSelection(url)}>
                                        <img src={url} alt={`Generated option ${index + 1}`} className="w-full h-auto rounded-lg border-2 border-transparent group-hover:border-indigo-500 transition-all" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <span className="px-4 py-2 bg-white text-slate-800 font-semibold rounded-md">
                                                {getTranslation('selectThisImage', language)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Confirmation Panel */}
            {showConfirmation && !isSelecting && (
                <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-3">{getTranslation('confirmRenderingTitle', language)}</h3>
                    <p className="text-indigo-700 mb-6">{getTranslation('confirmRenderingDescription', language)}</p>
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
            {showEditingControls && !isSelecting && (
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
                                className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900" 
                                placeholder={getTranslation('correctionInputPlaceholder', language)}
                            />
                             <button 
                                onClick={handleSuggestImprovement}
                                disabled={isGenerating || isSuggesting}
                                className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 whitespace-nowrap flex items-center justify-center"
                            >
                                {isSuggesting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {getTranslation('suggestingImprovement', language)}
                                    </>
                                ) : getTranslation('suggestImprovement', language)}
                            </button>
                        </div>
                        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                             <NumberOfImagesSelector />
                             <div className="flex justify-end mt-2">
                                <button 
                                    onClick={submitCorrection}
                                    disabled={isGenerating || isSuggesting}
                                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                    {getTranslation('submitCorrection', language)}
                                </button>
                             </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button 
                            onClick={handleDollhouseGeneration}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {getTranslation('createDollhouseView', language)}
                        </button>
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