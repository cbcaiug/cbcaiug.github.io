/*
 * script.js
 * This file contains all the JavaScript and React logic for the application.
 * It defines all the components, state management, and API interactions.
 * Keeping this separate from the HTML makes the project much easier to debug and scale.
*/

const { useState, useEffect, useRef, useCallback } = React;

// --- SVG ICONS (as React components) ---
const Icon = ({ C, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>{C}</svg>;
const SendIcon = (props) => <Icon {...props} C={<><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>} />;
const StopIcon = (props) => <Icon {...props} C={<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />} />;
const PaperclipIcon = (props) => <Icon {...props} C={<><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/></>} />;
const FileIcon = (props) => <Icon {...props} C={<><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></>} />;
const XIcon = (props) => <Icon {...props} C={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />;
const TrashIcon = (props) => <Icon {...props} C={<><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>} />;
const HomeIcon = (props) => <Icon {...props} C={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>} />;
const MenuIcon = (props) => <Icon {...props} C={<><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></>} />;
const AlertTriangleIcon = (props) => <Icon {...props} C={<><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>} />;
const ChevronUpIcon = (props) => <Icon {...props} C={<polyline points="18 15 12 9 6 15"/>} />;
const ChevronDownIcon = (props) => <Icon {...props} C={<polyline points="6 9 12 15 18 9"/>} />;
const CopyIcon = (props) => <Icon {...props} C={<><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></>} />;
const MoreVerticalIcon = (props) => <Icon {...props} C={<><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></>} />;
const CheckCircleIcon = (props) => <Icon {...props} C={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} />;
const AlertCircleIcon = (props) => <Icon {...props} C={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>} />;
const StarIcon = (props) => <Icon {...props} C={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>} />;
const Share2Icon = (props) => <Icon {...props} C={<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>} />;
const RefreshCwIcon = (props) => <Icon {...props} C={<><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></>} />;
const SettingsIcon = (props) => <Icon {...props} C={<path d="M12.22 2h-4.44l-2 6-6 2 2 6 6 2 2-6 6-2-2-6zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>} />;
const BellIcon = (props) => <Icon {...props} C={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>} />;
const FileTextIcon = (props) => <Icon {...props} C={<><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></>} />;

// --- NEW/MODIFIED ICONS to match landing page footer ---
const FooterEmailIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>;
const FooterPhoneIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.02.74-.25 1.02l-2.2 2.2z"/></svg>;
const FooterWhatsAppIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="currentColor" {...props}><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-26.7l-7-4.1-72.5 19.1 19.4-70.5-4.5-7.3c-18.4-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>;


// --- CONFIGURATION ---
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxZHjqJoIwvdsXE_wrr8Dil9vIFvrv9BKe7ZZln8LtkEbOgLcPrzust6K-MSN7NcLZN/exec';
const FEEDBACK_TRIGGER_COUNT = 5;
const LONG_RESPONSE_TIMEOUT = 10000; // 10 seconds

// --- Event Tracking Function ---
const trackEvent = (eventType, assistantName, details = {}) => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

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
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    }).catch(error => console.error('Event tracking failed:', error));
};


// --- PROMPT MANAGEMENT ---
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
      return [ "Item Writer", "Lesson Notes Generator" ];
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

// --- AI PROVIDER CONFIGURATION ---
const AI_PROVIDERS = [
  { key: 'google', label: 'Google Gemini', apiKeyName: 'googleApiKey', apiKeyUrl: 'https://aistudio.google.com/app/apikey', apiHost: 'https://generativelanguage.googleapis.com', models: [
      { name: 'gemini-2.5-pro', vision: true }, { name: 'gemini-2.5-flash', vision: true }, { name: 'gemini-2.0-pro', vision: true }, { name: 'gemini-2.0-flash', vision: true }, { name: 'gemini-1.5-pro-latest', vision: true }, { name: 'gemini-1.5-flash-latest', vision: true }
  ]},
  { key: 'openai', label: 'OpenAI GPT', apiKeyName: 'openaiApiKey', apiKeyUrl: 'https://platform.openai.com/api-keys', apiHost: 'https://api.openai.com', models: [
      { name: 'gpt-4o', vision: true }, { name: 'gpt-4-turbo', vision: true }, { name: 'gpt-3.5-turbo', vision: false }
  ]},
  { key: 'anthropic', label: 'Anthropic Claude', apiKeyName: 'anthropicApiKey', apiKeyUrl: 'https://console.anthropic.com/settings/keys', apiHost: 'https://api.anthropic.com', models: [
      { name: 'claude-3-opus-20240229', vision: true }, { name: 'claude-3-sonnet-20240229', vision: true }, { name: 'claude-3-haiku-20240307', vision: true }
  ]},
  { key: 'groq', label: 'Llama 3 (via Groq)', apiKeyName: 'groqApiKey', apiKeyUrl: 'https://console.groq.com/keys', apiHost: 'https://api.groq.com/openai', models: [
      { name: 'llama3-8b-8192', vision: false }, { name: 'llama3-70b-8192', vision: false }
  ]},
  { key: 'deepseek', label: 'Deepseek (Free Tier)', apiKeyName: 'deepseekApiKey', apiKeyUrl: 'https://platform.deepseek.com/api_keys', apiHost: 'https://api.deepseek.com', models: [
      { name: 'deepseek-chat', vision: false }, { name: 'deepseek-coder', vision: false }
  ]},
  { key: 'qwen', label: 'Qwen (Free Tier)', apiKeyName: 'qwenApiKey', apiKeyUrl: 'https://openrouter.ai/keys', apiHost: 'https://openrouter.ai/api', models: [
      { name: 'qwen/qwen-2-72b-instruct', vision: false }, { name: 'qwen/qwen-2-7b-instruct', vision: false }
  ]},
];

// --- REACT COMPONENTS ---
const LoadingScreen = ({ text }) => (
    <div className="loading-screen-container">
        <div className="loading-logo-wrapper">
            <img src="https://raw.githubusercontent.com/derikmusa/derikmusa.github.io/a8d098a0d2e51d472cf4291b37e02d4f26f7d642/cbc-ai-tool-logo.jpeg" alt="Loading Logo" className="loading-logo-img" />
        </div>
        <p className="loading-screen-text">{text}</p>
    </div>
);

// Renders markdown content, handles "thinking" and "taking long" indicators
const MarkdownRenderer = ({ htmlContent, isLoading, isTakingLong }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            const tables = contentRef.current.querySelectorAll('table');
            tables.forEach(table => {
                const existingGuide = table.nextElementSibling;
                if (existingGuide && existingGuide.classList.contains('scroll-guide')) {
                    existingGuide.remove();
                }

                if (table.scrollWidth > table.clientWidth) {
                    const guide = document.createElement('p');
                    guide.innerHTML = '<em>&laquo;&mdash; Scroll left and right to view more content &mdash;&raquo;</em>';
                    guide.className = 'text-center text-slate-500 text-sm mt-1 scroll-guide italic';
                    table.parentNode.insertBefore(guide, table.nextSibling);
                }
            });
        }
    }, [htmlContent, isLoading]);

    // If loading and no content yet, show the thinking/taking long message
    if (isLoading && !htmlContent.trim().replace(/<p><\/p>/g, '')) {
        return (
            <div className="p-4 flex items-center text-slate-500">
                <div className="loading-spinner mr-3"></div>
                <span className="font-medium">
                    {isTakingLong ? "AI is taking a bit longer than usual..." : "AI is thinking..."}
                </span>
            </div>
        );
    }
    
    const finalHtml = htmlContent + (isLoading ? '<span class="streaming-indicator"></span>' : '');
    return <div ref={contentRef} className="markdown-content p-4" dangerouslySetInnerHTML={{ __html: finalHtml }} />;
};

