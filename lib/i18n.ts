/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'zh' | 'en';

export interface Translations {
    // App Level
    appTitle: string;
    appSubtitle: string;
    
    // Language Selection
    selectLanguage: string;
    chinese: string;
    english: string;
    
    // Navigation
    previousStep: string;
    nextStep: string;
    restart: string;
    
    // Step Labels
    stepUpload: string;
    stepRendering: string;
    stepGeneration: string;
    stepPresentation: string;

    // Step 1 - Upload
    step1Title: string;
    step1Description: string;
    uploadPlaceholder: string;
    uploadButton: string;
    reuploadButton: string;
    analyzingIndicator: string;
    
    // Step 2 - Rendering
    step2Title: string;
    step2Description: string;
    originalPlanReference: string;
    aiRenderingArea: string;
    pleaseUploadFirst: string;
    startAIRendering: string;
    aiGenerating: string;
    renderingFailed: string;
    confirmRenderingTitle: string;
    confirmRenderingDescription: string;
    acceptRendering: string;
    regenerateRendering: string;
    correctionInputLabel: string;
    correctionInputPlaceholder: string;
    submitCorrection: string;
    autoMaterial: string;
    restore: string;
    clearMask: string;
    downloadImage: string;
    enterCorrectionAlert: string;
    markAreaAlert: string;
    correctionFailed: string;
    autoMaterialFailed: string;
    
    // Step 3 - Scene Generation
    step3Title: string;
    step3Description: string;
    maxViewpointsAlert: string;
    styleInputPlaceholder: string;
    suggestStyleButton: string;
    suggestingStyle: string;
    styleSuggestionFailed: string;
    generateScenes: string;
    generating: string;
    clearViewpoints: string;
    downloadAllZip: string;
    enterStyleAlert: string;
    selectViewpointAlert: string;
    generateScenesFirst: string;
    viewpoint: string;
    generationFailed: string;
    retry: string;
    downloadFailed: string;

    // Step 4 - Presentation
    step4Title: string;
    step4Description: string;
    generatePresentation: string;
    generatingPresentation: string;
    presentationReady: string;
    downloadPresentation: string;
    presentationSlide: string;
    presentationGenerationFailed: string;
    presentationLanguage: string;
    presentationTheme: string;
    themeModernBlue: string;
    themeWarmEarth: string;
    themeMinimalistGray: string;
    themeBoldTeal: string;
    // Static text for slides
    slideSubtitle: string;
    slideConceptsTitle: string;
    slideConclusionTitle: string;
    slideFooter: string;
}

