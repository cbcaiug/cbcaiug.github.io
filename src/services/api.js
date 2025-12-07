/**
 * js/services/api.js
 *
 * This file centralizes all API communication for the application.
 * It handles fetching data from the Google Apps Script backend and
 * streaming responses from the various AI model providers.
 */

// --- CONFIGURATION CONSTANTS ---
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz_b_LYkR5OvK90eVKZnbRPXsPjnDZK6S3kKqIwjmVr_s0tj28cSnEGsx-oqBuRxIcL/exec';

const AI_PROVIDERS = [
    {
        key: 'google', label: 'Google Gemini', apiKeyName: 'googleApiKey', apiKeyUrl: 'https://aistudio.google.com/app/apikey', apiHost: 'https://generativelanguage.googleapis.com', models: [
            { name: 'gemini-2.5-pro', vision: true },
            { name: 'gemini-2.5-flash', vision: true },
            { name: 'gemini-2.0-flash', vision: true }
        ]
    },
    {
        key: 'openai', label: 'OpenAI GPT', apiKeyName: 'openaiApiKey', apiKeyUrl: 'https://platform.openai.com/api-keys', apiHost: 'https://api.openai.com', models: [
            { name: 'gpt-4o', vision: true }, { name: 'gpt-4-turbo', vision: true }, { name: 'gpt-3.5-turbo', vision: false }
        ]
    },
    {
        key: 'anthropic', label: 'Anthropic Claude', apiKeyName: 'anthropicApiKey', apiKeyUrl: 'https://console.anthropic.com/settings/keys', apiHost: 'https://api.anthropic.com', models: [
            { name: 'claude-3-opus-20240229', vision: true }, { name: 'claude-3-sonnet-20240229', vision: true }, { name: 'claude-3-haiku-20240307', vision: true }
        ]
    },
    {
        key: 'groq', label: 'Llama 3 (via Groq)', apiKeyName: 'groqApiKey', apiKeyUrl: 'https://console.groq.com/keys', apiHost: 'https://api.groq.com/openai', models: [
            { name: 'llama3-8b-8192', vision: false }, { name: 'llama3-70b-8192', vision: false }
        ]
    },
    {
        key: 'deepseek', label: 'Deepseek (Free Tier)', apiKeyName: 'deepseekApiKey', apiKeyUrl: 'https://platform.deepseek.com/api_keys', apiHost: 'https://api.deepseek.com', models: [
            { name: 'deepseek-chat', vision: false }, { name: 'deepseek-coder', vision: false }
        ]
    },
    {
        key: 'qwen', label: 'Qwen (Free Tier)', apiKeyName: 'qwenApiKey', apiKeyUrl: 'https://openrouter.ai/keys', apiHost: 'https://openrouter.ai/api', models: [
            { name: 'qwen/qwen-2-72b-instruct', vision: false }, { name: 'qwen/qwen-2-7b-instruct', vision: false }
        ]
    },
];

// --- EVENT TRACKING & FEEDBACK ---

/**
 * Sends an event log to the Google Apps Script backend.
 * @param {string} eventType - The type of event (e.g., 'generation', 'feedback_submitted').
 * @param {string} assistantName - The name of the assistant being used.
 * @param {object} details - Additional details about the event.
 */
const trackEvent = (eventType, assistantName, details = {}) => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

    // NEW: 21/08/2025 5:05 PM - Add browser and OS info to the details payload.
    // The navigator.userAgent string contains all this information.
    details.browserOs = navigator.userAgent;

    const payload = {
        action: 'logEvent',
        event: {
            type: eventType,
            assistant: assistantName,
            details: details,
            userType: isAdmin ? 'Admin' : 'User'
        }
    };

    fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // Use no-cors for simple, one-way data sending.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    }).catch(error => console.error('Event tracking failed:', error));
};

/**
 * Submits feedback data to the backend. This is a specific implementation of trackEvent.
 * @param {object} submissionData - The data from the feedback form.
 */
const handleFeedbackSubmit = async (submissionData) => {
    trackEvent('feedback_submitted', submissionData.assistantName, submissionData);
};


// --- PROMPT & NOTIFICATION MANAGEMENT ---

const PromptManager = {
    cache: {},
    availableAssistants: [],
    async getAvailableAssistants() {
        try {
            const response = await fetch(`${GAS_WEB_APP_URL}?action=getAssistants`);
            const data = await response.json();
            if (data.success) {
                this.availableAssistants = data.assistants;
                return data.assistants;
            }
            throw new Error(data.error || 'Failed to fetch assistants');
        } catch (error) {
            console.error('Error fetching assistants:', error);
            return ["Item Writer", "Lesson Notes Generator"]; // Fallback
        }
    },
    async getPromptContent(assistantName) {
        if (this.cache[assistantName]) return this.cache[assistantName];
        try {
            const response = await fetch(`${GAS_WEB_APP_URL}?action=getPrompt&assistant=${encodeURIComponent(assistantName)}`);
            const data = await response.json();
            if (data.success && data.prompt && data.prompt.trim() !== '') {
                this.cache[assistantName] = data.prompt;
                return data.prompt;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching prompt for ${assistantName}:`, error);
            return null;
        }
    },
    clearCache() { this.cache = {}; }
};

/**
 * Fetches the latest notifications/updates from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of update objects.
 */
const fetchNotifications = async () => {
    try {
        const response = await fetch(`${GAS_WEB_APP_URL}?action=getUpdates`);
        const data = await response.json();
        if (data.success && data.updates) {
            return data.updates;
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }
};

/**
 * Fetches recent positive reviews from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of review objects.
 */
const fetchReviews = async () => {
    try {
        const response = await fetch(`${GAS_WEB_APP_URL}?action=getReviews`);
        const data = await response.json();
        if (data.success && data.reviews) {
            return data.reviews;
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return [];
    }
};

// --- FILE & DATA PROCESSING ---

/**
 * Processes a user-selected file into the format required by the AI API.
 * @param {File} file - The file object from the input.
 * @returns {Promise<object>} A promise that resolves to an object with mime_type and base64 data.
 */
const processFileForApi = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) reject("No file provided");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ mime_type: file.type, data: reader.result.split(',')[1] });
        reader.onerror = (error) => reject(error);
    });
};

// Note: The main `fetchAndStreamResponse` function will be moved into the App.js component
// in a later step, as it is tightly coupled with the application's state management.
// This file is for standalone services that do not directly manage React state.