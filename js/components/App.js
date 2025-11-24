/**
 * js/components/App.js
 *
 * This is the main root component for the entire application.
 * It manages the overall state, such as settings, chat history,
 * and communication between different child components.
 */

const { useState, useEffect, useRef, useCallback } = React;
// --- HELPERS ---
const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
// MODIFIED: 21/08/2025 8:30 PM EAT - Session ID now persists in sessionStorage for the browser tab.
const generateReadableId = () => {
    // Word lists for creating memorable IDs.
    const adjectives = ["Agile", "Bright", "Clever", "Daring", "Eager", "Fast", "Gifted", "Honest", "Jolly", "Keen", "Loyal", "Mighty"];
    const nouns = ["Lion", "Eagle", "River", "Star", "Flame", "Shield", "Quest", "Spark", "Vision", "Peak", "Core", "Nexus"];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    const minute = new Date().getMinutes();
    const randomNum = Math.floor(Math.random() * 100);

    return `${adj}-${noun}-${minute}${randomNum}`;
};

// This function ensures the Session ID is consistent for the entire browser tab session.
const getSessionId = () => {
    // Try to get an existing ID from sessionStorage.
    let sessionId = sessionStorage.getItem('cbcAiToolSessionId');

    // If no ID exists, create a new one and save it for future reloads in this tab.
    if (!sessionId) {
        sessionId = generateReadableId();
        sessionStorage.setItem('cbcAiToolSessionId', sessionId);
    }

    return sessionId;
};
const SESSION_ID = getSessionId();
// END OF MODIFICATION

// The number of free uses before a user must provide their own key.
const TRIAL_GENERATION_LIMIT = 50;

