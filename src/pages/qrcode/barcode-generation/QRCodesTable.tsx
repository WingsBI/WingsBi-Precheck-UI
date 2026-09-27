import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem as MuiMenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import {
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  GetApp as GetAppIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  CallSplit as CallSplitIcon,
} from "@mui/icons-material";
import { CustomPagination } from "../../../components/CustomPagination";
import SortableTableHeader from "../../../components/ui/SortableTableHeader";
import { TableCard, TableCardHeader } from "../../../components/ui/TableCard";

interface QRCodesTableProps {
  displayedQRCodes: any[];
  selectedBarcodes: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectBarcode: (id: string, checked: boolean) => void;
  onDownload: () => void;
  onOpenBulkUpdateDialog: () => void;
  onSplit: (globalIndex: number) => void;
  onSplitAll: () => void;
  hasAnySplit: boolean;
  canSplitAny: boolean;
  showBatchIdColumn: boolean;
  componentType: string;
  isDownloading: boolean;
  onOpenSingleExportDialog: (qrCodeId: string, batchId?: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newSize: number) => void;
}

const QRCodesTable = ({
  displayedQRCodes,
  selectedBarcodes,
  onSelectAll,
  onSelectBarcode,
  onDownload,
  onOpenBulkUpdateDialog,
  onSplit,
  onSplitAll,
  hasAnySplit,
  canSplitAny,
  showBatchIdColumn,
  componentType,
  isDownloading,
  onOpenSingleExportDialog,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: QRCodesTableProps) => {
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [actionMenuItem, setActionMenuItem] = useState<any | null>(null);
  const [actionMenuIndex, setActionMenuIndex] = useState<number | null>(null);

  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedQRCodes = React.useMemo(() => {
    if (!sortColumn) return displayedQRCodes;
    return [...displayedQRCodes].sort((a: any, b: any) => {
      let valA = a[sortColumn] ?? "";
      let valB = b[sortColumn] ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [displayedQRCodes, sortColumn, sortDirection]);

  const handleActionMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    item: any,
    globalIndex: number
  ) => {
    setActionMenuAnchorEl(event.currentTarget);
    setActionMenuItem(item);
    setActionMenuIndex(globalIndex);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setActionMenuItem(null);
    setActionMenuIndex(null);
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <TableCard sx={{ mt: 2 }}>
      <TableCardHeader
        title="Generated QR Codes"
        count={displayedQRCodes.length > 0 ? displayedQRCodes.length : undefined}
        actions={
          <>
            {canSplitAny && (
              <Button
                variant="outlined"
                color={hasAnySplit ? "error" : "secondary"}
                size="small"
                onClick={onSplitAll}
                disabled={displayedQRCodes.length === 0}
                sx={{ mr: 1 }}
              >
                {hasAnySplit ? "Close All" : "Split All"}
              </Button>
            )}

            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={onDownload}
              disabled={selectedBarcodes.length === 0 || isDownloading}
            >
              Export Selected ({selectedBarcodes.length})
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<EditIcon />}
              onClick={onOpenBulkUpdateDialog}
              disabled={selectedBarcodes.length === 0}
            >
              Bulk Edit ({selectedBarcodes.length})
            </Button>
          </>
        }
      />

      <TableContainer>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ height: 40 }}>
                <TableCell
                  padding="checkbox"
                  sx={{ fontWeight: 700, backgroundColor: "#F9FAFB !important", color: "#475467", fontSize: "0.8rem", borderBottom: "1px solid #EAECF0", py: 0.75, px: 1.25 }}
                >
                  <Checkbox
                    checked={
                      selectedBarcodes.length === displayedQRCodes.length &&
                      displayedQRCodes.length > 0
                    }
                    indeterminate={
                      selectedBarcodes.length > 0 &&
                      selectedBarcodes.length < displayedQRCodes.length
                    }
                    onChange={(e) => onSelectAll(e.target.checked)}
                    size="small"
                  />
                </TableCell>
                <SortableTableHeader label="Sr. No" isSortable={false} />
                <SortableTableHeader
                  label="QR Code"
                  columnKey="qrCodeNumber"
                  activeSortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  isSortable={true}
                />
                <SortableTableHeader
                  label="ID Number"
                  columnKey="idNumber"
                  activeSortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  isSortable={true}
                />
                {showBatchIdColumn && (
                  <SortableTableHeader
                    label="Batch ID"
                    columnKey="batchId"
                    activeSortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    isSortable={true}
                  />
                )}
                <SortableTableHeader
                  label="Status"
                  columnKey="isNewQrCode"
                  activeSortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  isSortable={true}
                />
                <SortableTableHeader label="Actions" align="center" isSortable={false} sx={{ position: "sticky", right: 0, zIndex: 3 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedQRCodes
                .slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
                .map((item, index) => (
                  <TableRow
                    key={
                      item.id || item.qrCodeNumber || item.serialNumber
                    }
                    hover
                    sx={{
                      height: 36,
                      backgroundColor: item.isSplitRow ? "#f5f5f5" : "inherit",
                      "& td": { borderBottom: "1px solid #F2F4F7", fontSize: "0.775rem", color: "#344054", py: 0.5, px: 1.25 },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedBarcodes.includes(
                          item.id || item.qrCodeNumber || item.serialNumber
                        )}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelectBarcode(
                            item.id || item.qrCodeNumber || item.serialNumber,
                            e.target.checked
                          );
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontSize: "0.775rem", fontWeight: 600, color: "#101828" }}
                      >
                        {item.qrCodeNumber || item.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.idNumber || "-"}</TableCell>
                    {showBatchIdColumn && (
                      <TableCell>{item.batchId || "N/A"}</TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={item.isNewQrCode ? "New" : "Existing"}
                        color={item.isNewQrCode ? "success" : "default"}
                        size="small"
                        sx={{ height: 22, fontSize: "0.75rem" }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ position: "sticky", right: 0, backgroundColor: item.isSplitRow ? "#f5f5f5" : "#ffffff", zIndex: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) =>
                          handleActionMenuOpen(
                            e,
                            item,
                            page * rowsPerPage + index
                          )
                        }
                        sx={{
                          color: "#64748B",
                          "&:hover": { color: "#6D2A8F", backgroundColor: "rgba(109, 42, 143, 0.08)" },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
          anchorEl={actionMenuAnchorEl}
          open={Boolean(actionMenuAnchorEl)}
          onClose={handleActionMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              minWidth: 140,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              borderRadius: "8px",
              py: 0.5,
            },
          }}
        >
          <MuiMenuItem
            onClick={() => {
              if (actionMenuItem) {
                copyToClipboard(
                  actionMenuItem.qrCodeNumber || actionMenuItem.serialNumber
                );
              }
              handleActionMenuClose();
            }}
            sx={{ fontSize: "0.85rem", py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "#6D2A8F" }}>
              <CopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Copy" primaryTypographyProps={{ fontSize: "0.85rem" }} />
          </MuiMenuItem>

          <MuiMenuItem
            onClick={() => {
              if (actionMenuItem) {
                onOpenSingleExportDialog(
                  actionMenuItem.qrCodeNumber || actionMenuItem.serialNumber,
                  actionMenuItem.batchId
                );
              }
              handleActionMenuClose();
            }}
            sx={{ fontSize: "0.85rem", py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "#6D2A8F" }}>
              <GetAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Download" primaryTypographyProps={{ fontSize: "0.85rem" }} />
          </MuiMenuItem>

          {actionMenuItem &&
            (componentType === "BATCH" || componentType === "Batch") &&
            canSplitAny &&
            (Number(actionMenuItem.quantity) > 1 || actionMenuItem.hasBeenSplit) &&
            !actionMenuItem.isSplitRow && (
              <MuiMenuItem
                onClick={() => {
                  if (actionMenuIndex !== null) {
                    onSplit(actionMenuIndex);
                  }
                  handleActionMenuClose();
                }}
                sx={{
                  fontSize: "0.85rem",
                  py: 1,
                  color: actionMenuItem.hasBeenSplit ? "error.main" : "secondary.main",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: actionMenuItem.hasBeenSplit ? "error.main" : "secondary.main",
                  }}
                >
                  <CallSplitIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={actionMenuItem.hasBeenSplit ? "Close Split" : "Split"}
                  primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }}
                />
              </MuiMenuItem>
            )}
        </Menu>

        <CustomPagination
          page={page}
          pageSize={rowsPerPage}
          totalCount={displayedQRCodes.length}
          pageSizeOptions={[5, 10, 25, 50]}
          onPageChange={(newPage) => onPageChange(newPage)}
          onPageSizeChange={(newSize) => {
            onRowsPerPageChange(newSize);
          }}
        />

    </TableCard>
  );
};

export default React.memo(QRCodesTable);
