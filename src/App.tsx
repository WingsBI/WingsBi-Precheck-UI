import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme/theme';
import { store } from './store/store';
import type { AppDispatch, RootState } from './store/store';
// Removed initializeAuth to prevent auto-login from cookies/localStorage
import AppRoutes from './routes';
import { cookieUtils } from './utils/cookieUtils';
import { decodeJwt } from './utils/jwtUtils';
import { setAuthFromStorage } from './store/slices/authSlice';

// Create QueryClient for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch on tab focus
    },
  },
});

// Rehydrate auth from session cookie on first load (not persistent across browser restarts)
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [bootstrapped, setBootstrapped] = useState(false);
  const token = useSelector((state: RootState) => state.auth.user?.token) || cookieUtils.getToken() || null;

  useEffect(() => {
    try {
      // Session sentinel: if this is a brand-new browser session (no sentinel),
      // clear any leftover cookies to avoid auto-login, then set the sentinel.
      // Refreshes within the same session will keep cookies and rehydrate auth.
      const SESSION_SENTINEL_KEY = 'session_started';
      const hasSession = sessionStorage.getItem(SESSION_SENTINEL_KEY);
      if (!hasSession) {
        // New browser session → clear auth cookies to force fresh login
        cookieUtils.clearAuth();
        sessionStorage.setItem(SESSION_SENTINEL_KEY, '1');
      }

      const currentToken = cookieUtils.getToken();
      if (currentToken) {
        const decoded: any = decodeJwt(currentToken);
        const now = Date.now() / 1000;
        if (decoded?.exp && decoded.exp > now) {
          dispatch(setAuthFromStorage({
            token: currentToken,
            id: decoded.id,
            userid: decoded.userid,
            username: decoded.username,
            roleid: decoded.roleid,
            role: decoded.role,
            plantid: decoded.plantid,
            email: decoded.email,
            deptid: decoded.deptid,
            department: decoded.department,
          }));
        }
      }
    } finally {
      setBootstrapped(true);
    }
  }, [dispatch]);

  // Auto-open chatbot ONCE on initial page load if logged in, but DO NOT auto-open on page route changes
  const initialLoadHandled = useRef(false);

  useEffect(() => {
    if (!bootstrapped) return;

    const publicAuthRoutes = ['/login', '/register', '/forget-password', '/forgot-password'];
    const isAuthPage = publicAuthRoutes.includes(location.pathname.toLowerCase());

    const getChatbot = () => {
      const mod = (window as any).MyChatbot;
      return mod?.default || mod?.MyChatbot || mod;
    };

    if (!token || isAuthPage) {
      initialLoadHandled.current = false;
      const chatbot = getChatbot();
      if (chatbot && typeof chatbot.close === 'function') {
        chatbot.close();
      }
      return;
    }

    // Auto-open ONLY on initial page load or fresh login, not on route changes
    if (!initialLoadHandled.current) {
      initialLoadHandled.current = true;

      const tryOpen = () => {
        const chatbot = getChatbot();
        if (chatbot && typeof chatbot.open === 'function') {
          chatbot.open();
          return true;
        }
        return false;
      };

      if (!tryOpen()) {
        const intervalId = setInterval(() => {
          if (tryOpen()) {
            clearInterval(intervalId);
          }
        }, 200);

        const timeoutId = setTimeout(() => {
          clearInterval(intervalId);
        }, 5000);

        return () => {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        };
      }
    }
  }, [token, bootstrapped, location.pathname]);

  // Add visibility change listener to track tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only log in development
      if (import.meta.env.MODE === 'development') {
        console.log('Tab visibility changed:', {
          hidden: document.hidden,
          timestamp: new Date().toISOString(),
          token: cookieUtils.getToken() ? 'Token exists' : 'No token'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!bootstrapped) return null;
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 9999 }}
          />
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
