/**
 * js/components/Sidebar.js
 *
 * Enhanced sidebar with tabbed interface, collapsible sections, and improved UX
 */

const { useCallback, useState, useEffect, useRef } = React;

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
    const [currentUser, setCurrentUser] = useState(null);
        const [assistantSearch, setAssistantSearch] = useState('');
        const [assistantSelectorOpen, setAssistantSelectorOpen] = useState(false);
        const assistantInputRef = useRef(null);
        const assistantContainerRef = useRef(null);
        const assistantToggleRef = useRef(null);

        const [providerSearch, setProviderSearch] = useState('');
        const [providerSelectorOpen, setProviderSelectorOpen] = useState(false);
        const providerInputRef = useRef(null);
        const providerContainerRef = useRef(null);
        const providerToggleRef = useRef(null);

        const [modelSearch, setModelSearch] = useState('');
        const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
        const modelInputRef = useRef(null);
        const modelContainerRef = useRef(null);
        const modelToggleRef = useRef(null);
    
    const selectedProvider = AI_PROVIDERS.find(p => p.key === selectedProviderKey);

    // Get current user from Supabase
    useEffect(() => {
        const loadUser = async () => {
            if (window.supabaseAuth?.supabase) {
                const { data: { user } } = await window.supabaseAuth.supabase.auth.getUser();
                setCurrentUser(user);
            }
        };
        
        loadUser();
        
        // Listen for auth state changes from Supabase
        let authListener = null;
        const setupListener = () => {
            if (window.supabaseAuth?.supabase) {
                const { data } = window.supabaseAuth.supabase.auth.onAuthStateChange((event, session) => {
                    console.log('Auth state changed:', event, session?.user?.email);
                    setCurrentUser(session?.user || null);
                });
                authListener = data;
            }
        };
        
        // Setup listener immediately or wait for supabaseAuth to be ready
        if (window.supabaseAuth?.supabase) {
            setupListener();
        } else {
            const checkInterval = setInterval(() => {
                if (window.supabaseAuth?.supabase) {
                    setupListener();
                    clearInterval(checkInterval);
                }
            }, 100);
            setTimeout(() => clearInterval(checkInterval), 5000);
        }
        
        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

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

    // History state and helpers (local-only)
    const [historyItems, setHistoryItems] = useState([]);
    const [showAllHistoryModal, setShowAllHistoryModal] = useState(false);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    const [historyMenuOpen, setHistoryMenuOpen] = useState(null);
    const [historyEnabled, setHistoryEnabled] = useState(() => localStorage.getItem('cbc_chat_history_autosave') === '1');

    useEffect(() => {
        try {
            const raw = localStorage.getItem('cbc_chat_history');
            if (raw) {
                const all = JSON.parse(raw);
                if (Array.isArray(all)) {
                    all.sort((a,b)=>b.timestamp - a.timestamp);
                    setHistoryItems(all);
                }
            }
        } catch (e) { console.error('Failed to load history', e); }
    }, []);

    useEffect(() => {
        const h = (e) => {
            try {
                const raw = localStorage.getItem('cbc_chat_history');
                if (raw) {
                    const all = JSON.parse(raw);
                    all.sort((a,b)=>b.timestamp - a.timestamp);
                    setHistoryItems(all);
                }
            } catch (err) { console.error('Failed to refresh history', err); }
        };
        window.addEventListener('historyUpdated', h);
        return () => window.removeEventListener('historyUpdated', h);
    }, []);

    const onSelectHistoryItem = (item) => {
        if (typeof window !== 'undefined' && window.__LOAD_HISTORY_CHAT__) {
            window.__LOAD_HISTORY_CHAT__(item);
        } else if (typeof window !== 'undefined') {
            const ev = new CustomEvent('loadHistoryChat', {detail: item});
            window.dispatchEvent(ev);
        }
    };

    const handleDeleteHistory = (itemId, e) => {
        e.stopPropagation();
        if (confirm('Delete this chat?')) {
            try {
                const raw = localStorage.getItem('cbc_chat_history');
                const arr = raw ? JSON.parse(raw) : [];
                const filtered = arr.filter(x => x.id !== itemId);
                localStorage.setItem('cbc_chat_history', JSON.stringify(filtered));
                window.dispatchEvent(new CustomEvent('historyUpdated'));
                setHistoryMenuOpen(null);
            } catch (e) { console.error(e); }
        }
    };

    const handleDeleteAllHistory = () => {
        if (confirm('Delete all chat history? This cannot be undone.')) {
            try {
                localStorage.setItem('cbc_chat_history', JSON.stringify([]));
                window.dispatchEvent(new CustomEvent('historyUpdated'));
            } catch (e) { console.error(e); }
        }
    };

    const HistoryPreview = () => {
        const list = historyItems.slice(0, 3);
        return (
            <div className="space-y-2">
                <button
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                    className="flex items-center justify-between w-full text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <span>Chat History</span>
                    <svg className={`w-4 h-4 transition-transform ${isHistoryExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {isHistoryExpanded && (
                    <div className="space-y-1">
                        {list.length === 0 && <div className="text-sm text-slate-400 px-2 py-2">No recent chats.</div>}
                        {list.map(it => (
                            <div key={it.id} className="relative group">
                                <button onClick={() => onSelectHistoryItem(it)} className="w-full text-left px-2 py-2 hover:bg-slate-700 rounded-md flex flex-col pr-8">
                                    <div className="text-sm font-medium truncate">{it.title || it.assistantKey}</div>
                                    <div className="text-xs text-slate-400 truncate">{it.excerpt || ''}</div>
                                    <div className="text-xs text-slate-500">{new Date(it.timestamp).toLocaleString()}</div>
                                </button>
                                <div className="absolute top-2 right-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setHistoryMenuOpen(historyMenuOpen === it.id ? null : it.id); }}
                                        className="p-1 hover:bg-slate-600 rounded"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <circle cx="12" cy="5" r="2"/>
                                            <circle cx="12" cy="12" r="2"/>
                                            <circle cx="12" cy="19" r="2"/>
                                        </svg>
                                    </button>
                                    {historyMenuOpen === it.id && (
                                        <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded shadow-lg z-50 min-w-[120px]">
                                            <button
                                                onClick={(e) => handleDeleteHistory(it.id, e)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 text-red-400"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {historyItems.length > 3 && (
                            <button onClick={() => setShowAllHistoryModal(true)} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm">
                                View All History
                            </button>
                        )}
                        {historyItems.length > 0 && (
                            <button onClick={handleDeleteAllHistory} className="w-full py-2 bg-red-800 hover:bg-red-700 rounded-md text-sm">
                                Delete All
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Close selector panels on outside click or Escape
    useEffect(() => {
        const onDocClick = (e) => {
            try {
                const t = e.target;
                if (assistantSelectorOpen) {
                    if (assistantContainerRef.current && !assistantContainerRef.current.contains(t) && assistantToggleRef.current && !assistantToggleRef.current.contains(t)) {
                        setAssistantSelectorOpen(false);
                    }
                }
                if (providerSelectorOpen) {
                    if (providerContainerRef.current && !providerContainerRef.current.contains(t) && providerToggleRef.current && !providerToggleRef.current.contains(t)) {
                        setProviderSelectorOpen(false);
                    }
                }
                if (modelSelectorOpen) {
                    if (modelContainerRef.current && !modelContainerRef.current.contains(t) && modelToggleRef.current && !modelToggleRef.current.contains(t)) {
                        setModelSelectorOpen(false);
                    }
                }
            } catch (err) { /* ignore */ }
        };
        const onKey = (e) => { if (e.key === 'Escape') { setAssistantSelectorOpen(false); setProviderSelectorOpen(false); setModelSelectorOpen(false); } };
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey); };
    }, [assistantSelectorOpen, providerSelectorOpen, modelSelectorOpen]);

    // Autofocus inputs when panels open
    useEffect(() => {
        if (assistantSelectorOpen) setTimeout(()=>assistantInputRef.current?.focus(), 50);
    }, [assistantSelectorOpen]);
    useEffect(() => {
        if (providerSelectorOpen) setTimeout(()=>providerInputRef.current?.focus(), 50);
    }, [providerSelectorOpen]);
    useEffect(() => {
        if (modelSelectorOpen) setTimeout(()=>modelInputRef.current?.focus(), 50);
    }, [modelSelectorOpen]);

    const AISettingsTab = () => (
        <div className="space-y-4">
            {/* History Preview (collapsible, closed by default) */}
            <div className="p-2 bg-slate-800 border border-slate-700 rounded-md">
                <HistoryPreview />
            </div>

            {/* Assistant Selector */}
            
            <div>
                <label className="text-sm text-slate-400">Select Assistant</label>
                    <div className="mt-1 relative">
                        <button
                            ref={assistantToggleRef}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setAssistantSelectorOpen(s => !s); }}
                            className="w-full text-left p-2 bg-slate-700 border border-slate-600 rounded-md flex items-center justify-between focus:outline-none"
                        >
                            <span className="truncate">{activePromptKey}</span>
                            <svg className={`w-4 h-4 ml-2 transition-transform ${assistantSelectorOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {assistantSelectorOpen && (
                            <div ref={assistantContainerRef} onClick={(e)=>e.stopPropagation()} className="mt-2 bg-slate-800 border border-slate-700 rounded-md shadow-lg">
                                <div className="p-2">
                                    <input
                                        ref={assistantInputRef}
                                        autoFocus
                                        type="search"
                                        placeholder="Search assistants"
                                        value={assistantSearch}
                                        onChange={(e) => setAssistantSearch(e.target.value)}
                                        className="w-full p-2 rounded-md bg-slate-700 text-sm border border-slate-600"
                                    />
                                </div>
                                <div className="max-h-64 overflow-y-auto enhanced-scrollbar">
                                    {/* Reuse existing grouping renderer but wrap onAssistantChange to close the panel after selection */}
                                    <div className="px-2 pb-2">
                                        {(() => {
                                            const raw = (availableAssistants || []).slice().sort((a,b)=>a.localeCompare(b));
                                            const groupsDef = [
                                                { id: 'lesson-plans', name: 'Lesson Plans', keys: ['Lesson Plans (NCDC)', 'Lesson Plans (with Biblical Integration)'] },
                                                { id: 'scheme-of-work', name: 'Scheme of Work', keys: ['Scheme of Work NCDC', 'Scheme of Work (with Biblical Integration)', 'UACE SoW NCDC'] },
                                                { id: 'item-writer', name: 'Item Writer', keys: ['Item Writer', 'UCE BIO Item Writer'] }
                                            ];
                                            const groups = {};
                                            groupsDef.forEach(g => { groups[g.id] = { id: g.id, name: g.name, variants: [] }; });
                                            const leftovers = [];
                                            raw.forEach(name => {
                                                let placed = false;
                                                for (const g of groupsDef) {
                                                    if (g.keys.includes(name)) { groups[g.id].variants.push({ key: name, label: name }); placed = true; break; }
                                                }
                                                if (!placed) leftovers.push(name);
                                            });
                                            leftovers.forEach(name => { const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'-'); groups[id] = { id, name, variants: [{ key: name, label: name }] }; });
                                            const groupArr = Object.values(groups).sort((a,b)=>a.name.localeCompare(b.name));

                                            return groupArr.map(group => {
                                                const matches = group.variants.filter(v => v.label.toLowerCase().includes(assistantSearch.toLowerCase()) || group.name.toLowerCase().includes(assistantSearch.toLowerCase()));
                                                if (matches.length === 0) return null;
                                                const sorted = matches.sort((a,b)=>a.label.localeCompare(b.label));
                                                return (
                                                    <div key={group.id} className="assistant-group">
                                                        <div className="text-xs text-slate-400 px-2 py-1 border-t border-slate-700">{group.name.replace(/[()]/g,'')}</div>
                                                        {sorted.map(v => (
                                                            <button
                                                                key={v.key}
                                                                onClick={() => {
                                                                    setAssistantSelectorOpen(false);
                                                                    // call parent handler
                                                                    onAssistantChange(v.key);
                                                                    // make selection robust: update URL and emit an event
                                                                    try { const url = new URL(window.location); url.searchParams.set('assistant', v.key); window.history.pushState({}, '', url); } catch(_) {}
                                                                    try { window.dispatchEvent(new CustomEvent('assistantChanged', {detail:{key:v.key}})); } catch(_) {}
                                                                }}
                                                                className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded-md flex items-center justify-between"
                                                            >
                                                                <span className="truncate">{(v.label || '').replace(/[()]/g,'')}</span>
                                                                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

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

            {/* AI Provider & Model - searchable pickers */}
            <div className="space-y-3">
                <div>
                    <label className="text-sm text-slate-400">AI Provider</label>
                    <div className="mt-1 relative">
                        <button
                            ref={providerToggleRef}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); if (!useSharedApiKey) setProviderSelectorOpen(s=>!s); }}
                            disabled={useSharedApiKey}
                            className={`settings-input w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-left ${useSharedApiKey ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{(AI_PROVIDERS.find(p=>p.key===selectedProviderKey)?.label) || selectedProviderKey}</span>
                                <svg className={`w-4 h-4 ml-2 transition-transform ${providerSelectorOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>

                        {providerSelectorOpen && (
                            <div ref={providerContainerRef} onClick={(e)=>e.stopPropagation()} className="mt-2 bg-slate-800 border border-slate-700 rounded-md shadow-lg">
                                <div className="p-2">
                                    <input ref={providerInputRef} autoFocus type="search" placeholder="Search providers" value={providerSearch} onChange={(e)=>setProviderSearch(e.target.value)} className="w-full p-2 rounded-md bg-slate-700 text-sm border border-slate-600" />
                                </div>
                                <div className="max-h-48 overflow-y-auto enhanced-scrollbar">
                                    {AI_PROVIDERS.slice().sort((a,b)=>a.label.localeCompare(b.label)).filter(p=>p.label.toLowerCase().includes(providerSearch.toLowerCase())).map(p => (
                                        <button key={p.key} onClick={()=>{ setProviderSelectorOpen(false); onProviderChange(p.key); try{ const url=new URL(window.location); url.searchParams.set('provider', p.key); window.history.pushState({},'',url); }catch(_){} }} className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded-md">
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {useSharedApiKey && (
                        <p className="text-xs text-slate-500 mt-1">Locked to Google Gemini for shared keys</p>
                    )}
                </div>
                <div>
                    <label className="text-sm text-slate-400">AI Model</label>
                    <div className="mt-1 relative">
                        <button ref={modelToggleRef} type="button" onClick={(e)=>{ e.stopPropagation(); setModelSelectorOpen(s=>!s); }} className="settings-input w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-left">
                            <div className="flex items-center justify-between">
                                <span>{selectedModelName}</span>
                                <svg className={`w-4 h-4 ml-2 transition-transform ${modelSelectorOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>

                        {modelSelectorOpen && (
                            <div ref={modelContainerRef} onClick={(e)=>e.stopPropagation()} className="mt-2 bg-slate-800 border border-slate-700 rounded-md shadow-lg">
                                <div className="p-2">
                                    <input ref={modelInputRef} autoFocus type="search" placeholder="Search models" value={modelSearch} onChange={(e)=>setModelSearch(e.target.value)} className="w-full p-2 rounded-md bg-slate-700 text-sm border border-slate-600" />
                                </div>
                                <div className="max-h-48 overflow-y-auto enhanced-scrollbar">
                                    {(selectedProvider?.models || []).slice().sort((a,b)=>a.name.localeCompare(b.name)).filter(m=>m.name.toLowerCase().includes(modelSearch.toLowerCase())).map(m => (
                                        <button key={m.name} onClick={()=>{ setModelSelectorOpen(false); onModelChange(m.name); try{ const url=new URL(window.location); url.searchParams.set('model', m.name); window.history.pushState({},'',url); }catch(_){} }} className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded-md">
                                            {m.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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

            {/* Save Chat History Toggle */}
            <div className="bg-slate-700 p-3 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                        <label htmlFor="history-toggle" className="font-semibold text-white cursor-pointer">Save Chat History</label>
                        <p className="text-xs text-slate-400">Auto-save chats locally</p>
                    </div>
                    <label htmlFor="history-toggle" className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input 
                            type="checkbox" 
                            checked={historyEnabled} 
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setHistoryEnabled(checked);
                                localStorage.setItem('cbc_chat_history_autosave', checked ? '1' : '0');
                            }} 
                            id="history-toggle" 
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

            {/* Reset Settings */}
            <div>
                <label className="text-sm text-slate-400">App Settings</label>
                {showResetConfirm ? (
                    <div className="mt-1 p-3 bg-red-900/50 border border-red-500 rounded-md">
                        <p className="text-sm mb-2 text-white">This will clear API keys and chat history only. Usage tracking will remain.</p>
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

    // Full History Modal
    const FullHistoryModal = () => {
        const [historySearch, setHistorySearch] = useState('');
        if (!showAllHistoryModal) return null;
        const filteredHistory = historyItems.filter(it => 
            (it.title || '').toLowerCase().includes(historySearch.toLowerCase()) ||
            (it.excerpt || '').toLowerCase().includes(historySearch.toLowerCase())
        );
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
                <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-md flex flex-col max-h-[90vh] sm:max-h-[80vh]">
                    <div className="flex justify-between items-center p-3 sm:p-4 border-b border-slate-700 flex-shrink-0">
                        <h3 className="text-base sm:text-lg font-semibold truncate">All Chat History</h3>
                        <button onClick={() => { setShowAllHistoryModal(false); setHistorySearch(''); }} className="p-2 hover:bg-slate-700 rounded flex-shrink-0 ml-2">✕</button>
                    </div>
                    <div className="px-3 sm:px-4 py-2 border-b border-slate-700 flex-shrink-0">
                        <input
                            type="search"
                            placeholder="Search history..."
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            className="w-full p-2 rounded-md bg-slate-700 text-sm border border-slate-600 mb-2"
                        />
                        {historyItems.length > 0 && (
                            <button onClick={handleDeleteAllHistory} className="w-full py-2 bg-red-800 hover:bg-red-700 rounded text-xs sm:text-sm">
                                Delete All History
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto enhanced-scrollbar p-3 sm:p-4">
                        <div className="space-y-2">
                            {filteredHistory.length === 0 && <div className="text-sm text-slate-400 text-center py-8">{historySearch ? 'No matching chats.' : 'No saved chats.'}</div>}
                            {filteredHistory.map(it => (
                                <div key={it.id} className="p-2 sm:p-3 bg-slate-900 rounded-md flex items-start gap-2 relative group">
                                    <button onClick={() => { onSelectHistoryItem(it); setShowAllHistoryModal(false); setHistoryMenuOpen(null); }} className="flex-1 text-left min-w-0">
                                        <div className="font-medium text-sm truncate">{it.title || it.assistantKey}</div>
                                        <div className="text-xs text-slate-400 line-clamp-2 break-words">{it.excerpt}</div>
                                        <div className="text-xs text-slate-500 mt-1">{new Date(it.timestamp).toLocaleString()}</div>
                                    </button>
                                    <div className="flex-shrink-0 relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setHistoryMenuOpen(historyMenuOpen === it.id ? null : it.id); }}
                                            className="p-2 hover:bg-slate-700 rounded"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="5" r="2"/>
                                                <circle cx="12" cy="12" r="2"/>
                                                <circle cx="12" cy="19" r="2"/>
                                            </svg>
                                        </button>
                                        {historyMenuOpen === it.id && (
                                            <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded shadow-lg z-50 min-w-[120px]">
                                                <button
                                                    onClick={(e) => handleDeleteHistory(it.id, e)}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 text-red-400 whitespace-nowrap"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
        <div
            style={{ width: `${sidebarWidth}px`, maxWidth: '100vw' }}
            className={`fixed lg:static top-0 left-0 h-full bg-slate-800 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="flex-1 flex flex-col min-h-0">
                {/* Header with integrated close button */}
                <div className="flex justify-between items-center p-4 flex-shrink-0 border-b border-slate-700">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Settings</h1>
                        {currentUser && (
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-slate-400 truncate">
                                    {currentUser.email?.replace('@local.app', '') || 'User'}
                                </p>
                                <button
                                    onClick={async () => {
                                        if (confirm('Sign out?')) {
                                            await window.supabaseAuth?.signOut();
                                            // Update local UI state immediately without reloading
                                            try { setCurrentUser(null); } catch(e) { /* ignore */ }
                                        }
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300 underline"
                                    title="Sign out"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
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
        {isMenuOpen && <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"></div>}
        <FullHistoryModal />
        </>
    );
};