/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GeneratedScene } from '../components/Step3SceneGeneration';
import type { PresentationText } from '../services/geminiService';
import { Language, getTranslation } from './i18n';

const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;
const FONT_FAMILY = `'Roboto', 'Noto Sans TC', sans-serif`;

export interface ColorTheme {
    name: string;
    background: string;
    primaryText: string;
    secondaryText: string;
    accent: string;
    titleText: string;
    slideFooter: string;
}

export const themes: Record<string, ColorTheme> = {
    modernBlue: {
        name: 'Modern Blue',
        background: '#f9fafb',
        primaryText: '#1f2937',
        secondaryText: '#4b5563',
        accent: '#1e3a8a',
        titleText: '#111827',
        slideFooter: '#6b7280',
    },
    warmEarth: {
        name: 'Warm Earth',
        background: '#fdf6e3',
        primaryText: '#5d4037',
        secondaryText: '#795548',
        accent: '#c85a19',
        titleText: '#4e342e',
        slideFooter: '#a1887f',
    },
    minimalistGray: {
        name: 'Minimalist Gray',
        background: '#f8f9fa',
        primaryText: '#212529',
        secondaryText: '#495057',
        accent: '#343a40',
        titleText: '#000000',
        slideFooter: '#adb5bd',
    },
    boldTeal: {
        name: 'Bold Teal',
        background: '#f0f9ff',
        primaryText: '#334155',
        secondaryText: '#475569',
        accent: '#0d9488',
        titleText: '#1e293b',
        slideFooter: '#94a3b8',
    }
};


async function loadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const promises = urls.map(src => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(new Error(`Failed to load image: ${src.substring(0, 50)}...`));
            img.src = src;
        });
    });
    return Promise.all(promises);
}

function getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    if (!text) return lines;

    // Check for Chinese characters to determine wrapping strategy
    const hasChinese = /[\u4e00-\u9fa5]/.test(text);

    if (hasChinese) {
        // Character-by-character wrapping for Chinese and mixed content
        let currentLine = '';
        for (const char of text) {
            if (char === '\n') {
                lines.push(currentLine);
                currentLine = '';
                continue;
            }
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
    } else {
        // Word-based wrapping for English and other space-delimited languages
        const words = text.split(' ');
        let currentLine = '';
        for (const word of words) {
            if (!word) continue;
            const testLine = currentLine === '' ? word : `${currentLine} ${word}`;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
    }

    return lines;
}


function drawTextWithDynamicSize(
    ctx: CanvasRenderingContext2D,
    text: string,
    options: {
        x: number,
        y: number,
        maxWidth: number,
        maxHeight: number,
        initialFontSize: number,
        minFontSize: number,
        lineHeightRatio: number,
        weight: 'normal' | 'bold',
        align?: 'left' | 'center' | 'right',
        color: string
    }
) {
    let fontSize = options.initialFontSize;
    ctx.textAlign = options.align || 'left';
    ctx.fillStyle = options.color;

    while(fontSize >= options.minFontSize) {
        const font = `${options.weight} ${fontSize}px ${FONT_FAMILY}`;
        ctx.font = font;
        const lineHeight = fontSize * options.lineHeightRatio;
        const lines = getLines(ctx, text, options.maxWidth);
        const textHeight = lines.length * lineHeight;

        if (textHeight <= options.maxHeight) {
            // It fits, we can draw it
            lines.forEach((line, index) => {
                let x = options.x;
                if (options.align === 'center') {
                    x = options.x + options.maxWidth / 2;
                } else if (options.align === 'right') {
                    x = options.x + options.maxWidth;
                }
                ctx.fillText(line, x, options.y + (index * lineHeight));
            });
            return;
        }

        fontSize -= 2; // Reduce font size and try again
    }
    
    // If it still doesn't fit, draw it truncated (optional, for now we just draw at min size)
     const font = `${options.weight} ${options.minFontSize}px ${FONT_FAMILY}`;
     ctx.font = font;
     const lineHeight = options.minFontSize * options.lineHeightRatio;
     const lines = getLines(ctx, text, options.maxWidth);
     lines.forEach((line, index) => {
         const y = options.y + (index * lineHeight);
         if(y < options.y + options.maxHeight - lineHeight){
             let x = options.x;
                if (options.align === 'center') {
                    x = options.x + options.maxWidth / 2;
                } else if (options.align === 'right') {
                    x = options.x + options.maxWidth;
                }
             ctx.fillText(line, x, y);
         }
     });

}


function drawTitleSlide(ctx: CanvasRenderingContext2D, title: string, sceneImages: HTMLImageElement[], language: Language, theme: ColorTheme) {
    // 1. Draw image montage background
    const numImages = sceneImages.length;
    const cols = Math.ceil(Math.sqrt(numImages));
    const rows = Math.ceil(numImages / cols);
    const cellWidth = SLIDE_WIDTH / cols;
    const cellHeight = SLIDE_HEIGHT / rows;

    sceneImages.forEach((img, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = col * cellWidth;
        const y = row * cellHeight;

        const imgRatio = img.width / img.height;
        const cellRatio = cellWidth / cellHeight;
        let sx, sy, sWidth, sHeight;

        if (imgRatio > cellRatio) {
            sHeight = img.height;
            sWidth = sHeight * cellRatio;
            sx = (img.width - sWidth) / 2;
            sy = 0;
        } else {
            sWidth = img.width;
            sHeight = sWidth / cellRatio;
            sx = 0;
            sy = (img.height - sHeight) / 2;
        }
        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, cellWidth, cellHeight);
    });

    // 2. Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

    // 3. Draw Text
    // Title
    drawTextWithDynamicSize(ctx, title, {
        x: 200, y: SLIDE_HEIGHT / 2 - 150,
        maxWidth: SLIDE_WIDTH - 400, maxHeight: 300,
        initialFontSize: 96, minFontSize: 48,
        lineHeightRatio: 1.15,
        weight: 'bold', color: '#ffffff', align: 'center'
    });
    
    // Subtitle
    ctx.font = `60px ${FONT_FAMILY}`;
    ctx.fillStyle = '#e5e7eb';
    ctx.textAlign = 'center';
    ctx.fillText(getTranslation('slideSubtitle', language), SLIDE_WIDTH / 2, SLIDE_HEIGHT / 2 + 100);

    // Footer
    ctx.font = `32px ${FONT_FAMILY}`;
    ctx.fillStyle = theme.slideFooter;
    ctx.fillText(getTranslation('slideFooter', language), SLIDE_WIDTH / 2, SLIDE_HEIGHT - 80);
}