const zhTranslations: Translations = {
    // App Level
    appTitle: '平面圖 AI 視覺化編輯器',
    appSubtitle: '將 2D 平面圖轉換、編輯並生成擬真實景圖',
    
    // Language Selection
    selectLanguage: '選擇語言 / Select Language',
    chinese: '中文',
    english: 'English',
    
    // Navigation
    previousStep: '上一步',
    nextStep: '下一步',
    restart: '重新開始',
    
    // Step Labels
    stepUpload: '上傳與分析',
    stepRendering: 'AI 渲染與編輯',
    stepGeneration: '生成室內實景',
    stepPresentation: '製作簡報',
    
    // Step 1 - Upload
    step1Title: '步驟 1: 上傳與分析平面圖',
    step1Description: '請上傳您的平面圖。系統將模擬自動分析流程，以準備進行 AI 渲染。',
    uploadPlaceholder: '點擊下方按鈕上傳平面圖',
    uploadButton: '上傳您的平面圖',
    reuploadButton: '重新上傳平面圖',
    analyzingIndicator: '正在進行 AI 分析，請稍候...',
    
    // Step 2 - Rendering
    step2Title: '步驟 2: AI 渲染與編輯',
    step2Description: 'AI 將生成渲染圖。您可使用畫筆在圖上標示區域，並透過提示詞進行修改。',
    originalPlanReference: '原始平面圖參考',
    aiRenderingArea: 'AI 生成與編輯區',
    pleaseUploadFirst: '請先上傳平面圖',
    startAIRendering: '開始 AI 渲染',
    aiGenerating: 'AI 正在生成中...',
    renderingFailed: 'AI 渲染失敗，請稍後再試。',
    confirmRenderingTitle: '確認渲染結果',
    confirmRenderingDescription: '您是否滿意這張 AI 渲染圖？',
    acceptRendering: '接受，繼續編輯',
    regenerateRendering: '重新生成',
    correctionInputLabel: '修正指令輸入框：',
    correctionInputPlaceholder: '例如：將標示區域改為木質地板...',
    submitCorrection: '送出指令',
    autoMaterial: '自動材質',
    restore: '還原',
    clearMask: '清除標示',
    downloadImage: '下載圖片',
    enterCorrectionAlert: '請輸入修正指令！',
    markAreaAlert: '請先用畫筆標示要修改的區域！',
    correctionFailed: '修正失敗，請稍後再試。',
    autoMaterialFailed: '自動材質應用失敗，請稍後再試。',
    
    // Step 3 - Scene Generation
    step3Title: '步驟 3: 生成室內實景圖',
    step3Description: '在下方平面圖上點擊最多八個位置作為視角，輸入裝修風格，AI 將生成對應的擬真實景圖。',
    maxViewpointsAlert: '最多只能選擇八個視角。',
    styleInputPlaceholder: '輸入裝修風格 (例如: 北歐風、工業風)',
    suggestStyleButton: 'AI 推薦',
    suggestingStyle: '推薦中...',
    styleSuggestionFailed: '風格推薦失敗。',
    generateScenes: '生成實景圖',
    generating: '生成中...',
    clearViewpoints: '清除視角',
    downloadAllZip: '下載全部 ZIP',
    enterStyleAlert: '請輸入裝修風格！',
    selectViewpointAlert: '請至少在地圖上點選一個視角！',
    generateScenesFirst: '請先生成實景圖！',
    viewpoint: '視角',
    generationFailed: '生成失敗',
    retry: '重試',
    downloadFailed: '下載失敗，請稍後再試。',

    // Step 4 - Presentation
    step4Title: '步驟 4: 生成設計簡報',
    step4Description: 'AI 將根據您的設計風格與視角圖，自動生成一份完整的設計提案簡報。',
    generatePresentation: '生成設計簡報',
    generatingPresentation: '正在生成簡報...',
    presentationReady: '簡報預覽',
    downloadPresentation: '下載簡報 (ZIP)',
    presentationSlide: '投影片',
    presentationGenerationFailed: '簡報生成失敗，請再試一次。',
    presentationLanguage: '簡報語言',
    presentationTheme: '簡報主題配色',
    themeModernBlue: '現代藍',
    themeWarmEarth: '溫暖大地',
    themeMinimalistGray: '簡約灰',
    themeBoldTeal: '大膽青',
    // Static text for slides
    slideSubtitle: '室內設計提案',
    slideConceptsTitle: '設計理念與平面圖',
    slideConclusionTitle: '總結',
    slideFooter: '由 FloorPlan AI 生成',
};

