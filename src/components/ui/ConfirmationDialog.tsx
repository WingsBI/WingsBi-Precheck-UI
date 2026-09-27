/**
 * ConfirmationDialog — Standardized confirmation modal
 *
 * Usage:
 *   <ConfirmationDialog
 *     open={showDelete}
 *     title="Delete Part"
 *     message="Are you sure you want to delete this part?"
 *     confirmLabel="Delete"
 *     cancelLabel="No"
 *     severity="danger"
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowDelete(false)}
 *   />
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ActionButton from './ActionButton';

const FONT_FAMILY = '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

type Severity = 'primary' | 'danger' | 'warning' | 'info';

interface ConfirmationDialogProps {
  open: boolean;
  title?: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: Severity;
  confirmVariant?: Severity;
  loading?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const severityToVariant: Record<Severity, 'primary' | 'danger' | 'warning'> = {
  primary: 'primary',
  danger: 'danger',
  warning: 'warning',
  info: 'primary',
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  severity,
  confirmVariant,
  loading,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  const activeSeverity = confirmVariant || severity || 'primary';
  const activeLoading = isLoading ?? loading ?? false;

  return (
  <Dialog
    open={open}
    onClose={onCancel}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: '12px',
        p: 0.5,
      },
    }}
  >
    <DialogTitle
      sx={{
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: '1.05rem',
        color: '#1F2937',
        pb: 0.5,
        pt: 2,
        px: 3,
      }}
    >
      {title}
    </DialogTitle>
    <DialogContent sx={{ px: 3, py: 1 }}>
      {typeof message === 'string' ? (
        <DialogContentText
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: '0.875rem',
            color: '#4B5563',
          }}
        >
          {message}
        </DialogContentText>
      ) : (
        message
      )}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
      <ActionButton
        variant="secondary"
        size="compact"
        onClick={onCancel}
        disabled={activeLoading}
      >
        {cancelLabel}
      </ActionButton>
      <ActionButton
        variant={severityToVariant[activeSeverity]}
        size="compact"
        onClick={onConfirm}
        disabled={activeLoading}
      >
        {confirmLabel}
      </ActionButton>
    </DialogActions>
  </Dialog>
  );
};

export default ConfirmationDialog;
