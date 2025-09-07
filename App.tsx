/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import LanguageSelector from './components/LanguageSelector';
import Stepper from './components/Stepper';
import Step1Upload from './components/Step1Upload';
import Step2Rendering from './components/Step2Rendering';
import Step3SceneGeneration, { GeneratedScene } from './components/Step3SceneGeneration';
import Step4Presentation from './components/Step4Presentation';
import { Language, getTranslation } from './lib/i18n';

type AppState = 'language' | 'step1' | 'step2' | 'step3' | 'step4';

function App() {
    const [currentStep, setCurrentStep] = useState<AppState>('language');
    const [language, setLanguage] = useState<Language>('zh');
    const [uploadedImage, setUploadedImage] = useState<string>('');
    const [renderedImage, setRenderedImage] = useState<string>('');
    const [style, setStyle] = useState<string>('');
    const [generatedScenes, setGeneratedScenes] = useState<GeneratedScene[]>([]);

    const handleLanguageSelect = (selectedLanguage: Language) => {
        setLanguage(selectedLanguage);
        setCurrentStep('step1');
    };

    const handleImageUpload = (imageUrl: string) => {
        setUploadedImage(imageUrl);
        setRenderedImage('');
        setStyle('');
        setGeneratedScenes([]);
    };

    const handleRenderingComplete = (renderedImageUrl: string) => {
        setRenderedImage(renderedImageUrl);
        setStyle('');
        setGeneratedScenes([]);
    };

    const goToNextStep = () => {
        switch (currentStep) {
            case 'step1':
                if (uploadedImage) setCurrentStep('step2');
                break;
            case 'step2':
                if (renderedImage) setCurrentStep('step3');
                break;
            case 'step3':
                if (generatedScenes.length > 0) setCurrentStep('step4');
                break;
            default:
                break;
        }
    };

    const goToPrevStep = () => {
        switch (currentStep) {
            case 'step2':
                setCurrentStep('step1');
                break;
            case 'step3':
                setCurrentStep('step2');
                break;
            case 'step4':
                setCurrentStep('step3');
                break;
            default:
                break;
        }
    };

    const resetApp = () => {
        setCurrentStep('step1');
        setUploadedImage('');
        setRenderedImage('');
        setStyle('');
        setGeneratedScenes([]);
    };

    const changeLanguage = () => {
        setCurrentStep('language');
    };

    const getStepNumber = (): number => {
        switch (currentStep) {
            case 'step1': return 1;
            case 'step2': return 2;
            case 'step3': return 3;
            case 'step4': return 4;
            default: return 1;
        }
    };

    const canGoNext = (): boolean => {
        switch (currentStep) {
            case 'step1': return !!uploadedImage;
            case 'step2': return !!renderedImage;
            case 'step3': return generatedScenes.length > 0 && !generatedScenes.some(s => s.isLoading);
            default: return false;
        }
    };

    const canGoPrev = (): boolean => {
        return currentStep !== 'step1' && currentStep !== 'language';
    };

    // Show language selector if not set
    if (currentStep === 'language') {
        return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800">
            <div className="container mx-auto p-4 md:p-8 max-w-7xl">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    {/* Header */}
                    <header className="text-center mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1"></div>
                            <div className="flex-1">
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                                    {getTranslation('appTitle', language)}
                                </h1>
                                <p className="mt-2 text-slate-600">
                                    {getTranslation('appSubtitle', language)}
                                </p>
                            </div>
                            <div className="flex-1 flex justify-end">
                                <button
                                    onClick={changeLanguage}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                                    title="Change Language"
                                >
                                    {language === 'zh' ? '🇺🇸 EN' : '🇹🇼 中'}
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Stepper */}
                    <Stepper currentStep={getStepNumber()} maxStep={4} language={language} />

                    {/* Content Area */}
                    <main className="mb-8 min-h-[50vh]">
                        {currentStep === 'step1' && (
                            <Step1Upload 
                                onImageUpload={handleImageUpload}
                                uploadedImage={uploadedImage}
                                language={language}
                            />
                        )}
                        
                        {currentStep === 'step2' && (
                            <Step2Rendering 
                                originalImage={uploadedImage}
                                onRenderingComplete={handleRenderingComplete}
                                language={language}
                            />
                        )}
                        
                        {currentStep === 'step3' && (
                            <Step3SceneGeneration 
                                finalPlanImage={renderedImage}
                                language={language}
                                style={style}
                                onStyleChange={setStyle}
                                scenes={generatedScenes}
                                onScenesChange={setGeneratedScenes}
                            />
                        )}

                        {currentStep === 'step4' && (
                            <Step4Presentation
                                finalPlanImage={renderedImage}
                                generatedScenes={generatedScenes}
                                style={style}
                                language={language}
                            />
                        )}
                    </main>

                    {/* Navigation Buttons */}
                    <footer className="flex justify-between pt-4 border-t border-gray-200">
                        <button 
                            onClick={goToPrevStep}
                            disabled={!canGoPrev()}
                            className="px-6 py-2 bg-slate-300 text-slate-800 font-semibold rounded-lg hover:bg-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {getTranslation('previousStep', language)}
                        </button>
                        
                        <div className="flex gap-3">
                            {currentStep !== 'step1' && (
                                <button 
                                    onClick={resetApp}
                                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    {getTranslation('restart', language)}
                                </button>
                            )}
                            
                            {currentStep !== 'step4' && (
                                <button 
                                    onClick={goToNextStep}
                                    disabled={!canGoNext()}
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {getTranslation('nextStep', language)}
                                </button>
                            )}
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default App;