import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { OwnerAuthProvider } from './context/OwnerAuthContext.jsx';
import { validateEnv } from './config/env.js';
import './styles/globals.css';

validateEnv();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OwnerAuthProvider>
      <App />
    </OwnerAuthProvider>
  </React.StrictMode>,
);
