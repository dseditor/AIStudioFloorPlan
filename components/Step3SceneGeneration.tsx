/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { generateInteriorScene, suggestInteriorStyle, suggestStyleIdeas } from '../services/geminiService';
// FIX: Corrected import path for i18n module.
import { Language, getTranslation } from '../lib/i18n';
import JSZip from 'jszip';
import InteractiveSceneModal from './InteractiveSceneModal';

export interface ScenePoint {
    x: number;
    y: number;
}

export interface GeneratedScene {
    url: string;
    originalUrl: string; // For restore functionality in Step 4
    viewIndex: number;
    style: string;
    isLoading: boolean;
    error?: string;
    camera: {
        rotation: number;
        tilt: number;
        zoom: number;
    };
    mode: 'day' | 'night';
    temperature: number;
}

interface Step3SceneGenerationProps {
    finalPlanImage: string;
    language: Language;
    style: string;
    onStyleChange: (style: string) => void;
    scenes: GeneratedScene[];
    // Fix: Correctly type the onScenesChange prop to accept a state updater function.
    onScenesChange: React.Dispatch<React.SetStateAction<GeneratedScene[]>>;
    scenePoints: ScenePoint[];
    onScenePointsChange: React.Dispatch<React.SetStateAction<ScenePoint[]>>;
}

const styleEmojis = ['🎨', '🛋️', '🖼️', '🪴', '💡', '🏺'];