function drawConceptSlide(ctx: CanvasRenderingContext2D, planImage: HTMLImageElement, concepts: string[], language: Language, theme: ColorTheme) {
    // Background
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

    // Title
    ctx.fillStyle = theme.titleText;
    ctx.textAlign = 'left';
    ctx.font = `bold 72px ${FONT_FAMILY}`;
    ctx.fillText(getTranslation('slideConceptsTitle', language), 100, 150);

    // Draw Floor Plan Image
    const imageAspectRatio = planImage.width / planImage.height;
    const imageMaxWidth = SLIDE_WIDTH / 2 - 150;
    const imageMaxHeight = SLIDE_HEIGHT - 300;
    let imgW = imageMaxWidth;
    let imgH = imgW / imageAspectRatio;
    if (imgH > imageMaxHeight) {
        imgH = imageMaxHeight;
        imgW = imgH * imageAspectRatio;
    }
    const imgX = SLIDE_WIDTH - imgW - 100;
    const imgY = (SLIDE_HEIGHT - imgH) / 2 + 50;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    ctx.drawImage(planImage, imgX, imgY, imgW, imgH);
    ctx.restore();

    // Draw Concepts
    const availableHeight = SLIDE_HEIGHT - 350;
    const conceptSpacing = availableHeight / Math.max(1, concepts.length);
    let conceptY = 280;

    concepts.forEach((concept) => {
        const parts = concept.split(':');
        const conceptTitle = parts[0] + ':';
        const conceptDesc = parts.slice(1).join(':').trim();

        drawTextWithDynamicSize(ctx, conceptTitle, {
            x: 120, y: conceptY,
            maxWidth: 650, maxHeight: conceptSpacing * 0.4,
            initialFontSize: 48, minFontSize: 24,
            lineHeightRatio: 1.2,
            weight: 'bold', color: theme.accent
        });
        
        drawTextWithDynamicSize(ctx, conceptDesc, {
            x: 120, y: conceptY + 65,
            maxWidth: 650, maxHeight: conceptSpacing * 0.5,
            initialFontSize: 36, minFontSize: 20,
            lineHeightRatio: 1.4,
            weight: 'normal', color: theme.secondaryText
        });

        conceptY += conceptSpacing;
    });
}