// --- MAIN APP COMPONENT ---
const App = ({ onMount }) => {
    // --- STATE MANAGEMENT ---

    // Call onMount when component is ready
    useEffect(() => {
        // Call immediately - no need to delay
        onMount?.();
    }, [onMount]);

    const [apiKeys, setApiKeys] = useState({});
    const [apiKeyStatus, setApiKeyStatus] = useState({});
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [selectedProviderKey, setSelectedProviderKey] = useState('google');
    const [selectedModelName, setSelectedModelName] = useState('gemini-2.5-pro');
    const [autoDeleteHours, setAutoDeleteHours] = useState('2');
    const [chatHistory, setChatHistory] = useState([]);
    // UPDATED: State to hold an array of pending files for multi-file upload.
    const [pendingFiles, setPendingFiles] = useState([]);;
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [customPromptContent, setCustomPromptContent] = useState('');
    // The initial assistant is now read from the URL once, and then managed by the app's state.
    const [activePromptKey, setActivePromptKey] = useState(() => {
        const assistant = new URLSearchParams(window.location.search).get('assistant') || 'Coteacher';
        // Set initial meta tags immediately
        const assistantDescriptions = {
            'Prompt Assistant': 'AI-powered prompt engineering and optimization tool for educational content creation.',
            'Item Writer': 'Generate scenario-based assessment items with structured scoring guides for Uganda\'s CBC curriculum.',
            'Lesson Plans (NCDC)': 'Create detailed lesson plans following the official NCDC template for Ugandan educators.',
            'Lesson Plans (with Biblical Integration)': 'Create NCDC lesson plans with integrated biblical values and Christian worldview perspectives.',
            'UACE SoW NCDC': 'Develop comprehensive schemes of work specifically for Uganda Advanced Certificate of Education (UACE) level.',
            'Scheme of Work NCDC': 'Develop structured schemes of work based on Uganda\'s CBC syllabus requirements.',
            'Scheme of Work (with Biblical Integration)': 'Create CBC schemes of work incorporating biblical principles and Christian educational values.',
            'Lesson Notes Generator': 'Produce comprehensive and well-structured lecture notes for any educational topic.',
            'UCE Project Assistant': 'Guide students through Uganda Certificate of Education (UCE) project planning and execution.',
            'AI in Education Coach': 'Get guidance on integrating AI tools effectively into your classroom teaching.',
            'Essay Grading Assistant': 'Efficiently grade student essays using specified rubrics and assessment criteria.',
            'Coteacher': 'Your all-purpose AI teaching assistant for questions, brainstorming, and classroom support.',
            'Data & Document Analyst': 'Analyze educational data, documents, and research materials with AI-powered insights.',
            'UCE BIO Item Writer': 'Generate biology assessment items specifically designed for Uganda Certificate of Education (UCE) level.'
        };
        const title = `${assistant} | AI Educational Assistant`;
        const description = assistantDescriptions[assistant] || 'AI-powered educational tool for Uganda\'s CBC curriculum.';

        document.title = title;
        if (document.getElementById('page-description')) document.getElementById('page-description').content = description;
        if (document.getElementById('og-title')) document.getElementById('og-title').content = title;
        if (document.getElementById('og-description')) document.getElementById('og-description').content = description;
        if (document.getElementById('twitter-title')) document.getElementById('twitter-title').content = title;
        if (document.getElementById('twitter-description')) document.getElementById('twitter-description').content = description;

        return assistant;
    });
    const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth >= 1024);
    const [isPromptMissing, setIsPromptMissing] = useState(false);
    const [availableAssistants, setAvailableAssistants] = useState([]);
    const [isLoadingAssistants, setIsLoadingAssistants] = useState(true);
    const [navigationMenu, setNavigationMenu] = useState({});
    const [showCopyToast, setShowCopyToast] = useState(false);
    const [apiKeyToast, setApiKeyToast] = useState('');
    const [generationCount, setGenerationCount] = useState(0);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [showUpdateBanner, setShowUpdateBanner] = useState(false);
    const [isTakingLong, setIsTakingLong] = useState(false);
    // History enabled flag (opt-in). Default false unless localStorage key is '1'
    const [historyEnabled, setHistoryEnabled] = useState(() => localStorage.getItem('cbc_chat_history_autosave') === '1');
    // NEW: This function handles switching assistants without a page reload.
    const handleAssistantChange = (newAssistantKey) => {
        if (newAssistantKey === activePromptKey) return; // Do nothing if the same assistant is selected

        // Update the app's state to the new assistant
        setActivePromptKey(newAssistantKey);
        setIsPromptMissing(false);
        setError('');

        // Update the browser's URL bar without reloading the page
        const url = new URL(window.location);
        url.searchParams.set('assistant', newAssistantKey);
        window.history.pushState({}, '', url);

        // Clear the current chat and load the initial message for the new assistant
        setChatHistory([]); // Clear existing messages
        loadInitialMessage(newAssistantKey); // Load the welcome message for the new assistant
    };

    // Load history chat
    const handleLoadHistoryChat = useCallback((item) => {
        if (!item || !item.messages) return;
        setActivePromptKey(item.assistantKey);
        setChatHistory(item.messages);
        setIsPromptMissing(false);
        setError('');
    }, []);
    const [showConsentModal, setShowConsentModal] = useState(false);
    // NEW: State for the Google Doc success and download modal
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [createdDocInfo, setCreatedDocInfo] = useState(null);
    const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
    // NEW: State for the Google Search (grounding) toggle
    const [isGroundingEnabled, setIsGroundingEnabled] = useState(false);
    // NEW: State for Save/Copy usage counter (20 free uses)
    const [usageCount, setUsageCount] = useState(() => {
        const saved = localStorage.getItem('saveUsageCount');
        return saved ? parseInt(saved, 10) : 20;
    });
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [paymentFormUrl, setPaymentFormUrl] = useState('https://docs.google.com/forms/d/e/1FAIpQLSfo92FKmdwzdbXLIqbm5GRrjxRLFwEH2b8AGsBBAdcB4mccZw/viewform');
    const [currentCartId, setCurrentCartId] = useState(() => localStorage.getItem('currentCartId') || null);
    // NEW: State to manage whether the user wants to use the shared (trial) API key.
    const [useSharedApiKey, setUseSharedApiKey] = useState(true);

    // This new handler ensures that when the shared key is enabled,
    // the provider is always reset to Google Gemini.
    const handleSharedKeyToggle = (isEnabled) => {
        setUseSharedApiKey(isEnabled);
        if (isEnabled) {
            setSelectedProviderKey('google');
            // Don't force model change - let user keep their selected Gemini model
        }
    };
    // NEW: State to hold the "sticky" trial key for the current session to reduce backend calls.
    const [activeTrialApiKey, setActiveTrialApiKey] = useState(null);
    // NEW: Friendly label for the currently active shared/trial key (e.g., "Key #3")
    const [activeSharedKeyLabel, setActiveSharedKeyLabel] = useState('');
    // NEW: Add state to track remaining trial generations.
    const [trialGenerations, setTrialGenerations] = useState(TRIAL_GENERATION_LIMIT);

    // --- REFS ---
    const chatContainerRef = useRef(null);
    const chatEndRef = useRef(null);
    // Ref to measure header height for mobile padding adjustment
    const headerRef = useRef(null);
    const userInputRef = useRef(null);
    const validationTimeoutRef = useRef(null);
    const apiKeyToastTimeoutRef = useRef(null);
    const abortControllerRef = useRef(null);
    const longResponseTimerRef = useRef(null);
    // History save throttling
    const lastSavedAtRef = useRef(0);

    // --- CONSTANTS & DERIVED STATE ---
    const FEEDBACK_TRIGGER_COUNT = 5;
    const LONG_RESPONSE_TIMEOUT = 10000; // 10 seconds
    const selectedProvider = AI_PROVIDERS.find(p => p.key === selectedProviderKey);
    const selectedModel = selectedProvider?.models.find(m => m.name === selectedModelName);
    const isFileUploadDisabled = !selectedModel?.vision;
    const MAX_TOTAL_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

    // --- API & STREAMING LOGIC ---
    const fetchAndStreamResponse = async ({ historyForApi, systemPrompt, apiKey, onUpdate, onComplete, onError }) => {


        abortControllerRef.current = new AbortController();

        if (longResponseTimerRef.current) clearTimeout(longResponseTimerRef.current);
        longResponseTimerRef.current = setTimeout(() => {
            setIsTakingLong(true);
        }, LONG_RESPONSE_TIMEOUT);

        // Track whether the request/stream failed so callers don't treat
        // failed attempts as successful completions.
        let hadError = false;

        // Batching variables to throttle UI updates
        let batchedContent = '';
        let lastUpdateTime = Date.now();
        const BATCH_INTERVAL = 50; // milliseconds

        try {
            let requestUrl, requestHeaders, requestBody;
            if (selectedProvider.key === 'google') {
                // Gemini 3.0 preview models require v1alpha endpoint, others use v1beta
                const apiVersion = selectedModel.name.includes('-preview') ? 'v1alpha' : 'v1beta';
                requestUrl = `${selectedProvider.apiHost}/${apiVersion}/models/${selectedModel.name}:streamGenerateContent?key=${apiKey}&alt=sse`;
                requestHeaders = { 'Content-Type': 'application/json' };

                // We will now conditionally build the history based on whether grounding is active.
                let geminiHistory;

                const chatHistoryForApi = historyForApi.map(msg => {
                    const parts = [{ text: msg.content || "" }];
                    if (msg.role === 'user' && msg.fileDataForApi && msg.fileDataForApi.length > 0) {
                        // This used to be a single push, now it adds all files
                        msg.fileDataForApi.forEach(file => {
                            parts.push({ inline_data: { mime_type: file.mime_type, data: file.data } });
                        });
                    }
                    return { role: msg.role === 'user' ? 'user' : 'model', parts };
                });

                // If grounding is OFF, we use the system prompt for better persona control.
                if (!isGroundingEnabled) {
                    geminiHistory = [
                        { role: 'user', parts: [{ text: systemPrompt }] },
                        { role: 'model', parts: [{ text: "Okay, I am ready." }] },
                        ...chatHistoryForApi
                    ];
                } else {
                    // If grounding is ON, we send a cleaner history to avoid conflicts with the 'tools' parameter.
                    geminiHistory = chatHistoryForApi;
                }

                const geminiRequestBody = {
                    contents: geminiHistory
                };

                if (isGroundingEnabled) {
                    geminiRequestBody.tools = [{ "google_search_retrieval": {} }];
                }

                requestBody = JSON.stringify(geminiRequestBody);
            }
            else {
                requestUrl = `${selectedProvider.apiHost}/v1/chat/completions`;
                requestHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
                if (selectedProvider.key === 'anthropic') {
                    requestHeaders = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' };
                }
                const messages = historyForApi.map(msg => {
                    const content = [{ type: 'text', text: msg.content || "" }];
                    if (msg.role === 'user' && msg.fileDataForApi) {
                        content.push({ type: 'image_url', image_url: { url: `data:${msg.fileDataForApi.mime_type};base64,${msg.fileDataForApi.data}` } });
                    }
                    return { role: msg.role, content: content.length === 1 && content[0].type === 'text' ? content[0].text : content };
                });
                const systemMessage = selectedProvider.key === 'anthropic' ? { system: systemPrompt } : { messages: [{ role: 'system', content: systemPrompt }, ...messages] };
                const requestMessages = selectedProvider.key === 'anthropic' ? { messages } : {};

                requestBody = JSON.stringify({
                    model: selectedModel.name,
                    ...systemMessage,
                    ...requestMessages,
                    stream: true,
                    max_tokens: 4096
                });
            }

            const response = await fetch(requestUrl, { method: 'POST', headers: requestHeaders, body: requestBody, signal: abortControllerRef.current.signal });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `API request failed with status ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let firstChunkReceived = false;

            while (true) {
                if (abortControllerRef.current?.signal?.aborted) break;

                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        if (!firstChunkReceived) {
                            firstChunkReceived = true;
                            clearTimeout(longResponseTimerRef.current);
                            setIsTakingLong(false);
                        }

                        const dataStr = line.substring(6);
                        if (dataStr.trim() === '[DONE]') break;
                        try {
                            const data = JSON.parse(dataStr);
                            let textChunk = '';
                            if (selectedProvider.key === 'google') textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            else textChunk = data.choices?.[0]?.delta?.content || data.delta?.text || '';

                            if (textChunk) {
                                batchedContent += textChunk;
                                const now = Date.now();
                                if (now - lastUpdateTime >= BATCH_INTERVAL) {
                                    onUpdate(batchedContent);
                                    batchedContent = '';
                                    lastUpdateTime = now;
                                }
                            }
                        } catch (e) { /* Ignore parsing errors */ }
                    }
                }
            }

        } catch (err) {
            hadError = true;
            if (err.name !== 'AbortError') {
                onError(err.message);
            }
        } finally {
            // Flush any remaining batched content
            if (batchedContent) {
                onUpdate(batchedContent);
            }

            clearTimeout(longResponseTimerRef.current);
            setIsTakingLong(false);

            const wasAborted = abortControllerRef.current && abortControllerRef.current.signal && abortControllerRef.current.signal.aborted;
            // Clear the controller reference so subsequent operations don't accidentally reuse it
            try { abortControllerRef.current = null; } catch (e) { /* ignore */ }

            if (!hadError && !wasAborted) {
                try { onComplete(); } catch (e) { console.error('onComplete handler failed', e); }
            }
        }
    };

    // Consolidated STOP / cleanup function to ensure immediate abort and UI reset
    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            try {
                console.debug('stopStreaming: aborting current request');
                abortControllerRef.current.abort();
            } catch (e) { console.warn('stopStreaming abort failed', e); }
        }

        if (longResponseTimerRef.current) {
            clearTimeout(longResponseTimerRef.current);
            longResponseTimerRef.current = null;
        }

        // Reset UI flags that indicate an in-progress/long operation
        try { setIsTakingLong(false); } catch (e) { /* ignore in unmounted */ }
        try { setIsLoading(false); } catch (e) { /* ignore in unmounted */ }

        // Clear controller reference to avoid accidental reuse
        try { abortControllerRef.current = null; } catch (e) { /* ignore */ }

        // Ensure the assistant placeholder stops showing a spinner and mark response as stopped
        try {
            setChatHistory(prev => {
                if (!prev || prev.length === 0) return prev;
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant' && last.isLoading) {
                    last.isLoading = false;
                    const stopNote = '\n\n*Response stopped by user.*';
                    if (!last.content || last.content.trim() === '') last.content = stopNote;
                    else last.content = last.content + stopNote;
                }
                return updated;
            });
        } catch (e) { console.warn('stopStreaming: failed to update chat history', e); }
    }, []);


    // --- HANDLERS & LOGIC ---
    const loadInitialMessage = useCallback(async (promptKey) => {
        const chatKey = `chatHistory_${promptKey}`;
        const savedChat = JSON.parse(localStorage.getItem(chatKey));
        const hours = parseFloat(autoDeleteHours || '2');

        if (savedChat && (autoDeleteHours === 'never' || (Date.now() - savedChat.timestamp) / 36e5 < hours)) {
            setChatHistory(savedChat.history);
            setIsPromptMissing(false);
            return;
        }

        const promptContent = await PromptManager.getPromptContent(promptKey);

        if (!promptContent) {
            setIsPromptMissing(true);
            setChatHistory([]);
        } else {
            setIsPromptMissing(false);
            let finalMessage;
            try {
                const promptJson = JSON.parse(promptContent);
                const intro = promptJson?.interaction_flow?.introduction_message?.display_text;
                if (intro) {
                    finalMessage = intro.replace(/\\n/g, '\n').replace(/\\\*/g, '*');
                } else {
                    finalMessage = `${promptKey} assistant is ready. How can I assist you?`;
                }
            } catch (e) {
                finalMessage = `${promptKey} assistant is ready. How can I assist you?`;
            }
            setChatHistory([{ role: 'assistant', content: finalMessage, id: Date.now() }]);
        }
    }, [autoDeleteHours]);

    // --- Chat History Persistence (local-only, opt-in) ---
    useEffect(() => {
        // Listener for explicit save requests from UI
        const saveHandler = () => {
            try {
                if (!chatHistory || chatHistory.length === 0) return;
                const now = Date.now();
                const title = `${activePromptKey}`;
                const excerpt = (chatHistory[chatHistory.length - 1]?.content || '').slice(0, 120);
                const item = {
                    id: `h_${now}`,
                    title,
                    assistantKey: activePromptKey,
                    timestamp: now,
                    excerpt,
                    messages: chatHistory
                };
                const raw = localStorage.getItem('cbc_chat_history');
                const arr = raw ? JSON.parse(raw) : [];
                arr.unshift(item);
                const limitRaw = parseInt(localStorage.getItem('cbc_chat_history_limit') || '200', 10) || 200;
                const limited = arr.slice(0, limitRaw);
                localStorage.setItem('cbc_chat_history', JSON.stringify(limited));
                window.dispatchEvent(new CustomEvent('historyUpdated', { detail: { item } }));
            } catch (err) { console.error('Save snapshot failed', err); }
        };
        window.addEventListener('requestSaveSnapshot', saveHandler);
        return () => window.removeEventListener('requestSaveSnapshot', saveHandler);
    }, [chatHistory, activePromptKey]);

    // Autosave snapshots when assistant replies (opt-in via localStorage key)
    useEffect(() => {
        try {
            if (!chatHistory || chatHistory.length === 0) return;
            const now = Date.now();
            if (now - lastSavedAtRef.current < 5000) return; // throttle 5s
            const autosave = localStorage.getItem('cbc_chat_history_autosave');
            if (autosave !== '1') return; // disabled by default

            // Save only when last message is assistant and not loading
            const lastMsg = chatHistory[chatHistory.length - 1];
            if (!lastMsg || lastMsg.role !== 'assistant' || lastMsg.isLoading) return;

            // Check if this session already saved
            const sessionKey = `h_session_${activePromptKey}_${SESSION_ID}`;
            const raw = localStorage.getItem('cbc_chat_history');
            const arr = raw ? JSON.parse(raw) : [];
            const existingIndex = arr.findIndex(x => x.id === sessionKey);

            const title = `${activePromptKey}`;
            const excerpt = (chatHistory[chatHistory.length - 1]?.content || '').slice(0, 120);
            const item = {
                id: sessionKey,
                title,
                assistantKey: activePromptKey,
                timestamp: now,
                excerpt,
                messages: chatHistory
            };

            if (existingIndex >= 0) {
                // Update existing session
                arr[existingIndex] = item;
            } else {
                // Add new session
                arr.unshift(item);
            }

            const limitRaw = parseInt(localStorage.getItem('cbc_chat_history_limit') || '200', 10) || 200;
            const limited = arr.slice(0, limitRaw);
            localStorage.setItem('cbc_chat_history', JSON.stringify(limited));
            lastSavedAtRef.current = now;
            window.dispatchEvent(new CustomEvent('historyUpdated', { detail: { item } }));
        } catch (e) { console.error('Failed to save chat history', e); }
    }, [chatHistory, activePromptKey]);

    // Allow other UI to change active assistant via custom event
    useEffect(() => {
        const handler = (e) => {
            const key = e?.detail?.key;
            if (key) handleAssistantChange(key);
        };
        window.addEventListener('assistantChanged', handler);
        return () => window.removeEventListener('assistantChanged', handler);
    }, [handleAssistantChange]);

    // Load history chat from sidebar
    useEffect(() => {
        const handler = (e) => {
            handleLoadHistoryChat(e?.detail);
        };
        window.addEventListener('loadHistoryChat', handler);
        if (typeof window !== 'undefined') {
            window.__LOAD_HISTORY_CHAT__ = handleLoadHistoryChat;
        }
        return () => {
            window.removeEventListener('loadHistoryChat', handler);
            if (typeof window !== 'undefined') {
                delete window.__LOAD_HISTORY_CHAT__;
            }
        };
    }, [handleLoadHistoryChat]);

    // When a user signs in elsewhere (OAuth redirect or sign-in), check terms and reinitialize
    useEffect(() => {
        const onUserSignedIn = async (e) => {
            try {
                // Clear any stale UI state
                setChatHistory([]);
                setIsPromptMissing(false);
                // Check Supabase to see if user has accepted terms (first-time users only)
                try {
                    const quota = await window.supabaseAuth?.getQuota();
                    if (quota && !quota.accepted_terms) {
                        // First-time user - show consent modal
                        setShowConsentModal(true);
                        return;
                    }
                } catch (err) {
                    console.warn('Failed to check terms status:', err);
                }
                // Returning user or error - load assistant welcome message
                loadInitialMessage(activePromptKey);
            } catch (err) {
                console.warn('userSignedIn handler failed', err);
                loadInitialMessage(activePromptKey);
            }
        };
        window.addEventListener('userSignedIn', onUserSignedIn);
        return () => window.removeEventListener('userSignedIn', onUserSignedIn);
    }, [activePromptKey, loadInitialMessage]);

    // When a user signs out, abort any in-progress streams and clear chat state
    useEffect(() => {
        const onUserSignedOut = () => {
            try {
                stopStreaming();
                setChatHistory([]);
                setIsPromptMissing(false);
            } catch (err) { console.warn('userSignedOut handler failed', err); }
        };
        window.addEventListener('userSignedOut', onUserSignedOut);
        return () => window.removeEventListener('userSignedOut', onUserSignedOut);
    }, [stopStreaming]);

    // When a user accepts terms from the consent modal
    useEffect(() => {
        const onTermsAccepted = () => {
            try {
                setShowConsentModal(false);
                // Load the assistant welcome message now that terms are accepted
                loadInitialMessage(activePromptKey);
            } catch (err) { console.warn('termsAccepted handler failed', err); }
        };
        window.addEventListener('termsAccepted', onTermsAccepted);
        return () => window.removeEventListener('termsAccepted', onTermsAccepted);
    }, [activePromptKey, loadInitialMessage]);

    const validateApiKey = useCallback(async (provider, key) => {
        if (!key) {
            setApiKeyStatus(prev => ({ ...prev, [provider.key]: 'unchecked' }));
            return;
        }
        setApiKeyStatus(prev => ({ ...prev, [provider.key]: 'checking' }));
        let isValid = false;
        try {
            let response;
            if (['openai', 'groq', 'deepseek', 'qwen'].includes(provider.key)) {
                response = await fetch(`${provider.apiHost}/v1/models`, { headers: { 'Authorization': `Bearer ${key}` } });
            } else if (provider.key === 'google') {
                response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            } else if (provider.key === 'anthropic') {
                response = await fetch(`${provider.apiHost}/v1/messages`, {
                    method: 'POST',
                    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
                    body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 1, messages: [{ role: "user", content: "ping" }] })
                });
            }

            if (response && response.ok) {
                isValid = true;
                setApiKeyStatus(prev => ({ ...prev, [provider.key]: 'valid' }));
                setApiKeyToast(`${provider.label} API Key Verified!`);
            }
        } catch (error) {
            console.error(`API Key validation failed for ${provider.label}:`, error);
        }

        if (apiKeyToastTimeoutRef.current) clearTimeout(apiKeyToastTimeoutRef.current);
        apiKeyToastTimeoutRef.current = setTimeout(() => setApiKeyToast(''), 3000);

        if (!isValid) {
            setApiKeyStatus(prev => ({ ...prev, [provider.key]: 'invalid' }));
            if (!apiKeyToast) {
                setApiKeyToast(`Invalid ${provider.label} API Key`);
            }
        }
    }, [apiKeyToast]);

    const handleApiKeyChange = (keyName, provider, value) => {
        setApiKeys(prev => ({ ...prev, [keyName]: value }));
        if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
        if (!value) {
            setApiKeyStatus(prev => ({ ...prev, [provider.key]: 'unchecked' }));
            return;
        }
        setApiKeyStatus(prev => ({ ...prev, [provider.key]: 'checking' }));
        validationTimeoutRef.current = setTimeout(() => {
            validateApiKey(provider, value);
        }, 800);
    };

    // Check if item already in cart (by content only, not type)
    const isInCart = (content) => {
        return cartItems.some(item => item.content === content);
    };

    // UPDATED: This function now receives the doc ID and opens our new modal.
    const handleDocxDownload = async (markdownContent) => {
        // Check if already in cart
        if (isInCart(markdownContent)) {
            setPendingAction({ type: 'save', content: markdownContent, inCart: true });
            setIsLimitModalOpen(true);
            return;
        }

        // Check Supabase quota first, fall back to local usageCount
        try {
            const quota = await window.supabaseAuth.getQuota();
            if (quota && quota.free_downloads_remaining <= 0) {
                setPendingAction({ type: 'save', content: markdownContent, inCart: false });
                setIsLimitModalOpen(true);
                return;
            }
        } catch (err) {
            console.warn('Supabase quota check failed:', err);
            // Fall back to local count
            if (usageCount <= 0) {
                setPendingAction({ type: 'save', content: markdownContent, inCart: false });
                setIsLimitModalOpen(true);
                return;
            }
        }

        // Use the error state to provide feedback to the user that the process has started.
        setError('Creating your Google Doc, please wait...');

        try {
            // First, convert the raw markdown from the chat message into clean HTML.
            const htmlContent = marked.parse(markdownContent);

            // Prepare the data payload to send to our Google Apps Script.
            const payload = {
                action: 'createDoc',
                details: {
                    htmlContent: htmlContent,
                    title: activePromptKey, // The assistant's name (e.g., "Item Writer")
                    modelName: selectedModelName, // The AI model used (e.g., "gemini-2.5-flash")
                    sessionId: SESSION_ID, // Include session ID for logging
                    browserOs: navigator.userAgent // Include browser/OS info
                }
            };

            // Send the HTML data to our backend script.
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            // Parse the response from the server.
            const data = await response.json();

            // Check if we received the URL and the new ID.
            if (data.success && data.url && data.id) {
                // Track in both systems (Supabase + GAS). Fall back to local decrement on error.
                try {
                    await window.supabaseAuth.consume('download');
                    const quota = await window.supabaseAuth.getQuota();
                    if (quota) {
                        setUsageCount(quota.free_downloads_remaining);
                    }
                    await fetch(`${GAS_WEB_APP_URL}?action=logDownload&sessionId=${SESSION_ID}`);
                } catch (err) {
                    console.warn('Tracking failed:', err);
                    // Fall back to local tracking
                    const newCount = usageCount - 1;
                    setUsageCount(newCount);
                    localStorage.setItem('saveUsageCount', newCount.toString());
                }

                // Log the doc creation (analytics)
                trackEvent('google_doc_created', activePromptKey, {
                    sessionId: SESSION_ID,
                    url: data.url,
                    model: selectedModelName
                });

                // Store the document info (URL and ID) in our new state.
                setCreatedDocInfo({ url: data.url, downloadUrl: data.downloadUrl, id: data.id });
                // Open our new modal instead of a new tab.
                setIsDocModalOpen(true);
                setError(''); // Clear the "Creating..." message.
            } else {
                // If the server reported an error, throw it so our catch block can handle it.
                throw new Error(data.error || 'The server did not return the required document information.');
            }

        } catch (error) {
            console.error("Error creating Google Doc:", error);
            setError('Unable to create document right now. Please try again in a moment.');
        }
    };

    const handleSendMessage = async () => {
        // First, check if there's any input or if the app is already busy.
        if ((!userInput.trim() && pendingFiles.length === 0) || isLoading) return;

        let apiKey = apiKeys[selectedProvider.apiKeyName];
        let isTrial = false;
        // NEW: Create a variable to hold the key label for this specific message's log.
        // This solves the timing issue.
        let keyLabelForLogging;

        // Check if user selected unsupported Gemini 3.0 preview model
        if (selectedProvider.key === 'google' && selectedModel.name.includes('3.0') && selectedModel.name.includes('preview')) {
            setError("⚠️ Gemini 3.0 preview models are not yet supported via API keys. They require Google Cloud authentication. Support coming soon! Please select Gemini 2.5 Pro or another model.");
            return;
        }

        // Final, efficient logic for handling API keys.
        if (useSharedApiKey) {
            // === SHARED KEY LOGIC ===
            if (selectedProvider.key !== 'google' || trialGenerations <= 0) {
                setError("Shared key is only for Google Gemini, or you are out of free trials. Please turn off the toggle and add your own key.");
                return;
            }

            isTrial = true; // Mark this as a trial generation.

            // Use the "sticky" key if we have it.
            if (activeTrialApiKey) {
                apiKey = activeTrialApiKey;
                // For subsequent messages, the state will be correct.
                keyLabelForLogging = activeSharedKeyLabel;
            } else {
                // Show immediate feedback that we're getting a key
                setError('Getting shared API key, please wait...');

                // Otherwise, fetch a new one from the backend.
                try {
                    const response = await fetch(`${GAS_WEB_APP_URL}?action=getTrialApiKey`);
                    const data = await response.json();
                    if (data.success && data.apiKey) {
                        apiKey = data.apiKey;
                        setActiveTrialApiKey(apiKey); // Save the key for this session.
                        if (data.keyLabel) {
                            // Set the state for the UI, AND set our local variable for the immediate log.
                            setActiveSharedKeyLabel(data.keyLabel);
                            keyLabelForLogging = data.keyLabel;
                        }
                        setError(''); // Clear the "getting key" message
                    } else {
                        throw new Error(data.error || 'Failed to fetch trial key.');
                    }
                } catch (err) {
                    setError(`Could not retrieve trial key: ${err.message}`);
                    return;
                }
            }

        } else {
            // === PERSONAL KEY LOGIC ===
            if (!apiKey || apiKeyStatus[selectedProvider.key] !== 'valid') {
                setError(`Please enter a valid ${selectedProvider.label} API Key in the settings panel.`);
                return;
            }
            isTrial = false;
            // For personal keys, the label is always the same.
            keyLabelForLogging = 'PERSONAL KEY';
        }

        // If we have a valid key (either trial or personal), we can proceed.
        setIsLoading(true);
        setError('');

        const fileProcessingPromises = pendingFiles.map(f => processFileForApi(f.file));
        const filesDataForApi = await Promise.all(fileProcessingPromises).catch(e => {
            setError("Could not read one or more files.");
            setIsLoading(false);
            return null;
        });

        if (!filesDataForApi) return;

        const userMessage = {
            role: 'user',
            content: userInput,
            files: pendingFiles.map(f => ({ name: f.file.name, previewUrl: f.previewUrl })),
            fileDataForApi: filesDataForApi,
            id: Date.now()
        };

        const assistantPlaceholder = { role: 'assistant', content: '', isLoading: true, id: Date.now() + 1 };
        const newHistory = [...chatHistory, userMessage, assistantPlaceholder];
        setChatHistory(newHistory);
        setUserInput(''); setPendingFiles([]);

        const systemPrompt = activePromptKey === 'custom' ? customPromptContent : await PromptManager.getPromptContent(activePromptKey);
        if (!systemPrompt) {
            setError('Failed to load assistant configuration. Please try again.');
            setChatHistory(prev => prev.slice(0, -2));
            setIsLoading(false);
            return;
        }

        // Check Supabase quota before attempting generation (falls back to GAS/local if check fails)
        try {
            const quota = await window.supabaseAuth.getQuota();
            if (quota && quota.free_generations_remaining <= 0) {
                setError('Free generations exhausted. Add your own API key or sign in with a different account.');
                setIsLoading(false);
                return;
            }
        } catch (err) {
            console.warn('Supabase quota check failed:', err);
            // Continue anyway - GAS will track
        }

        await fetchAndStreamResponse({
            historyForApi: newHistory.slice(0, -1),
            systemPrompt,
            apiKey,
            onUpdate: (chunk) => {
                setChatHistory(prev => {
                    const updatedHistory = [...prev];
                    const lastMsg = updatedHistory[updatedHistory.length - 1];
                    if (lastMsg && lastMsg.isLoading) lastMsg.content += chunk;
                    return updatedHistory;
                });
            },
            onComplete: () => {
                setIsLoading(false);
                setChatHistory(prev => {
                    const updatedHistory = [...prev];
                    const lastMsg = updatedHistory[updatedHistory.length - 1];
                    if (lastMsg) lastMsg.isLoading = false;
                    return updatedHistory;
                });

                if (!abortControllerRef.current?.signal?.aborted) {
                    // Use our new local variable for logging.
                    const finalKeyLabel = keyLabelForLogging || (isTrial ? 'SHARED KEY' : 'PERSONAL KEY');

                    if (isTrial) {
                        trackEvent('trial_generation', activePromptKey, { sessionId: SESSION_ID, apiKeyUsed: finalKeyLabel });
                    } else {
                        trackEvent('generation', activePromptKey, { sessionId: SESSION_ID, apiKeyUsed: finalKeyLabel });
                    }
                    setGenerationCount(prevCount => prevCount + 1);

                    // Track generation in Supabase and GAS, then sync state immediately
                    window.supabaseAuth.consume('generation')
                        .then(() => window.supabaseAuth.getQuota())
                        .then(quota => {
                            if (quota) {
                                setTrialGenerations(quota.free_generations_remaining);
                            }
                            return fetch(`${GAS_WEB_APP_URL}?action=logGeneration&sessionId=${SESSION_ID}`);
                        })
                        .catch(err => {
                            console.warn('Tracking failed:', err);
                            // Fall back to local tracking
                            const newCount = trialGenerations - 1;
                            setTrialGenerations(newCount);
                            localStorage.setItem('trialGenerationsCount', newCount.toString());
                        });
                }
                abortControllerRef.current = null;
            },
            onError: (err) => {
                if (isTrial) {
                    setActiveTrialApiKey(null); // Clear the failed key
                    setActiveSharedKeyLabel(''); // Clear its label
                    setError("The current shared key failed. A new key will be tried on your next message.");
                } else {
                    setError(err);
                }
                setChatHistory(prev => prev.slice(0, -2));
                setIsLoading(false);
            }
        });
    };

    const handleRegenerate = async (indexToRegenerate) => {
        if (isLoading) return;

        const historyForApi = chatHistory.slice(0, indexToRegenerate);
        if (historyForApi.length === 0 || historyForApi[historyForApi.length - 1].role !== 'user') {
            setError("Cannot regenerate without a preceding user prompt.");
            return;
        }

        // Check if user selected unsupported Gemini 3.0 preview model
        if (selectedProvider.key === 'google' && selectedModel.name.includes('3.0') && selectedModel.name.includes('preview')) {
            setError("⚠️ Gemini 3.0 preview models are not yet supported via API keys. Please select Gemini 2.5 Pro or another model.");
            return;
        }

        // Get API key using same logic as handleSendMessage
        let apiKey = apiKeys[selectedProvider.apiKeyName];

        if (useSharedApiKey) {
            if (selectedProvider.key !== 'google' || trialGenerations <= 0) {
                setError("Shared key is only for Google Gemini, or you are out of free trials. Please turn off the toggle and add your own key.");
                return;
            }

            if (activeTrialApiKey) {
                apiKey = activeTrialApiKey;
            } else {
                setError('Getting shared API key, please wait...');

                try {
                    const response = await fetch(`${GAS_WEB_APP_URL}?action=getTrialApiKey`);
                    const data = await response.json();
                    if (data.success && data.apiKey) {
                        apiKey = data.apiKey;
                        setActiveTrialApiKey(apiKey);
                        if (data.keyLabel) {
                            setActiveSharedKeyLabel(data.keyLabel);
                        }
                        setError(''); // Clear the "getting key" message
                    } else {
                        throw new Error(data.error || 'Failed to fetch trial key.');
                    }
                } catch (err) {
                    setError(`Could not retrieve trial key: ${err.message}`);
                    return;
                }
            }
        } else {
            if (!apiKey || apiKeyStatus[selectedProvider.key] !== 'valid') {
                setError(`Please enter a valid ${selectedProvider.label} API Key in the settings panel.`);
                return;
            }
        }

        setIsLoading(true);
        setError('');

        const originalMessage = chatHistory[indexToRegenerate];

        setChatHistory(prev => {
            const updatedHistory = [...prev];
            const msgToUpdate = updatedHistory[indexToRegenerate];
            if (msgToUpdate) {
                msgToUpdate.content = '';
                msgToUpdate.isLoading = true;
            }
            return updatedHistory;
        });

        const systemPrompt = activePromptKey === 'custom' ? customPromptContent : await PromptManager.getPromptContent(activePromptKey);

        await fetchAndStreamResponse({
            historyForApi,
            systemPrompt,
            apiKey,
            onUpdate: (chunk) => {
                setChatHistory(prev => {
                    const updatedHistory = [...prev];
                    const msgToUpdate = updatedHistory[indexToRegenerate];
                    if (msgToUpdate && msgToUpdate.isLoading) {
                        msgToUpdate.content += chunk;
                    }
                    return updatedHistory;
                });
            },
            onComplete: () => {
                setIsLoading(false);
                setChatHistory(prev => {
                    const updatedHistory = [...prev];
                    const msgToUpdate = updatedHistory[indexToRegenerate];
                    if (msgToUpdate) msgToUpdate.isLoading = false;
                    return updatedHistory;
                });
                if (!abortControllerRef.current?.signal?.aborted) {
                    setGenerationCount(prevCount => prevCount + 1);
                    trackEvent('regeneration', activePromptKey, { sessionId: SESSION_ID });
                }
                abortControllerRef.current = null;
            },
            onError: (err) => {
                setError(err);
                setIsLoading(false);
                setChatHistory(prev => {
                    const updatedHistory = [...prev];
                    updatedHistory[indexToRegenerate] = originalMessage;
                    return updatedHistory;
                });
            }
        });
    };

    const clearChat = useCallback(() => {
        const chatKey = `chatHistory_${activePromptKey}`;
        setChatHistory([]);
        localStorage.removeItem(chatKey);
        setPendingFiles([]);
        setError('');
        loadInitialMessage(activePromptKey);
    }, [activePromptKey, loadInitialMessage]);
    // NEW: Handles adding one or more files, checking against the total size limit.
    // NOTE: use functional updater for setPendingFiles to avoid a race where
    // multiple quick file selections can read stale `pendingFiles` and bypass the limit.
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length || isFileUploadDisabled) return;

        const rejected = [];

        // Use functional updater to guarantee we base calculations on the latest state
        setPendingFiles(prev => {
            let currentTotalSize = prev.reduce((sum, f) => sum + (f.file?.size || 0), 0);
            const filesToAdd = [];

            for (const file of files) {
                const newTotal = currentTotalSize + (file.size || 0);
                if (newTotal > MAX_TOTAL_UPLOAD_SIZE) {
                    rejected.push(file.name);
                } else {
                    const previewUrl = file.type && file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
                    filesToAdd.push({ file, previewUrl, id: Date.now() + Math.random() });
                    currentTotalSize = newTotal;
                }
            }

            if (filesToAdd.length === 0) return prev;
            return [...prev, ...filesToAdd];
        });

        if (rejected.length > 0) {
            setError(`⚠️ Cannot add ${rejected.length} file(s) - would exceed 10 MB limit!`);
            setTimeout(() => setError(''), 5000);
        }

        e.target.value = null;
    };

    // NEW: Handles removing a specific file from the pending list.
    const handleRemoveFile = (fileId) => {
        setPendingFiles(prev => prev.filter(f => f.id !== fileId));
    };
    const resetSettings = () => {
        // Only clear API keys and chat history
        const savedState = JSON.parse(localStorage.getItem('aiAssistantState')) || {};
        savedState.apiKeys = {};
        savedState.apiKeyStatus = {};
        localStorage.setItem('aiAssistantState', JSON.stringify(savedState));

        // Clear all chat history
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('chatHistory_')) {
                localStorage.removeItem(key);
            }
        });
        localStorage.setItem('cbc_chat_history', JSON.stringify([]));

        // DO NOT clear: generationCount, saveUsageCount, cart, trialGenerationsCount, etc.

        setShowResetConfirm(false);
        setApiKeys({});
        setApiKeyStatus({});

        loadInitialMessage(activePromptKey);
        window.dispatchEvent(new CustomEvent('historyUpdated'));
    };

    // --- TUTORIAL LOGIC ---
    // The tutorial has been temporarily disabled to fix a bug.
    // The following are empty placeholder functions to prevent the app from crashing.
    const startResizing = useCallback(() => { }, []);
    const handleHelpButtonClick = () => { };

    // --- CLIPBOARD PASTE HANDLER ---
    const handlePaste = useCallback((e) => {
        const items = e.clipboardData?.items;
        if (!items || isFileUploadDisabled) return;

        const files = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }

        if (files.length > 0) {
            e.preventDefault();
            e.stopPropagation();

            const rejected = [];

            // Use functional updater so we always calculate against the latest pendingFiles
            setPendingFiles(prev => {
                let currentTotalSize = prev.reduce((sum, f) => sum + (f.file?.size || 0), 0);
                const filesToAdd = [];

                for (const file of files) {
                    if (currentTotalSize + (file.size || 0) > MAX_TOTAL_UPLOAD_SIZE) {
                        rejected.push(file.name);
                    } else {
                        const previewUrl = file.type && file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
                        filesToAdd.push({ file, previewUrl, id: Date.now() + Math.random() });
                        currentTotalSize += file.size || 0;
                    }
                }

                if (filesToAdd.length === 0) return prev;
                return [...prev, ...filesToAdd];
            });

            if (rejected.length > 0) {
                setError(`Cannot paste ${rejected.length} file(s). Total size would exceed 10 MB limit.`);
                setTimeout(() => setError(''), 5000);
            }
        }
    }, [isFileUploadDisabled, MAX_TOTAL_UPLOAD_SIZE]);

    // --- EFFECTS ---
    useEffect(() => {
        // Listen for consent modal trigger from auth
        const handleShowConsent = () => setShowConsentModal(true);
        window.addEventListener('showConsent', handleShowConsent);
        // Listen for quota updates dispatched by auth module (priority: Supabase)
        const handleQuotaUpdated = (e) => {
            try {
                const q = e?.detail;
                if (!q) return;
                // Prefer Supabase values and persist them locally so different browsers sync
                if (typeof q.free_generations_remaining === 'number') {
                    setTrialGenerations(q.free_generations_remaining);
                    localStorage.setItem('trialGenerationsCount', String(q.free_generations_remaining));
                }
                if (typeof q.free_downloads_remaining === 'number') {
                    setUsageCount(q.free_downloads_remaining);
                    localStorage.setItem('saveUsageCount', String(q.free_downloads_remaining));
                }
            } catch (err) {
                console.error('Error handling quotaUpdated event', err);
            }
        };
        window.addEventListener('quotaUpdated', handleQuotaUpdated);
        // Listen for localStorage changes from other tabs (near-real-time sync)
        const handleStorage = (e) => {
            try {
                if (!e.key) return;
                if (e.key === 'trialGenerationsCount') {
                    const v = parseInt(e.newValue || '0', 10);
                    if (!Number.isNaN(v)) setTrialGenerations(v);
                }
                if (e.key === 'saveUsageCount') {
                    const v = parseInt(e.newValue || '0', 10);
                    if (!Number.isNaN(v)) setUsageCount(v);
                }
            } catch (err) {
                console.error('storage event handler error', err);
            }
        };
        window.addEventListener('storage', handleStorage);

        // Subscribe to real-time quota updates from Supabase
        const unsubscribe = window.supabaseAuth?.subscribeToQuotaUpdates?.((quota) => {
            if (quota) {
                setTrialGenerations(quota.free_generations_remaining);
                setUsageCount(quota.free_downloads_remaining);
            }
        });

        // Listen for sign-out events to reset client-only state and allow in-page account switching
        const handleUserSignedOut = () => {
            try {
                if (typeof stopStreaming === 'function') stopStreaming();
            } catch (e) { console.warn('userSignedOut: stopStreaming failed', e); }

            try { setChatHistory([]); } catch (e) { /* ignore */ }
            try { setUserInput(''); } catch (e) { /* ignore */ }
            try { setIsLoading(false); } catch (e) { /* ignore */ }
            try { setIsTakingLong(false); } catch (e) { /* ignore */ }
            try { setActiveTrialApiKey(null); } catch (e) { /* ignore */ }
            try { setActiveSharedKeyLabel(''); } catch (e) { /* ignore */ }
            try { setTrialGenerations(TRIAL_GENERATION_LIMIT); } catch (e) { /* ignore */ }
            try { setUsageCount(20); } catch (e) { /* ignore */ }
            try { localStorage.removeItem('trialGenerationsCount'); localStorage.removeItem('saveUsageCount'); } catch (e) { /* ignore */ }
        };
        window.addEventListener('userSignedOut', handleUserSignedOut);

        // Initialize the app on first load
        const initializeApp = async () => {
            if (!localStorage.getItem('userConsentV1')) {
                setShowConsentModal(true);
            }

            const savedCount = parseInt(localStorage.getItem('generationCount') || '0', 10);
            setGenerationCount(savedCount);

            // Use cached values immediately to avoid blocking UI
            const cachedTrialCount = parseInt(localStorage.getItem('trialGenerationsCount') || TRIAL_GENERATION_LIMIT, 10);
            const cachedUsageCount = parseInt(localStorage.getItem('saveUsageCount') || '20', 10);
            setTrialGenerations(cachedTrialCount);
            setUsageCount(cachedUsageCount);

            // Load quotas from Supabase in background (non-blocking)
            // This updates the UI when ready but doesn't prevent initial render
            (async () => {
                try {
                    const quota = await window.supabaseAuth.getQuota();
                    if (quota) {
                        // Update with fresh values from Supabase
                        setTrialGenerations(quota.free_generations_remaining);
                        setUsageCount(quota.free_downloads_remaining);
                        try {
                            localStorage.setItem('trialGenerationsCount', String(quota.free_generations_remaining));
                            localStorage.setItem('saveUsageCount', String(quota.free_downloads_remaining));
                        } catch (e) { /* ignore localStorage errors */ }
                    } else {
                        // Supabase returned null, check if we need to reset trial policy
                        const TRIAL_POLICY_VERSION = 'v2';
                        const savedPolicyVersion = localStorage.getItem('trialPolicyVersion');
                        if (savedPolicyVersion !== TRIAL_POLICY_VERSION) {
                            const newTrialCount = TRIAL_GENERATION_LIMIT;
                            setTrialGenerations(newTrialCount);
                            localStorage.setItem('trialGenerationsCount', newTrialCount.toString());
                            localStorage.setItem('trialPolicyVersion', TRIAL_POLICY_VERSION);
                        }
                    }
                } catch (err) {
                    console.warn('Background quota fetch failed:', err);
                    // Keep using cached values - already set above
                }
            })();

            setIsLoadingAssistants(true);
            let assistants = [];
            let fetchedNotifications = [];
            try {
                const results = await Promise.all([
                    PromptManager.getAvailableAssistants(),
                    fetchNotifications()
                ]);
                assistants = results[0] || [];
                fetchedNotifications = results[1] || [];
            } catch (fetchErr) {
                console.error('Failed to load assistants or notifications:', fetchErr);
                // Fallback to built-in assistant list handled by PromptManager
                try {
                    assistants = await PromptManager.getAvailableAssistants();
                } catch (fallbackErr) {
                    console.error('Fallback to built-in assistants failed:', fallbackErr);
                    assistants = ['Coteacher', 'Item Writer', 'Lesson Plans (NCDC)', 'Scheme of Work NCDC'];
                }
                fetchedNotifications = [];
            }

            setAvailableAssistants(assistants);
            const menu = {};
            assistants.forEach(assistant => {
                const urlParams = new URLSearchParams(window.location.search);
                const adminParam = urlParams.get('admin') === 'true' ? '&admin=true' : '';
                menu[assistant] = `?assistant=${encodeURIComponent(assistant)}${adminParam}`;
            });
            setNavigationMenu(menu);

            if (fetchedNotifications.length > 0) {
                setNotifications(fetchedNotifications);
                const latestTimestamp = fetchedNotifications[0].timestamp;
                const lastSeenTimestamp = localStorage.getItem('lastSeenUpdateTimestamp');
                if (latestTimestamp !== lastSeenTimestamp) {
                    setShowUpdateBanner(true);
                    setHasNewNotification(true);
                }
            }

            // NEW: Load settings and the initial message for the current assistant
            const savedState = JSON.parse(localStorage.getItem('aiAssistantState')) || {};
            setApiKeys(savedState.apiKeys || {});
            setApiKeyStatus(savedState.apiKeyStatus || {});
            setSidebarWidth(savedState.sidebarWidth || 320);
            setSelectedProviderKey(savedState.selectedProviderKey || 'google');
            setSelectedModelName(savedState.selectedModelName || 'gemini-2.5-pro');
            setAutoDeleteHours(savedState.autoDeleteHours || '2');

            // Load the welcome message for the assistant that was determined from the URL
            loadInitialMessage(activePromptKey);

            setIsLoadingAssistants(false);
        };
        initializeApp();

        // Add paste event listener
        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
            window.removeEventListener('showConsent', handleShowConsent);
            window.removeEventListener('quotaUpdated', handleQuotaUpdated);
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('userSignedOut', handleUserSignedOut);
        };
    }, []);



    useEffect(() => {
        // Trigger the tutorial for first-time visitors - CURRENTLY DISABLED
        /*
        if (!isLoadingAssistants && !showConsentModal) { 
            const hasSeenTutorial = localStorage.getItem('hasSeenCbcAiTutorial');
            if (!hasSeenTutorial) {
                setTimeout(() => {
                    handleHelpButtonClick(); 
                    localStorage.setItem('hasSeenCbcAiTutorial', 'true');
                }, 500);
            }
        }
        */
    }, [isLoadingAssistants, showConsentModal]);

    useEffect(() => {
        // Save state to local storage on change
        localStorage.setItem('aiAssistantState', JSON.stringify({ apiKeys, apiKeyStatus, sidebarWidth, selectedProviderKey, selectedModelName, autoDeleteHours }));
    }, [apiKeys, apiKeyStatus, sidebarWidth, selectedProviderKey, selectedModelName, autoDeleteHours]);

    useEffect(() => {
        // Save chat history to local storage
        if (chatHistory && chatHistory.length > 0 && !chatHistory[chatHistory.length - 1]?.isLoading) {
            const chatKey = `chatHistory_${activePromptKey}`;
            localStorage.setItem(chatKey, JSON.stringify({ history: chatHistory, timestamp: Date.now() }));
        }
    }, [chatHistory, activePromptKey]);
    // This effect updates the page title and meta tags whenever the active assistant changes.
    useEffect(() => {
        const assistantDescriptions = {
            'Prompt Assistant': 'AI-powered prompt engineering and optimization tool for educational content creation.',
            'Item Writer': 'Generate scenario-based assessment items with structured scoring guides for Uganda\'s CBC curriculum.',
            'Lesson Plans (NCDC)': 'Create detailed lesson plans following the official NCDC template for Ugandan educators.',
            'Lesson Plans (with Biblical Integration)': 'Create NCDC lesson plans with integrated biblical values and Christian worldview perspectives.',
            'UACE SoW NCDC': 'Develop comprehensive schemes of work specifically for Uganda Advanced Certificate of Education (UACE) level.',
            'Scheme of Work NCDC': 'Develop structured schemes of work based on Uganda\'s CBC syllabus requirements.',
            'Scheme of Work (with Biblical Integration)': 'Create CBC schemes of work incorporating biblical principles and Christian educational values.',
            'Lesson Notes Generator': 'Produce comprehensive and well-structured lecture notes for any educational topic.',
            'UCE Project Assistant': 'Guide students through Uganda Certificate of Education (UCE) project planning and execution.',
            'AI in Education Coach': 'Get guidance on integrating AI tools effectively into your classroom teaching.',
            'Essay Grading Assistant': 'Efficiently grade student essays using specified rubrics and assessment criteria.',
            'Coteacher': 'Your all-purpose AI teaching assistant for questions, brainstorming, and classroom support.',
            'Data & Document Analyst': 'Analyze educational data, documents, and research materials with AI-powered insights.',
            'UCE BIO Item Writer': 'Generate biology assessment items specifically designed for Uganda Certificate of Education (UCE) level.'
        };

        const title = `${activePromptKey} | AI Educational Assistant`;
        const description = assistantDescriptions[activePromptKey] || 'AI-powered educational tool for Uganda\'s CBC curriculum.';

        document.title = title;
        document.getElementById('page-description').content = description;
        document.getElementById('og-title').content = title;
        document.getElementById('og-description').content = description;
        document.getElementById('twitter-title').content = title;
        document.getElementById('twitter-description').content = description;
    }, [activePromptKey]);
    // NEW: This effect runs whenever the selected model changes.
    useEffect(() => {
        // We don't want to show a notification when the app first loads,
        // so we check if the chat history is not empty.
        if (chatHistory.length > 0) {
            // Create a new system message object to be added to the chat.
            const modelSwitchMessage = {
                role: 'system', // A special role for system messages
                content: `*Model switched to ${selectedModelName}*`,
                id: Date.now() // Unique ID for the message
            };

            // Add the new message to the existing chat history.
            setChatHistory(prevHistory => [...prevHistory, modelSwitchMessage]);
        }
    }, [selectedModelName]); // This tells React to run the effect only when selectedModelName changes.

    useEffect(() => {
        // Handle feedback modal trigger
        localStorage.setItem('generationCount', generationCount.toString());
        if (generationCount > 0 && generationCount % FEEDBACK_TRIGGER_COUNT === 0) {
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            let feedbackTimestamps = JSON.parse(localStorage.getItem('feedbackTimestamps') || '[]');
            feedbackTimestamps = feedbackTimestamps.filter(ts => now - ts < oneDay);

            if (feedbackTimestamps.length < 2) {
                setIsFeedbackModalOpen(true);
                feedbackTimestamps.push(now);
                localStorage.setItem('feedbackTimestamps', JSON.stringify(feedbackTimestamps));
            }
        }
    }, [generationCount]);

    useEffect(() => {
        // Auto-resize textarea
        const textarea = userInputRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [userInput]);

    useEffect(() => {
        // Auto-scroll chat only when content changes (not on initial load)
        if (chatHistory.length > 1 || (chatHistory.length === 1 && chatHistory[0].content && !chatHistory[0].content.includes('ready'))) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        // Don't force scroll to top on initial load - let natural padding handle it
    }, [chatHistory[chatHistory.length - 1]?.content]);


    // Measure the header height and apply padding to the chat inner wrapper
    // on small viewports so the first assistant message is not hidden by the
    // fixed header. This is a safe, non-destructive fix that only applies
    // when `window.innerWidth <= 640` (mobile).
    useEffect(() => {
        const setMainTopPadding = () => {
            try {
                const headerEl = headerRef.current;
                const mainEl = chatContainerRef.current;
                if (!headerEl || !mainEl) return;
                const innerDiv = mainEl.querySelector('div');
                if (!innerDiv) return;

                // Compute overlap between header bottom and main top.
                // If header overlays the main content (fixed/sticky), we set
                // padding-top on the inner wrapper so the first message is
                // fully visible. This accounts for varying header heights
                // and other banners that might affect layout.
                const headerRect = headerEl.getBoundingClientRect();
                const mainRect = mainEl.getBoundingClientRect();

                let requiredPadding = 0;
                if (window.innerWidth <= 640) {
                    // If the header bottom is below the main top, we need to
                    // push the main inner content down by that overlap amount.
                    if (mainRect.top < headerRect.bottom) {
                        requiredPadding = Math.ceil(headerRect.bottom - mainRect.top);
                    }
                }

                // Apply computed padding (or clear it on larger screens)
                innerDiv.style.paddingTop = requiredPadding ? `${requiredPadding}px` : '';
            } catch (e) {
                console.error('Failed to adjust chat padding', e);
            }
        };

        setMainTopPadding();
        window.addEventListener('resize', setMainTopPadding);
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(setMainTopPadding) : null;
        if (ro && headerRef.current) ro.observe(headerRef.current);

        return () => {
            window.removeEventListener('resize', setMainTopPadding);
            if (ro) ro.disconnect();
        };
    }, []);


    // --- RENDER ---
    if (isLoadingAssistants) {
        return (
            <div className="h-screen w-screen flex items-center justify-center loading-screen-overlay">
                <LoadingScreen text="Getting AI Assistants ready for you..." />
            </div>
        );
    }

    if (isPromptMissing) {
        // Render an error screen if the assistant prompt is missing
        return (
            <div className="flex items-center justify-center h-screen bg-slate-100 p-4">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-lg">
                    <AlertTriangleIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Assistant Not Configured</h2>
                    <p className="text-slate-600 mb-4">The "{activePromptKey}" assistant is not yet availabe.</p>
                    <p className="text-slate-600 mb-6">Please contact the administrator or select another assistant.</p>
                    <a href="/" className="mt-6 inline-flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 font-semibold"><HomeIcon className="w-5 h-5" />Return to Home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden flex bg-white">
            <Sidebar
                isMenuOpen={isMenuOpen}
                sidebarWidth={sidebarWidth}
                availableAssistants={availableAssistants}
                activePromptKey={activePromptKey}
                selectedProviderKey={selectedProviderKey}
                selectedModelName={selectedModelName}
                apiKeys={apiKeys}
                apiKeyStatus={apiKeyStatus}
                autoDeleteHours={autoDeleteHours}
                showResetConfirm={showResetConfirm}
                isGroundingEnabled={isGroundingEnabled}
                useSharedApiKey={useSharedApiKey}
                onUseSharedApiKeyChange={handleSharedKeyToggle}
                activeSharedKeyLabel={activeSharedKeyLabel}
                onGroundingChange={setIsGroundingEnabled}
                onClose={() => setIsMenuOpen(false)}
                onAssistantChange={handleAssistantChange} // <-- MODIFIED: Using the new handler
                onCustomPromptUpload={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                        const text = await file.text();
                        setCustomPromptContent(text);
                        setActivePromptKey('custom');
                        setIsPromptMissing(false);
                        setChatHistory([{ role: 'assistant', content: 'Custom prompt loaded. How can I assist?', id: Date.now() }]);
                    } catch (err) { setError('Could not read custom prompt file.'); }
                }}
                onProviderChange={(e) => {
                    const newProviderKey = e.target.value;
                    setSelectedProviderKey(newProviderKey);
                    const provider = AI_PROVIDERS.find(p => p.key === newProviderKey);
                    setSelectedModelName(provider.key === 'google' ? 'gemini-2.5-pro' : provider.models[0].name);
                }}
                onModelChange={(modelNameOrEvent) => {
                    // Handle both event object and direct model name
                    const modelName = typeof modelNameOrEvent === 'string' ? modelNameOrEvent : modelNameOrEvent.target.value;
                    setSelectedModelName(modelName);
                }}
                onApiKeyChange={handleApiKeyChange}
                onAutoDeleteChange={(e) => setAutoDeleteHours(e.target.value)}
                onResetSettings={resetSettings}
                onShowResetConfirm={setShowResetConfirm}
                onStartResizing={startResizing}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">

                <header ref={headerRef} className="fixed top-0 left-0 right-0 p-2 lg:p-4 border-b border-slate-200 flex flex-col items-center gap-2 flex-shrink-0 bg-white z-10" style={{ marginLeft: isMenuOpen && window.innerWidth >= 1024 ? sidebarWidth : 0 }}>
                    <h2 className="text-lg lg:text-xl font-semibold text-slate-800 text-center w-full">{activePromptKey} Assistant</h2>
                    <div className="flex flex-wrap items-center justify-center gap-1 lg:gap-2">
                        {!isMenuOpen && (
                            <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Open Settings">
                                <SettingsIcon className="w-5 h-5" />
                            </button>
                        )}
                        {/* Cart Icon - Grayed out and disabled for now */}
                        <button
                            onClick={() => usageCount === 0 ? setIsCartOpen(true) : null}
                            className="relative p-2 rounded-lg transition-colors opacity-30 cursor-not-allowed"
                            title="Cart (Coming Soon)"
                            disabled
                        >
                            <ShoppingCartIcon className="w-6 h-6 text-slate-400" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-slate-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                        {/* Help dropdown menu */}
                        <div className="relative">
                            <button onClick={() => setIsHelpMenuOpen(!isHelpMenuOpen)} id="help-button" title="Help & Feedback" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                                <HelpCircleIcon className="w-5 h-5" />
                            </button>
                            {isHelpMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                                    <button onClick={() => { setIsFeedbackModalOpen(true); setIsHelpMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                        <StarIcon className="w-4 h-4" />
                                        Send Feedback
                                    </button>
                                    <a href="https://wa.me/256726654714" target="_blank" rel="noopener noreferrer" onClick={() => setIsHelpMenuOpen(false)} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 no-underline">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" /></svg>
                                        WhatsApp Support
                                    </a>
                                </div>
                            )}
                        </div>
                        {isHelpMenuOpen && <div onClick={() => setIsHelpMenuOpen(false)} className="fixed inset-0 z-40"></div>}
                        <a href="gift.html" target="_blank" rel="noopener noreferrer" id="gift-button" title="Support the Creator" className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors no-underline">
                            <span className="text-lg">🎁</span>
                        </a>
                        <button id="notifications-button" onClick={() => setIsNotificationsOpen(true)} title="Notifications" className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"><BellIcon className="w-5 h-5" />{hasNewNotification && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}</button>
                        <button id="share-app-button" onClick={() => handleShare({ title: 'AI Educational Assistant', text: 'Check out this suite of AI-powered tools for educators!', url: window.location.href }, () => { setShowCopyToast(true); setTimeout(() => setShowCopyToast(false), 3000); })} title="Share this app" className="p-2 rounded-full hover:bg-slate-200"><Share2Icon className="w-5 h-5 text-slate-500" /></button>
                        <button id="clear-chat-button" onClick={clearChat} title="Clear chat messages" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                </header>

                <main ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar relative pt-32 sm:pt-28 pb-48">
                    <div className="px-1 p-2 sm:p-6 space-y-4">
                        {chatHistory.map((msg, index) => {
                            // For system messages, we render a simple, centered div.
                            if (msg.role === 'system') {
                                return (
                                    <div key={msg.id || index} className="text-center text-xs text-slate-500 italic my-2">
                                        🤖 {msg.content}
                                    </div>
                                );
                            }

                            // For user and assistant messages, we render the full chat bubble.
                            return (
                                <div key={msg.id || index} className={`flex w-full items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    <div className={`flex flex-col w-full max-w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`rounded-lg w-full overflow-hidden flex flex-col ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'}`}>
                                            {msg.files && msg.files.length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-indigo-500/80">
                                                    {msg.files.map((file, idx) => (
                                                        <div key={idx} className="relative group">
                                                            {file.previewUrl ?
                                                                <img src={file.previewUrl} alt={file.name} className="w-full h-24 object-cover rounded-md" /> :
                                                                <div className="w-full h-24 bg-indigo-400 rounded-md flex flex-col items-center justify-center text-white p-1">
                                                                    <FileIcon className="w-8 h-8" />
                                                                    <span className="text-xs text-center truncate w-full mt-1">{file.name}</span>
                                                                </div>
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <MarkdownRenderer htmlContent={marked.parse(msg.content || '')} isLoading={msg.isLoading} isTakingLong={isTakingLong} />
                                            <MessageMenu msg={msg} index={index} usageCount={usageCount} onCopy={async (content) => {
                                                // Track in both systems (Supabase + GAS). Fall back to local decrement on error.
                                                try {
                                                    await window.supabaseAuth.consume('download');
                                                    const quota = await window.supabaseAuth.getQuota();
                                                    if (quota) {
                                                        setUsageCount(quota.free_downloads_remaining);
                                                    }
                                                    await fetch(`${GAS_WEB_APP_URL}?action=logDownload&sessionId=${SESSION_ID}`);
                                                } catch (err) {
                                                    console.warn('Copy tracking failed:', err);
                                                    // Fall back to local tracking
                                                    const newCount = usageCount - 1;
                                                    setUsageCount(newCount);
                                                    localStorage.setItem('saveUsageCount', newCount.toString());
                                                }
                                                handleCopyToClipboard(content, () => { setShowCopyToast(true); setTimeout(() => setShowCopyToast(false), 3000); }, setError);
                                            }} onShare={(data) => handleShare(data, () => { setShowCopyToast(true); setTimeout(() => setShowCopyToast(false), 3000); })} onDelete={(idx) => setChatHistory(prev => prev.filter((_, i) => i !== idx))} onRegenerate={handleRegenerate} onDocxDownload={handleDocxDownload} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>
                </main>

                {/* --- NOTIFICATIONS PANEL --- */}
                <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: 'min(400px, 100vw)' }}>
                    <div className="flex flex-col h-full">
                        <header className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-xl font-semibold text-slate-800">Notifications</h3>
                            <button
                                onClick={() => setIsNotificationsOpen(false)}
                                className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="space-y-4 p-4">
                                    {notifications.map((note, index) => (
                                        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <p className="font-semibold text-slate-800">{note.message}</p>
                                            <p className="text-xs text-slate-500 mt-2">
                                                {new Date(note.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            {note.url && <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">Learn More &raquo;</a>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 mt-10 p-4">
                                    <BellIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                    <p className="font-medium">No new notifications</p>
                                    <p className="text-sm">Check back later for updates!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {isNotificationsOpen && <div onClick={() => setIsNotificationsOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>}



                <footer id="chat-input-area" className="fixed bottom-0 left-0 right-0 p-4 pb-safe border-t border-slate-200 bg-white flex-shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))', marginLeft: isMenuOpen && window.innerWidth >= 1024 ? sidebarWidth : 0 }}>
                    <div className="relative mx-auto max-w-4xl">
                        {error && <div className={`p-4 border-t flex-shrink-0 ${error.includes('Creating your Google Doc') || error.includes('Getting shared API key') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{error}</div>}
                        {/* NEW: Attachment Manager UI */}
                        {pendingFiles.length > 0 && (
                            <div className="absolute bottom-full left-0 mb-2 w-full max-w-2xl p-2">
                                <div className="bg-slate-200 rounded-lg p-3 shadow-md max-h-40 overflow-y-auto">
                                    {/* Header with total size */}
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-semibold text-slate-800">Attachments ({pendingFiles.length})</h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium ${pendingFiles.reduce((sum, f) => sum + f.file.size, 0) > MAX_TOTAL_UPLOAD_SIZE * 0.9 ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                                                {formatBytes(pendingFiles.reduce((sum, f) => sum + f.file.size, 0))} / {formatBytes(MAX_TOTAL_UPLOAD_SIZE)}
                                            </span>
                                            <button onClick={() => setPendingFiles([])} className="text-xs text-red-600 hover:text-red-800 font-medium" title="Clear all attachments">
                                                Clear All
                                            </button>
                                        </div>
                                    </div>

                                    {/* Horizontal list of attached files */}
                                    <div className="flex flex-wrap gap-2">
                                        {pendingFiles.map(f => (
                                            <div key={f.id} className="flex items-center gap-2 bg-white p-2 rounded-md text-sm">
                                                {f.previewUrl ?
                                                    <img src={f.previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded-md shrink-0" /> :
                                                    <FileIcon className="w-10 h-10 text-slate-500 shrink-0 p-1" />
                                                }
                                                <div className="flex-grow overflow-hidden max-w-[100px]">
                                                    <p className="font-medium text-slate-800 truncate text-xs">{f.file.name}</p>
                                                    <p className="text-xs text-slate-500">{formatBytes(f.file.size)}</p>
                                                </div>
                                                <button onClick={() => handleRemoveFile(f.id)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500 shrink-0">
                                                    <XIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-end gap-2 sm:gap-4">
                            <div id="file-attach-button" className="flex flex-col items-center self-end">
                                <label htmlFor="file-upload" title={isFileUploadDisabled ? "File upload not supported by this model" : "Attach File"} className={`p-3 rounded-full hover:bg-slate-100 ${isFileUploadDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <PlusCircleIcon className="w-6 h-6 text-slate-600" />
                                </label>
                                <span className="text-xs text-slate-400 hidden sm:inline">Attach</span>
                            </div>
                            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isFileUploadDisabled} />
                            <textarea ref={userInputRef} id="chat-input" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="Type here..." className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-y-auto max-h-48" rows="1" />
                            {/* UPDATED: Wrap the send button and add the trial counter text */}
                            <div className="flex flex-col items-center">
                                <button id="send-button" onClick={isLoading ? stopStreaming : handleSendMessage} disabled={!isLoading && !userInput.trim() && pendingFiles.length === 0} className="px-4 py-3 rounded-lg bg-indigo-600 text-white disabled:bg-slate-300 transition-colors hover:bg-indigo-700 self-end flex items-center gap-2 font-semibold">
                                    {isLoading ? (<><StopIcon className="w-5 h-5" /><span>Stop</span></>) : (<><SendIcon className="w-5 h-5" /><span>Send</span></>)}
                                </button>
                                {/* The trial counter now only appears when the shared key mode is active. */}
                                {useSharedApiKey && (
                                    <p className="text-xs text-slate-500 mt-1 text-center">
                                        {trialGenerations > 0 ? `${trialGenerations} free uses remaining.` : 'Add API key to continue.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* --- TOASTS & MODALS --- */}
            {showCopyToast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg z-50">Copied to clipboard!</div>}
            {apiKeyToast && <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 text-white ${apiKeyToast.includes('Invalid') ? 'bg-red-600' : 'bg-green-600'}`}>{apiKeyToast.includes('Invalid') ? <AlertCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}<span>{apiKeyToast}</span></div>}
            {/* Consent modal for first-time users */}
            <ConsentModal
                isOpen={showConsentModal}
                onAccept={() => {
                    window.supabaseAuth?.acceptTerms();
                }}
            />
            <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} onSubmit={(feedbackData) => handleFeedbackSubmit({ ...feedbackData, sessionId: SESSION_ID })} assistantName={activePromptKey} />
            <CartModal
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onRemoveItem={(itemId) => {
                    const updatedCart = cartItems.filter(item => item.id !== itemId);
                    setCartItems(updatedCart);
                    localStorage.setItem('cart', JSON.stringify(updatedCart));
                    // Clear CartID if cart is empty
                    if (updatedCart.length === 0) {
                        setCurrentCartId(null);
                        localStorage.removeItem('currentCartId');
                    }
                }}
                onCheckout={() => {
                    if (!paymentFormUrl) {
                        alert('Payment form is loading, please try again.');
                        return;
                    }
                    const itemsList = cartItems.map((item, i) => `${i + 1}. ${item.assistantName} (${new Date(item.timestamp).toLocaleString()})`).join('\n');
                    const total = cartItems.length * 1000;

                    const params = new URLSearchParams({
                        'entry.1510315924': SESSION_ID,
                        'entry.153116271': itemsList,
                        'entry.1062442954': total.toString(),
                        'entry.322933472': currentCartId || 'N/A'
                    });

                    window.open(`${paymentFormUrl}?${params.toString()}`, '_blank');

                    // Clear cart and CartID after checkout
                    setCartItems([]);
                    localStorage.removeItem('cart');
                    setCurrentCartId(null);
                    localStorage.removeItem('currentCartId');
                    setIsCartOpen(false);
                }}
            />
            <LimitReachedModal
                isOpen={isLimitModalOpen}
                onClose={() => setIsLimitModalOpen(false)}
                itemType={pendingAction?.type || 'download'}
                inCart={pendingAction?.inCart}
                onAddToCart={() => {
                    const newItem = {
                        id: Date.now(),
                        type: pendingAction.type,
                        assistantName: activePromptKey,
                        sessionId: SESSION_ID,
                        timestamp: new Date().toISOString(),
                        price: 1000,
                        content: pendingAction.content
                    };
                    const updatedCart = [...cartItems, newItem];
                    setCartItems(updatedCart);
                    localStorage.setItem('cart', JSON.stringify(updatedCart));
                    setIsLimitModalOpen(false);
                    setShowCopyToast(true);
                    setTimeout(() => setShowCopyToast(false), 3000);
                }}
                onRemoveFromCart={() => {
                    const updatedCart = cartItems.filter(item => item.content !== pendingAction.content);
                    setCartItems(updatedCart);
                    localStorage.setItem('cart', JSON.stringify(updatedCart));
                    // Clear CartID if cart is empty
                    if (updatedCart.length === 0) {
                        setCurrentCartId(null);
                        localStorage.removeItem('currentCartId');
                    }
                    setIsLimitModalOpen(false);
                }}
            />
            {/* NEW: Add the Google Doc success modal to the UI */}
            <DocSuccessModal
                isOpen={isDocModalOpen}
                onClose={() => setIsDocModalOpen(false)}
                docInfo={createdDocInfo}
            />
        </div>
    );
}
