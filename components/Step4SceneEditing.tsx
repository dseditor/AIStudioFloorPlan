/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, ChangeEvent } from 'react';
import { GeneratedScene } from './Step3SceneGeneration';
import { editInteriorScene, imageSrcToBase64 } from '../services/geminiService';
import { Language, getTranslation } from '../lib/i18n';
import JSZip from 'jszip';
import DrawingCanvas, { DrawingCanvasRef } from './DrawingCanvas';

interface EditableSceneCardProps {
    scene: GeneratedScene;
    onEdit: (viewIndex: number, prompt: string, mode: 'day' | 'night', temperature: number, maskBase64?: string, objectImageDataUrl?: string | null) => void;
    onRestore: (viewIndex: number) => void;
    language: Language;
}

const EditableSceneCard: React.FC<EditableSceneCardProps> = ({ scene, onEdit, onRestore, language }) => {
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState(scene.mode);
    const [temperature, setTemperature] = useState(scene.temperature);
    const [objectImage, setObjectImage] = useState<string | null>(null);
    const canvasRef = useRef<DrawingCanvasRef>(null);
    const objectInputRef = useRef<HTMLInputElement>(null);

    const handleApply = () => {
        const maskBase64 = canvasRef.current?.getMaskBase64();
        onEdit(scene.viewIndex, prompt, mode, temperature, maskBase64, objectImage);
    };

    const handleClearSelection = () => {
        canvasRef.current?.clearCanvas();
    };

    const handleObjectUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setObjectImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const isRestorable = scene.url !== scene.originalUrl;

    return (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 flex flex-col">
            <div className="relative aspect-square">
                <DrawingCanvas
                    ref={canvasRef}
                    imageUrl={scene.url}
                    className="rounded-t-lg"
                />
                {scene.isLoading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white rounded-t-lg">
                        <div className="loader border-4 border-slate-400 border-t-white rounded-full w-10 h-10 animate-spin mb-3"></div>
                        <p className="font-semibold">{getTranslation('updatingScene', language)}</p>
                    </div>
                )}
            </div>
            <div className="p-4 space-y-3 flex-grow flex flex-col">
                <div className="flex-grow">
                     <input
                        type="file"
                        accept="image/*"
                        ref={objectInputRef}
                        onChange={handleObjectUpload}
                        className="hidden"
                    />
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={getTranslation('editPromptPlaceholder', language)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        disabled={scene.isLoading}
                        rows={2}
                    />
                </div>
                
                {/* Object Upload Section */}
                {objectImage ? (
                    <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md">
                        <img src={objectImage} alt="Uploaded object" className="w-12 h-12 rounded object-cover"/>
                        <p className="text-sm font-medium text-slate-700 flex-grow">{getTranslation('addObject', language)}</p>
                        <button 
                            onClick={() => setObjectImage(null)}
                            className="p-1 text-slate-500 hover:text-red-600"
                            aria-label={getTranslation('clearObject', language)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => objectInputRef.current?.click()}
                        className="w-full px-3 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                        disabled={scene.isLoading}
                    >
                        {getTranslation('addObject', language)}
                    </button>
                )}
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMode('day')}
                        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex-1 ${mode === 'day' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                        disabled={scene.isLoading}
                    >
                        {getTranslation('day', language)}
                    </button>
                    <button
                        onClick={() => setMode('night')}
                         className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex-1 ${mode === 'night' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                         disabled={scene.isLoading}
                    >
                        {getTranslation('night', language)}
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <input
                        type="range"
                        min="2700"
                        max="7500"
                        step="100"
                        value={temperature}
                        onChange={(e) => setTemperature(parseInt(e.target.value, 10))}
                        className="w-full"
                        disabled={scene.isLoading}
                    />
                    <span className="text-sm font-semibold text-slate-700 w-16 text-center">{temperature}K</span>
                </div>

                <div className="pt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleApply}
                            disabled={scene.isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {getTranslation('applyEdit', language)}
                        </button>
                        <button
                            onClick={() => onRestore(scene.viewIndex)}
                            disabled={!isRestorable || scene.isLoading}
                            className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            {getTranslation('restoreOriginal', language)}
                        </button>
                    </div>
                    <button
                        onClick={handleClearSelection}
                        disabled={scene.isLoading}
                        className="w-full px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                    >
                        {getTranslation('clearMask', language)}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface Step4SceneEditingProps {
    scenes: GeneratedScene[];
    onScenesChange: React.Dispatch<React.SetStateAction<GeneratedScene[]>>;
    language: Language;
}

const Step4SceneEditing: React.FC<Step4SceneEditingProps> = ({ scenes, onScenesChange, language }) => {

    const handleEdit = async (viewIndex: number, prompt: string, mode: 'day' | 'night', temperature: number, maskBase64?: string, objectImageDataUrl?: string | null) => {
        const sceneIndex = scenes.findIndex(s => s.viewIndex === viewIndex);
        if (sceneIndex === -1) return;

        onScenesChange(prev => prev.map(s => s.viewIndex === viewIndex ? { ...s, isLoading: true } : s));
        
        try {
            const baseImageSrc = scenes[sceneIndex].url;
            const objectImageBase64 = objectImageDataUrl ? await imageSrcToBase64(objectImageDataUrl) : undefined;
            
            const newUrl = await editInteriorScene(baseImageSrc, prompt, mode, temperature, maskBase64, objectImageBase64);

            onScenesChange(prev => prev.map(s => {
                if (s.viewIndex === viewIndex) {
                    const newScene = { ...s, url: newUrl, mode, temperature, isLoading: false };
                    // If this is the first edit, set the originalUrl so we can restore to the Step 3 version.
                    // The originalUrl should only be set once from the initial generation.
                    if (s.url === s.originalUrl) {
                        newScene.originalUrl = s.url;
                    }
                    return newScene;
                }
                return s;
            }));
        } catch (error) {
            console.error(`Error editing scene ${viewIndex}:`, error);
            alert(`Failed to edit scene. ${error instanceof Error ? error.message : ''}`);
            onScenesChange(prev => prev.map(s => s.viewIndex === viewIndex ? { ...s, isLoading: false } : s));
        }
    };
    
    const handleRestore = (viewIndex: number) => {
        onScenesChange(prev => prev.map(s => {
            if (s.viewIndex === viewIndex) {
                // Also reset mode and temp to original if we stored them, otherwise reset to a default
                return { ...s, url: s.originalUrl };
            }
            return s;
        }));
    };

    const downloadAllScenesAsZip = async () => {
        const completedScenes = scenes.filter(scene => scene.url && !scene.isLoading);
        if (completedScenes.length === 0) return;

        const zip = new JSZip();
        const promises: Promise<void>[] = [];

        completedScenes.forEach(scene => {
            if (scene.url) {
                promises.push(
                    fetch(scene.url)
                        .then(res => res.blob())
                        .then(blob => {
                            const fileName = `edited_scene_${scene.viewIndex}.png`;
                            zip.file(fileName, blob);
                        })
                        .catch(err => console.error('Error adding image to zip:', err))
                );
            }
        });

        try {
            await Promise.all(promises);
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `edited_scenes_${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error creating zip:', error);
            alert(getTranslation('downloadFailed', language));
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {getTranslation('step4Title', language)}
                    </h2>
                    <p className="text-slate-500 max-w-3xl">
                        {getTranslation('step4Description', language)}
                    </p>
                </div>
                <button
                    onClick={downloadAllScenesAsZip}
                    disabled={scenes.length === 0 || scenes.some(s => !s.url)}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                    {getTranslation('downloadEditedScenes', language)}
                </button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {scenes.map(scene => (
                    <EditableSceneCard 
                        key={scene.viewIndex}
                        scene={scene}
                        onEdit={handleEdit}
                        onRestore={handleRestore}
                        language={language}
                    />
                ))}
            </div>
        </div>
    );
};

export default Step4SceneEditing;