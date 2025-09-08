/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, getTranslation } from '../lib/i18n';

interface AnimatedSlideshowProps {
    isOpen: boolean;
    slides: string[];
    onClose: () => void;
    language: Language;
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
    })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const AnimatedSlideshow: React.FC<AnimatedSlideshowProps> = ({ isOpen, slides, onClose, language }) => {
    const [[page, direction], setPage] = useState([0, 0]);

    const paginate = useCallback((newDirection: number) => {
        if (!slides || slides.length === 0) return;
        setPage(prevPage => {
            const newPageIndex = (prevPage[0] + newDirection + slides.length) % slides.length;
            return [newPageIndex, newDirection];
        });
    }, [slides.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                paginate(1);
            } else if (e.key === 'ArrowLeft') {
                paginate(-1);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, paginate, onClose]);

    useEffect(() => {
        if (isOpen) {
            setPage([0, 0]);
        }
    }, [isOpen]);
    
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center" role="dialog" aria-modal="true">
            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-16">
                 <AnimatePresence initial={false} custom={direction}>
                    <motion.img
                        key={page}
                        src={slides[page]}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);
                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1);
                            }
                        }}
                        className="absolute max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        alt={`Slide ${page + 1}`}
                    />
                </AnimatePresence>

                {/* Prev Button */}
                <button 
                    onClick={() => paginate(-1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors z-20"
                    aria-label="Previous slide"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {/* Next Button */}
                <button 
                    onClick={() => paginate(1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors z-20"
                    aria-label="Next slide"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            
            <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
                {slides.length > 0 && (
                    <span className="text-white text-lg font-mono bg-black/30 px-3 py-1 rounded-md">{page + 1} / {slides.length}</span>
                )}
                <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
                    aria-label={getTranslation('closeSlideshow', language)}
                >
                    {getTranslation('closeSlideshow', language)}
                </button>
            </div>
        </div>
    );
};

export default AnimatedSlideshow;
