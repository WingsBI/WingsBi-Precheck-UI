import React from "react";
import ConfirmationDialog from "../../../components/ui/ConfirmationDialog";

// ── Batch Warning Dialog ──
interface BatchWarningDialogProps {
  open: boolean;
  onClose: () => void;
}

export const BatchWarningDialog: React.FC<BatchWarningDialogProps> = ({
  open,
  onClose,
}) => {
  return (
    <ConfirmationDialog
      open={open}
      title="Warning"
      message="Previous QR code is not scanned, scan that QR code first"
      confirmLabel="OK"
      confirmVariant="primary"
      onConfirm={onClose}
      onCancel={onClose}
    />
  );
};

// ── Camera Permission Dialog ──
interface CameraPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export const CameraPermissionDialog: React.FC<CameraPermissionDialogProps> = ({
  open,
  onClose,
  onAllow,
}) => {
  return (
    <ConfirmationDialog
      open={open}
      title="Camera Access"
      message="To scan QR codes, we need your permission to access the camera. Would you like to allow access?"
      confirmLabel="Allow"
      cancelLabel="Deny"
      confirmVariant="primary"
      onConfirm={onAllow}
      onCancel={onClose}
    />
  );
};
