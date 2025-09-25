import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // If you are using Tailwind or custom CSS

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
