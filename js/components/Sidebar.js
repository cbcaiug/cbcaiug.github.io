/**
 * js/components/Sidebar.js
 *
 * This file contains the Sidebar component, which includes all the settings
 * for the application like API key management, model selection, and help links.
 */

const { useCallback } = React;

const Sidebar = ({
    // State props
    isMenuOpen,
    sidebarWidth,
    availableAssistants,
    navigationMenu,
    activePromptKey,
    selectedProviderKey,
    selectedModelName,
    apiKeys,
    apiKeyStatus,
    autoDeleteHours,
    showResetConfirm,

    // Handler props
    onClose,
    onPromptSelectionChange,
    onCustomPromptUpload,
    onProviderChange,
    onModelChange,
    onApiKeyChange,
    onAutoDeleteChange,
    onResetSettings,
    onShowResetConfirm,
    onStartResizing,

}) => {

    const selectedProvider = AI_PROVIDERS.find(p => p.key === selectedProviderKey);

    return (
        <div
            id="settings-panel"
            style={{ width: `${sidebarWidth}px`, maxWidth: '100vw' }}
            className={`absolute lg:static top-0 left-0 h-full bg-slate-800 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        >
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center p-4 flex-shrink-0">
                     <h1 className="text-2xl font-bold">Settings</h1>
                     <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
                    <div id="assistant-selector-container">
                        <label className="text-sm text-slate-400">Select an Assistant</label>
                        <select onChange={onPromptSelectionChange} value={navigationMenu[activePromptKey] || ""} className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {availableAssistants.map(assistant => (
                                <option key={assistant} value={navigationMenu[assistant]}>{assistant}</option>
                            ))}
                            {activePromptKey === 'custom' && <option value="">Custom Prompt</option>}
                        </select>
                         <label htmlFor="custom-prompt-upload" className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer block text-center py-2 border border-dashed border-slate-600 rounded-md hover:border-indigo-500 transition-colors">Upload Custom Prompt</label>
                        <input id="custom-prompt-upload" type="file" className="hidden" accept=".txt,.json" onChange={onCustomPromptUpload} />
                    </div>
                    
                    <div id="provider-model-selector-group">
                        <div id="provider-selector-container">
                            <label className="text-sm text-slate-400">AI Provider</label>
                            <select value={selectedProviderKey} onChange={onProviderChange} className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                {AI_PROVIDERS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                            </select>
                        </div>
                        <div className="mt-5">
                            <label className="text-sm text-slate-400">AI Model</label>
                            <select value={selectedModelName} onChange={onModelChange} className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                {selectedProvider?.models.map(model => <option key={model.name} value={model.name}>{model.name}</option>)}
                            </select>
                        </div>
                    </div>

                     <div id="api-key-container">
                        <label className="text-sm text-slate-400">{selectedProvider?.label} API Key</label>
                        <div className="relative">
                            <input type="password" value={apiKeys[selectedProvider?.apiKeyName] || ''} onChange={(e) => onApiKeyChange(selectedProvider.apiKeyName, selectedProvider, e.target.value)} placeholder={`Paste your ${selectedProvider?.label} key here`} className="w-full mt-1 p-2 pr-8 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                {apiKeyStatus[selectedProvider.key] === 'checking' && <div className="loading-spinner"></div>}
                                {apiKeyStatus[selectedProvider.key] === 'valid' && <CheckCircleIcon className="w-5 h-5 text-green-500"/>}
                                {apiKeyStatus[selectedProvider.key] === 'invalid' && <AlertCircleIcon className="w-5 h-5 text-red-500"/>}
                            </div>
                        </div>
                        <a href={selectedProvider?.apiKeyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-1 block">Get your key here &raquo;</a>
                    </div>
                    <div><label className="text-sm text-slate-400">Auto-delete Chat</label><select value={autoDeleteHours} onChange={onAutoDeleteChange} className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="1">After 1 Hour</option><option value="2">After 2 Hours</option><option value="24">After 24 Hours</option><option value="never">Never</option></select></div>
                     <div id="reset-settings-button">
                        <label className="text-sm text-slate-400">App Settings</label>
                        {showResetConfirm ? (
                            <div className="mt-1 p-2 bg-red-900/50 border border-red-500 rounded-md text-center">
                                <p className="text-sm mb-2">Are you sure? This will clear all API keys and settings.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => onShowResetConfirm(false)} className="w-full text-xs py-1 bg-slate-600 hover:bg-slate-500 rounded">Cancel</button>
                                    <button onClick={onResetSettings} className="w-full text-xs py-1 bg-red-600 hover:bg-red-500 rounded">Confirm Reset</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => onShowResetConfirm(true)} className="w-full mt-1 p-2 bg-red-800 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center gap-2">
                                <SettingsIcon className="w-5 h-5"/>
                                <span>Reset App Settings</span>
                            </button>
                        )}
                    </div>
                </div>
                <div className="p-4 mt-auto space-y-3 flex-shrink-0 border-t border-slate-700">
                     <div id="contact-info-panel" className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-slate-400">
                          <a href="mailto:cbcaitool@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors" title="Send an Email">
                              <FooterEmailIcon />
                              <span className="text-sm">cbcaitool@gmail.com</span>
                          </a>
                          <a href="https://wa.me/256750470234" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors" title="Chat on WhatsApp">
                              <FooterWhatsAppIcon />
                              <span className="text-sm">+256750470234</span>
                          </a>
                     </div>
                     {/* UPDATED: Added the 'About Me' link for consistency */}
<div className="text-center text-xs text-slate-500">
    <a href="about.html" target="_blank" className="hover:text-slate-300 transition-colors">About Me</a>
    <span className="mx-2">|</span>
    <a href="terms.html" target="_blank" className="hover:text-slate-300 transition-colors">Terms of Service</a>
    <span className="mx-2">|</span>
    <a href="privacy.html" target="_blank" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
</div>
                     <a href= "/" rel="external" className="flex items-center justify-center gap-2 w-full text-center mt-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"><HomeIcon className="w-5 h-5"/>Return to Home</a>
                </div>
            </div>
            <div onMouseDown={onStartResizing} className="resize-handle hidden lg:block"></div>
        </div>
    );
};