/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse, Part } from "@google/genai";
import { GeneratedScene } from '../components/Step3SceneGeneration';
import { Language } from "../lib/i18n";


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });


// --- Helper Functions ---

/**
 * Creates a fallback prompt to use when the primary one is blocked.
 * @param decade The decade string (e.g., "1950s").
 * @returns The fallback prompt string.
 */
function getFallbackPrompt(decade: string): string {
    return `Create a photograph of the person in this image as if they were living in the ${decade}. The photograph should capture the distinct fashion, hairstyles, and overall atmosphere of that time period. Ensure the final image is a clear photograph that looks authentic to the era.`;
}

/**
 * Extracts the decade (e.g., "1950s") from a prompt string.
 * @param prompt The original prompt.
 * @returns The decade string or null if not found.
 */
function extractDecade(prompt: string): string | null {
    const match = prompt.match(/(\d{4}s)/);
    return match ? match[1] : null;
}

/**
 * Processes the Gemini API response, extracting the image or throwing an error if none is found.
 * @param response The response from the generateContent call.
 * @returns A data URL string for the generated image.
 */
function processGeminiResponse(response: GenerateContentResponse): string {
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    const textResponse = response.text;
    console.error("API did not return an image. Response:", textResponse);
    throw new Error(`The AI model responded with text instead of an image: "${textResponse || 'No text response received.'}"`);
}

/**
 * A wrapper for the Gemini API call that includes a retry mechanism for internal server errors.
 * @param imagePart The image part of the request payload.
 * @param textPart The text part of the request payload.
 * @returns The GenerateContentResponse from the API.
 */
