/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'zh';

type Translations = {
    [key: string]: {
        en: string;
        zh: string;
    };
};

// FIX: Removed the `: Translations` type annotation to allow TypeScript to infer a
// more specific type for the object keys. This makes `keyof typeof translations` a
// union of string literals, resolving the type error in `getTranslation`.
const translations = {
    // App.tsx
    appTitle: { en: 'Floor Plan Wizard', zh: '平面圖魔法師' },
    appSubtitle: { en: 'Transform Floor Plans into Photorealistic Renders and Professional Presentations', zh: '從平面圖到照片級渲染與簡報製作' },
    previousStep: { en: 'Previous Step', zh: '上一步' },
    nextStep: { en: 'Next Step', zh: '下一步' },
    restart: { en: 'Start Over', zh: '重新開始' },
    
    // Stepper.tsx
    stepUpload: { en: 'Upload', zh: '上傳' },
    stepRendering: { en: 'Rendering', zh: '渲染' },
    stepGeneration: { en: 'Generation', zh: '生成' },
    step4SceneEditing: { en: 'Edit Scenes', zh: '編輯場景' },
    step5Presentation: { en: 'Presentation', zh: '簡報' },

    // LanguageSelector.tsx
    selectLanguage: { en: 'Select Language', zh: '選擇語言' },
    chinese: { en: 'Traditional Chinese', zh: '繁體中文' },
    english: { en: 'English', zh: '英文' },

    // Step1Upload.tsx
    step1Title: { en: 'Step 1: Upload Your Floor Plan', zh: '步驟 1：上傳您的平面圖' },
    step1Description: { en: 'Upload a clear image of your floor plan. The AI will analyze the layout to begin the design process.', zh: '上傳清晰的平面圖照片。AI 將分析佈局以開始設計流程。' },
    uploadPlaceholder: { en: 'Your floor plan image will appear here', zh: '您的平面圖將會顯示在這裡' },
    uploadButton: { en: 'Select Floor Plan', zh: '選擇平面圖' },
    reuploadButton: { en: 'Select a Different Plan', zh: '選擇其他平面圖' },
    analyzingIndicator: { en: 'Analyzing floor plan...', zh: '正在分析平面圖...' },

    // Step2Rendering.tsx
    step2Title: { en: 'Step 2: Clean & Render Floor Plan', zh: '步驟 2：清理並渲染平面圖' },
    step2Description: { en: 'The AI will remove text and annotations, then create a clean 3D top-down rendering. You can make corrections if needed.', zh: 'AI 將移除文字和標註，並生成乾淨的 3D 俯視渲染圖。如果需要，您可以進行修正。' },
    originalPlanReference: { en: 'Original Plan Reference', zh: '原始平面圖參考' },
    pleaseUploadFirst: { en: 'Please upload a plan first', zh: '請先上傳平面圖' },
    aiRenderingArea: { en: 'AI Rendering Area', zh: 'AI 渲染區' },
    aiGenerating: { en: 'AI is generating...', zh: 'AI 生成中...' },
    initialRenderingPrompt: { en: 'Click the button below to generate your initial 3D rendering.', zh: '點擊下方按鈕以生成您的初始3D渲染圖。' },
    startRenderingButton: { en: 'Start AI Rendering', zh: '開始 AI 渲染' },
    createDollhouseView: { en: 'Create Dollhouse View', zh: '生成擬真娃娃屋' },
    dollhouseGenerationFailed: { en: 'Failed to generate dollhouse view. Please try again.', zh: '擬真娃娃屋生成失敗，請重試。' },
    renderingFailed: { en: 'AI rendering failed. Please try again.', zh: 'AI 渲染失敗，請重試。' },
    confirmRenderingTitle: { en: 'Confirm Rendering', zh: '確認渲染圖' },
    confirmRenderingDescription: { en: 'Does this rendering accurately represent your floor plan? You can accept it to continue, or regenerate if there are issues.', zh: '此渲染圖是否準確呈現您的平面圖？您可以接受以繼續，或在有問題時重新生成。' },
    acceptRendering: { en: 'Looks Good, Continue', zh: '看起來不錯，繼續' },
    regenerateRendering: { en: 'Regenerate', zh: '重新生成' },
    correctionInputLabel: { en: 'Make Corrections: Describe the change. For targeted edits, you can also mark an area on the image.', zh: '進行修正：描述您想做的更改。若要針對特定區域編輯，也可以先在圖片上標示該區域。' },
    correctionInputPlaceholder: { en: 'e.g., "add a window here", "remove this wall"', zh: '例如：「在這裡加一扇窗」、「移除這面牆」' },
    submitCorrection: { en: 'Submit Correction', zh: '提交修正' },
    autoMaterial: { en: 'Apply Auto-Materials', zh: '自動應用材質' },
    restore: { en: 'Undo', zh: '復原' },
    clearMask: { en: 'Clear Selection', zh: '清除選取' },
    downloadImage: { en: 'Download', zh: '下載' },
    enterCorrectionAlert: { en: 'Please enter a correction instruction.', zh: '請輸入修正指令。' },
    correctionFailed: { en: 'Failed to apply correction. Please try again.', zh: '修正失敗，請重試。' },
    autoMaterialFailed: { en: 'Failed to apply auto-materials. Please try again.', zh: '自動應用材質失敗，請重試。' },
    suggestImprovement: { en: 'AI Suggestion', zh: 'AI 建議' },
    suggestingImprovement: { en: 'Suggesting...', zh: '建議中...' },
    suggestionFailed: { en: 'Failed to get suggestion. Please try again.', zh: '建議失敗，請重試。' },
    numberOfImagesLabel: { en: 'Number of Images to Generate', zh: '生成圖片數量' },
    image: { en: 'Image', zh: '張' },
    images: { en: 'Images', zh: '張' },
    chooseRenderingTitle: { en: 'Choose Your Preferred Rendering', zh: '選擇您偏好的渲染圖' },
    chooseRenderingDescription: { en: 'Select the image you\'d like to continue with.', zh: '選擇您想繼續使用的圖片。' },
    selectThisImage: { en: 'Select This Image', zh: '選擇此圖' },
    selectionConfirmationTitle: { en: 'Confirm Your Choice', zh: '確認您的選擇' },
    confirmSelectionButton: { en: 'Yes, I want this image', zh: '是，我要這張' },
    backToSelectionButton: { en: 'Back to Selection', zh: '返回選擇' },

    // Step3SceneGeneration.tsx
    step3Title: { en: 'Step 3: Generate Interior Scenes', zh: '步驟 3：生成室內場景' },
    step3Description: { en: 'Select viewpoints on the plan and choose a design style. The AI will generate photorealistic scenes from those perspectives.', zh: '在平面圖上選擇視角並選擇設計風格。AI 將從這些視角生成照片級場景。' },
    maxViewpointsAlert: { en: 'You can select a maximum of 8 viewpoints.', zh: '您最多可以選擇 8 個視角。' },
    styleInputPlaceholder: { en: 'Enter a style (e.g., Modern Minimalist)', zh: '輸入風格（例如：現代極簡）' },
    suggestStyleButton: { en: 'Suggest a Style', zh: '建議風格' },
    suggestingStyle: { en: 'Suggesting...', zh: '建議中...' },
    styleSuggestionFailed: { en: 'Failed to suggest a style. Please enter one manually.', zh: '風格建議失敗，請手動輸入。' },
    generateScenes: { en: 'Generate Scenes', zh: '生成場景' },
    generating: { en: 'Generating...', zh: '生成中...' },
    clearViewpoints: { en: 'Clear All', zh: '清除全部' },
    removeLastViewpoint: { en: 'Remove Last', zh: '移除上個視角' },
    allViewpointsCleared: { en: 'All viewpoints have been cleared.', zh: '已清除所有視角。'},
    downloadAllZip: { en: 'Download All (.zip)', zh: '全部下載 (.zip)' },
    viewpoint: { en: 'Viewpoint', zh: '視角' },
    generationFailed: { en: 'Failed', zh: '生成失敗' },
    retry: { en: 'Retry', zh: '重試' },
    enterStyleAlert: { en: 'Please enter an interior design style.', zh: '請輸入室內設計風格。' },
    selectViewpointAlert: { en: 'Please select at least one viewpoint on the floor plan.', zh: '請在平面圖上至少選擇一個視角。' },
    generateScenesFirst: { en: 'Please generate scenes before downloading.', zh: '請在下載前先生成場景。' },
    downloadFailed: { en: 'Download failed. Please try again.', zh: '下載失敗，請重試。' },
    selectStyle: { en: 'Or select a style below:', zh: '或選擇下方的風格：' },
    loadingStyleIdeas: { en: 'Loading style ideas...', zh: '正在載入風格靈感...' },

    // Step4SceneEditing.tsx
    step4Title: { en: 'Step 4: Edit & Refine Scenes', zh: '步驟 4：編輯與優化場景' },
    step4Description: { en: 'Fine-tune your scenes here. Please note: content editing and lighting adjustments are separate steps. First, use a text prompt to modify content and click "Apply". Once that is done, you can adjust the lighting and click "Apply" again.', zh: '在此微調您的場景。請注意：內容編輯與燈光調整是分開的步驟。請先使用提示詞修改內容並點擊「套用」，完成後再調整燈光並再次點擊「套用」。' },
    editPromptPlaceholder: { en: 'e.g., "make the sofa blue", "add this chair"', zh: '例如：「把沙發換成藍色」、「加入這張椅子」' },
    applyEdit: { en: 'Apply', zh: '套用' },
    restoreOriginal: { en: 'Restore Original', zh: '還原原始圖' },
    updatingScene: { en: 'Updating scene...', zh: '正在更新場景...' },
    downloadEditedScenes: { en: 'Download All (.zip)', zh: '全部下載 (.zip)' },
    addObject: { en: 'Add Object', zh: '新增物件' },
    clearObject: { en: 'Clear Object', zh: '清除物件' },

    // Step5Presentation.tsx (was Step4)
    step5Title: { en: 'Step 5: Finalize Your Design Presentation', zh: '步驟 5：完成您的設計簡報' },
    step5Description: { en: 'Follow the steps below to customize and download your presentation. You can edit text on any slide.', zh: '依照以下步驟來自訂和下載您的簡報。您可以編輯任何投影片上的文字。' },
    generatingPresentation: { en: 'Generating presentation...', zh: '正在生成簡報...' },
    presentationFailed: { en: 'Failed to generate presentation. Please try again.', zh: '簡報生成失敗，請重試。' },
    downloadPresentation: { en: 'Download Presentation (.zip)', zh: '下載簡報 (.zip)' },
    viewSlideshow: { en: 'View Slideshow', zh: '檢視簡報' },
    editSlide: { en: 'Edit Text', zh: '編輯文字' },
    customizeTheme: { en: '1. Customize Theme', zh: '1. 選擇版型配色' },
    presentationTheme: { en: 'Presentation Theme', zh: '簡報主題' },
    themeModernBlue: { en: 'Modern Blue', zh: '現代藍' },
    themeEarthTones: { en: 'Earth Tones', zh: '大地色' },
    themeMinimalistGray: { en: 'Minimalist Gray', zh: '簡約灰' },
    themeVibrantCreative: { en: 'Vibrant Creative', zh: '活力創意' },
    themeElegantNoir: { en: 'Elegant Noir', zh: '優雅黑' },
    themeSakuraPink: { en: 'Sakura Pink', zh: '櫻花粉' },
    editContent: { en: '2. Edit Content', zh: '2. 編輯文字' },
    editContentDescription: { en: 'Click the edit button on any slide to modify its text.', zh: '點擊任一張投影片上的編輯按鈕來修改文字。' },
    downloadStep: { en: '3. Download', zh: '3. 儲存簡報' },
    downloadStepDescription: { en: 'Download all slides as high-resolution images in a ZIP file.', zh: '將所有投影片下載為高解析度圖片的 ZIP 檔案。' },
    generatingSlides: { en: 'Generating slides...', zh: '正在生成投影片...' },

    // EditSlideModal.tsx
    editSlideTitle: { en: 'Edit Slide Content', zh: '編輯投影片內容' },
    title: { en: 'Title', zh: '標題' },
    description: { en: 'Description', zh: '描述' },
    concept: { en: 'Concept', zh: '設計理念' },
    conclusion: { en: 'Conclusion', zh: '結語' },
    saveChanges: { en: 'Save Changes', zh: '儲存變更' },
    cancel: { en: 'Cancel', zh: '取消' },

    // AnimatedSlideshow.tsx
    closeSlideshow: { en: 'Close', zh: '關閉' },

    // InteractiveSceneModal.tsx & Step4SceneEditing.tsx
    day: { en: 'Day', zh: '白天' },
    night: { en: 'Night', zh: '夜晚' },
    colorTemperature: { en: 'Color Temperature', zh: '色溫' },
    updatingLighting: { en: 'Updating lighting...', zh: '正在更新燈光...' },
};

export function getTranslation(key: keyof typeof translations, language: Language): string {
    return translations[key] ? translations[key][language] : key;
}