/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { Language, getTranslation } from '../lib/i18n';

export interface SlideData {
    type: 'title' | 'concept' | 'viewpoint' | 'conclusion';
    index?: number; // viewpoint index
    slideIndex?: number; // index in the slide array
    content: {
        title?: string;
        description: string;
    };
}

interface EditSlideModalProps {
    isOpen: boolean;
    onClose: () => void;
    slideData: SlideData | null;
    onSave: (updatedData: SlideData) => void;
    language: Language;
}

const EditSlideModal: React.FC<EditSlideModalProps> = ({ isOpen, onClose, slideData, onSave, language }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (slideData) {
            setTitle(slideData.content.title || '');
            setDescription(slideData.content.description);
        }
    }, [slideData]);

    if (!isOpen || !slideData) return null;

    const handleSave = () => {
        onSave({
            ...slideData,
            content: {
                ...slideData.content,
                title: title || undefined,
                description: description,
            }
        });
        onClose();
    };
    
    const getLabels = () => {
        switch (slideData.type) {
            case 'title':
                return { titleLabel: '', descriptionLabel: getTranslation('title', language) };
            case 'concept':
                return { titleLabel: getTranslation('title', language), descriptionLabel: getTranslation('concept', language) };
            case 'viewpoint':
                return { titleLabel: getTranslation('title', language), descriptionLabel: getTranslation('description', language) };
            case 'conclusion':
                return { titleLabel: getTranslation('title', language), descriptionLabel: getTranslation('conclusion', language) };
            default:
                return { titleLabel: 'Title', descriptionLabel: 'Content' };
        }
    };

    const { titleLabel, descriptionLabel } = getLabels();
    const hasTitle = slideData.type === 'viewpoint' || slideData.type === 'conclusion';

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4 text-slate-800">{getTranslation('editSlideTitle', language)}</h2>
                
                <div className="space-y-4">
                    {hasTitle && (
                         <div>
                            <label htmlFor="slide-title" className="block text-sm font-medium text-slate-700">
                                {titleLabel}
                            </label>
                            <input
                                id="slide-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-slate-900"
                            />
                        </div>
                    )}
                   
                    <div>
                        <label htmlFor="slide-description" className="block text-sm font-medium text-slate-700">
                           {descriptionLabel}
                        </label>
                        <textarea
                            id="slide-description"
                            rows={slideData.type === 'concept' ? 10 : 6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-slate-900"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        {getTranslation('cancel', language)}
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {getTranslation('saveChanges', language)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditSlideModal;