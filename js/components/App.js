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
const App = () => {
  // --- STATE MANAGEMENT ---
  

  const [apiKeys, setApiKeys] = useState({});
  const [apiKeyStatus, setApiKeyStatus] = useState({});
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [selectedProviderKey, setSelectedProviderKey] = useState('google');
  const [selectedModelName, setSelectedModelName] = useState('gemini-2.5-flash');
  const [autoDeleteHours, setAutoDeleteHours] = useState('2');
  const [chatHistory, setChatHistory] = useState([]);
  // UPDATED: State to hold an array of pending files for multi-file upload.
    const [pendingFiles, setPendingFiles] = useState([]);;
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [customPromptContent, setCustomPromptContent] = useState('');
  // The initial assistant is now read from the URL once, and then managed by the app's state.
const [activePromptKey, setActivePromptKey] = useState(() => new URLSearchParams(window.location.search).get('assistant') || 'Coteacher');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  // NEW: This function handles switching assistants without a page reload.
const handleAssistantChange = (newAssistantKey) => {
    if (newAssistantKey === activePromptKey) return; // Do nothing if the same assistant is selected

    // Update the app's state to the new assistant
    setActivePromptKey(newAssistantKey);

    // Update the browser's URL bar without reloading the page
    const url = new URL(window.location);
    url.searchParams.set('assistant', newAssistantKey);
    window.history.pushState({}, '', url);

    // Clear the current chat and load the initial message for the new assistant
    setChatHistory([]); // Clear existing messages
    loadInitialMessage(newAssistantKey); // Load the welcome message for the new assistant
};
  const [showConsentModal, setShowConsentModal] = useState(false);
  // NEW: State for the Google Doc success and download modal
const [isDocModalOpen, setIsDocModalOpen] = useState(false);
const [createdDocInfo, setCreatedDocInfo] = useState(null);
    // NEW: State for the Google Search (grounding) toggle
const [isGroundingEnabled, setIsGroundingEnabled] = useState(false);
  // NEW: State to manage whether the user wants to use the shared (trial) API key.
    const [useSharedApiKey, setUseSharedApiKey] = useState(true);

  // This new handler ensures that when the shared key is enabled,
  // the provider is always reset to Google Gemini.
  const handleSharedKeyToggle = (isEnabled) => {
    setUseSharedApiKey(isEnabled);
    if (isEnabled) {
      setSelectedProviderKey('google');
      setSelectedModelName('gemini-2.5-flash'); // Reset to a default Gemini model
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
  const userInputRef = useRef(null);
  const validationTimeoutRef = useRef(null);
  const apiKeyToastTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const longResponseTimerRef = useRef(null);

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
      
      if(longResponseTimerRef.current) clearTimeout(longResponseTimerRef.current);
      longResponseTimerRef.current = setTimeout(() => {
          setIsTakingLong(true);
      }, LONG_RESPONSE_TIMEOUT);

    // Track whether the request/stream failed so callers don't treat
    // failed attempts as successful completions.
    let hadError = false;

      try {
          let requestUrl, requestHeaders, requestBody;
if (selectedProvider.key === 'google') {
    requestUrl = `${selectedProvider.apiHost}/v1beta/models/${selectedModel.name}:streamGenerateContent?key=${apiKey}&alt=sse`;
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
              const systemMessage = selectedProvider.key === 'anthropic' ? { system: systemPrompt } : { messages: [{role: 'system', content: systemPrompt}, ...messages] };
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
              if (abortControllerRef.current.signal.aborted) break;
              
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
                              onUpdate(textChunk);
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
          clearTimeout(longResponseTimerRef.current);
          setIsTakingLong(false);

          const wasAborted = abortControllerRef.current && abortControllerRef.current.signal && abortControllerRef.current.signal.aborted;
          if (!hadError && !wasAborted) {
              try { onComplete(); } catch (e) { console.error('onComplete handler failed', e); }
          }
      }
  };

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
                  finalMessage = intro.replace(/\\n/g, '\n');
              } else {
                  finalMessage = `${promptKey} assistant is ready. How can I assist you?`;
              }
          } catch (e) {
              finalMessage = `${promptKey} assistant is ready. How can I assist you?`;
          }
          setChatHistory([{ role: 'assistant', content: finalMessage, id: Date.now() }]);
      }
  }, [autoDeleteHours]);

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
                  body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 1, messages: [{role: "user", content: "ping"}] })
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
      setApiKeys(prev => ({...prev, [keyName]: value}));
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
  
   // UPDATED: This function now receives the doc ID and opens our new modal.
