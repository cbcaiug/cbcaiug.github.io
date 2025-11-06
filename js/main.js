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

// Once React is ready and mounted, smoothly transition
reactRoot.render(<App onMount={() => {
    // Fade in the React app
    requestAnimationFrame(() => {
        appContainer.style.opacity = '1';
        // Fade out the static loader
        fadeOutLoader(staticLoader);
    });
}} />);