/**
 * js/components/Sidebar.js
 *
 * Enhanced sidebar with tabbed interface, collapsible sections, and improved UX
 */

const { useCallback, useState, useEffect } = React;

const Sidebar = ({
    // State props
    isMenuOpen,
    sidebarWidth,
    availableAssistants,
    activePromptKey,
    selectedProviderKey,
    selectedModelName,
    apiKeys,
    apiKeyStatus,
    autoDeleteHours,
    showResetConfirm,
    isGroundingEnabled,
    useSharedApiKey,
    activeSharedKeyLabel,

    // Handler props
    onClose,
    onAssistantChange,
    onCustomPromptUpload,
    onProviderChange,
    onModelChange,
    onApiKeyChange,
    onAutoDeleteChange,
    onResetSettings,
    onShowResetConfirm,
    onStartResizing,
    onGroundingChange,
    onUseSharedApiKeyChange,
}) => {
    const [activeTab, setActiveTab] = useState('ai');
    const [showPersonalKey, setShowPersonalKey] = useState(!useSharedApiKey);
    const [keyModeToast, setKeyModeToast] = useState('');
    
    const selectedProvider = AI_PROVIDERS.find(p => p.key === selectedProviderKey);

    // Handle personal key toggle
    const handlePersonalKeyToggle = (enabled) => {
        setShowPersonalKey(enabled);
        onUseSharedApiKeyChange(!enabled);
        
        // Show toast notification
        const message = enabled ? 'Using personal API key' : 'Using shared API key';
        setKeyModeToast(message);
        setTimeout(() => setKeyModeToast(''), 3000);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isMenuOpen) return;
            
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        setActiveTab('ai');
                        break;
                    case '2':
                        e.preventDefault();
                        setActiveTab('app');
                        break;
                    case '3':
                        e.preventDefault();
                        setActiveTab('about');
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen]);

    const TabButton = ({ id, label, shortcut, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`settings-tab flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive ? 'active' : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title={`${label} (Ctrl+${shortcut})`}
        >
            {label}
        </button>
    );

    const AISettingsTab = () => (
        <div className="space-y-4">
            {/* Assistant Selector */}
            <div>
                <label className="text-sm text-slate-400">Select Assistant</label>
                <select 
                    onChange={(e) => onAssistantChange(e.target.value)} 
                    value={activePromptKey} 
                    className="settings-input w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {availableAssistants.map(assistant => (
                        <option key={assistant} value={assistant}>{assistant}</option>
                    ))}
                    {activePromptKey === 'custom' && !availableAssistants.includes('custom') && 
                        <option value="custom">Custom Prompt</option>
                    }
                </select>
                <label htmlFor="custom-prompt-upload" className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer block text-center py-2 border border-dashed border-slate-600 rounded-md hover:border-indigo-500 transition-colors">
                    Upload Custom Prompt
                </label>
                <input id="custom-prompt-upload" type="file" className="hidden" accept=".txt,.json" onChange={onCustomPromptUpload} />
            </div>

            {/* Shared API Key Toggle */}
            <div className="bg-slate-700 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <label htmlFor="shared-key-toggle" className="font-semibold text-white">Use Shared API Key</label>
                        <p className="text-xs text-slate-400">Recommended for new users</p>
                        {activeSharedKeyLabel && <p className="text-xs text-indigo-300 mt-1">Active: <strong>{activeSharedKeyLabel}</strong></p>}
                    </div>
                    <label htmlFor="shared-key-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={useSharedApiKey} 
                            onChange={(e) => handlePersonalKeyToggle(!e.target.checked)} 
                            id="shared-key-toggle" 
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

            {/* AI Provider & Model - Always visible */}
            <div className="space-y-3">
                <div>
                    <label className="text-sm text-slate-400">AI Provider</label>
                    <select 
                        value={selectedProviderKey} 
                        onChange={onProviderChange} 
                        disabled={useSharedApiKey}
                        className={`settings-input w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${useSharedApiKey ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {AI_PROVIDERS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                    {useSharedApiKey && (
                        <p className="text-xs text-slate-500 mt-1">Locked to Google Gemini for shared keys</p>
                    )}
                </div>
                <div>
                    <label className="text-sm text-slate-400">AI Model</label>
                    <select 
                        value={selectedModelName} 
                        onChange={onModelChange} 
                        className="settings-input w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {selectedProvider?.models.map(model => <option key={model.name} value={model.name}>{model.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Personal API Key Settings - Only API Key Input */}
            <div>
                <button
                    onClick={() => handlePersonalKeyToggle(!showPersonalKey)}
                    className="flex items-center justify-between w-full text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <span>Use Personal API Key</span>
                    <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={showPersonalKey} 
                                onChange={(e) => handlePersonalKeyToggle(e.target.checked)} 
                                className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-600 rounded-full peer peer-focus:ring-1 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                        <svg className={`w-4 h-4 transition-transform ${showPersonalKey ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>
                
                {showPersonalKey && (
                    <div className="mt-3 p-3 bg-slate-700 rounded-lg">
                        <div>
                            <label className="text-sm text-slate-400">{selectedProvider?.label} API Key</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    value={apiKeys[selectedProvider?.apiKeyName] || ''} 
                                    onChange={(e) => onApiKeyChange(selectedProvider.apiKeyName, selectedProvider, e.target.value)} 
                                    placeholder={`Paste your ${selectedProvider?.label} key here`}
                                    className="settings-input w-full mt-1 p-2 pr-8 bg-slate-600 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    {apiKeyStatus[selectedProvider.key] === 'checking' && <div className="loading-spinner"></div>}
                                    {apiKeyStatus[selectedProvider.key] === 'valid' && <CheckCircleIcon className="w-5 h-5 text-green-500"/>}
                                    {apiKeyStatus[selectedProvider.key] === 'invalid' && <AlertCircleIcon className="w-5 h-5 text-red-500"/>}
                                </div>
                            </div>
                            <a href={selectedProvider?.apiKeyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-1 block">
                                Get your key here &raquo;
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const AppSettingsTab = () => (
        <div className="space-y-4">
            {/* Auto-delete Chat */}
            <div>
                <label className="text-sm text-slate-400">Auto-delete Chat</label>
                <select 
                    value={autoDeleteHours} 
                    onChange={onAutoDeleteChange} 
                    className="settings-input w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="1">After 1 Hour</option>
                    <option value="2">After 2 Hours</option>
                    <option value="24">After 24 Hours</option>
                    <option value="never">Never</option>
                </select>
            </div>

            {/* Reset Settings */}
            <div>
                <label className="text-sm text-slate-400">App Settings</label>
                {showResetConfirm ? (
                    <div className="mt-1 p-3 bg-red-900/50 border border-red-500 rounded-md">
                        <p className="text-sm mb-2 text-white">Are you sure? This will clear all API keys and settings.</p>
                        <div className="flex gap-2">
                            <button onClick={() => onShowResetConfirm(false)} className="flex-1 text-xs py-2 bg-slate-600 hover:bg-slate-500 rounded transition-colors">
                                Cancel
                            </button>
                            <button onClick={onResetSettings} className="flex-1 text-xs py-2 bg-red-600 hover:bg-red-500 rounded transition-colors">
                                Confirm Reset
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => onShowResetConfirm(true)} 
                        className="w-full mt-1 p-2 bg-red-800 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                        <SettingsIcon className="w-4 h-4"/>
                        <span>Reset App Settings</span>
                    </button>
                )}
            </div>
        </div>
    );

    const AboutTab = () => (
        <div className="space-y-4">
            {/* Contact Info */}
            <div>
                <label className="text-sm text-slate-400 mb-2 block">Contact Information</label>
                <div className="space-y-2">
                    <a href="mailto:cbcaitool@gmail.com" className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700 transition-colors text-slate-300 hover:text-white">
                        <FooterEmailIcon />
                        <span className="text-sm">cbcaitool@gmail.com</span>
                    </a>
                    <a href="https://wa.me/256726654714" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700 transition-colors text-slate-300 hover:text-white">
                        <FooterWhatsAppIcon />
                        <span className="text-sm">+256726654714</span>
                    </a>
                </div>
            </div>

            {/* Links */}
            <div>
                <label className="text-sm text-slate-400 mb-2 block">Information</label>
                <div className="space-y-1">
                    <a href="about.html" target="_blank" className="block text-sm text-slate-300 hover:text-white transition-colors py-1">
                        About Me
                    </a>
                    <a href="terms.html" target="_blank" className="block text-sm text-slate-300 hover:text-white transition-colors py-1">
                        Terms of Service
                    </a>
                    <a href="privacy.html" target="_blank" className="block text-sm text-slate-300 hover:text-white transition-colors py-1">
                        Privacy Policy
                    </a>
                </div>
            </div>

            {/* Return to Home */}
            <a href="/" className="flex items-center justify-center gap-2 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-white">
                <HomeIcon className="w-4 h-4"/>
                <span>Return to Home</span>
            </a>
        </div>
    );

    return (
        <div
            style={{ width: `${sidebarWidth}px`, maxWidth: '100vw' }}
            className={`absolute lg:static top-0 left-0 h-full bg-slate-800 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        >
            <div className="flex-1 flex flex-col min-h-0 pt-28 lg:pt-0">
                {/* Header with integrated close button */}
                <div className="flex justify-between items-center p-4 flex-shrink-0 border-b border-slate-700">
                    <h1 className="text-xl font-bold">Settings</h1>
                    <button 
                        onClick={onClose} 
                        className="lg:hidden p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="px-4 pt-4 flex-shrink-0">
                    <div className="flex bg-slate-700 rounded-lg p-1 gap-1">
                        <TabButton 
                            id="ai" 
                            label="AI" 
                            shortcut="1" 
                            isActive={activeTab === 'ai'} 
                            onClick={() => setActiveTab('ai')} 
                        />
                        <TabButton 
                            id="app" 
                            label="App" 
                            shortcut="2" 
                            isActive={activeTab === 'app'} 
                            onClick={() => setActiveTab('app')} 
                        />
                        <TabButton 
                            id="about" 
                            label="About" 
                            shortcut="3" 
                            isActive={activeTab === 'about'} 
                            onClick={() => setActiveTab('about')} 
                        />
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto enhanced-scrollbar p-4">
                    {activeTab === 'ai' && <AISettingsTab />}
                    {activeTab === 'app' && <AppSettingsTab />}
                    {activeTab === 'about' && <AboutTab />}
                </div>
            </div>
            
            {/* Toast Notification */}
            {keyModeToast && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5"/>
                    <span>{keyModeToast}</span>
                </div>
            )}
            
            {/* Resize Handle */}
            <div onMouseDown={onStartResizing} className="resize-handle hidden lg:block"></div>
        </div>
    );
};