const handleDocxDownload = async (markdownContent) => {
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
        modelName: selectedModelName // The AI model used (e.g., "gemini-2.5-flash")
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
            // Store the document info (URL and ID) in our new state.
            setCreatedDocInfo({ url: data.url, id: data.id });
            // Open our new modal instead of a new tab.
            setIsDocModalOpen(true);
            setError(''); // Clear the "Creating..." message.
        } else {
            // If the server reported an error, throw it so our catch block can handle it.
            throw new Error(data.error || 'The server did not return the required document information.');
        }

    } catch (error) {
        console.error("Error creating Google Doc:", error);
        // Display a user-friendly error message.
        setError(`Failed to create Google Doc: ${error.message}`);
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
              
              if (!abortControllerRef.current.signal.aborted) {
                  // Use our new local variable for logging.
                  const finalKeyLabel = keyLabelForLogging || (isTrial ? 'SHARED KEY' : 'PERSONAL KEY');

                  if (isTrial) {
                      const newCount = trialGenerations - 1;
                      setTrialGenerations(newCount);
                      localStorage.setItem('trialGenerationsCount', newCount.toString());
                      trackEvent('trial_generation', activePromptKey, { sessionId: SESSION_ID, apiKeyUsed: finalKeyLabel });
                  } else {
                      trackEvent('generation', activePromptKey, { sessionId: SESSION_ID, apiKeyUsed: finalKeyLabel });
                  }
                  setGenerationCount(prevCount => prevCount + 1);
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
          if(msgToUpdate) {
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
              if (!abortControllerRef.current.signal.aborted) {
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
const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || isFileUploadDisabled) return;

    let currentTotalSize = pendingFiles.reduce((sum, f) => sum + f.file.size, 0);

    const newFiles = files.map(file => {
        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
        return { file, previewUrl, id: Date.now() + Math.random() };
    });

    for (const newFile of newFiles) {
        if (currentTotalSize + newFile.file.size > MAX_TOTAL_UPLOAD_SIZE) {
            setError(`Cannot add "${newFile.file.name}". Total size cannot exceed 10 MB.`);
            // We stop adding files once the limit is reached.
            break;
        }
        setPendingFiles(prev => [...prev, newFile]);
        currentTotalSize += newFile.file.size;
    }
    
    // Clear the input value so the user can select the same file again if they remove it.
    e.target.value = null;
};

// NEW: Handles removing a specific file from the pending list.
const handleRemoveFile = (fileId) => {
    setPendingFiles(prev => prev.filter(f => f.id !== fileId));
};
  const resetSettings = () => {
      localStorage.removeItem('aiAssistantState');
      localStorage.removeItem('generationCount');
      localStorage.removeItem('feedbackTimestamps');
      localStorage.removeItem('hasSeenCbcAiTutorial');
      localStorage.removeItem('userConsentV1');
      Object.keys(localStorage).forEach(key => {
          if (key.startsWith('chatHistory_')) {
              localStorage.removeItem(key);
          }
      });
      setShowResetConfirm(false);

      setApiKeys({});
      setApiKeyStatus({});
      setSidebarWidth(320);
      setSelectedProviderKey('google');
      setSelectedModelName('gemini-2.5-flash');
      setAutoDeleteHours('2');
      setGenerationCount(0);
      
      loadInitialMessage(activePromptKey);
      setShowConsentModal(true);
  };

// --- TUTORIAL LOGIC ---
// The tutorial has been temporarily disabled to fix a bug.
// The following are empty placeholder functions to prevent the app from crashing.
const startResizing = useCallback(() => {}, []);
const handleHelpButtonClick = () => {};

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
      
      let currentTotalSize = pendingFiles.reduce((sum, f) => sum + f.file.size, 0);

      const newFiles = files.map(file => {
        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
        return { file, previewUrl, id: Date.now() + Math.random() };
      });

      for (const newFile of newFiles) {
        if (currentTotalSize + newFile.file.size > MAX_TOTAL_UPLOAD_SIZE) {
          setError(`Cannot paste "${newFile.file.name}". Total size cannot exceed 10 MB.`);
          break;
        }
        setPendingFiles(prev => [...prev, newFile]);
        currentTotalSize += newFile.file.size;
      }
    }
  }, [pendingFiles, isFileUploadDisabled, MAX_TOTAL_UPLOAD_SIZE]);

  // --- EFFECTS ---
  useEffect(() => {
      // Initialize the app on first load
      const initializeApp = async () => {
          if (!localStorage.getItem('userConsentV1')) {
              setShowConsentModal(true);
          }

          const savedCount = parseInt(localStorage.getItem('generationCount') || '0', 10);
          setGenerationCount(savedCount);

          // NEW: Smartly reset trial generations when the policy changes.
          const TRIAL_POLICY_VERSION = 'v2'; // Increment this to reset everyone's trial count in the future.
          const savedPolicyVersion = localStorage.getItem('trialPolicyVersion');
          let trialCount;

          if (savedPolicyVersion !== TRIAL_POLICY_VERSION) {
            // If the user is on an old version, give them the new full amount of trials.
            trialCount = TRIAL_GENERATION_LIMIT;
            localStorage.setItem('trialGenerationsCount', trialCount.toString());
            localStorage.setItem('trialPolicyVersion', TRIAL_POLICY_VERSION); // Save the new version.
          } else {
            // Otherwise, load their saved count as usual.
            trialCount = parseInt(localStorage.getItem('trialGenerationsCount') || TRIAL_GENERATION_LIMIT, 10);
          }
          setTrialGenerations(trialCount);

          setIsLoadingAssistants(true);
          const [assistants, fetchedNotifications] = await Promise.all([
              PromptManager.getAvailableAssistants(),
              fetchNotifications()
          ]);
          
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
          setSelectedModelName(savedState.selectedModelName || 'gemini-2.5-flash');
          setAutoDeleteHours(savedState.autoDeleteHours || '2');

          // Load the welcome message for the assistant that was determined from the URL
          loadInitialMessage(activePromptKey);

          setIsLoadingAssistants(false);
      };
      initializeApp();

      // Add paste event listener
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
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
    // This effect updates the page title whenever the active assistant changes.
  useEffect(() => {
      document.title = `${activePromptKey} | AI Assistant`;
  }, [activePromptKey]); // It runs only when the activePromptKey state changes.
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
      // Auto-scroll chat
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory[chatHistory.length - 1]?.content]);


  // --- RENDER ---
  if (isLoadingAssistants) {
      return (
          <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
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
                  <a href = "/" className="mt-6 inline-flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 font-semibold"><HomeIcon className="w-5 h-5"/>Return to Home</a>
              </div>
          </div>
      );
  }

  return (
      <div className="h-screen w-screen overflow-hidden flex bg-white">
          {showConsentModal && <ConsentModal onAccept={() => {
              localStorage.setItem('userConsentV1', 'true');
              setShowConsentModal(false);
          }} />}
          
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
                  setSelectedModelName(AI_PROVIDERS.find(p => p.key === newProviderKey).models[0].name);
              }}
              onModelChange={(e) => setSelectedModelName(e.target.value)}
              onApiKeyChange={handleApiKeyChange}
              onAutoDeleteChange={(e) => setAutoDeleteHours(e.target.value)}
              onResetSettings={resetSettings}
              onShowResetConfirm={setShowResetConfirm}
              onStartResizing={startResizing}
          />

          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
              {showUpdateBanner && <UpdateBanner latestUpdate={notifications[0]} onDismiss={() => {
                  setShowUpdateBanner(false);
                  if (notifications.length > 0) {
                      localStorage.setItem('lastSeenUpdateTimestamp', notifications[0].timestamp);
                      setHasNewNotification(false);
                  }
              }} />}
              
              <header className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0 bg-white z-10">
                  <button onClick={() => setIsMenuOpen(true)} className="p-1 text-slate-600 hover:text-slate-900 lg:hidden"><MenuIcon className="w-6 h-6" /></button>
                  <h2 className="text-xl font-semibold text-slate-800 text-center flex-1">{activePromptKey} Assistant</h2>
                  <div className="flex items-center gap-2">
                      {/* The Help button is now a direct link to WhatsApp for support. */}
