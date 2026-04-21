import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { AuthProvider } from '../modules/auth/context/AuthContext';
import '../styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className: 'border border-slate-800 bg-slate-950 text-slate-100',
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);