const enTranslations: Translations = {
    // App Level
    appTitle: 'Floor Plan AI Visualization Editor',
    appSubtitle: 'Transform 2D floor plans, edit and generate realistic interior scenes',
    
    // Language Selection
    selectLanguage: '選擇語言 / Select Language',
    chinese: '中文',
    english: 'English',
    
    // Navigation
    previousStep: 'Previous',
    nextStep: 'Next',
    restart: 'Restart',
    
    // Step Labels
    stepUpload: 'Upload & Analysis',
    stepRendering: 'AI Rendering & Editing',
    stepGeneration: 'Interior Scene Generation',
    stepPresentation: 'Create Presentation',
    
    // Step 1 - Upload
    step1Title: 'Step 1: Upload & Analyze Floor Plan',
    step1Description: 'Please upload your floor plan. The system will simulate automatic analysis to prepare for AI rendering.',
    uploadPlaceholder: 'Click the button below to upload your floor plan',
    uploadButton: 'Upload Your Floor Plan',
    reuploadButton: 'Re-upload Floor Plan',
    analyzingIndicator: 'AI analysis in progress, please wait...',
    
    // Step 2 - Rendering
    step2Title: 'Step 2: AI Rendering & Editing',
    step2Description: 'AI will generate a rendering. You can use the brush to mark areas on the image and modify them through prompts.',
    originalPlanReference: 'Original Floor Plan Reference',
    aiRenderingArea: 'AI Generation & Editing Area',
    pleaseUploadFirst: 'Please upload floor plan first',
    startAIRendering: 'Start AI Rendering',
    aiGenerating: 'AI is generating...',
    renderingFailed: 'AI rendering failed, please try again later.',
    confirmRenderingTitle: 'Confirm Rendering Result',
    confirmRenderingDescription: 'Are you satisfied with this AI rendered image?',
    acceptRendering: 'Accept, Continue Editing',
    regenerateRendering: 'Regenerate',
    correctionInputLabel: 'Correction Input:',
    correctionInputPlaceholder: 'e.g., Change marked area to wooden flooring...',
    submitCorrection: 'Submit',
    autoMaterial: 'Auto Material',
    restore: 'Restore',
    clearMask: 'Clear Mark',
    downloadImage: 'Download',
    enterCorrectionAlert: 'Please enter correction instructions!',
    markAreaAlert: 'Please mark the area to modify with the brush first!',
    correctionFailed: 'Correction failed, please try again later.',
    autoMaterialFailed: 'Auto material application failed, please try again later.',
    
    // Step 3 - Scene Generation
    step3Title: 'Step 3: Generate Interior Scenes',
    step3Description: 'Click up to eight locations on the floor plan as viewpoints, enter a style, and AI will generate corresponding realistic interior images.',
    maxViewpointsAlert: 'Maximum eight viewpoints allowed.',
    styleInputPlaceholder: 'Enter decoration style (e.g., Nordic, Industrial)',
    suggestStyleButton: 'AI Suggest',
    suggestingStyle: 'Suggesting...',
    styleSuggestionFailed: 'Style suggestion failed.',
    generateScenes: 'Generate Scenes',
    generating: 'Generating...',
    clearViewpoints: 'Clear Viewpoints',
    downloadAllZip: 'Download All ZIP',
    enterStyleAlert: 'Please enter decoration style!',
    selectViewpointAlert: 'Please select at least one viewpoint on the map!',
    generateScenesFirst: 'Please generate scenes first!',
    viewpoint: 'Viewpoint',
    generationFailed: 'Generation Failed',
    retry: 'Retry',
    downloadFailed: 'Download failed, please try again later.',

    // Step 4 - Presentation
    step4Title: 'Step 4: Generate Design Presentation',
    step4Description: 'Based on your design style and viewpoint images, the AI will automatically generate a complete design proposal presentation.',
    generatePresentation: 'Generate Presentation',
    generatingPresentation: 'Generating Presentation...',
    presentationReady: 'Presentation Preview',
    downloadPresentation: 'Download Presentation (ZIP)',
    presentationSlide: 'Slide',
    presentationGenerationFailed: 'Presentation generation failed, please try again.',
    presentationLanguage: 'Presentation Language',
    presentationTheme: 'Presentation Theme',
    themeModernBlue: 'Modern Blue',
    themeWarmEarth: 'Warm Earth',
    themeMinimalistGray: 'Minimalist Gray',
    themeBoldTeal: 'Bold Teal',
    // Static text for slides
    slideSubtitle: 'Interior Design Proposal',
    slideConceptsTitle: 'Design Concepts & Floor Plan',
    slideConclusionTitle: 'Conclusion',
    slideFooter: 'Generated with FloorPlan AI',
};

export const translations = {
    zh: zhTranslations,
    en: enTranslations
};

export const getTranslation = (key: keyof Translations, language: Language): string => {
    return translations[language][key];
};