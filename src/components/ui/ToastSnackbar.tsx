/**
 * ToastSnackbar — Standardized toast notification
 *
 * Usage:
 *   <ToastSnackbar
 *     open={showToast}
 *     message="Part stored successfully"
 *     severity="success"
 *     onClose={() => setShowToast(false)}
 *   />
 */
import React from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

const FONT_FAMILY = '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

interface ToastSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  /** Auto-hide duration in milliseconds (default 4000) */
  autoHideDuration?: number;
  /** Anchor position */
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  onClose: () => void;
}

const ToastSnackbar: React.FC<ToastSnackbarProps> = ({
  open,
  message,
  severity = 'success',
  autoHideDuration = 4000,
  anchorOrigin = { vertical: 'top', horizontal: 'center' },
  onClose,
}) => (
  <Snackbar
    open={open}
    autoHideDuration={autoHideDuration}
    onClose={onClose}
    anchorOrigin={anchorOrigin}
  >
    <Alert
      onClose={onClose}
      severity={severity}
      variant="standard"
      sx={{
        width: '100%',
        fontFamily: FONT_FAMILY,
        fontSize: '0.85rem',
        fontWeight: 600,
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        border: '1px solid',
        borderColor: () => {
          switch (severity) {
            case 'success':
              return '#bbf7d0';
            case 'error':
              return '#fecaca';
            case 'warning':
              return '#fde68a';
            case 'info':
            default:
              return '#bfdbfe';
          }
        },
        backgroundColor: () => {
          switch (severity) {
            case 'success':
              return '#f0fdf4';
            case 'error':
              return '#fef2f2';
            case 'warning':
              return '#fffbeb';
            case 'info':
            default:
              return '#eff6ff';
          }
        },
        color: () => {
          switch (severity) {
            case 'success':
              return '#15803d';
            case 'error':
              return '#b91c1c';
            case 'warning':
              return '#b45309';
            case 'info':
            default:
              return '#1d4ed8';
          }
        },
        '& .MuiAlert-icon': {
          color: () => {
            switch (severity) {
              case 'success':
                return '#16a34a';
              case 'error':
                return '#dc2626';
              case 'warning':
                return '#d97706';
              case 'info':
              default:
                return '#2563eb';
            }
          },
        },
        '& .MuiAlert-action': {
          color: 'inherit',
        },
      }}
    >
      {message}
    </Alert>
  </Snackbar>
);

export default ToastSnackbar;
