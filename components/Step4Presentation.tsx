/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Language, getTranslation } from '../lib/i18n';
import type { GeneratedScene } from './Step3SceneGeneration';
import { generatePresentationText, PresentationText } from '../services/geminiService';
import { createPresentationSlides, themes, ColorTheme } from '../lib/presentationUtils';
import { cn } from '../lib/utils';
import JSZip from 'jszip';

interface Step4PresentationProps {
    finalPlanImage: string;
    generatedScenes: GeneratedScene[];
    style: string;
    language: Language;
}

const Step4Presentation: React.FC<Step4PresentationProps> = ({ finalPlanImage, generatedScenes, style, language }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [slides, setSlides] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [presentationLanguage, setPresentationLanguage] = useState<Language>(language);
    const [selectedThemeKey, setSelectedThemeKey] = useState<string>('modernBlue');

    const handleGeneratePresentation = async () => {
        setIsLoading(true);
        setError(null);
        setSlides([]);

        try {
            const validScenes = generatedScenes.filter(s => s.url && !s.error);
            if (validScenes.length === 0) {
                throw new Error("No valid scenes available to generate a presentation.");
            }

            // 1. Get text content from Gemini
            const presentationText: PresentationText = await generatePresentationText(
                finalPlanImage,
                validScenes,
                style,
                presentationLanguage
            );

            // 2. Create slide images with Canvas
            const selectedTheme = themes[selectedThemeKey];
            const slideImages = await createPresentationSlides(
                finalPlanImage,
                validScenes,
                presentationText,
                presentationLanguage,
                selectedTheme
            );

            setSlides(slideImages);

        } catch (err) {
            console.error("Failed to generate presentation:", err);
            setError(err instanceof Error ? err.message : getTranslation('presentationGenerationFailed', language));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = async () => {
        if (slides.length === 0) return;

        const zip = new JSZip();
        
        const promises = slides.map(async (slideDataUrl, index) => {
            const response = await fetch(slideDataUrl);
            const blob = await response.blob();
            zip.file(`slide_${index + 1}.png`, blob);
        });

        await Promise.all(promises);

        zip.generateAsync({ type: "blob" }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `Design_Presentation_${style.replace(/\s+/g, '_')}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        });
    };

    const themeOptions: { key: string; theme: ColorTheme; nameKey: keyof import('../lib/i18n').Translations }[] = [
        { key: 'modernBlue', theme: themes.modernBlue, nameKey: 'themeModernBlue' },
        { key: 'warmEarth', theme: themes.warmEarth, nameKey: 'themeWarmEarth' },
        { key: 'minimalistGray', theme: themes.minimalistGray, nameKey: 'themeMinimalistGray' },
        { key: 'boldTeal', theme: themes.boldTeal, nameKey: 'themeBoldTeal' },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-slate-900">
                {getTranslation('step4Title', language)}
            </h2>
            <p className="text-center text-slate-500 mb-8 max-w-2xl mx-auto">
                {getTranslation('step4Description', language)}
            </p>

            {!isLoading && slides.length === 0 && (
                 <div className="max-w-xl mx-auto p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="space-y-6">
                        {/* Language Selection */}
                        <div>
                            <label htmlFor="lang-select" className="block font-semibold text-slate-700 mb-2">
                               {getTranslation('presentationLanguage', language)}
                            </label>
                            <select
                                id="lang-select"
                                value={presentationLanguage}
                                onChange={(e) => setPresentationLanguage(e.target.value as Language)}
                                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="zh">{getTranslation('chinese', language)}</option>
                                <option value="en">{getTranslation('english', language)}</option>
                            </select>
                        </div>
                        
                        {/* Theme Selection */}
                        <div>
                            <label className="block font-semibold text-slate-700 mb-2">
                                {getTranslation('presentationTheme', language)}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {themeOptions.map(({ key, theme, nameKey }) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedThemeKey(key)}
                                        className={cn(
                                            "p-3 border rounded-lg text-left transition-all duration-200",
                                            selectedThemeKey === key
                                                ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50'
                                                : 'border-slate-300 bg-white hover:border-slate-400'
                                        )}
                                    >
                                        <div className="font-semibold text-sm mb-2">{getTranslation(nameKey, language)}</div>
                                        <div className="flex h-5 rounded overflow-hidden">
                                            <div className="w-1/4" style={{ backgroundColor: theme.background }}></div>
                                            <div className="w-1/4" style={{ backgroundColor: theme.accent }}></div>
                                            <div className="w-1/4" style={{ backgroundColor: theme.primaryText }}></div>
                                            <div className="w-1/4" style={{ backgroundColor: theme.secondaryText }}></div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleGeneratePresentation}
                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
                        >
                            {getTranslation('generatePresentation', language)}
                        </button>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                    <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 animate-spin mb-4"></div>
                    <p className="font-semibold text-slate-600 text-lg">{getTranslation('generatingPresentation', language)}</p>
                </div>
            )}

            {error && (
                <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-semibold mb-4">{getTranslation('presentationGenerationFailed', language)}</p>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <button
                        onClick={handleGeneratePresentation}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {getTranslation('retry', language)}
                    </button>
                </div>
            )}

            {slides.length > 0 && (
                <div>
                    <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                        <h3 className="text-xl font-bold text-slate-800">{getTranslation('presentationReady', language)}</h3>
                        <button
                            onClick={handleDownload}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {getTranslation('downloadPresentation', language)}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100 p-4 rounded-lg">
                        {slides.map((slide, index) => (
                            <div key={index} className="border bg-white rounded-lg shadow-md overflow-hidden">
                                <img src={slide} alt={`${getTranslation('presentationSlide', language)} ${index + 1}`} className="w-full h-auto" />
                                <p className="text-center p-2 font-semibold text-sm text-slate-600">
                                    {getTranslation('presentationSlide', language)} {index + 1}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step4Presentation;