async function callGeminiWithRetry(imagePart: object, textPart: object): Promise<GenerateContentResponse> {
    const maxRetries = 3;
    const initialDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [imagePart, textPart] },
            });
        } catch (error) {
            console.error(`Error calling Gemini API (Attempt ${attempt}/${maxRetries}):`, error);
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            const isInternalError = errorMessage.includes('"code":500') || errorMessage.includes('INTERNAL');

            if (isInternalError && attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                console.log(`Internal error detected. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error; // Re-throw if not a retriable error or if max retries are reached.
        }
    }
    // This should be unreachable due to the loop and throw logic above.
    throw new Error("Gemini API call failed after all retries.");
}


/**
 * Converts an image source to base64 format
 * @param src The image source (data URL or blob URL)
 * @returns Promise resolving to base64 string
 */
export async function imageSrcToBase64(src: string): Promise<string> {
    // If it's already a data URL, extract the base64 part
    const match = src.match(/^data:image\/\w+;base64,(.*)$/);
    if (match) {
        return match[1];
    }

    try {
        const response = await fetch(src);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error converting image to base64:", error);
        throw error;
    }
}

/**
 * Generates prompt variations to ensure different results
 * @param basePrompt The base prompt
 * @returns Modified prompt with variation
 */
function generatePromptVariations(basePrompt: string): string {
    const variations = [
        '',  // Original
        '. Please generate a unique result.',
        '; make it distinctive.',
        '! Create something fresh.',
        ' - ensure originality.',
        '? Make it stand out.',
        ': focus on uniqueness.'
    ];
    const randomVariation = variations[Math.floor(Math.random() * variations.length)];
    const timestamp = Date.now();
    return basePrompt + randomVariation + ` [${timestamp}]`;
}

/**
 * Generates an architectural image with AI
 * @param parts The parts array for the request
 * @returns Promise resolving to data URL of generated image
 */
export async function generateArchitecturalImage(parts: any[]): Promise<string> {
    const maxAttempts = 7;
    let attempts = 0;
    
    const payload = { 
        contents: { parts }, 
        config: { 
            responseModalities: ['IMAGE'],
            temperature: 0.3,
            topP: 0.7,
        },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
    };
    
    while(attempts < maxAttempts) {
        try {
            console.log(`Architectural image generation attempt ${attempts + 1}/${maxAttempts}`);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                ...payload
            });
            
            // Check for blocked content
            if (response.candidates?.[0]?.finishReason === 'SAFETY') {
                throw new Error('Content was blocked by safety filters');
            }
            
            const imagePart = response?.candidates?.[0]?.content?.parts?.find(p => (p as any).inlineData);
            if (imagePart && (imagePart as any).inlineData?.data) {
                console.log('Architectural image generation successful');
                return `data:image/png;base64,${(imagePart as any).inlineData.data}`;
            }
            
            throw new Error("API response did not contain image data");
        } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, error);
            
            if (attempts >= maxAttempts) {
                console.error('All attempts failed, throwing error');
                throw new Error(`Architectural image generation failed after ${maxAttempts} attempts. Last error: ${error instanceof Error ? error.message : String(error)}`);
            }
            
            // Progressive backoff: 2s, 4s, 8s, 16s, 32s, 64s
            const backoffTime = Math.min(Math.pow(2, attempts) * 1000, 60000);
            console.log(`Waiting ${backoffTime/1000}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
    }
    
    throw new Error('Architectural image generation failed after all attempts');
}

/**
 * Generates AI rendering of floor plan
 * @param baseImageSrc Source image URL or data URL
 * @param promptOverride Optional prompt override
 * @param maskBase64 Optional mask for editing specific areas
 * @returns Promise resolving to generated image data URL
 */
export async function generateAIRendering(baseImageSrc: string, promptOverride?: string, maskBase64?: string): Promise<string> {
    const baseImage64 = await imageSrcToBase64(baseImageSrc);
    
    let parts;
    if(maskBase64) {
        const maskPrompt = generatePromptVariations(`Using the provided red mask overlay, make precise modifications to ONLY the marked areas according to these instructions: ${promptOverride}

MASK EDITING REQUIREMENTS:
- Modify EXCLUSIVELY the areas covered by the red mask
- Maintain exact boundaries - do not affect unmarked areas
- Blend seamlessly with surrounding unchanged regions
- Preserve architectural accuracy and proportions

QUALITY STANDARDS:
- Keep the same lighting conditions as the base image
- Match the overall style and material quality
- Ensure realistic transitions and connections
- Maintain professional architectural visualization standards

IMPORTANT: Generate a high-quality image with precise mask-based modifications only.`);
        parts = [
            { text: maskPrompt },
            { inlineData: { mimeType: 'image/png', data: baseImage64 } },
            { inlineData: { mimeType: 'image/png', data: maskBase64 } }
        ];
    } else {
        parts = [
            { text: generatePromptVariations(promptOverride || `Transform this 2D architectural floor plan into a precise, high-quality 3D rendered top-down view with the following requirements:

CLEANING REQUIREMENTS:
- COMPLETELY REMOVE all text, Chinese characters, numbers, dimension markings, labels, room names, symbols, and human figures
- Remove all annotations, measurements, and written descriptions
- Eliminate any logos, watermarks, or copyright notices

ARCHITECTURAL PRECISION:
- Maintain exact wall positions, thicknesses, and openings from the original plan
- Preserve accurate door and window locations and sizes
- Keep precise room proportions and spatial relationships
- Maintain correct corridor widths and ceiling heights where indicated

VISUAL ENHANCEMENT:
- Add realistic architectural materials (concrete walls, tile/wood flooring, proper ceiling finishes)
- Apply appropriate lighting with natural shadows
- Use neutral, professional color palette
- Ensure clean, crisp edges and professional presentation

IMPORTANT: Generate a clean, professional architectural visualization that accurately represents the spatial layout while removing all textual elements.`) },
            { inlineData: { mimeType: 'image/jpeg', data: baseImage64 } }
        ];
    }

    return await generateArchitecturalImage(parts);
}

/**
 * Generates interior scene from viewpoint
 * @param planImageSrc The floor plan image source
 * @param pointX X coordinate of viewpoint
 * @param pointY Y coordinate of viewpoint  
 * @param style Interior design style
 * @param viewIndex Index of the viewpoint (1-4)
 * @param camera Camera parameters for view angle
 * @param lighting Description of the lighting conditions
 * @param materialRealism Description of the desired material quality
 * @returns Promise resolving to generated scene image data URL
 */
export async function generateInteriorScene(
    planImageSrc: string,
    pointX: number,
    pointY: number,
    style: string,
    viewIndex: number,
    camera: { rotation: number; tilt: number; zoom: number; },
    lighting: string,
    materialRealism: string
): Promise<string> {
    // Create a temporary canvas to draw the base image and enhanced viewpoint marker
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = planImageSrc;
    });
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const radius = 25;

    // Draw simple viewpoint marker
    ctx.beginPath();
    ctx.arc(pointX, pointY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Add viewpoint number
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(viewIndex.toString(), pointX, pointY);

    const imageWithPointBase64 = canvas.toDataURL().split(',')[1];
    
    let cameraInstructions = '';
    if (camera) {
        if (camera.rotation !== 0) {
            const direction = camera.rotation > 0 ? 'right' : 'left';
            cameraInstructions += ` The camera is panned ${Math.abs(camera.rotation)} degrees to the ${direction}.`;
        }

        if (camera.tilt !== 0) {
            const direction = camera.tilt > 0 ? 'upwards' : 'downwards';
            cameraInstructions += ` The camera is tilted ${Math.abs(camera.tilt)} degrees ${direction}.`;
        }

        if (camera.zoom > 1) {
            cameraInstructions += ` The view is zoomed in.`;
        } else if (camera.zoom < 1) {
            cameraInstructions += ` The view is zoomed out for a wider angle.`;
        }
    }
    
    const promptDetails = [
        `Generate a ${materialRealism} FIRST-PERSON VIEW interior photograph from the perspective of viewpoint ${viewIndex} on the attached floor plan.`,
        `STYLE & ATMOSPHERE: The interior design style is "${style}".`,
        `LIGHTING: The scene is illuminated by ${lighting}. Render realistic shadows, reflections, and highlights corresponding to this light source.`,
        `CAMERA VIEW: The camera is at human eye-level (approximately 1.6 meters high).${cameraInstructions || ' The camera is at a neutral, forward-facing position.'}`,
        'COMPOSITION: Create a complete and believable indoor scene with walls, ceiling, floor, furniture, and decor that fit the specified style. The layout must be consistent with the floor plan.',
        `CRITICAL INSTRUCTIONS: The output MUST be a ground-level, horizontal photograph from inside the room. ABSOLUTELY DO NOT generate aerial, top-down, or bird's-eye perspectives. The image must look like it was taken by a person standing at viewpoint ${viewIndex}.`
    ];
    
    const basePrompt = promptDetails.join(' ');
    const prompt = generatePromptVariations(basePrompt);
    
    const parts = [
        { text: prompt },
        { inlineData: { mimeType: 'image/png', data: imageWithPointBase64 } }
    ];
    
    console.log(`Generating scene ${viewIndex} with prompt: ${prompt}`);
    return await generateArchitecturalImage(parts);
}

