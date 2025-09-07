/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import type { Language, getTranslation } from '../lib/i18n';
import type { GeneratedScene } from './Step3SceneGeneration';

interface InteractiveSceneModalProps {
    scene: GeneratedScene;
    onClose: () => void;
    onCameraUpdate: (viewIndex: number, newCamera: GeneratedScene['camera']) => void;
    language: Language;
}

const ControlButton = ({ onClick, children, 'aria-label': ariaLabel, className = '' }: { onClick: () => void, children: React.ReactNode, 'aria-label': string, className?: string }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`absolute w-12 h-12 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white ${className}`}
    >
        {children}
    </button>
);

const InteractiveSceneModal: React.FC<InteractiveSceneModalProps> = ({ scene, onClose, onCameraUpdate }) => {
    const handleUpdate = (cameraChanges: Partial<GeneratedScene['camera']>) => {
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
                className="relative bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl aspect-video overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Image Display */}
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
                        <p className="text-lg font-semibold">Generating New View...</p>
                    </div>
                )}
                
                {/* Controls */}
                {!scene.isLoading && (
                    <>
                        <h2 id="scene-viewer-title" className="sr-only">Interactive Scene Viewer</h2>
                        {/* Tilt Up */}
                        <ControlButton onClick={() => handleUpdate({ tilt: scene.camera.tilt + 15 })} aria-label="Tilt camera up" className="top-4 left-1/2 -translate-x-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </ControlButton>
                        
                        {/* Tilt Down */}
                        <ControlButton onClick={() => handleUpdate({ tilt: scene.camera.tilt - 15 })} aria-label="Tilt camera down" className="bottom-4 left-1/2 -translate-x-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </ControlButton>

                        {/* Pan Left */}
                        <ControlButton onClick={() => handleUpdate({ rotation: scene.camera.rotation - 30 })} aria-label="Pan camera left" className="left-4 top-1/2 -translate-y-1/2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </ControlButton>
                        
                        {/* Pan Right */}
                        <ControlButton onClick={() => handleUpdate({ rotation: scene.camera.rotation + 30 })} aria-label="Pan camera right" className="right-4 top-1/2 -translate-y-1/2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </ControlButton>

                        {/* Zoom Controls */}
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                             <ControlButton onClick={() => handleUpdate({ zoom: scene.camera.zoom * 1.25 })} aria-label="Zoom in" className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            </ControlButton>
                             <ControlButton onClick={() => handleUpdate({ zoom: scene.camera.zoom / 1.25 })} aria-label="Zoom out" className="relative">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                            </ControlButton>
                        </div>
                    </>
                )}
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    aria-label="Close scene viewer"
                    className="absolute top-4 right-4 w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export default InteractiveSceneModal;
