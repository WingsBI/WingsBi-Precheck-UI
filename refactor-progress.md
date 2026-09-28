# Table Tokenization & Restyling Refactor Progress

## 1. Centralized Token System
- Defined `TABLE_TOKENS` and `STATUS_ROW_TOKENS` at the top of `src/components/tableStyles.ts`.
- Exported `DATAGRID_DEFAULT_PROPS = { rowHeight: TABLE_TOKENS.rowHeight, columnHeaderHeight: TABLE_TOKENS.headerHeightNum }`.
- Unified Header bg (`#F9FAFB`), color (`#475467`), height (`40px`), weight (`700`).
- Unified Body text (`#1F2937`), font size (`0.775rem`), row height (`32px`), borders (`#E5E7EB`).
- Status row highlight tokens (`statusRowRejected: #FDE8E8`, `statusRowUpdated: #FFF7ED`, `statusRowShort: #FFFBEB`).

## 2. Shared Sub-table Component
- Created `ExpandedDetailsTable.tsx` in `src/components/ui/ExpandedDetailsTable.tsx`.
- Exported `ExpandedDetailsTable` from `src/components/ui/index.ts`.
- Uses `commonExpandedRowStyle`, `commonTableHeaderStyle`, and `commonTableRowStyle`.
- Replaced inline sub-table in `ViewBarcode.tsx`.

## 3. DataGrid Restyling (Preserved DataGrid Engine)
1. **`UserManagement.tsx` (`~L760`)**: Applied `{...DATAGRID_DEFAULT_PROPS}`, removed hardcoded `rowHeight={42}` & `columnHeaderHeight={40}`, styled exclusively via `adminDataGridSx`.
2. **`RoleManagement.tsx` (`~L390` & `~L661`)**: Applied `{...DATAGRID_DEFAULT_PROPS}` on both DataGrids, removed hardcoded heights, styled via `adminDataGridSx`.
3. **`AddComponents.tsx` (`~L183`)**: Wrapped DataGrid in `<TableCard>`, applied `{...DATAGRID_DEFAULT_PROPS}`, removed hardcoded heights, styled via `adminDataGridSx`.
4. **`ProductionOrderUpload.tsx` (`~L1970` & `~L2332`)**: Applied `{...DATAGRID_DEFAULT_PROPS}` on both DataGrids, removed hardcoded `rowHeight={32}`, preserved `hideFooter`, removed column font/color overrides.
5. **`DataGridPreview.tsx` (`~L108`)**: Applied `{...DATAGRID_DEFAULT_PROPS}`, removed hardcoded `rowHeight={34}`, `columnHeaderHeight={40}`, and `density="compact"`.

## 4. Completed Native & Tree Table Restyling
1. **`ViewOrder.tsx`**: Updated both BOM tab table (`~L376`) and Orders tab table (`~L757`) to read row styles exclusively from `commonTableRowStyle`.
2. **`QRCodesTable.tsx`**: Updated header row and body rows (`~L171`) to use `commonTableHeaderStyle`, `commonTableCellCompactCheckbox`, and `commonTableRowStyle`.
3. **`ExistingQRCodesDialog.tsx`**: Updated dialog table (`~L46`) to use `commonTableHeaderStyle` and `commonTableRowStyle`.
4. **`ComponentTypeStep.tsx`**: Restyled matrix table (`~L521`) using `commonTableHeaderStyle` and `commonTableRowStyle` while maintaining `maxHeight: 295px` container layout.
5. **`ViewSOP.tsx` & `TreeTable.tsx`**: Removed hardcoded `rowHeight={42}`, applied `TABLE_TOKENS.rowHeight` (`32px`), and aligned header/body cells with central table tokens.
6. **`ViewPrecheck.tsx`**: Replaced inline status row highlight HEX colors with `STATUS_ROW_TOKENS`. Replaced handwritten expanded row sub-table with `ExpandedDetailsTable`.
7. **`StoreIn.tsx`, `StoredInComponents.tsx`, `ViewComponents.tsx`**: Replaced all handwritten expanded row sub-tables with `ExpandedDetailsTable`.
8. **`MaterialRequisition.tsx`**: Applied `commonTableRowStyle` and `commonTableCellCompactCheckbox` to header and row checkbox cells.

## 5. Universal Table Parity & Compact Element Standardization
- **`commonTableCellCompactCheckbox`**: Configured to `py: 0`, `px: 0.5`, height `32px` with `& .MuiCheckbox-root` at `p: 0.5`, height `28px`, width `28px`. Renders a 20px icon in a 28px box within the 32px row.
- **Action IconButtons**: Applied `sx={{ p: 0.25 }}` (2px padding) to row `<IconButton size="small">` with `<MoreVertIcon fontSize="small" />` in `ViewBarcode.tsx` and `ViewIRMSN.tsx`. Overrides `theme.ts` root `MuiIconButton` default padding of `8px` (up to `16px` on wider screens) to prevent row height expansion beyond 32px.
- **Computed Parity Proof**:
  - Row Height: `32px`
  - Body Cell Font Size: `0.775rem` (12.4px)
  - Body Cell Padding: `py: 0.15` (1.2px) / `px: 0.75` (6px)
  - Body Cell Color: `#1F2937`
  - Bottom Border Color: `#E5E7EB`
