import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store/store';
import theme from './theme';
import App from './App';
import { injectStore } from './services/api';
import { cookieUtils } from './utils/cookieUtils';

// Inject store into api
injectStore(store);

// ── Load Chatbot Widget via script tag ──────────────────────────
const script = document.createElement('script');
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const defaultScriptUrl = isLocalhost
  ? 'http://localhost:5173/src/widget.jsx'
  : 'https://precheck-ai-assistant-etd4dvdwanc6hfb2.centralindia-01.azurewebsites.net/my-chatbot.iife.js';

const scriptUrl = import.meta.env.VITE_CHATBOT_SCRIPT_URL || defaultScriptUrl;
if (scriptUrl.includes('/src/') || scriptUrl.endsWith('.jsx')) {
  script.type = 'module';
}
script.src = scriptUrl;
script.onload = () => {
  const mod = (window as any).MyChatbot;
  const chatbot = mod?.default || mod?.MyChatbot || mod;
  if (chatbot?.init) {
    chatbot.init({
      chatApiUrl: import.meta.env.VITE_API_BASE_URL,
      position: 'bottom-right',
      autoOpen: false,
      showLauncher: false,
      getAuthToken: () => cookieUtils.getToken() || null,
      themeOverrides: {
        primaryColor: '#6D2A8F',
        secondaryColor: '#D82578',
        gradient: 'linear-gradient(135deg, #6D2A8F 0%, #D82578 100%)',
        fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }
    });

    const publicAuthRoutes = ['/login', '/register', '/forget-password', '/forgot-password'];
    const isAuthPage = publicAuthRoutes.includes(window.location.pathname.toLowerCase());
    const token = cookieUtils.getToken();

    if (!token || isAuthPage) {
      if (typeof chatbot.close === 'function') chatbot.close();
    }
  }
};
document.body.appendChild(script);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
); 