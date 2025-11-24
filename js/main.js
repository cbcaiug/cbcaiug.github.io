/**
 * js/main.js
 *
 * This is the main entry point for the React application.
 * It manages the smooth transition from static loader to React app.
 */

// Function to smoothly fade out the static loader
const fadeOutLoader = (staticLoader) => {
    if (!staticLoader) return;
    staticLoader.style.transition = 'opacity 0.4s ease-out';
    staticLoader.style.opacity = '0';
    setTimeout(() => {
        staticLoader.remove();
    }, 400); // Match the transition duration
};

// Keep a reference to the static loader
const staticLoader = document.querySelector('.loading-screen-container');

// Create a React root for the app container
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// Create a new container for the React app that won't replace the loader
const appContainer = document.createElement('div');
appContainer.id = 'react-root';
appContainer.style.height = '100%';
appContainer.style.opacity = '0';
appContainer.style.transition = 'opacity 0.3s ease-in';
container.appendChild(appContainer);

// Render React app in the new container
const reactRoot = ReactDOM.createRoot(appContainer);

// Try to render the app; if an error occurs during render we catch it
// and remove the static loader after showing an inline error so the
// page doesn't remain stuck on the loading screen.
try {
    reactRoot.render(<App onMount={() => {
        // Fade in the React app
        requestAnimationFrame(() => {
            appContainer.style.opacity = '1';
            // Fade out the static loader
            fadeOutLoader(staticLoader);
        });
    }} />);
} catch (renderErr) {
    // Log and show a simple error UI in the new container, then remove loader
    console.error('React render failed:', renderErr);
    appContainer.style.opacity = '1';
    appContainer.innerHTML = `<div style="padding:24px;font-family:Inter,Arial,sans-serif;color:#111;background:#fff;min-height:100%;box-sizing:border-box;">
        <h2 style="margin:0 0 8px 0;font-size:18px;color:#111">Application failed to start</h2>
        <p style="margin:0 0 12px 0;color:#444">An error occurred while initializing the app. Check the browser console for details.</p>
        <button id="reload-app-btn" style="padding:8px 12px;border-radius:6px;border:1px solid #ddd;background:#f3f4f6;cursor:pointer">Reload</button>
        </div>`;
    const btn = appContainer.querySelector('#reload-app-btn');
    if (btn) btn.addEventListener('click', () => window.location.reload());
    // Remove static loader so users can interact with the error UI
    fadeOutLoader(staticLoader);
}

// Safety net: if React hasn't called onMount within 3 seconds, remove the loader
// and reveal the app container so users aren't stuck on the static loader.
setTimeout(() => {
    if (staticLoader && document.body.contains(staticLoader)) {
        console.warn('Mount timeout: removing static loader to avoid blocking the UI');
        fadeOutLoader(staticLoader);
        appContainer.style.opacity = '1';
    }
}, 3000);