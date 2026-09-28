/**
 * Shared UI Component Library — Barrel Export
 *
 * Import any shared component from a single path:
 *   import { PageHeader, ActionButton, FormTextField } from '../../components/ui';
 */

// Layout
export { default as PageContainer } from './PageContainer';
export { default as PageHeader, toTitleCase, toSentenceCase } from './PageHeader';

// Buttons
export { default as ActionButton } from './ActionButton';


// Tables
export { TableCard, TableCardHeader } from './TableCard';
export { default as TableCardDefault } from './TableCard';
export { SortableTableHeader } from './SortableTableHeader';
export type { SortableTableHeaderProps } from './SortableTableHeader';
export { ExpandedDetailsTable } from './ExpandedDetailsTable';
export type { ExpandedTableColumn, ExpandedDetailsTableProps } from './ExpandedDetailsTable';

// Search & Filters
export { default as SearchBar } from './SearchBar';
export { default as ActiveFilterChips } from './ActiveFilterChips';
export type { FilterChip } from './ActiveFilterChips';

// Dialogs
export { default as ConfirmationDialog } from './ConfirmationDialog';

// Toasts
export { default as ToastSnackbar } from './ToastSnackbar';

// Tabs
export { StyledTabs, StyledTab } from './StyledTabs';
export { default as StyledTabsDefault } from './StyledTabs';
