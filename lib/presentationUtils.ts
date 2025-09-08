/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { PresentationText } from '../services/geminiService';
import { GeneratedScene } from '../components/Step3SceneGeneration';
import { Language, getTranslation } from './i18n';

type ColorThemeNameKey = 'themeModernBlue' | 'themeEarthTones' | 'themeMinimalistGray' | 'themeVibrantCreative' | 'themeElegantNoir' | 'themeSakuraPink';

export interface ColorTheme {
    nameKey: ColorThemeNameKey;
    colors: {
        background: string;
        primaryText: string;
        secondaryText: string;
        accent: string;
        titleBackground: string;
    };
}

export const themes: ColorTheme[] = [
    {
        nameKey: 'themeModernBlue',
        colors: { background: '#FFFFFF', primaryText: '#1E3A8A', secondaryText: '#475569', accent: '#3B82F6', titleBackground: 'rgba(255, 255, 255, 0.7)' }
    },
    {
        nameKey: 'themeEarthTones',
        colors: { background: '#FBF9F6', primaryText: '#5D4037', secondaryText: '#795548', accent: '#A1887F', titleBackground: 'rgba(255, 255, 255, 0.7)' }
    },
    {
        nameKey: 'themeMinimalistGray',
        colors: { background: '#F3F4F6', primaryText: '#111827', secondaryText: '#4B5563', accent: '#6B7280', titleBackground: 'rgba(255, 255, 255, 0.7)' }
    },
    {
        nameKey: 'themeVibrantCreative',
        colors: { background: '#FFFBEB', primaryText: '#854D0E', secondaryText: '#B45309', accent: '#F59E0B', titleBackground: 'rgba(255, 255, 255, 0.7)' }
    },
    {
        nameKey: 'themeElegantNoir',
        colors: { background: '#212121', primaryText: '#FFFFFF', secondaryText: '#BDBDBD', accent: '#D4AF37', titleBackground: 'rgba(0, 0, 0, 0.6)' }
    },
    {
        nameKey: 'themeSakuraPink',
        colors: { background: '#FFF5F7', primaryText: '#5B21B6', secondaryText: '#4A044E', accent: '#F472B6', titleBackground: 'rgba(255, 255, 255, 0.7)' }
    }
];

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const PADDING = 80;

// Banner layout constants
const BANNER_Y = CANVAS_HEIGHT * 0.6;
const BANNER_HEIGHT = CANVAS_HEIGHT * 0.4;
const BANNER_PADDING = PADDING * 1.5;


function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Wraps text to fit a specified width, handling explicit newlines and different languages.
 * @param ctx The canvas rendering context.
 * @param text The text to wrap.
 * @param maxWidth The maximum width for a line.
 * @returns An array of strings, where each string is a line of wrapped text.
 */
function getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const finalLines: string[] = [];
    if (!text) return finalLines;

    const paragraphs = text.split('\n');
    const hasChinese = /[\u4E00-\u9FA5]/.test(text);

    for (const paragraph of paragraphs) {
        if (paragraph === '') {
            finalLines.push('');
            continue;
        }

        if (hasChinese) {
            let currentLine = '';
            for (const char of paragraph) {
                const testLine = currentLine + char;
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && currentLine !== '') {
                    finalLines.push(currentLine);
                    currentLine = char;
                } else {
                    currentLine = testLine;
                }
            }
            finalLines.push(currentLine);
        } else { // Word-based wrapping for English and other languages
            const words = paragraph.split(' ');
            let currentLine = '';
            for (const word of words) {
                const testLine = currentLine === '' ? word : `${currentLine} ${word}`;
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && currentLine !== '') {
                    finalLines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            finalLines.push(currentLine);
        }
    }
    return finalLines;
}


/**
 * Draws text on the canvas, automatically adjusting font size to fit within a bounding box.
 */
function drawTextWithAutoSize(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number, y: number,
    maxWidth: number, maxHeight: number,
    baseFont: string, lineHeight: number, align: 'left' | 'center' | 'right' = 'left'
) {
    let fontSize = parseInt(baseFont.match(/(\d+)px/)?.[1] || '60', 10);
    const baseFontSize = fontSize;
    
    while (fontSize > 10) {
        ctx.font = baseFont.replace(/\d+px/, `${fontSize}px`);
        const currentLineHeight = lineHeight * (fontSize / baseFontSize);
        const lines = getLines(ctx, text, maxWidth);
        const totalHeight = lines.length * currentLineHeight;
        
        if (totalHeight <= maxHeight) {
            let startY = y;
            for (const line of lines) {
                let startX = x;
                if (align === 'center') {
                    startX = x + (maxWidth - ctx.measureText(line).width) / 2;
                } else if (align === 'right') {
                    startX = x + (maxWidth - ctx.measureText(line).width);
                }
                ctx.fillText(line, startX, startY);
                startY += currentLineHeight;
            }
            return;
        }
        fontSize -= 2; // Decrease font size and try again
    }
    
    // If it still doesn't fit, draw with the smallest font size and truncate
    ctx.font = baseFont.replace(/\d+px/, `${fontSize}px`);
    const finalLineHeight = lineHeight * (fontSize / baseFontSize);
    let startY = y;
    const lines = getLines(ctx, text, maxWidth);
    for (const line of lines) {
        let startX = x;
         if (align === 'center') {
            startX = x + (maxWidth - ctx.measureText(line).width) / 2;
        } else if (align === 'right') {
            startX = x + (maxWidth - ctx.measureText(line).width);
        }
        ctx.fillText(line, startX, startY);
        startY += finalLineHeight;
        if (startY > y + maxHeight - finalLineHeight) break; // Stop if exceeding max height
    }
}