/**
 * Generates a decade-styled image from a source image and a prompt.
 * It includes a fallback mechanism for prompts that might be blocked in certain regions.
 * @param imageDataUrl A data URL string of the source image (e.g., 'data:image/png;base64,...').
 * @param prompt The prompt to guide the image generation.
 * @returns A promise that resolves to a base64-encoded image data URL of the generated image.
 */
export async function generateDecadeImage(imageDataUrl: string, prompt: string): Promise<string> {
  const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
  }
  const [, mimeType, base64Data] = match;

    const imagePart = {
        inlineData: { mimeType, data: base64Data },
    };

    // --- First attempt with the original prompt ---
    try {
        console.log("Attempting generation with original prompt...");
        const textPart = { text: prompt };
        const response = await callGeminiWithRetry(imagePart, textPart);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        const isNoImageError = errorMessage.includes("The AI model responded with text instead of an image");

        if (isNoImageError) {
            console.warn("Original prompt was likely blocked. Trying a fallback prompt.");
            const decade = extractDecade(prompt);
            if (!decade) {
                console.error("Could not extract decade from prompt, cannot use fallback.");
                throw error; // Re-throw the original "no image" error.
            }

            // --- Second attempt with the fallback prompt ---
            try {
                const fallbackPrompt = getFallbackPrompt(decade);
                console.log(`Attempting generation with fallback prompt for ${decade}...`);
                const fallbackTextPart = { text: fallbackPrompt };
                const fallbackResponse = await callGeminiWithRetry(imagePart, fallbackTextPart);
                return processGeminiResponse(fallbackResponse);
            } catch (fallbackError) {
                console.error("Fallback prompt also failed.", fallbackError);
                const finalErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
                throw new Error(`The AI model failed with both original and fallback prompts. Last error: ${finalErrorMessage}`);
            }
        } else {
            // This is for other errors, like a final internal server error after retries.
            console.error("An unrecoverable error occurred during image generation.", error);
            throw new Error(`The AI model failed to generate an image. Details: ${errorMessage}`);
        }
    }
}

