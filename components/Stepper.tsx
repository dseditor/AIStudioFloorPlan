/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
// FIX: Corrected import path for i18n module.
import { Language, getTranslation } from '../lib/i18n';

interface StepperProps {
    currentStep: number;
    maxStep: number;
    language: Language;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, maxStep, language }) => {
    const steps = [
        { id: 1, labelKey: 'stepUpload' as const },
        { id: 2, labelKey: 'stepRendering' as const },
        { id: 3, labelKey: 'stepGeneration' as const },
        { id: 4, labelKey: 'step4SceneEditing' as const },
        { id: 5, labelKey: 'step5Presentation' as const }
    ];

    return (
        <div className="flex items-center justify-center mb-8 md:mb-12">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex items-center">
                        <div 
                            className={`
                                w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300
                                ${step.id === currentStep 
                                    ? 'bg-blue-700 text-white border-blue-700' 
                                    : step.id < currentStep 
                                        ? 'bg-green-600 text-white border-green-600' 
                                        : 'border-slate-300 text-slate-500'
                                }
                            `}
                        >
                            {step.id}
                        </div>
                        <span className={`ml-2 font-semibold hidden md:inline ${step.id <= currentStep ? 'text-slate-900' : 'text-slate-500'}`}>
                            {getTranslation(step.labelKey, language)}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div 
                            className={`
                                h-0.5 flex-grow mx-4 transition-all duration-300
                                ${step.id < currentStep ? 'bg-blue-700' : 'bg-slate-300'}
                            `}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Stepper;