import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App.jsx';

// Find the root element in the HTML where our app will be mounted.
const container = document.getElementById('root');

// Create a React root for that container.
const root = ReactDOM.createRoot(container);

// Render the main App component into the root.
root.render(<App />);