<a href="https://wa.me/256726654714" target="_blank" rel="noopener noreferrer" id="help-button" title="Get Help on WhatsApp" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors no-underline">
    <HelpCircleIcon className="w-5 h-5"/>
    <span className="hidden sm:inline">Help</span>
</a>
                      <a href="gift.html" target="_blank" rel="noopener noreferrer" id="gift-button" title="Support the Creator" className="flex items-center gap-2 p-2 rounded-lg hover:bg-amber-50 text-amber-600 font-medium text-sm transition-colors no-underline">
                          <span className="text-lg">🎁</span>
                          <span className="hidden sm:inline">Send me a gift</span>
                      </a>
                      <button id="notifications-button" onClick={() => setIsNotificationsOpen(true)} title="Notifications" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors"><BellIcon className="w-5 h-5"/><span className="hidden sm:inline">Notifications</span>{hasNewNotification && <span className="block w-2.5 h-2.5 bg-red-500 rounded-full"></span>}</button>
                      <button id="share-app-button" onClick={() => handleShare({ title: 'AI Educational Assistant', text: 'Check out this suite of AI-powered tools for educators!', url: window.location.href }, () => { setShowCopyToast(true); setTimeout(() => setShowCopyToast(false), 3000); })} title="Share this app" className="p-2 rounded-full hover:bg-slate-200"><Share2Icon className="w-5 h-5 text-slate-500"/></button>
                      <button id="clear-chat-button" onClick={clearChat} title="Clear chat messages" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors"><TrashIcon className="w-5 h-5"/><span className="hidden sm:inline">Clear Chat</span></button>
                  </div>
              </header>

              <main ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
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
                <img src={file.previewUrl} alt={file.name} className="w-full h-24 object-cover rounded-md"/> :
                <div className="w-full h-24 bg-indigo-400 rounded-md flex flex-col items-center justify-center text-white p-1">
                    <FileIcon className="w-8 h-8"/>
                    <span className="text-xs text-center truncate w-full mt-1">{file.name}</span>
                </div>
            }
        </div>
    ))}
