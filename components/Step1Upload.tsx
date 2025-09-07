/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { ChangeEvent, useState } from 'react';
import { Language, getTranslation } from '../lib/i18n';

interface Step1UploadProps {
    onImageUpload: (imageUrl: string) => void;
    uploadedImage: string | null;
    language: Language;
}

const Step1Upload: React.FC<Step1UploadProps> = ({ onImageUpload, uploadedImage, language }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                onImageUpload(imageUrl);
                
                // Show analysis indicator
                setIsAnalyzing(true);
                setTimeout(() => setIsAnalyzing(false), 1500);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-slate-900">
                {getTranslation('step1Title', language)}
            </h2>
            <p className="text-center text-slate-500 mb-6 max-w-2xl mx-auto">
                {getTranslation('step1Description', language)}
            </p>
            
            <div className="flex flex-col items-center gap-6">
                <div className="w-full max-w-3xl border-2 border-dashed border-slate-300 rounded-lg p-4 bg-white">
                    {uploadedImage ? (
                        <img 
                            src={uploadedImage} 
                            alt="上傳的平面圖" 
                            className="w-full h-auto rounded-md max-h-[60vh] object-contain" 
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div className="w-full h-64 bg-slate-50 rounded-md flex flex-col items-center justify-center text-slate-400">
                            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <span className="text-lg font-medium">{getTranslation('uploadPlaceholder', language)}</span>
                        </div>
                    )}
                </div>
                
                <div>
                    <label 
                        htmlFor="file-upload" 
                        className="cursor-pointer bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        {uploadedImage ? getTranslation('reuploadButton', language) : getTranslation('uploadButton', language)}
                    </label>
                    <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                    />
                </div>
                
                {isAnalyzing && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                        <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-8 h-8 animate-spin" />
                        <span className="font-semibold text-blue-700">{getTranslation('analyzingIndicator', language)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Step1Upload;