function drawViewpointSlide(ctx: CanvasRenderingContext2D, sceneImage: HTMLImageElement, title: string, description: string, theme: ColorTheme) {
    // Background - use image as full bleed background
    const imageAspectRatio = sceneImage.width / sceneImage.height;
    const slideAspectRatio = SLIDE_WIDTH / SLIDE_HEIGHT;
    let sx = 0, sy = 0, sWidth = sceneImage.width, sHeight = sceneImage.height;

    if (imageAspectRatio > slideAspectRatio) {
        sWidth = sceneImage.height * slideAspectRatio;
        sx = (sceneImage.width - sWidth) / 2;
    } else {
        sHeight = sceneImage.width / slideAspectRatio;
        sy = (sceneImage.height - sHeight) / 2;
    }
    ctx.drawImage(sceneImage, sx, sy, sWidth, sHeight, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

    // Text Overlay Box
    const boxHeight = 400;
    const gradient = ctx.createLinearGradient(0, SLIDE_HEIGHT - boxHeight, 0, SLIDE_HEIGHT);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, SLIDE_HEIGHT - boxHeight, SLIDE_WIDTH, boxHeight);

    // Text
    drawTextWithDynamicSize(ctx, title, {
        x: 80, y: SLIDE_HEIGHT - 300,
        maxWidth: SLIDE_WIDTH - 160, maxHeight: 120,
        initialFontSize: 72, minFontSize: 36,
        lineHeightRatio: 1.2,
        weight: 'bold', color: '#ffffff'
    });

    drawTextWithDynamicSize(ctx, description, {
        x: 80, y: SLIDE_HEIGHT - 180,
        maxWidth: SLIDE_WIDTH - 160, maxHeight: 150,
        initialFontSize: 40, minFontSize: 24,
        lineHeightRatio: 1.4,
        weight: 'normal', color: '#e5e7eb'
    });
}


function drawConclusionSlide(ctx: CanvasRenderingContext2D, conclusionImage: HTMLImageElement, conclusion: string, language: Language, theme: ColorTheme) {
    // Draw background image on the left half
    const imageWidth = SLIDE_WIDTH * 0.55;
    const imageAspectRatio = conclusionImage.width / conclusionImage.height;
    const slideHeightAspectRatio = imageWidth / SLIDE_HEIGHT;
    let sx = 0, sy = 0, sWidth = conclusionImage.width, sHeight = conclusionImage.height;
    if (imageAspectRatio > slideHeightAspectRatio) {
        sWidth = conclusionImage.height * slideHeightAspectRatio;
        sx = (conclusionImage.width - sWidth) / 2;
    } else {
        sHeight = conclusionImage.width / slideHeightAspectRatio;
        sy = (conclusionImage.height - sHeight) / 2;
    }
    ctx.drawImage(conclusionImage, sx, sy, sWidth, sHeight, 0, 0, imageWidth, SLIDE_HEIGHT);

    // Draw colored panel on the right half
    ctx.fillStyle = theme.background;
    ctx.fillRect(imageWidth, 0, SLIDE_WIDTH - imageWidth, SLIDE_HEIGHT);
    
    // Draw content on the right panel
    const textX = imageWidth + 80;
    const textMaxWidth = SLIDE_WIDTH - imageWidth - 160;

    // Title
    ctx.fillStyle = theme.accent;
    ctx.textAlign = 'left';
    ctx.font = `bold 96px ${FONT_FAMILY}`;
    ctx.fillText(getTranslation('slideConclusionTitle', language), textX, 250);

    // Text
    drawTextWithDynamicSize(ctx, conclusion, {
        x: textX, y: 420,
        maxWidth: textMaxWidth, maxHeight: SLIDE_HEIGHT - 550,
        initialFontSize: 42, minFontSize: 24,
        lineHeightRatio: 1.6,
        weight: 'normal', color: theme.primaryText
    });
}

export async function createPresentationSlides(
    planImageSrc: string,
    scenes: GeneratedScene[],
    text: PresentationText,
    language: Language,
    theme: ColorTheme
): Promise<string[]> {
    const imageUrls = [planImageSrc, ...scenes.map(s => s.url)];
    const [planImage, ...sceneImages] = await loadImages(imageUrls);

    const slides: string[] = [];

    const createCanvas = () => {
        const canvas = document.createElement('canvas');
        canvas.width = SLIDE_WIDTH;
        canvas.height = SLIDE_HEIGHT;
        return canvas;
    };

    // Slide 1: Title
    let canvas = createCanvas();
    let ctx = canvas.getContext('2d')!;
    drawTitleSlide(ctx, text.presentationTitle, sceneImages, language, theme);
    slides.push(canvas.toDataURL('image/png'));
    
    // Slide 2: Concepts
    canvas = createCanvas();
    ctx = canvas.getContext('2d')!;
    drawConceptSlide(ctx, planImage, text.mainConcepts, language, theme);
    slides.push(canvas.toDataURL('image/png'));

    // Slides 3+: Viewpoints
    scenes.forEach((scene, index) => {
        canvas = createCanvas();
        ctx = canvas.getContext('2d')!;
        const details = text.viewpointDetails[index] || { title: `Viewpoint ${scene.viewIndex}`, description: "This viewpoint showcases the blend of functionality and style." };
        drawViewpointSlide(ctx, sceneImages[index], details.title, details.description, theme);
        slides.push(canvas.toDataURL('image/png'));
    });

    // Final Slide: Conclusion
    canvas = createCanvas();
    ctx = canvas.getContext('2d')!;
    const conclusionImage = sceneImages[0] || planImage;
    drawConclusionSlide(ctx, conclusionImage, text.conclusion, language, theme);
    slides.push(canvas.toDataURL('image/png'));

    return slides;
}