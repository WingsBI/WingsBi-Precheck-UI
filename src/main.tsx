import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store/store';
import theme from './theme';
import App from './App';
import { injectStore } from './services/api';

// Direct import of chatbot widget for local development (bypasses port 5173 dev server dependency)
// @ts-ignore
import MyChatbotDirect from '@chatbot';

// Inject store into api
injectStore(store);

// Initialize Chatbot Widget
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const initBot = (chatbotModule: any) => {
  const MyChatbot = chatbotModule?.default || chatbotModule || (window as any).MyChatbot;
  if (MyChatbot) {
    (window as any).MyChatbot = MyChatbot;
    try {
      MyChatbot.init({
        apiUrl: 'https://webapi-xpopilot-dev.azurewebsites.net',
        eventIdentifier: 'big5global2025',
        position: 'bottom-right',
        theme: 'dark',
        basePath: 'https://webapp-xpopilot-widget-dev.azurewebsites.net',
        autoOpen: false,
        showLauncher: false,
        stdTypeId: 280,
        stdTypeName: null,
        exbId: 96464,
        eventid: 673,
        marketingEnvId: null,
        // ── Connect to .NET backend ──────────────────────────
        chatApiUrl: isLocal ? 'http://localhost:5027' : 'https://app-wingsbi-precheck-api-gwece8g8bbaxgebj.centralindia-01.azurewebsites.net',
        chatEndpoint: '/api/Chatbot/AskStream',
        getAuthToken: function () {
          const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
          return match ? decodeURIComponent(match[1]) : null;
        },
        // ──────────────────────────────────────────────────────────
        themeOverrides: {
          primaryColor: '#7c3aed',
          secondaryColor: '#ec4899',
          gradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
          fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }
      });
    } catch (e) {
      console.error('[WingsBi Precheck] MyChatbot.init error:', e);
    }
  }
};

if (MyChatbotDirect) {
  initBot(MyChatbotDirect);
} else {
  const wrapperUrl = isLocal
    ? 'http://localhost:5173/src/widget.jsx'
    : 'https://webapp-xpopilot-widget-dev.azurewebsites.net/my-chatbot.js';

  import(/* @vite-ignore */ wrapperUrl)
    .then((module) => {
      initBot(module.default || (window as any).MyChatbot);
    })
    .catch((err) => console.error('[WingsBi Precheck] Chatbot wrapper error:', err));
}

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