/**
 * js/main.js
 *
 * This is the main entry point for the React application.
 * Its sole responsibility is to find the root DOM element and render the
 * main App component into it.
 */

// Find the root element in the HTML where our app will be mounted
const container = document.getElementById('root');

// Create a React root for that container
const root = ReactDOM.createRoot(container);

// Render the main App component into the root
root.render(<App />);