/**
 * Generates an interior design style suggestion based on a floor plan.
 * @param planImageSrc The floor plan image source.
 * @returns A promise that resolves to a suggested style string.
 */
export async function suggestInteriorStyle(planImageSrc: string): Promise<string> {
    try {
        const baseImage64 = await imageSrcToBase64(planImageSrc);
        const imagePart = {
            inlineData: { mimeType: 'image/jpeg', data: baseImage64 }
        };

        const prompt = `Analyze this architectural floor plan. Based on the layout, room sizes, and potential flow, suggest a single, concise interior design style that would be suitable. Provide only the name of the style (e.g., "Modern Minimalist", "Scandinavian", "Industrial Loft", "Bohemian Chic"). Do not add any other explanatory text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [ { text: prompt }, imagePart ] },
        });

        const suggestedStyle = response.text.trim();
        if (!suggestedStyle) {
            throw new Error("AI did not return a style suggestion.");
        }
        
        return suggestedStyle.split('\n')[0];

    } catch (error) {
        console.error("Error suggesting interior style:", error);
        throw new Error(`Failed to get style suggestion from AI. ${error instanceof Error ? error.message : String(error)}`);
    }
}


export interface PresentationText {
    presentationTitle: string;
    mainConcepts: string[];
    viewpointDetails: {
        title: string;
        description: string;
    }[];
    conclusion: string;
}

/**
 * Generates text content for a design presentation.
 * @param planImageSrc The source of the floor plan image.
 * @param scenes An array of generated scene objects.
 * @param style The interior design style.
 * @param language The target language for the output.
 * @returns A promise that resolves to an object containing the generated text.
 */
export async function generatePresentationText(
    planImageSrc: string,
    scenes: GeneratedScene[],
    style: string,
    language: Language
): Promise<PresentationText> {
    try {
        const planImageBase64 = await imageSrcToBase64(planImageSrc);
        const sceneImagePromises = scenes
            .filter(scene => scene.url)
            .map(scene => imageSrcToBase64(scene.url));
        const sceneImagesBase64 = await Promise.all(sceneImagePromises);
        
        const languageInstruction = language === 'zh' ? 'Traditional Chinese (Taiwan)' : 'English';

        const parts: Part[] = [
            {
                text: `You are an expert interior designer creating a client-facing presentation in ${languageInstruction}.

The provided design style is "${style}". Your primary task is to generate all text content for the presentation.

**CRITICAL INSTRUCTIONS:**
1.  **Language:** The entire JSON output MUST be in ${languageInstruction}. If the provided style name "${style}" is not in this language, you MUST translate it. There should be no mixed languages in the output.
2.  **Brevity:** Be concise. Adhere strictly to the following length limits to ensure text fits on the slides.
    - **presentationTitle**: A creative title, max 10 words.
    - **mainConcepts**: Exactly 4 concepts. Each string should be "Title: Description", max 15 words total per string.
    - **viewpointDetails.title**: A short room name or summary, max 7 words.
    - **viewpointDetails.description**: A detailed description, max 30 words.
    - **conclusion**: A concluding paragraph, max 40 words.

Analyze the provided floor plan and ${scenes.length} viewpoint images, then generate a JSON object that follows the provided schema.`
            },
            { inlineData: { mimeType: 'image/png', data: planImageBase64 } }
        ];

        sceneImagesBase64.forEach(data => {
            parts.push({ inlineData: { mimeType: 'image/png', data } });
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        presentationTitle: {
                            type: Type.STRING,
                            description: "A creative title for the design proposal (max 10 words)."
                        },
                        mainConcepts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Four main design concepts, each formatted as 'Title: Explanation' (max 15 words total per concept)."
                        },
                        viewpointDetails: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "Short room name or summary (max 7 words)." },
                                    description: { type: Type.STRING, description: "Detailed description of the scene (max 30 words)." }
                                },
                                required: ["title", "description"]
                            },
                            description: "An array of objects, one for each viewpoint."
                        },
                        conclusion: {
                            type: Type.STRING,
                            description: "A concluding paragraph for the presentation (max 40 words)."
                        }
                    },
                    required: ["presentationTitle", "mainConcepts", "viewpointDetails", "conclusion"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating presentation text:", error);
        throw new Error(`Failed to get presentation text from AI. ${error instanceof Error ? error.message : String(error)}`);
    }
}