/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Language, getTranslation } from '../lib/i18n';

interface LanguageSelectorProps {
    onLanguageSelect: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        {getTranslation('selectLanguage', 'zh')}
                    </h1>
                    <p className="text-slate-600">
                        Please select your preferred language
                    </p>
                </div>
                
                <div className="space-y-4">
                    <button
                        onClick={() => onLanguageSelect('zh')}
                        className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-3"
                    >
                        <span className="text-2xl">🇹🇼</span>
                        <span className="text-lg">{getTranslation('chinese', 'zh')}</span>
                    </button>
                    
                    <button
                        onClick={() => onLanguageSelect('en')}
                        className="w-full px-6 py-4 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors duration-200 flex items-center justify-center gap-3"
                    >
                        <span className="text-2xl">🇺🇸</span>
                        <span className="text-lg">{getTranslation('english', 'en')}</span>
                    </button>
                </div>
                
                <div className="mt-6 text-sm text-slate-500">
                    You can change language anytime in settings
                </div>
            </div>
        </div>
    );
};

export default LanguageSelector;