const FeedbackModal = ({ isOpen, onClose, onSubmit, assistantName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (e) => {
      const newEmail = e.target.value;
      setEmail(newEmail);
      if (newEmail === '') {
          setIsEmailValid(null);
      } else {
          setIsEmailValid(emailRegex.test(newEmail));
      }
  };

  const handleSubmit = async () => {
    if ((rating === 0 && email === '') || (email !== '' && !isEmailValid)) return;
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await onSubmit({ rating: rating > 0 ? rating : null, feedbackText, assistantName, email: isEmailValid ? email : null });
      setSubmitStatus('success');
      setTimeout(() => {
          onClose();
          setSubmitStatus(null);
          setRating(0);
          setFeedbackText('');
          setEmail('');
          setIsEmailValid(null);
      }, 2000);
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
      trackEvent('feedback_skipped', assistantName);
      onClose();
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full transform transition-all scale-100 opacity-100">
              {submitStatus === 'success' ? (
                  <div className="text-center py-8">
                      <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-slate-800">Thank You!</h2>
                      <p className="text-slate-600 mt-2">Your submission has been received.</p>
                  </div>
              ) : (
                  <>
                      <h2 className="text-2xl font-bold text-slate-800 text-center">Enjoying the App?</h2>
                      <p className="text-slate-600 text-center mt-2 mb-6">Your feedback helps improve this tool. Please rate your experience or sign up for updates.</p>

                      <div className="flex justify-center items-center mb-6 star-rating" onMouseLeave={() => setHoverRating(0)}>
                          {[1, 2, 3, 4, 5].map(star => (
                              <div key={star} onMouseEnter={() => setHoverRating(star)} onClick={() => setRating(star)}>
                                  <StarIcon className={`w-10 h-10 star ${(hoverRating >= star) ? 'hover' : ''} ${rating >= star ? 'selected' : ''}`} style={{fill: 'currentColor'}}/>
                              </div>
                          ))}
                      </div>

                      <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Optional: Tell me more about your experience..."
                          className="w-full mt-1 p-3 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          rows="3"
                      />

                      <div className="mt-4">
                          <label htmlFor="email-signup" className="text-sm font-medium text-slate-700">Get notified about future updates</label>
                          <div className="relative mt-1">
                              <input
                                  id="email-signup"
                                  type="email"
                                  value={email}
                                  onChange={handleEmailChange}
                                  placeholder="your.email@example.com"
                                  className={`w-full p-3 pr-10 bg-slate-100 border rounded-md focus:outline-none focus:ring-2 transition ${isEmailValid === true ? 'border-green-500 focus:ring-green-500' : isEmailValid === false ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  {isEmailValid === true && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                  {isEmailValid === false && <AlertCircleIcon className="w-5 h-5 text-red-500" />}
                              </div>
                          </div>
                      </div>

                      {submitStatus === 'error' && <p className="text-red-600 text-sm mt-2 text-center">Sorry, something went wrong. Please try again.</p>}

                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                          <button onClick={handleClose} className="w-full px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                              Not Now
                          </button>
                          <button onClick={handleSubmit} disabled={(rating === 0 && !isEmailValid) || isSubmitting} className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                              {isSubmitting && <div className="loading-spinner !border-white !border-t-transparent"></div>}
                              Submit
                          </button>
                      </div>
                  </>
              )}
          </div>
      </div>
  );
};

const UpdateBanner = ({ latestUpdate, onDismiss }) => {
    if (!latestUpdate) return null;

    return (
        <div className="bg-indigo-600 text-white p-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
                <BellIcon className="w-6 h-6 shrink-0"/>
                <p className="text-sm font-medium">
                    <span className="font-bold mr-2">New Update:</span>
                    {latestUpdate.message}
                    {latestUpdate.url && <a href={latestUpdate.url} target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:opacity-80">Learn more &raquo;</a>}
                </p>
            </div>
            <button onClick={onDismiss} className="p-1 rounded-full hover:bg-indigo-500">
                <XIcon className="w-5 h-5"/>
            </button>
        </div>
    );
};


// Context menu for each message (copy, share, delete, etc.)
const MessageMenu = ({ msg, index, onCopy, onShare, onDelete, onRegenerate, onDocxDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
      const handleClickOutside = (event) => {
          if (menuRef.current && !menuRef.current.contains(event.target)) {
              setIsOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  if (msg.isLoading) return null;
  
  const menuPositionClass = 'right-0';

  return (
      <div className="relative self-end mt-1" ref={menuRef}>
          <button
              onClick={() => setIsOpen(prev => !prev)}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500"
              title="Options"
          >
              <MoreVerticalIcon className="w-5 h-5" />
          </button>
          {isOpen && (
              <div className={`absolute ${menuPositionClass} bottom-full mb-2 w-52 bg-white rounded-md shadow-lg z-20 border border-slate-200`}>
                  <button
                      onClick={() => { onCopy(msg.content); setIsOpen(false); }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                      <CopyIcon className="w-4 h-4" />
                      <span>Copy Message</span>
                  </button>
                  {msg.role === 'assistant' && (
                     <button
                        onClick={() => { onDocxDownload(msg.content); setIsOpen(false); }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                        <FileTextIcon className="w-4 h-4" />
                        <span>Download as .docx</span>
                    </button>
                  )}
                  <button
                      onClick={() => { onShare({ title: 'AI Assistant Response', text: msg.content }); setIsOpen(false); }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                      <Share2Icon className="w-4 h-4" />
                      <span>Share Message</span>
                  </button>
                  {msg.role === 'assistant' && (
                      <button
                          onClick={() => { onRegenerate(index); setIsOpen(false); }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                          <RefreshCwIcon className="w-4 h-4" />
                          <span>Regenerate</span>
                      </button>
                  )}
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                      onClick={() => { onDelete(index); setIsOpen(false); }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                      <TrashIcon className="w-4 h-4" />
                      <span>Delete Message</span>
                  </button>
              </div>
          )}
      </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  // --- STATE MANAGEMENT ---
  const getAssistantFromURL = () => new URLSearchParams(window.location.search).get('assistant') || 'Item Writer';

  const [apiKeys, setApiKeys] = useState({});
  const [apiKeyStatus, setApiKeyStatus] = useState({});
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [selectedProviderKey, setSelectedProviderKey] = useState('google');
  const [selectedModelName, setSelectedModelName] = useState('gemini-2.5-flash');
  const [autoDeleteHours, setAutoDeleteHours] = useState('2');
  const [chatHistory, setChatHistory] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFilePreview, setPendingFilePreview] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [customPromptContent, setCustomPromptContent] = useState('');
  const [activePromptKey, setActivePromptKey] = useState(getAssistantFromURL());
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


  // --- REFS ---
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  const userInputRef = useRef(null);
  const validationTimeoutRef = useRef(null);
  const apiKeyToastTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const longResponseTimerRef = useRef(null);

  // --- DERIVED STATE ---
  const selectedProvider = AI_PROVIDERS.find(p => p.key === selectedProviderKey);
  const selectedModel = selectedProvider?.models.find(m => m.name === selectedModelName);
  const isFileUploadDisabled = !selectedModel?.vision;

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


  // --- EFFECTS ---
    useEffect(() => {
      const savedCount = parseInt(localStorage.getItem('generationCount') || '0', 10);
      setGenerationCount(savedCount);

      const initializeApp = async () => {
          setIsLoadingAssistants(true);
          const [assistants] = await Promise.all([
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
          setIsLoadingAssistants(false);
      };
      initializeApp();
  }, []);

  useEffect(() => {
      const currentPromptKey = getAssistantFromURL();
      setActivePromptKey(currentPromptKey);
      document.title = `${currentPromptKey} | AI Assistant`;

      const savedState = JSON.parse(localStorage.getItem('aiAssistantState')) || {};
      setApiKeys(savedState.apiKeys || {});
      setApiKeyStatus(savedState.apiKeyStatus || {});
      setSidebarWidth(savedState.sidebarWidth || 320);
      setSelectedProviderKey(savedState.selectedProviderKey || 'google');
      setSelectedModelName(savedState.selectedModelName || 'gemini-2.5-flash');
      setAutoDeleteHours(savedState.autoDeleteHours || '2');

      if (!isLoadingAssistants) {
          loadInitialMessage(currentPromptKey);
      }
  }, [window.location.search, isLoadingAssistants, loadInitialMessage]);

  useEffect(() => {
      localStorage.setItem('aiAssistantState', JSON.stringify({ apiKeys, apiKeyStatus, sidebarWidth, selectedProviderKey, selectedModelName, autoDeleteHours }));
  }, [apiKeys, apiKeyStatus, sidebarWidth, selectedProviderKey, selectedModelName, autoDeleteHours]);

  useEffect(() => {
      if (chatHistory && chatHistory.length > 0 && !chatHistory[chatHistory.length - 1]?.isLoading) {
           const chatKey = `chatHistory_${activePromptKey}`;
           localStorage.setItem(chatKey, JSON.stringify({ history: chatHistory, timestamp: Date.now() }));
      }
  }, [chatHistory, activePromptKey]);

  useEffect(() => {
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
      const textarea = userInputRef.current;
      if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
          const stopTouchPropagation = (e) => e.stopPropagation();
          textarea.addEventListener('touchmove', stopTouchPropagation);
          return () => textarea.removeEventListener('touchmove', stopTouchPropagation);
      }
  }, [userInput]);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory[chatHistory.length - 1]?.content]);

  // --- HANDLERS & LOGIC ---
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

  const handleFeedbackSubmit = async (submissionData) => {
      trackEvent('feedback_submitted', submissionData.assistantName, submissionData);
  };


  const processFileForApi = (file) => {
      return new Promise((resolve, reject) => {
          if (!file) reject("No file provided");
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve({ mime_type: file.type, data: reader.result.split(',')[1] });
          reader.onerror = (error) => reject(error);
      });
  };

  const handleShare = async (shareData) => {
      trackEvent('share', activePromptKey);
      if (navigator.share) {
          try {
              await navigator.share(shareData);
          } catch (err) {
              console.error("Share failed:", err);
          }
      } else {
          navigator.clipboard.writeText(shareData.text || shareData.url);
          setShowCopyToast(true);
          setTimeout(() => setShowCopyToast(false), 3000);
      }
  };

    // =================================================================
    // MODIFIED: This function now copies rich text (HTML) to the clipboard.
    // This allows pasting formatted content into apps like Word or Google Docs.
    // =================================================================
    const handleCopy = async (markdownContent) => {
        try {
            // Convert the raw markdown into HTML using the 'marked' library
            const htmlContent = marked.parse(markdownContent);

            // Create a temporary container to properly structure the HTML for copying
            const container = document.createElement('div');
            container.innerHTML = htmlContent;

            // Add the standard attribution line to the end of the content
            const attribution = document.createElement('p');
            attribution.innerHTML = '<br><br>---<br><em>Generated by the CBC AI Educational Assistant</em><br><em>Created by Derrick Musamali | Visit: <a href="https://cbc-ai-tool.netlify.app/">https://cbc-ai-tool.netlify.app/</a></em>';
            container.appendChild(attribution);

            const finalHtml = container.innerHTML;
            const plainText = container.innerText; // Get a plain text version as a fallback

            // Create a "blob" (a file-like object) for the HTML content
            const blobHtml = new Blob([finalHtml], { type: 'text/html' });
            // Create a blob for the plain text fallback
            const blobText = new Blob([plainText], { type: 'text/plain' });

            // Use the modern Clipboard API to write both HTML and plain text formats
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': blobHtml,
                    'text/plain': blobText
                })
            ]);

            // Show a success message
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 3000);

        } catch (err) {
            // If the rich text copy fails, fall back to copying plain text
            console.error('Rich text copy failed, falling back to plain text. Error:', err);
            try {
                const plainText = marked.parse(markdownContent).replace(/<[^>]*>/g, ''); // Basic conversion
                const attributionText = "\n\n---\nGenerated by the CBC AI Educational Assistant\nCreated by Derrick Musamali | Visit: https://cbc-ai-tool.netlify.app/";
                await navigator.clipboard.writeText(plainText + attributionText);
                setShowCopyToast(true);
                setTimeout(() => setShowCopyToast(false), 3000);
            } catch (fallbackErr) {
                console.error('Plain text fallback copy failed:', fallbackErr);
                setError("Failed to copy message. Your browser might not support this feature.");
            }
        }
    };


  const handleDeleteMessage = (indexToDelete) => {
      setChatHistory(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleStopGeneration = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
      }
      if(longResponseTimerRef.current) {
          clearTimeout(longResponseTimerRef.current);
      }
      setIsTakingLong(false);
  };
  
  // DOCX download handler using the 'docx' library.
  const handleDocxDownload = async (markdownContent) => {
      if (typeof docx === 'undefined') {
          setError("DOCX export library is still loading. Please try again in a moment.");
          console.error("`docx` library not found on window object.");
          return;
      }
      
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } = docx;

      try {
          const tokens = marked.lexer(markdownContent);
          const children = [];

          const parseInlines = (inlines) => {
              const runs = [];
              for (const inline of inlines) {
                  if (inline.type === 'strong') {
                      runs.push(new TextRun({ text: inline.text, bold: true }));
                  } else if (inline.type === 'em') {
                      runs.push(new TextRun({ text: inline.text, italics: true }));
                  } else {
                      runs.push(new TextRun(inline.text));
                  }
              }
              return runs;
          };

          for (const token of tokens) {
              if (token.type === 'heading') {
                  children.push(new Paragraph({
                      children: parseInlines(token.tokens),
                      heading: `Heading${token.depth}`
                  }));
              } else if (token.type === 'paragraph') {
                  children.push(new Paragraph({ children: parseInlines(token.tokens) }));
              } else if (token.type === 'list') {
                  for (const item of token.items) {
                      children.push(new Paragraph({
                          children: parseInlines(item.tokens[0].tokens),
                          bullet: { level: 0 }
                      }));
                  }
              } else if (token.type === 'table') {
                  const header = new TableRow({
                      children: token.header.map(cell => new TableCell({
                          children: [new Paragraph({ children: parseInlines(cell.tokens), alignment: AlignmentType.CENTER })],
                          shading: { fill: "E5E7EB" }
                      })),
                      tableHeader: true,
                  });
                  const rows = token.rows.map(row => new TableRow({
                      children: row.map(cell => new TableCell({ children: [new Paragraph({ children: parseInlines(cell.tokens) })] }))
                  }));
                  const table = new Table({
                      rows: [header, ...rows],
                      width: { size: 100, type: WidthType.PERCENTAGE }
                  });
                  children.push(table);
              } else if (token.type === 'space') {
                  children.push(new Paragraph(""));
              }
          }

          const doc = new Document({
              sections: [{
                  headers: {
                      default: new Paragraph({
                          children: [new TextRun({ text: `Generated by AI Assistant for ${activePromptKey}`, size: 16, color: "888888", italics: true })],
                          alignment: AlignmentType.RIGHT
                      }),
                  },
                  footers: {
                      default: new Paragraph({
                          children: [new TextRun({ text: "Created by Derrick Musamali | cbc-ai-tool.netlify.app", size: 16, color: "888888", italics: true })],
                          alignment: AlignmentType.CENTER
                      }),
                  },
                  children,
              }]
          });

          const blob = await Packer.toBlob(doc);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const fileName = `${activePromptKey.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.docx`;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          trackEvent('docx_download', activePromptKey);

      } catch (error) {
          console.error("Error generating DOCX file:", error);
          setError("Sorry, there was an error creating the DOCX file.");
      }
  };


  const fetchAndStreamResponse = async ({ historyForApi, systemPrompt, onUpdate, onComplete, onError }) => {
      const apiKey = apiKeys[selectedProvider.apiKeyName];
      if (!apiKey || apiKeyStatus[selectedProvider.key] !== 'valid') {
          onError(`Please enter a valid ${selectedProvider.label} API Key in the settings panel.`);
          return;
      }

      abortControllerRef.current = new AbortController();
      
      if(longResponseTimerRef.current) clearTimeout(longResponseTimerRef.current);
      longResponseTimerRef.current = setTimeout(() => {
          setIsTakingLong(true);
      }, LONG_RESPONSE_TIMEOUT);

      try {
          let requestUrl, requestHeaders, requestBody;

          if (selectedProvider.key === 'google') {
              requestUrl = `${selectedProvider.apiHost}/v1beta/models/${selectedModel.name}:streamGenerateContent?key=${apiKey}&alt=sse`;
              requestHeaders = { 'Content-Type': 'application/json' };
              const geminiMessages = historyForApi.map(msg => {
                  const parts = [{ text: msg.content || "" }];
                  if (msg.role === 'user' && msg.fileDataForApi) {
                      parts.push({ inline_data: { mime_type: msg.fileDataForApi.mime_type, data: msg.fileDataForApi.data } });
                  }
                  return { role: msg.role === 'user' ? 'user' : 'model', parts };
              });
              requestBody = JSON.stringify({ contents: geminiMessages, systemInstruction: { parts: [{ text: systemPrompt }] } });
          } else {
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
          if (err.name !== 'AbortError') {
              onError(err.message);
          }
      } finally {
          clearTimeout(longResponseTimerRef.current);
          setIsTakingLong(false);
          onComplete();
      }
  };

  const handleSendMessage = async () => {
      if ((!userInput.trim() && !pendingFile) || isLoading) return;
      
      setIsLoading(true);
      setError('');
      
      let fileDataForApi = null;
      if (pendingFile && !isFileUploadDisabled) {
          try {
              fileDataForApi = await processFileForApi(pendingFile);
          } catch(e) {
              setError("Could not read file.");
              setIsLoading(false);
              return;
          }
      }

      const userMessage = { role: 'user', content: userInput, file: pendingFile ? { name: pendingFile.name, previewUrl: pendingFilePreview } : null, fileDataForApi, id: Date.now() };
      const assistantPlaceholder = { role: 'assistant', content: '', isLoading: true, id: Date.now() + 1 };
      
      const newHistory = [...chatHistory, userMessage, assistantPlaceholder];
      setChatHistory(newHistory);
      setUserInput(''); setPendingFile(null); setPendingFilePreview(null);

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
          onUpdate: (chunk) => {
              setChatHistory(prev => {
                  const updatedHistory = [...prev];
                  const lastMsg = updatedHistory[updatedHistory.length - 1];
                  if (lastMsg && lastMsg.isLoading) {
                      lastMsg.content += chunk;
                  }
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
                  setGenerationCount(prevCount => prevCount + 1);
                  trackEvent('generation', activePromptKey);
              }
              abortControllerRef.current = null;
          },
          onError: (err) => {
              setError(err);
              setChatHistory(prev => prev.slice(0, -2));
              setIsLoading(false);
          }
      });
  };

  const fetchNotifications = async () => {
    try {
        const response = await fetch(`${GAS_WEB_APP_URL}?action=getUpdates`);
        const data = await response.json();
        if (data.success && data.updates && data.updates.length > 0) {
            setNotifications(data.updates);
            
            const latestTimestamp = data.updates[0].timestamp;
            const lastSeenTimestamp = localStorage.getItem('lastSeenUpdateTimestamp');
            
            if (latestTimestamp !== lastSeenTimestamp) {
                setShowUpdateBanner(true);
                setHasNewNotification(true);
            }
        }
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
    }
  };

  const dismissUpdateBanner = () => {
      setShowUpdateBanner(false);
      if (notifications.length > 0) {
          localStorage.setItem('lastSeenUpdateTimestamp', notifications[0].timestamp);
          setHasNewNotification(false);
      }
  };


  
  const handleRegenerate = async (indexToRegenerate) => {
      if (isLoading) return;

      const historyForApi = chatHistory.slice(0, indexToRegenerate);
      if (historyForApi.length === 0 || historyForApi[historyForApi.length - 1].role !== 'user') {
          setError("Cannot regenerate without a preceding user prompt.");
          return;
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
                  trackEvent('regeneration', activePromptKey);
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


  const handleProviderChange = (e) => {
      const newProviderKey = e.target.value;
      setSelectedProviderKey(newProviderKey);
      setSelectedModelName(AI_PROVIDERS.find(p => p.key === newProviderKey).models[0].name);
  };

  const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file && !isFileUploadDisabled) {
          setPendingFile(file);
          if (file.type.startsWith('image/')) { setPendingFilePreview(URL.createObjectURL(file)); }
          else { setPendingFilePreview(null); }
      }
  };

  const handleCustomPromptUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
          const text = await file.text();
          setCustomPromptContent(text);
          setActivePromptKey('custom');
          setIsPromptMissing(false);
          setChatHistory([{ role: 'assistant', content: 'Custom prompt loaded. How can I assist?', id: Date.now() }]);
      } catch (err) { setError('Could not read custom prompt file.'); }
  };

  const handlePromptSelectionChange = (e) => {
      if (e.target.value) {
          window.location.href = e.target.value;
      }
  };

    const clearChat = () => {
      const chatKey = `chatHistory_${activePromptKey}`;
      setChatHistory([]); 
      localStorage.removeItem(chatKey);
      setPendingFile(null);
      setPendingFilePreview(null);
      setError('');
      loadInitialMessage(activePromptKey);
  };
  
  const resetSettings = () => {
      localStorage.removeItem('aiAssistantState');
      localStorage.removeItem('generationCount');
      localStorage.removeItem('feedbackTimestamps');
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
  };

  const handleScroll = (direction) => {
      const container = chatContainerRef.current;
      if (container) {
          const scrollAmount = container.clientHeight * 0.8;
          container.scrollBy({ top: direction === 'up' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      }
  };

  const startResizing = useCallback((mouseDownEvent) => {
      const handleMouseMove = (mouseMoveEvent) => {
          const newWidth = mouseDownEvent.clientX + (mouseMoveEvent.clientX - mouseDownEvent.clientX);
          if (newWidth > 280 && newWidth < 800) {
              setSidebarWidth(newWidth);
          }
      };
      const handleMouseUp = () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
      };
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
  }, []);

  // --- RENDER ---
    if (isLoadingAssistants) {
      return (
          <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
              <LoadingScreen text="Getting AI Assistants ready for you..." />
          </div>
      );
  }

  if (isPromptMissing) {
      return (
          <div className="flex items-center justify-center h-screen bg-slate-100 p-4">
              <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-lg">
                  <AlertTriangleIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Assistant Not Configured</h2>
                  <p className="text-slate-600 mb-4">The "{activePromptKey}" assistant has not been configured yet in the Google Apps Script.</p>
                  <p className="text-slate-600 mb-6">Please contact the administrator or select another assistant.</p>
                  <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-600 mb-3">Alternatively, you can upload a custom prompt in a `.txt` or `.json` file to start a session.</p>
                      <label htmlFor="custom-prompt-upload-error" className="w-full inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors cursor-pointer">Upload Custom Prompt</label>
                      <input id="custom-prompt-upload-error" type="file" className="hidden" accept=".txt,.json" onChange={handleCustomPromptUpload} />
                  </div>
                   <a href = "/" className="mt-6 inline-flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 font-semibold"><HomeIcon className="w-5 h-5"/>Return to Home</a>
              </div>
          </div>
      );
  }

  return (
      <div className="h-screen w-screen overflow-hidden flex bg-white">
          {/* --- SIDEBAR / SETTINGS PANEL --- */}
          <div
              style={{ width: `${sidebarWidth}px`, maxWidth: '100vw' }}
              className={`absolute lg:static top-0 left-0 h-full bg-slate-800 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
          >
              <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center p-4 flex-shrink-0">
                       <h1 className="text-2xl font-bold">Settings</h1>
                       <button onClick={() => setIsMenuOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white"><XIcon className="w-6 h-6"/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
                      <div>
                          <label className="text-sm text-slate-400">Select an Assistant</label>
                          <select onChange={handlePromptSelectionChange} value={navigationMenu[activePromptKey] || ""} className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                              {availableAssistants.map(assistant => (
                                  <option key={assistant} value={navigationMenu[assistant]}>{assistant}</option>
                              ))}
                              {activePromptKey === 'custom' && <option value="">Custom Prompt</option>}
                          </select>
                           <label htmlFor="custom-prompt-upload" className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer block text-center py-2 border border-dashed border-slate-600 rounded-md hover:border-indigo-500 transition-colors">Upload Custom Prompt</label>
                          <input id="custom-prompt-upload" type="file" className="hidden" accept=".txt,.json" onChange={handleCustomPromptUpload} />
                      </div>
                      <div>
                          <label className="text-sm text-slate-400">AI Provider</label>
                          <select value={selectedProviderKey} onChange={handleProviderChange} className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                              {AI_PROVIDERS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="text-sm text-slate-400">AI Model</label>
                          <select value={selectedModelName} onChange={(e) => setSelectedModelName(e.target.value)} className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                              {selectedProvider?.models.map(model => <option key={model.name} value={model.name}>{model.name}</option>)}
                          </select>
                      </div>
                       <div>
                          <label className="text-sm text-slate-400">{selectedProvider?.label} API Key</label>
                          <div className="relative">
                              <input type="password" value={apiKeys[selectedProvider?.apiKeyName] || ''} onChange={(e) => handleApiKeyChange(selectedProvider.apiKeyName, selectedProvider, e.target.value)} placeholder={`Paste your ${selectedProvider?.label} key here`} className="w-full mt-1 p-2 pr-8 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                  {apiKeyStatus[selectedProvider.key] === 'checking' && <div className="loading-spinner"></div>}
                                  {apiKeyStatus[selectedProvider.key] === 'valid' && <CheckCircleIcon className="w-5 h-5 text-green-500"/>}
                                  {apiKeyStatus[selectedProvider.key] === 'invalid' && <AlertCircleIcon className="w-5 h-5 text-red-500"/>}
                              </div>
                          </div>
                          <a href={selectedProvider?.apiKeyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-1 block">Get your key here &raquo;</a>
                      </div>
                      <div><label className="text-sm text-slate-400">Auto-delete Chat</label><select value={autoDeleteHours} onChange={(e) => setAutoDeleteHours(e.target.value)} className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="1">After 1 Hour</option><option value="2">After 2 Hours</option><option value="24">After 24 Hours</option><option value="never">Never</option></select></div>
                       <div>
                          <label className="text-sm text-slate-400">App Settings</label>
                          {showResetConfirm ? (
                              <div className="mt-1 p-2 bg-red-900/50 border border-red-500 rounded-md text-center">
                                  <p className="text-sm mb-2">Are you sure? This will clear all API keys and settings.</p>
                                  <div className="flex gap-2">
                                      <button onClick={() => setShowResetConfirm(false)} className="w-full text-xs py-1 bg-slate-600 hover:bg-slate-500 rounded">Cancel</button>
                                      <button onClick={resetSettings} className="w-full text-xs py-1 bg-red-600 hover:bg-red-500 rounded">Confirm Reset</button>
                                  </div>
                              </div>
                          ) : (
                              <button onClick={() => setShowResetConfirm(true)} className="w-full mt-1 p-2 bg-red-800 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center gap-2">
                                  <SettingsIcon className="w-5 h-5"/>
                                  <span>Reset App Settings</span>
                              </button>
                          )}
                      </div>
                  </div>
                  <div className="p-4 mt-auto space-y-3 flex-shrink-0 border-t border-slate-700">
                       <p className="text-sm text-slate-400 text-center">A Project by Derrick Musamali</p>
                       <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-slate-400">
                            <a href="mailto:cbcaitool@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors" title="Send an Email">
                                <FooterEmailIcon />
                                <span className="text-sm">cbcaitool@gmail.com</span>
                            </a>
                            <a href="tel:+256750470234" className="flex items-center gap-2 hover:text-white transition-colors" title="Make a Call">
                                <FooterPhoneIcon />
                                <span className="text-sm">+256750470234</span>
                            </a>
                            <a href="https://wa.me/256750470234" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors" title="Chat on WhatsApp">
                                <FooterWhatsAppIcon />
                                <span className="text-sm">+256750470234</span>
                            </a>
                       </div>
                       <a href= "/" rel="external" className="flex items-center justify-center gap-2 w-full text-center mt-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"><HomeIcon className="w-5 h-5"/>Return to Home</a>
                  </div>
              </div>
              <div onMouseDown={startResizing} className="resize-handle hidden lg:block"></div>
          </div>

          {/* --- MAIN CHAT INTERFACE --- */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
              {showUpdateBanner && <UpdateBanner latestUpdate={notifications[0]} onDismiss={dismissUpdateBanner} />}
              <header className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0 bg-white z-10">
                  <button onClick={() => setIsMenuOpen(true)} className="p-1 text-slate-600 hover:text-slate-900 lg:hidden"><MenuIcon className="w-6 h-6" /></button>
                  <h2 className="text-xl font-semibold text-slate-800 text-center flex-1">{activePromptKey} Assistant</h2>
                  <div className="flex items-center gap-2">
                      <button
                          onClick={() => setIsNotificationsOpen(true)}
                          title="Notifications"
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors"
                      >
                          <BellIcon className="w-5 h-5"/>
                          <span className="hidden sm:inline">Notifications</span>
                          {hasNewNotification && <span className="block w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
                      </button>
                      <button
                          onClick={() => handleShare({
                              title: 'AI Educational Assistant',
                              text: 'Check out this suite of AI-powered tools for educators!',
                              url: window.location.href
                          })}
                          title="Share this app"
                          className="p-2 rounded-full hover:bg-slate-200"
                      >
                          <Share2Icon className="w-5 h-5 text-slate-500"/>
                      </button>
                      <button onClick={clearChat} title="Clear chat messages" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors">
                           <TrashIcon className="w-5 h-5"/>
                           <span className="hidden sm:inline">Clear Chat</span>
                       </button>
                  </div>
              </header>

              <main ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
                  <div className="px-1 p-2 sm:p-6 space-y-4">
                      {chatHistory.map((msg, index) => (
                          <div key={msg.id || index} className={`flex w-full items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                              
                              <div className={`flex flex-col w-full max-w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                  <div className={`rounded-lg w-full overflow-hidden flex flex-col ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'}`}>
                                      {msg.file && (
                                          <div className="p-2 bg-indigo-500/80">
                                              {msg.file.previewUrl ? <img src={msg.file.previewUrl} className="max-w-xs rounded-md"/> : <div className="flex items-center gap-2 p-2"><FileIcon className="w-6 h-6"/><span>{msg.file.name}</span></div>}
                                          </div>
                                      )}
                                      <MarkdownRenderer 
                                          htmlContent={marked.parse(msg.content || '')} 
                                          isLoading={msg.isLoading}
                                          isTakingLong={isTakingLong}
                                      />
                                  </div>
                                  
                                  <MessageMenu
                                      msg={msg}
                                      index={index}
                                      onCopy={handleCopy}
                                      onShare={handleShare}
                                      onDelete={handleDeleteMessage}
                                      onRegenerate={handleRegenerate}
                                      onDocxDownload={handleDocxDownload}
                                  />
                              </div>
                          </div>
                      ))}
                      <div ref={chatEndRef} />
                  </div>
                  <div className="sticky bottom-4 right-4 float-right space-y-2">
                      <button onClick={() => handleScroll('up')} className="p-2 rounded-full bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition-opacity"><ChevronUpIcon className="w-5 h-5"/></button>
                      <button onClick={() => handleScroll('down')} className="p-2 rounded-full bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition-opacity"><ChevronDownIcon className="w-5 h-5"/></button>
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

              {error && <div className="p-4 bg-red-100 text-red-700 border-t border-red-200 flex-shrink-0">{error}</div>}

              <footer className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
                  <div className="relative mx-auto max-w-4xl">
                      {pendingFile && <div className="absolute bottom-full left-0 mb-2 max-w-md p-2"><div className="flex items-start gap-2 bg-slate-200 text-slate-700 rounded-lg p-2 text-sm">
                          {pendingFilePreview ? <img src={pendingFilePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md"/> : <FileIcon className="w-12 h-12 text-slate-500 shrink-0"/>}
                          <div className="flex-grow"><p className="font-semibold">File attached:</p><p className="text-xs break-all">{pendingFile.name}</p></div>
                          <button onClick={() => {setPendingFile(null); setPendingFilePreview(null);}} className="p-1 rounded-full hover:bg-slate-300 shrink-0"><XIcon className="w-4 h-4" /></button>
                      </div></div>}
                      <div className="flex items-end gap-2 sm:gap-4">
                            <div className="flex flex-col items-center self-end">
                              <label htmlFor="file-upload" title={isFileUploadDisabled ? "File upload not supported by this model" : "Attach File"} className={`p-3 rounded-full hover:bg-slate-100 ${isFileUploadDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                  <PaperclipIcon className="w-6 h-6 text-slate-600"/>
                              </label>
                              <span className="text-xs text-slate-400 hidden sm:inline">Attach</span>
                           </div>
                          <input id="file-upload" type="file" className="hidden" onChange={handleFileSelect} disabled={isFileUploadDisabled}/>
                          <textarea
                              ref={userInputRef}
                              id="chat-input"
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendMessage();
                                  }
                              }}
                              placeholder="Type your message or attach a file..."
                              className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-y-auto max-h-48"
                              rows="1"
                          />
                          <button 
                              onClick={isLoading ? handleStopGeneration : handleSendMessage} 
                              disabled={!isLoading && !userInput.trim() && !pendingFile} 
                              className="px-4 py-3 rounded-lg bg-indigo-600 text-white disabled:bg-slate-300 transition-colors hover:bg-indigo-700 self-end flex items-center gap-2 font-semibold"
                          >
                              {isLoading ? (
                                  <><StopIcon className="w-5 h-5"/><span>Stop</span></>
                              ) : (
                                  <><SendIcon className="w-5 h-5"/><span>Send</span></>
                              )}
                          </button>
                      </div>
                  </div>
              </footer>
          </div>

          {/* --- TOAST NOTIFICATIONS --- */}
          {showCopyToast && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg z-50">
                  Copied to clipboard!
              </div>
          )}
          {apiKeyToast && (
              <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 text-white ${
                  apiKeyToast.includes('Invalid') ? 'bg-red-600' : 'bg-green-600'
              }`}>
                  {apiKeyToast.includes('Invalid') ? <AlertCircleIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5"/>}
                  <span>{apiKeyToast}</span>
              </div>
          )}

          {/* --- FEEDBACK MODAL --- */}
          <FeedbackModal
              isOpen={isFeedbackModalOpen}
              onClose={() => setIsFeedbackModalOpen(false)}
              onSubmit={handleFeedbackSubmit}
              assistantName={activePromptKey}
          />
      </div>
  );
}

// --- RENDER THE APP ---
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