</div>
                                          )}
                                          <MarkdownRenderer htmlContent={marked.parse(msg.content || '')} isLoading={msg.isLoading} isTakingLong={isTakingLong} />
                                          <MessageMenu msg={msg} index={index} onCopy={(content) => handleCopyToClipboard(content, () => { setShowCopyToast(true); setTimeout(() => setShowCopyToast(false), 3000); }, setError)} onShare={(data) => handleShare(data, () => { setShowCopyToast(true); setTimeout(() => setShowCopyToast(false), 3000); })} onDelete={(idx) => setChatHistory(prev => prev.filter((_, i) => i !== idx))} onRegenerate={handleRegenerate} onDocxDownload={handleDocxDownload} />
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
                          <button onClick={() => setIsNotificationsOpen(false)} className="p-2 rounded-full hover:bg-slate-100">
                              <XIcon className="w-6 h-6 text-slate-600" />
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
                                  <BellIcon className="w-12 h-12 mx-auto mb-4 text-slate-400"/>
                                  <p className="font-medium">No new notifications</p>
                                  <p className="text-sm">Check back later for updates!</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
              {isNotificationsOpen && <div onClick={() => setIsNotificationsOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"></div>}

              

              <footer id="chat-input-area" className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
                  <div className="relative mx-auto max-w-4xl">
                                  {error && <div className={`p-4 border-t flex-shrink-0 ${error.includes('Creating your Google Doc') || error.includes('Getting shared API key') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{error}</div>}
                      {/* NEW: Attachment Manager UI */}
{pendingFiles.length > 0 && (
    <div className="absolute bottom-full left-0 mb-2 w-full max-w-2xl p-2">
        <div className="bg-slate-200 rounded-lg p-3 shadow-md">
            {/* Header with total size and progress bar */}
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-slate-800">Attachments ({pendingFiles.length})</h4>
                <span className="text-xs font-medium text-slate-600">
                    {formatBytes(pendingFiles.reduce((sum, f) => sum + f.file.size, 0))} / {formatBytes(MAX_TOTAL_UPLOAD_SIZE)}
                </span>
            </div>
            <div className="w-full bg-slate-300 rounded-full h-1.5 mb-3">
                <div 
                    className="bg-indigo-600 h-1.5 rounded-full" 
                    style={{ width: `${(pendingFiles.reduce((sum, f) => sum + f.file.size, 0) / MAX_TOTAL_UPLOAD_SIZE) * 100}%` }}
                ></div>
            </div>

            {/* List of attached files */}
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {pendingFiles.map(f => (
                    <div key={f.id} className="flex items-center gap-2 bg-white p-1.5 rounded-md text-sm">
                        {f.previewUrl ? 
                            <img src={f.previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded-md shrink-0"/> : 
                            <FileIcon className="w-10 h-10 text-slate-500 shrink-0 p-1"/>
                        }
                        <div className="flex-grow overflow-hidden">
                            <p className="font-medium text-slate-800 truncate">{f.file.name}</p>
                            <p className="text-xs text-slate-500">{formatBytes(f.file.size)}</p>
                        </div>
                        <button onClick={() => handleRemoveFile(f.id)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 shrink-0">
                            <XIcon className="w-4 h-4" />
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
                                  <PlusCircleIcon className="w-6 h-6 text-slate-600"/>
                              </label>
                              <span className="text-xs text-slate-400 hidden sm:inline">Attach</span>
                           </div>
                          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isFileUploadDisabled}/>
                          <textarea ref={userInputRef} id="chat-input" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} placeholder="Type your message or attach a file..." className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-y-auto max-h-48" rows="1" />
                                                    {/* UPDATED: Wrap the send button and add the trial counter text */}
                          <div className="flex flex-col items-center">
                              <button id="send-button" onClick={isLoading ? () => { if (abortControllerRef.current) abortControllerRef.current.abort(); if(longResponseTimerRef.current) clearTimeout(longResponseTimerRef.current); setIsTakingLong(false); } : handleSendMessage} disabled={!isLoading && !userInput.trim() && pendingFiles.length === 0} className="px-4 py-3 rounded-lg bg-indigo-600 text-white disabled:bg-slate-300 transition-colors hover:bg-indigo-700 self-end flex items-center gap-2 font-semibold">
                                  {isLoading ? ( <><StopIcon className="w-5 h-5"/><span>Stop</span></> ) : ( <><SendIcon className="w-5 h-5"/><span>Send</span></> )}
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
          {apiKeyToast && <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 text-white ${apiKeyToast.includes('Invalid') ? 'bg-red-600' : 'bg-green-600'}`}>{apiKeyToast.includes('Invalid') ? <AlertCircleIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5"/>}<span>{apiKeyToast}</span></div>}
          <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} onSubmit={(feedbackData) => handleFeedbackSubmit({ ...feedbackData, sessionId: SESSION_ID })} assistantName={activePromptKey} />
            {/* NEW: Add the Google Doc success modal to the UI */}
<DocSuccessModal 
    isOpen={isDocModalOpen} 
    onClose={() => setIsDocModalOpen(false)} 
    docInfo={createdDocInfo} 
/>
      </div>
  );
}