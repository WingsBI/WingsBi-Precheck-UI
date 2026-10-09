import React from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ActionButton from "../../../components/ui/ActionButton";
import ConfirmationDialog from "../../../components/ui/ConfirmationDialog";
import {
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { TABS, type AssemblyStats } from "../constants/scriptExecutorConstants";

interface ResultDialogProps {
  open: boolean;
  onClose: () => void;
  activeTab: number;
  executionStats: { total: number; success: number; warnings: number; errors: number };
  executionMessage: string;
  executionOutput: string;
  totalNewRecords: number;
  assemblyStats: AssemblyStats;
  onDone: () => void;
  onDownloadErrorReport?: () => void;
}

export const ResultDialog: React.FC<ResultDialogProps> = ({
  open,
  onClose,
  activeTab,
  executionStats,
  executionMessage,
  executionOutput,
  totalNewRecords,
  assemblyStats,
  onDone,
  onDownloadErrorReport,
}) => {
  const dialogSeverity = executionStats.errors > 0 ? (executionStats.success > 0 ? "warning" : "error") : "success";

  const dialogIcon = executionStats.errors > 0 ? (
    executionStats.success > 0 ? (
      <WarningIcon sx={{ color: "#f59e0b", fontSize: 28 }} />
    ) : (
      <WarningIcon sx={{ color: "#ef4444", fontSize: 28 }} />
    )
  ) : (
    <SuccessIcon sx={{ color: "#10b981", fontSize: 28 }} />
  );

  const dialogTitle = executionStats.errors > 0 ? (
    executionStats.success > 0 ? "Execution Completed with Warnings" : "Execution Failed"
  ) : "Execution Completed";

  const dialogAlertMessage = executionMessage || (executionStats.errors > 0 ? (
    executionStats.success > 0
      ? `Script executed with ${executionStats.errors} error(s) and ${executionStats.warnings} warning(s).`
      : `Script execution failed with ${executionStats.errors} error(s).`
  ) : "Script executed successfully.");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={executionOutput ? "md" : "sm"}
      fullWidth={!!executionOutput}
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 1.5,
          width: "100%",
          maxWidth: executionOutput ? "md" : 440,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
        {dialogIcon}
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          {dialogTitle}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        <Alert
          severity={dialogSeverity}
          icon={dialogIcon}
          sx={{ mb: 2, borderRadius: 2, fontWeight: 600, "& .MuiAlert-message": { whiteSpace: "pre-wrap" } }}
        >
          {dialogAlertMessage}
        </Alert>

        {activeTab === TABS.MASTER_DATA ? (
          <Stack spacing={1.5} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2.5, border: "1px solid", borderColor: "neutral.border" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">TOTAL NEW RECORDS</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>{totalNewRecords}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">New parts (child)</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>{assemblyStats.childDrawings}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">New parts (parent)</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>{assemblyStats.parentDrawings}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Updated assembly mappings</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>{assemblyStats.updatedMappings}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Resolved Warnings</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "warning.main" }}>{executionStats.warnings}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Errors / Failed Rows</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: executionStats.errors > 0 ? "error.main" : "text.secondary" }}>{executionStats.errors}</Typography>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={1.5} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2.5, border: "1px solid", borderColor: "neutral.border" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Processed Rows</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{executionStats.total}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Successfully Saved</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>{executionStats.success}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Resolved Warnings</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "warning.main" }}>{executionStats.warnings}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Errors / Failed Rows</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: executionStats.errors > 0 ? "error.main" : "text.secondary" }}>{executionStats.errors}</Typography>
            </Box>
          </Stack>
        )}

        {executionOutput && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
              EXECUTION OUTPUT REPORT
            </Typography>
            <Box
              sx={{
                bgcolor: "grey.900",
                color: "grey.300",
                p: 2,
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "grey.800",
                fontSize: "0.825rem",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                maxHeight: "300px",
                overflowY: "auto",
              }}
              className="scroll-hover"
            >
              {executionOutput}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, display: "flex", justifyContent: "space-between" }}>
        {executionStats.errors > 0 && onDownloadErrorReport ? (
          <ActionButton
            variant="secondary"
            size="compact"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            onClick={onDownloadErrorReport}
          >
            Download Error Report (PDF)
          </ActionButton>
        ) : <Box />}
        <ActionButton
          variant="primary"
          size="compact"
          onClick={onDone}
        >
          Done
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

interface ValidationErrorDialogProps {
  open: boolean;
  onClose: () => void;
  missingFiles: string[];
  onBrowseFiles: () => void;
}

export const ValidationErrorDialog: React.FC<ValidationErrorDialogProps> = ({
  open,
  onClose,
  missingFiles,
  onBrowseFiles,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 1.5,
          width: "100%",
          maxWidth: 420,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
        <WarningIcon sx={{ color: "warning.main", fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Missing Required File
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 1 }}>
        {missingFiles.length > 0 && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            Missing file: <strong>{missingFiles.join(" and ")}</strong>
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
          Both <strong>Master Data Assembly</strong> and <strong>Master Data Parts</strong> files are mandatory to upload.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          Please ensure both files are selected before proceeding with the upload.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <ActionButton
          variant="primary"
          size="compact"
          onClick={() => {
            onClose();
            onBrowseFiles();
          }}
        >
          Okay
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

interface LNValidationErrorDialogProps {
  open: boolean;
  onClose: () => void;
  lnValidationErrors: {
    missingInDrawing: string[];
    missingInAssembly: string[];
    assemblyFileName: string;
    drawingFileName: string;
  } | null;
}

export const LNValidationErrorDialog: React.FC<LNValidationErrorDialogProps> = ({
  open,
  onClose,
  lnValidationErrors,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 1.5,
          width: "100%",
          maxWidth: 500,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
        <WarningIcon sx={{ color: "error.main", fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: "error.main" }}>
          Item Code Mismatch
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 1.5 }}>
        {lnValidationErrors?.missingInDrawing && lnValidationErrors.missingInDrawing.length > 0 && (
          <Box sx={{ mb: (lnValidationErrors?.missingInAssembly?.length ?? 0) > 0 ? 3 : 0 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, lineHeight: 1.6, color: "text.primary" }}>
              The following Item Codes are present in the Master Parts Assembly file ({lnValidationErrors?.assemblyFileName}) but do not exist in the Master Parts file ({lnValidationErrors?.drawingFileName}):
            </Typography>

            <Box sx={{
              maxHeight: 120,
              overflowY: "auto",
              p: 1.5,
              mb: 1.5,
              bgcolor: (theme) => theme.palette.error.main + "0C",
              border: "1px solid",
              borderColor: "error.light",
              borderRadius: 2,
              fontSize: "0.85rem",
              color: "error.main",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all"
            }}>
              {lnValidationErrors.missingInDrawing.join(", ")}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
              Please ensure all Assembly Item Codes and Child Part Item Codes are available in the Master Parts file.
            </Typography>
          </Box>
        )}

        {lnValidationErrors?.missingInAssembly && lnValidationErrors.missingInAssembly.length > 0 && (
          <Box>
            {(lnValidationErrors?.missingInDrawing?.length ?? 0) > 0 && <Divider sx={{ my: 2.5 }} />}
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, lineHeight: 1.6, color: "text.primary" }}>
              The following Item Codes are present in the Master Parts file ({lnValidationErrors?.drawingFileName}) but do not exist in the Master Parts Assembly file ({lnValidationErrors?.assemblyFileName}):
            </Typography>

            <Box sx={{
              maxHeight: 120,
              overflowY: "auto",
              p: 1.5,
              mb: 1.5,
              bgcolor: (theme) => theme.palette.error.main + "0C",
              border: "1px solid",
              borderColor: "error.light",
              borderRadius: 2,
              fontSize: "0.85rem",
              color: "error.main",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all"
            }}>
              {lnValidationErrors.missingInAssembly.join(", ")}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
              Please ensure all Item Codes from the Master Parts file are mapped as either Assembly Item Codes or Child Part Item Codes in the Master Parts Assembly file.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <ActionButton
          variant="primary"
          size="compact"
          onClick={onClose}
        >
          Okay
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

interface ScriptErrorDialogProps {
  open: boolean;
  onClose: () => void;
  scriptErrorDetails: { message: string; output?: string; error?: string } | null;
  errorDialogTab: number;
  onErrorDialogTabChange: (val: number) => void;
  copied?: boolean;
  onCopyLog?: () => void;
  onDownloadErrorReport?: () => void;
}

export const ScriptErrorDialog: React.FC<ScriptErrorDialogProps> = ({
  open,
  onClose,
  scriptErrorDetails,
  errorDialogTab,
  onErrorDialogTabChange,
  onDownloadErrorReport,
}) => {
  const errorMessage = scriptErrorDetails?.message || "Execution encountered an error.";
  const hasDistinctLog = Boolean(
    (scriptErrorDetails?.output && scriptErrorDetails.output.trim() !== errorMessage.trim()) ||
    (scriptErrorDetails?.error && scriptErrorDetails.error.trim() !== errorMessage.trim())
  );

  const displayLog =
    errorDialogTab === 0
      ? (scriptErrorDetails?.output || scriptErrorDetails?.error || "")
      : (scriptErrorDetails?.error || scriptErrorDetails?.output || "");

  const showLogSection = hasDistinctLog && displayLog.trim().length > 0 && displayLog.trim() !== errorMessage.trim();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 0,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "white",
          color: "primary.main",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "neutral.border",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <WarningIcon sx={{ fontSize: 28, color: "warning.main" }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: "primary.main" }}>
              Script Execution Failed
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", opacity: 0.85, fontSize: "0.775rem" }}>
              Execution encountered an error. See details below:
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "primary.main", p: 0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", bgcolor: "grey.50" }}>
        {/* Prominent Red Alert Box */}
        <Box sx={{ px: 3, pt: 2.5, pb: showLogSection ? 1 : 2.5 }}>
          <Alert
            severity="error"
            sx={{
              borderRadius: 2.5,
              fontWeight: 600,
              fontSize: "0.875rem",
              lineHeight: 1.5,
              "& .MuiAlert-message": { whiteSpace: "pre-wrap", wordBreak: "break-word" },
            }}
          >
            {errorMessage}
          </Alert>
        </Box>

        {showLogSection && (
          <>
            {scriptErrorDetails?.output && scriptErrorDetails?.error && (
              <Tabs
                value={errorDialogTab}
                onChange={(_, val) => onErrorDialogTabChange(val)}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "neutral.border",
                  px: 2,
                  bgcolor: "background.paper",
                  "& .MuiTabs-indicator": {
                    backgroundColor: "primary.main",
                    height: 3,
                  },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    color: "text.secondary",
                    "&.Mui-selected": {
                      color: "primary.main",
                    },
                  },
                }}
              >
                <Tab label="Validation Report" value={0} />
                <Tab label="Developer Stacktrace" value={1} />
              </Tabs>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 1.25, bgcolor: "background.paper" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                {errorDialogTab === 0 ? "ERROR LOG & OUTPUT DETAILS" : "DEVELOPER STACKTRACE"}
              </Typography>
            </Box>

            <Box sx={{ px: 3, pb: 2.5, pt: 0 }}>
              <Box
                sx={{
                  bgcolor: "#ffffff",
                  color: "#dc2626",
                  p: 2.5,
                  borderRadius: 2.5,
                  border: "1px solid #fecdd3",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  maxHeight: "350px",
                  overflowY: "auto",
                }}
                className="scroll-hover"
              >
                {displayLog}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "neutral.border", display: "flex", justifyContent: "space-between" }}>
        {onDownloadErrorReport ? (
          <ActionButton
            variant="secondary"
            size="compact"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            onClick={onDownloadErrorReport}
          >
            Download Error Report (PDF)
          </ActionButton>
        ) : <Box />}
        <ActionButton
          variant="primary"
          size="compact"
          onClick={onClose}
        >
          Close
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

interface WrongFileDialogProps {
  open: boolean;
  onClose: () => void;
  expectedTemplate: string;
}

export const WrongFileDialog: React.FC<WrongFileDialogProps> = ({
  open,
  onClose,
  expectedTemplate,
}) => {
  return (
    <ConfirmationDialog
      open={open}
      title="Wrong File Uploaded"
      confirmLabel="Okay"
      confirmVariant="primary"
      onConfirm={onClose}
      onCancel={onClose}
      message={
        <Box>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: "text.primary" }}>
            The uploaded file does not match the selected module template.
          </Typography>

          <Stack spacing={1.5} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2.5, border: "1px solid", borderColor: "neutral.border" }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Expected Template:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "success.main" }}>{expectedTemplate}</Typography>
            </Box>
          </Stack>

          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            Please upload the correct template and try again.
          </Typography>
        </Box>
      }
    />
  );
};