/**
 * Draws an image to fill the entire canvas, cropping as needed while preserving aspect ratio.
 */
function drawFullBleedImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
    const sWidth = image.naturalWidth;
    const sHeight = image.naturalHeight;
    const sAspect = sWidth / sHeight;
    const dAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
    let sx, sy, sw, sh;

    if (sAspect > dAspect) { // source is wider, crop sides
        sh = sHeight;
        sw = sh * dAspect;
        sx = (sWidth - sw) / 2;
        sy = 0;
    } else { // source is taller or same, crop top/bottom
        sw = sWidth;
        sh = sw / dAspect;
        sx = 0;
        sy = (sHeight - sh) / 2;
    }
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}


async function drawTitleSlide(ctx: CanvasRenderingContext2D, text: PresentationText, style: string, theme: ColorTheme, scenes: GeneratedScene[]) {
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (scenes.length > 0) {
        const image = await loadImage(scenes[0].url);
        drawFullBleedImage(ctx, image);
    }
    
    ctx.fillStyle = theme.colors.titleBackground;
    ctx.fillRect(0, BANNER_Y, CANVAS_WIDTH, BANNER_HEIGHT);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillStyle = theme.colors.primaryText;
    const title = text.presentationTitle;
    const titleFont = `bold 100px sans-serif`;
    drawTextWithAutoSize(ctx, title, CANVAS_WIDTH / 2, BANNER_Y + BANNER_HEIGHT / 2, CANVAS_WIDTH - BANNER_PADDING * 2, 220, titleFont, 120, 'center');
}


async function drawConceptSlide(ctx: CanvasRenderingContext2D, text: PresentationText, planImageSrc: string, theme: ColorTheme) {
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const planImage = await loadImage(planImageSrc);
    drawFullBleedImage(ctx, planImage);

    ctx.fillStyle = theme.colors.titleBackground;
    ctx.fillRect(0, BANNER_Y, CANVAS_WIDTH, BANNER_HEIGHT);

    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    const concepts = text.mainConcepts.join('\n\n');
    const conceptsFont = '48px sans-serif';
    ctx.fillStyle = theme.colors.secondaryText;
    drawTextWithAutoSize(ctx, concepts, BANNER_PADDING, BANNER_Y + PADDING, CANVAS_WIDTH - BANNER_PADDING * 2, BANNER_HEIGHT - PADDING * 2, conceptsFont, 65, 'left');
}


async function drawViewpointSlide(ctx: CanvasRenderingContext2D, scene: GeneratedScene, detail: PresentationText['viewpointDetails'][0], theme: ColorTheme) {
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const image = await loadImage(scene.url);
    drawFullBleedImage(ctx, image);
    
    ctx.fillStyle = theme.colors.titleBackground;
    ctx.fillRect(0, BANNER_Y, CANVAS_WIDTH, BANNER_HEIGHT);
    
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    
    ctx.fillStyle = theme.colors.primaryText;
    const titleText = detail.title;
    const titleFont = 'bold 70px sans-serif';
    drawTextWithAutoSize(ctx, titleText, BANNER_PADDING, BANNER_Y + PADDING, CANVAS_WIDTH - BANNER_PADDING * 2, 120, titleFont, 80, 'left');

    ctx.fillStyle = theme.colors.secondaryText;
    const descFont = '40px sans-serif';
    drawTextWithAutoSize(ctx, detail.description, BANNER_PADDING, BANNER_Y + PADDING + 120, CANVAS_WIDTH - BANNER_PADDING * 2, BANNER_HEIGHT - PADDING * 2 - 120, descFont, 50, 'left');
}


async function drawConclusionSlide(ctx: CanvasRenderingContext2D, text: PresentationText, scenes: GeneratedScene[], theme: ColorTheme) {
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (scenes.length > 0) {
        const image = await loadImage(scenes[scenes.length - 1].url);
        drawFullBleedImage(ctx, image);
    }
    
    ctx.fillStyle = theme.colors.titleBackground;
    ctx.fillRect(0, BANNER_Y, CANVAS_WIDTH, BANNER_HEIGHT);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillStyle = theme.colors.primaryText;
    ctx.font = 'bold 80px sans-serif';
    ctx.fillText(text.conclusionTitle, CANVAS_WIDTH / 2, BANNER_Y + BANNER_HEIGHT / 2 - 80);

    ctx.fillStyle = theme.colors.secondaryText;
    const conclusionFont = '48px sans-serif';
    drawTextWithAutoSize(ctx, text.conclusion, CANVAS_WIDTH / 2, BANNER_Y + BANNER_HEIGHT / 2 + 40, CANVAS_WIDTH - BANNER_PADDING * 2, 200, conclusionFont, 60, 'center');
}


export async function generateSlides(
    text: PresentationText,
    scenes: GeneratedScene[],
    planImage: string,
    style: string,
    language: Language,
    theme: ColorTheme
): Promise<string[]> {
    const slideGenerators = [
        (ctx: CanvasRenderingContext2D) => drawTitleSlide(ctx, text, style, theme, scenes),
        (ctx: CanvasRenderingContext2D) => drawConceptSlide(ctx, text, planImage, theme),
        ...scenes.map((scene, i) => (ctx: CanvasRenderingContext2D) => drawViewpointSlide(ctx, scene, text.viewpointDetails[i], theme)),
        (ctx: CanvasRenderingContext2D) => drawConclusionSlide(ctx, text, scenes, theme),
    ];

    const dataUrls: string[] = [];

    for (const generate of slideGenerators) {
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create canvas context');
        
        await generate(ctx);
        dataUrls.push(canvas.toDataURL('image/png'));
    }

    return dataUrls;
}