const Step3SceneGeneration: React.FC<Step3SceneGenerationProps> = ({ 
    finalPlanImage, 
    language,
    style,
    onStyleChange,
    scenes,
    onScenesChange,
    scenePoints,
    onScenePointsChange
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuggestingStyle, setIsSuggestingStyle] = useState(false);
    const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);
    const [lightingMode] = useState<'day' | 'night'>('day');
    const [colorTemperature] = useState(6500);
    const [suggestedStyles, setSuggestedStyles] = useState<string[]>([]);
    const [isLoadingStyles, setIsLoadingStyles] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const fetchStyles = async () => {
            setIsLoadingStyles(true);
            try {
                const styles = await suggestStyleIdeas();
                setSuggestedStyles(styles);
            } catch (error) {
                console.error("Failed to fetch style suggestions:", error);
                // Fallback is handled in the service, so we just log the error.
            } finally {
                setIsLoadingStyles(false);
            }
        };
        fetchStyles();
    }, []);

    useEffect(() => {
        if (finalPlanImage && imageRef.current) {
            setupCanvas();
        }
    }, [finalPlanImage]);

    const setupCanvas = () => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        
        if (!canvas || !image) return;
        
        const updateCanvasSize = () => {
            if (image.clientWidth > 0) {
                canvas.width = image.clientWidth;
                canvas.height = image.clientHeight;
                drawPoints();
            }
        };

        const observer = new ResizeObserver(updateCanvasSize);
        observer.observe(image);
        
        image.onload = updateCanvasSize;
        if (image.complete) updateCanvasSize();

        return () => observer.disconnect();
    };

    const addScenePoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (scenePoints.length >= 8) {
            alert(getTranslation('maxViewpointsAlert', language));
            return;
        }
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        onScenePointsChange(prev => [...prev, { x, y }]);
    };

    const drawPoints = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        scenePoints.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(220, 38, 38, 0.8)';
            ctx.fill();
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((index + 1).toString(), point.x, point.y);
        });
    };

    const clearPoints = () => {
        onScenePointsChange([]);
        onScenesChange([]);
        // Redrawing is handled by the useEffect hook
    };

    const handleSuggestStyle = async () => {
        if (!finalPlanImage) return;

        setIsSuggestingStyle(true);
        try {
            const suggestedStyle = await suggestInteriorStyle(finalPlanImage);
            onStyleChange(suggestedStyle);
        } catch (error) {
            console.error(error);
            alert(getTranslation('styleSuggestionFailed', language));
        } finally {
            setIsSuggestingStyle(false);
        }
    };
    
    const handleCameraUpdate = async (viewIndex: number, newCamera: GeneratedScene['camera']) => {
        const sceneToUpdateIndex = scenes.findIndex(s => s.viewIndex === viewIndex);
        if (sceneToUpdateIndex === -1) return;

        const point = scenePoints[sceneToUpdateIndex];
        if (!point) {
            console.error("Could not find the original viewpoint for this scene.");
            return;
        }

        onScenesChange(prev => prev.map((scene, index) =>
            index === sceneToUpdateIndex ? { ...scene, isLoading: true, error: undefined } : scene
        ));

        try {
            const image = imageRef.current;
            if (!image) throw new Error('Reference image for canvas is not available');

            const scaleX = image.naturalWidth / image.clientWidth;
            const scaleY = image.naturalHeight / image.clientHeight;
            const scaledX = point.x * scaleX;
            const scaledY = point.y * scaleY;

            const sceneToUpdate = scenes[sceneToUpdateIndex];

            const newImageUrl = await generateInteriorScene(
                finalPlanImage,
                scaledX,
                scaledY,
                style,
                viewIndex,
                newCamera,
                sceneToUpdate.mode,
                sceneToUpdate.temperature
            );
            
            onScenesChange(prev => prev.map((scene, index) =>
                index === sceneToUpdateIndex
                    ? { ...scene, url: newImageUrl, camera: newCamera, isLoading: false }
                    : scene
            ));
        } catch (error) {
            console.error(`Scene ${viewIndex} update failed:`, error);
            onScenesChange(prev => prev.map((scene, index) =>
                index === sceneToUpdateIndex
                    ? {
                        ...scene,
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Update failed'
                      }
                    : scene
            ));
        }
    };


    const generateScenes = async () => {
        if (!style.trim()) {
            alert(getTranslation('enterStyleAlert', language));
            return;
        }
        
        if (scenePoints.length === 0) {
            alert(getTranslation('selectViewpointAlert', language));
            return;
        }
        
        setIsGenerating(true);
        
        const initialScenes: GeneratedScene[] = scenePoints.map((_, index) => ({
            url: '',
            originalUrl: '',
            viewIndex: index + 1,
            style: style,
            isLoading: true,
            camera: { rotation: 0, tilt: 0, zoom: 1 },
            mode: lightingMode,
            temperature: colorTemperature,
        }));
        onScenesChange(initialScenes);
        
        const generationPromises = scenePoints.map(async (point, index) => {
            try {
                const image = imageRef.current;
                if (!image) throw new Error('Image not available');
                
                const scaleX = image.naturalWidth / image.clientWidth;
                const scaleY = image.naturalHeight / image.clientHeight;
                const scaledX = point.x * scaleX;
                const scaledY = point.y * scaleY;
                
                const sceneUrl = await generateInteriorScene(
                    finalPlanImage,
                    scaledX,
                    scaledY,
                    style,
                    index + 1,
                    { rotation: 0, tilt: 0, zoom: 1 },
                    lightingMode,
                    colorTemperature
                );
                
                onScenesChange(prev => prev.map((scene, i) => 
                    i === index 
                        ? { ...scene, url: sceneUrl, originalUrl: sceneUrl, isLoading: false }
                        : scene
                ));
            } catch (error) {
                console.error(`Scene ${index + 1} generation failed:`, error);
                onScenesChange(prev => prev.map((scene, i) => 
                    i === index 
                        ? { 
                            ...scene, 
                            isLoading: false, 
                            error: error instanceof Error ? error.message : 'Unknown error'
                          }
                        : scene
                ));
            }
        });
        
        await Promise.all(generationPromises);
        setIsGenerating(false);
    };

    const downloadAllScenesAsZip = async () => {
        const completedScenes = scenes.filter(scene => scene.url && !scene.isLoading && !scene.error);
        
        if (completedScenes.length === 0) {
            alert(getTranslation('generateScenesFirst', language));
            return;
        }
        
        const zip = new JSZip();
        const promises: Promise<void>[] = [];
        
        completedScenes.forEach((scene) => {
            if (scene.url) {
                promises.push(
                    fetch(scene.url)
                        .then(res => res.blob())
                        .then(blob => {
                            const fileName = `viewpoint_${scene.viewIndex}_${scene.style || 'scene'}.png`;
                            zip.file(fileName, blob);
                        })
                        .catch(err => console.error('Error adding image to zip:', err))
                );
            }
        });
        
        try {
            await Promise.all(promises);
            const zipBlob = await zip.generateAsync({type: 'blob'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `interior_scenes_${new Date().toISOString().slice(0,10)}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error creating zip:', error);
            alert(getTranslation('downloadFailed', language));
        }
    };

    useEffect(() => {
        drawPoints();
    }, [scenePoints, finalPlanImage]);

    return (
        <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-slate-900">
                {getTranslation('step3Title', language)}
            </h2>
            <p className="text-center text-slate-500 mb-6 max-w-2xl mx-auto">
                {getTranslation('step3Description', language)}
            </p>
            
            <div className="w-full max-w-3xl mx-auto mb-6 relative border-2 border-slate-300 rounded-lg overflow-hidden">
                <img 
                    ref={imageRef}
                    src={finalPlanImage} 
                    alt="最終平面圖" 
                    className="w-full h-auto rounded-md opacity-80"
                    crossOrigin="anonymous"
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 cursor-pointer"
                    onClick={addScenePoint}
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-4 mb-6">
                <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                    <div className="flex-grow flex max-w-md">
                        <input 
                            type="text" 
                            value={style}
                            onChange={(e) => onStyleChange(e.target.value)}
                            className="flex-grow px-4 py-2 border border-slate-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                            placeholder={getTranslation('styleInputPlaceholder', language)}
                        />
                        <button
                            onClick={handleSuggestStyle}
                            disabled={isSuggestingStyle || isGenerating}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-r-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center whitespace-nowrap"
                        >
                            {isSuggestingStyle ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {getTranslation('suggestingStyle', language)}
                                </>
                            ) : getTranslation('suggestStyleButton', language)}
                        </button>
                    </div>
                </div>

                <div className="w-full max-w-3xl mx-auto pt-4">
                    <p className="text-center text-slate-600 mb-3">{getTranslation('selectStyle', language)}</p>
                    {isLoadingStyles ? (
                        <div className="text-center text-slate-500 p-4">{getTranslation('loadingStyleIdeas', language)}</div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {suggestedStyles.map((styleName, index) => {
                                const isSelected = style === styleName;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => onStyleChange(styleName)}
                                        className={`rounded-lg border-2 text-center p-2 h-24 transition-all duration-200 group focus:outline-none flex flex-col items-center justify-center gap-1 ${isSelected ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-600 text-white' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50 text-slate-800'}`}
                                    >
                                        <span className="text-3xl" role="img" aria-label="style icon">{styleEmojis[index % styleEmojis.length]}</span>
                                        <span className="text-xs font-bold leading-tight">{styleName}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <button 
                        onClick={generateScenes}
                        disabled={isGenerating || scenePoints.length === 0 || !style.trim()}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? getTranslation('generating', language) : getTranslation('generateScenes', language)}
                    </button>
                    <button 
                        onClick={clearPoints}
                        className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                        {getTranslation('clearViewpoints', language)}
                    </button>
                    <button 
                        onClick={downloadAllScenesAsZip}
                        disabled={scenes.filter(s => s.url && !s.error).length === 0}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {getTranslation('downloadAllZip', language)}
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }, (_, index) => {
                    const scene = scenes[index];
                    
                    if (!scene && scenePoints.length <= index) {
                         return (
                            <div key={index} className="bg-slate-100 aspect-square rounded-lg flex items-center justify-center text-slate-400">
                                <span>{getTranslation('viewpoint', language)} {index + 1}</span>
                            </div>
                        );
                    }

                    if (scene?.isLoading && !scene.url) { // Initial loading state
                        return (
                            <div key={index} className="bg-slate-100 aspect-square rounded-lg flex flex-col items-center justify-center text-slate-400">
                                <div className="loader border-4 border-slate-300 border-t-slate-600 rounded-full w-8 h-8 animate-spin mb-2"></div>
                                <p className="text-sm font-semibold">{getTranslation('generating', language)} {getTranslation('viewpoint', language)} {index + 1}</p>
                            </div>
                        );
                    }
                    
                    if (scene?.error) {
                        return (
                            <div key={index} className="bg-red-100 aspect-square rounded-lg flex flex-col items-center justify-center text-red-600 p-4">
                                <p className="font-semibold text-center">{getTranslation('viewpoint', language)} {index + 1} {getTranslation('generationFailed', language)}</p>
                                <p className="text-xs mt-1 text-center">{scene.error.substring(0, 50)}...</p>
                                <button 
                                    onClick={generateScenes}
                                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                >
                                    {getTranslation('retry', language)}
                                </button>
                            </div>
                        );
                    }
                    
                    if (scene?.url) {
                        return (
                            <div 
                                key={index} 
                                className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg transition-shadow relative group"
                                onClick={() => setSelectedSceneIndex(index)}
                            >
                                <img 
                                    src={scene.url} 
                                    alt={`視角 ${index + 1} - ${scene.style}`} 
                                    className="w-full h-full object-cover aspect-square"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        );
                    }
                    
                    return (
                        <div key={index} className="bg-slate-100 aspect-square rounded-lg flex items-center justify-center text-slate-400">
                            <span>{getTranslation('viewpoint', language)} {index + 1}</span>
                        </div>
                    );
                })}
            </div>
            
            {selectedSceneIndex !== null && scenes[selectedSceneIndex] && (
                <InteractiveSceneModal
                    scene={scenes[selectedSceneIndex]}
                    onClose={() => setSelectedSceneIndex(null)}
                    onCameraUpdate={handleCameraUpdate}
                    language={language}
                />
            )}
        </div>
    );
};

export default Step3SceneGeneration;