/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Language, getTranslation } from '../lib/i18n';
import type { GeneratedScene } from './Step3SceneGeneration';

interface InteractiveSceneModalProps {
    scene: GeneratedScene;
    onClose: () => void;
    onCameraUpdate: (viewIndex: number, newCamera: GeneratedScene['camera']) => void;
    language: Language;
}

const ControlButton = ({ onClick, children, 'aria-label': ariaLabel, disabled = false }: { onClick: () => void, children: React.ReactNode, 'aria-label': string, disabled?: boolean }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className="w-12 h-12 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);

const InteractiveSceneModal: React.FC<InteractiveSceneModalProps> = ({ scene, onClose, onCameraUpdate, language }) => {
    
    const handleCameraUpdate = (cameraChanges: Partial<GeneratedScene['camera']>) => {
        if (scene.isLoading) return;
        const currentCamera = scene.camera;
        const newCamera = {
            rotation: cameraChanges.rotation !== undefined ? cameraChanges.rotation : currentCamera.rotation,
            tilt: cameraChanges.tilt !== undefined ? Math.max(-45, Math.min(45, cameraChanges.tilt)) : currentCamera.tilt,
            zoom: cameraChanges.zoom !== undefined ? Math.max(0.5, Math.min(2.0, cameraChanges.zoom)) : currentCamera.zoom,
        };
        onCameraUpdate(scene.viewIndex, newCamera);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="scene-viewer-title"
        >
            <div 
                className="relative bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl h-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                 <h2 id="scene-viewer-title" className="sr-only">Interactive Scene Viewer</h2>
                {/* Image Display */}
                <div className="relative flex-grow min-h-0">
                    <img 
                        key={scene.url}
                        src={scene.url} 
                        alt={`Interactive scene for viewpoint ${scene.viewIndex}`} 
                        className="w-full h-full object-contain"
                    />
                    
                    {/* Loading Overlay */}
                    {scene.isLoading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                            <div className="loader border-4 border-slate-400 border-t-white rounded-full w-12 h-12 animate-spin mb-4"></div>
                            <p className="text-lg font-semibold">{getTranslation('generating', language)}</p>
                        </div>
                    )}
                </div>

                 {/* Control Bar */}
                <div className="flex-shrink-0 bg-black/30 p-3">
                    <div className="flex items-center justify-center gap-4">
                        {/* Pan Controls */}
                        <div className="flex items-center gap-2">
                             <ControlButton onClick={() => handleCameraUpdate({ rotation: scene.camera.rotation - 30 })} aria-label="Pan camera left" disabled={scene.isLoading}>
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </ControlButton>
                             <ControlButton onClick={() => handleCameraUpdate({ rotation: scene.camera.rotation + 30 })} aria-label="Pan camera right" disabled={scene.isLoading}>
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </ControlButton>
                        </div>
                        
                        {/* Separator */}
                        <div className="w-px h-10 bg-white/20"></div>

                        {/* Tilt Controls */}
                        <div className="flex items-center gap-2">
                            <ControlButton onClick={() => handleCameraUpdate({ tilt: scene.camera.tilt + 15 })} aria-label="Tilt camera up" disabled={scene.isLoading}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </ControlButton>
                            <ControlButton onClick={() => handleCameraUpdate({ tilt: scene.camera.tilt - 15 })} aria-label="Tilt camera down" disabled={scene.isLoading}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </ControlButton>
                        </div>
                        
                        {/* Separator */}
                        <div className="w-px h-10 bg-white/20"></div>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2">
                             <ControlButton onClick={() => handleCameraUpdate({ zoom: scene.camera.zoom * 1.25 })} aria-label="Zoom in" disabled={scene.isLoading}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            </ControlButton>
                             <ControlButton onClick={() => handleCameraUpdate({ zoom: scene.camera.zoom / 1.25 })} aria-label="Zoom out" disabled={scene.isLoading}>
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                            </ControlButton>
                        </div>
                    </div>
                </div>
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    aria-label="Close scene viewer"
                    className="absolute top-4 right-4 w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export default InteractiveSceneModal;