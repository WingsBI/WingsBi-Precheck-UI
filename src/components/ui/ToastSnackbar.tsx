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
      variant="filled"
      sx={{
        width: '100%',
        fontFamily: FONT_FAMILY,
        fontSize: '0.85rem',
        fontWeight: 600,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {message}
    </Alert>
  </Snackbar>
);

export default ToastSnackbar;
