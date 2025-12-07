/**
 * src/components/WelcomeView.js
 *
 * A compact, light-themed welcome screen sized like the auth modal.
 * Fits within the available viewport without scrolling on both phone and PC.
 * Includes PWA install prompt.
 */

const WelcomeView = () => {
    const [installPrompt, setInstallPrompt] = React.useState(null);

    React.useEffect(() => {
        // Check if prompt was already captured globally before React loaded
        if (window.deferredInstallPrompt) {
            setInstallPrompt(window.deferredInstallPrompt);
            console.log('PWA: Using pre-captured install prompt');
        }

        // Also listen for future events (in case it hasn't fired yet)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            window.deferredInstallPrompt = e;
            console.log('PWA: Install prompt captured in React');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        // Show the install prompt
        installPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, discard it
        setInstallPrompt(null);
    };

    return (
        <div className="w-full h-full flex items-start sm:items-center justify-center bg-[#0f0f0f] relative overflow-hidden font-sans p-4 pt-8 sm:pt-4">

            {/* Ambient Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-48 h-48 bg-blue-900/20 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-slate-800/30 rounded-full blur-3xl opacity-60"></div>
            </div>

            {/* Main Card - Dark Glass */}
            <div className="relative bg-[#1a1a1a] rounded-2xl border border-slate-700 shadow-lg p-5 w-full max-w-md">

                {/* Logo */}
                <div className="flex justify-center mb-4">
                    <img
                        src="https://raw.githubusercontent.com/cbcaiug/cbcaiug.github.io/90c773e3d0d5d330ab0b2e285243c52cb7e62c78/assets/images/1024%20swirl%20logo.png"
                        alt="CBC AI Logo"
                        className="w-14 h-14 rounded-full shadow-md object-cover border-2 border-slate-600"
                    />
                </div>

                {/* Title */}
                <h1 className="text-lg font-bold text-white text-center mb-1">Welcome to CBC AI</h1>
                <p className="text-xs text-slate-400 text-center mb-4">Your AI partner for the new curriculum</p>

                {/* Steps - Compact list */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="w-7 h-7 bg-blue-600 text-white rounded-md flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-white">1. Select Tool</span>
                            <span className="text-xs text-slate-400 ml-1">— Choose from sidebar</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="w-7 h-7 bg-blue-600 text-white rounded-md flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-white">2. Input Details</span>
                            <span className="text-xs text-slate-400 ml-1">— Attach docs, hit Send</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="w-7 h-7 bg-blue-600 text-white rounded-md flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-white">3. Generate</span>
                            <span className="text-xs text-slate-400 ml-1">— Get NCDC results</span>
                        </div>
                    </div>
                </div>

                {/* Install Button (Only visible if supported) */}
                {installPrompt && (
                    <button
                        onClick={handleInstallClick}
                        className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Install App
                    </button>
                )}

                {/* Footer Links */}
                <div className="flex justify-center gap-3 pt-3 border-t border-slate-700">
                    <a href="https://youtu.be/YXsOnmAD1Lg" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-full hover:bg-slate-700 hover:text-red-400 hover:border-red-500/50 transition-colors no-underline">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                        Video
                    </a>
                    <a href="faq.html" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-full hover:bg-slate-700 hover:text-blue-400 hover:border-blue-500/50 transition-colors no-underline">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        FAQ
                    </a>
                    <a href="https://wa.me/256750470234" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-full hover:bg-slate-700 hover:text-green-400 hover:border-green-500/50 transition-colors no-underline">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 448 512">
                            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-26.7l-7-4.1-72.5 19.1 19.4-70.5-4.5-7.3c-18.4-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                        </svg>
                        WhatsApp
                    </a>
                </div>

            </div>
        </div>
    );
};