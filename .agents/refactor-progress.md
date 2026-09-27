# UI Component & Design System Refactor Progress

This file tracks the refactoring status of every page in `WingsBi-Precheck-UI` against `component-architecture.md` and `design-tokens.md`.

## Progress Table

| Page | Status | Last Checked Date |
|---|---|---|
| `src/pages/auth/Login.tsx` | In Progress | 2026-09-27 |
| `src/pages/auth/Register.tsx` | In Progress | 2026-09-27 |
| `src/pages/auth/ForgetPassword.tsx` | In Progress | 2026-09-27 |
| `src/pages/Dashboard.tsx` | In Progress | 2026-09-27 |
| `src/pages/precheck/MakePrecheck.tsx` | TableCard, ActiveFilterChips, ToastSnackbar & ConfirmationDialog Refactored | 2026-09-27 |
| `src/pages/precheck/ViewPrecheck.tsx` | TableCard, ActiveFilterChips, ToastSnackbar, ActionButton, ConfirmationDialog & SearchBar Refactored | 2026-09-27 |
| `src/pages/precheck/StoreIn.tsx` | TableCard, ActiveFilterChips, ToastSnackbar, ActionButton, ConfirmationDialog, SortableTableHeader & SearchBar Refactored | 2026-09-27 |
| `src/pages/precheck/StoredInComponents.tsx` | TableCard, ActiveFilterChips, ToastSnackbar & ActionButton Refactored | 2026-09-27 |
| `src/pages/precheck/AvailableInStore.tsx` | TableCard, ActiveFilterChips, ToastSnackbar, ActionButton & SearchBar Refactored | 2026-09-27 |
| `src/pages/precheck/ViewConsumedIn.tsx` | N/A (Stub) | 2026-09-27 |
| `src/pages/materialrequisition/MaterialRequisition.tsx` | TableCard, ActionButton, ConfirmationDialog & SortableTableHeader Refactored | 2026-09-27 |
| `src/pages/irmsn/ViewIRMSN.tsx` | TableCard, ActiveFilterChips, ToastSnackbar, ActionButton, ConfirmationDialog & SearchBar Refactored | 2026-09-27 |
| `src/pages/irmsn/GenerateIRMSN.tsx` | ToastSnackbar, ActionButton, ConfirmationDialog & PageHeader Refactored | 2026-09-27 |
| `src/pages/irmsn/EditIRMSN.tsx` | ToastSnackbar, ActionButton, ConfirmationDialog & PageHeader Refactored | 2026-09-27 |
| `src/pages/qrcode/BarcodeGeneration.tsx` | TableCard, ToastSnackbar, ActionButton, ConfirmationDialog, PageHeader & SortableTableHeader Refactored | 2026-09-27 |
| `src/pages/qrcode/ViewBarcode.tsx` | TableCard, ActiveFilterChips, ToastSnackbar, ConfirmationDialog & SearchBar Refactored | 2026-09-27 |
| `src/pages/qrcode/UpdateBarcode.tsx` | ToastSnackbar & PageHeader Refactored | 2026-09-27 |
| `src/pages/sop/ViewSOP.tsx` | ActiveFilterChips N/A (uses SopFilterCard), ConfirmationDialog Refactored | 2026-09-27 |
| `src/pages/sop/ViewBOM.tsx` | TableCard Verified, PageHeader & SortableTableHeader Refactored | 2026-09-27 |
| `src/pages/components/ViewComponents.tsx` | TableCard, ActiveFilterChips, ActionButton & SearchBar Refactored | 2026-09-27 |
| `src/pages/components/ViewAssembly.tsx` | TableCard Verified | 2026-09-27 |
| `src/pages/settings/Settings.tsx` | In Progress | 2026-09-27 |
| `src/pages/productionorder/ProductionOrderUpload.tsx` | TableCard, ToastSnackbar, ActionButton & ConfirmationDialog Refactored | 2026-09-27 |
| `src/pages/productionorder/ViewOrder.tsx` | TableCard Verified, ActiveFilterChips N/A, SortableTableHeader Refactored | 2026-09-27 |
| `src/pages/productionorder/editproductionorder.tsx` | ToastSnackbar, ActionButton & PageHeader Refactored | 2026-09-27 |
| `src/pages/adminmaster/UserManagement.tsx` | TableCard, ActiveFilterChips, ToastSnackbar, ActionButton & ConfirmationDialog Refactored | 2026-09-27 |
| `src/pages/adminmaster/RoleManagement.tsx` | TableCard, ToastSnackbar, ActiveFilterChips N/A, ActionButton & ConfirmationDialog Refactored | 2026-09-27 |
| `src/pages/adminmaster/UpdateComponents.tsx` | ToastSnackbar, ActionButton & PageHeader Refactored | 2026-09-27 |
| `src/pages/adminmaster/AddComponents.tsx` | ToastSnackbar, ActionButton & PageHeader Refactored | 2026-09-27 |
| `src/pages/scriptexecutor/ScriptExecutor.tsx` | TableCard Verified (DataGridPreview), ActiveFilterChips N/A, ConfirmationDialog Refactored | 2026-09-27 |

## Refactoring Standard Operating Procedure (SOP)
Before declaring any page as **Fixed** or **Verified**:
1. Open and inspect the real code on disk.
2. Present the actual current code of the edited section to the user.
3. Confirm the edit was saved to disk.
4. Update the status column in this tracking file.
