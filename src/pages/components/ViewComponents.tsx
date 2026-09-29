import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Menu,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useFetchAllDrawingNumbers, useProductionSeries, useUnits } from "../../hooks/useMasterData";
import { useHasPermission } from "../../hooks/useHasPermission";
import { useDebounce } from "../../hooks/useDebounce";
import api from "../../services/api";
import { MultiSelectFilter } from "../../components/MultiSelectFilter";
import { CustomPagination } from "../../components/CustomPagination";
import { EmptyState } from "../../components/EmptyState";
import { ExpandedDetailsTable } from "../../components/ui/ExpandedDetailsTable";
import { ComponentTypeChip } from "../../components/ComponentTypeChip";
import PageHeader from "../../components/ui/PageHeader";
import ActionButton from "../../components/ui/ActionButton";
import SearchBar from "../../components/ui/SearchBar";
import { commonTableRowStyle } from "../../components/tableStyles";
import { SortableTableHeader, TableCard } from "../../components/ui";
import ActiveFilterChips, { type FilterChip } from "../../components/ui/ActiveFilterChips";

interface DrawingNumberRow {
  parentDrawingNumbers?: string[];
  id: number;
  drawingNumber?: string | null;
  nomenclature?: string | null;
  componentType?: string | null;
  componentCode?: string | null;
  lnItemCode?: string | null;
  availableFor?: string | null;
  isExpiry: boolean;
  location?: string | null;
  assemblyNumber?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
  isActive?: boolean;
  unitName?: string | null;
  qty?: number;
  productionSeries?: string | null;
}

const DrawingNumberRowComponent = ({
  drawingData,
  index,
  onDelete,
}: {
  drawingData: DrawingNumberRow;
  index: number;
  onDelete: (drawing: DrawingNumberRow) => void;
}) => {
  const [openDetails, setOpenDetails] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const navigate = useNavigate();

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };


  const handleEdit = () => {
    setMenuAnchorEl(null);
    setTimeout(() => {
      navigate(`/assembly/add-components/${drawingData.id}`, {
        state: { editRow: drawingData, fromView: true },
      });
    }, 0);
  };

  const handleDelete = () => {
    handleCloseMenu();
    onDelete(drawingData);
  };

  const handleToggleDetails = () => {
    handleCloseMenu();
    setOpenDetails((prev) => !prev);
  };

  return (
    <>
      <TableRow
        hover
        sx={commonTableRowStyle}
      >
        <TableCell sx={{ textAlign: "center", minWidth: 55 }}>
          {(drawingData as any)._srNo ?? (index + 1)}
        </TableCell>
        <TableCell sx={{ minWidth: 160, whiteSpace: "nowrap" }}>
          {drawingData?.drawingNumber || "N/A"}
        </TableCell>
        <TableCell sx={{ minWidth: 150, whiteSpace: "nowrap" }}>
          {drawingData?.lnItemCode || "N/A"}
        </TableCell>
        <TableCell sx={{ minWidth: 220, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {drawingData?.nomenclature || "N/A"}
        </TableCell>
        <TableCell sx={{ textAlign: "center", minWidth: 95 }}>
          <ComponentTypeChip type={drawingData?.componentType} />
        </TableCell>
        <TableCell sx={{ textAlign: "center", minWidth: 100, whiteSpace: "nowrap" }}>
          {drawingData?.unitName || "N/A"}
        </TableCell>
        <TableCell sx={{ textAlign: "center", minWidth: 110, whiteSpace: "nowrap" }}>
          {drawingData?.productionSeries || drawingData?.availableFor || "N/A"}
        </TableCell>

        <TableCell sx={{ textAlign: "center", minWidth: 75 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.25 }}>
            <IconButton
              size="small"
              onClick={handleOpenMenu}
              sx={{
                color: "text.muted",
                p: 0.5,
                "&:hover": { backgroundColor: "grey.100", color: "text.primary" },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={handleToggleDetails}
              sx={{
                color: openDetails ? "primary.main" : "text.muted",
                p: 0.5,
                "&:hover": { backgroundColor: "grey.100", color: "text.primary" },
              }}
              title={openDetails ? "Hide Additional Details" : "Additional Details"}
            >
              {openDetails ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
          </Box>

          <Menu
            anchorEl={menuAnchorEl}
            open={isMenuOpen}
            onClose={handleCloseMenu}
            transitionDuration={0}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 140, borderRadius: "8px", py: 0.5 },
            }}
          >
            <MenuItem onClick={handleEdit} sx={{ py: 0.75, px: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <EditIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Edit" primaryTypographyProps={{ fontSize: "0.8rem", fontWeight: 500 }} />
            </MenuItem>

            <MenuItem onClick={handleDelete} sx={{ py: 0.75, px: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Delete" primaryTypographyProps={{ fontSize: "0.8rem", fontWeight: 500, color: "error.main" }} />
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      <TableRow sx={{ height: 'auto' }}>
        <TableCell style={{ padding: 0 }} colSpan={8}>
          <Collapse in={openDetails} timeout="auto" unmountOnExit>
            <ExpandedDetailsTable
              columns={[
                { key: "assemblyNumber", label: "Assembly Number", render: (r) => r.parentDrawingNumbers?.join(", ") || r.assemblyNumber || "N/A" },
                { key: "componentCode", label: "Component Code", render: (r) => r.componentCode || "N/A" },
                { key: "location", label: "Rack Location", render: (r) => r.location || "N/A" },
                { key: "isExpiry", label: "Has Expiry", render: (r) => r.isExpiry ? "Yes" : "No" },
                { key: "createdDate", label: "Created Date", render: (r) => formatDate(r.createdDate) },
                { key: "modifiedDate", label: "Updated On", render: (r) => formatDate(r.modifiedDate || r.createdDate) },
              ]}
              rows={drawingData ? [drawingData] : []}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const ComponentTypesList = ["ID", "BATCH", "FIM", "SI"];

const Components: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const navigate = useNavigate();
  const hasAddComponentAccess = useHasPermission("Components");

  // ─── Persist filter state across navigation ───────────────────────────────
  // Key scoped to this page so other pages are not affected.
  const FILTER_STORAGE_KEY = "viewComponents_filters";

  // Initialise state from sessionStorage if available so filters survive
  // navigating to the edit page and coming back.
  const getInitialFilters = () => {
    try {
      const saved = sessionStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return null;
  };

  const savedFilters = useRef(getInitialFilters());

  // Filter state – restored from sessionStorage on first render
  const [searchQuery, setSearchQuery] = useState(savedFilters.current?.searchQuery ?? "");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const [selectedSeries, setSelectedSeries] = useState<string[]>(savedFilters.current?.selectedSeries ?? []);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(savedFilters.current?.selectedTypes ?? []);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(savedFilters.current?.selectedUnits ?? []);

  // Pagination & sorting state – also restored
  const [page, setPage] = useState(savedFilters.current?.page ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(savedFilters.current?.rowsPerPage ?? 10);
  const [sortColumn, setSortColumn] = useState<string>(savedFilters.current?.sortColumn ?? "modifiedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(savedFilters.current?.sortOrder ?? "desc");

  // Persist to sessionStorage whenever any filter changes
  useEffect(() => {
    try {
      sessionStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify({ searchQuery, selectedSeries, selectedTypes, selectedUnits, page, rowsPerPage, sortColumn, sortOrder })
      );
    } catch {
      /* ignore */
    }
  }, [searchQuery, selectedSeries, selectedTypes, selectedUnits, page, rowsPerPage, sortColumn, sortOrder]);
  // ──────────────────────────────────────────────────────────────────────────

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortOrder("asc");
    }
  };

  // Reset page when search query or filter states change (skip initial mount to preserve restored page)
  const isFirstRender = useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(0);
  }, [debouncedSearchQuery, selectedSeries, selectedTypes, selectedUnits]);

  // Pass debouncedSearchQuery, pageNumber (page + 1), pageSize (rowsPerPage), componentType, prodSeries, and unit filters directly to FetchAllDrawingNumbers API
  // Memoize to keep queryKey stable and avoid unnecessary re-fetches
  const componentTypeFilter = useMemo(
    () => (selectedTypes.length > 0 ? selectedTypes.join(",") : ""),
    [selectedTypes]
  );
  const {
    data: drawingNumbersData = [],
    isLoading,
    error,
    refetch,
  } = useFetchAllDrawingNumbers(
    debouncedSearchQuery,
    page + 1,
    rowsPerPage,
    componentTypeFilter,
    selectedSeries,
    selectedUnits
  );

  const { data: seriesList = [] } = useProductionSeries();
  const { data: unitsList = [] } = useUnits();

  const prodSeriesOptions = useMemo(
    () => seriesList.map((s: any) => s.productionSeries).filter(Boolean),
    [seriesList]
  );
  const unitOptions = useMemo(
    () => unitsList.map((u: any) => u.unitName).filter(Boolean),
    [unitsList]
  );

  // NOTE: No manual refetch on mount — React Query automatically re-fetches
  // when the cache is stale (staleTime: 5 min). Calling refetch() here would
  // bypass the cache and fire a network request on every navigation back.

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [deletingDrawing, setDeletingDrawing] = useState<DrawingNumberRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDeleteClick = (drawing: DrawingNumberRow) => {
    setDeletingDrawing(drawing);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDrawing) return;
    setIsDeleting(true);
    try {
      await api.post("/api/Common/DeleteDrawingNumber", {
        drawingNumber: deletingDrawing.drawingNumber || "",
        lnItemCode: deletingDrawing.lnItemCode || "",
      });
      setSnackbar({
        open: true,
        message: "Component deleted successfully",
        severity: "success",
      });
      setOpenDeleteDialog(false);
      setDeletingDrawing(null);
      refetch();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete component",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(0);
    refetch();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSeries([]);
    setSelectedTypes([]);
    setSelectedUnits([]);
    setPage(0);
  };

  const isDropdownFilterSelected = selectedSeries.length > 0 || selectedTypes.length > 0 || selectedUnits.length > 0;

  // Sort and pagination functionality
  const { displayData, totalCount } = useMemo(() => {
    let rawList: DrawingNumberRow[] = Array.isArray(drawingNumbersData)
      ? drawingNumbersData
      : (drawingNumbersData as any)?.data || [];

    const serverTotalRecords = (drawingNumbersData as any)?.totalRecords ?? (drawingNumbersData as any)?.totalCount;

    let result = rawList.map((item: any, idx: number) => ({
      ...item,
      _srNo: idx + 1,
    }));

    // Sorting functionality
    result.sort((a: any, b: any) => {
      let aVal: any = "";
      let bVal: any = "";
      if (sortColumn === "srNo" || sortColumn === "sr") {
        aVal = a._srNo ?? 0;
        bVal = b._srNo ?? 0;
      } else if (sortColumn === "modifiedDate") {
        aVal = new Date(a.modifiedDate || a.createdDate || 0).getTime();
        bVal = new Date(b.modifiedDate || b.createdDate || 0).getTime();
      } else {
        aVal = a[sortColumn] ?? "";
        bVal = b[sortColumn] ?? "";
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const isServerPaginated = serverTotalRecords !== undefined || (rawList.length <= rowsPerPage && rawList.length > 0);
    const finalDisplayData = isServerPaginated ? result : result.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const finalTotalCount = serverTotalRecords !== undefined ? serverTotalRecords : result.length;

    return { displayData: finalDisplayData, totalCount: finalTotalCount };
  }, [drawingNumbersData, sortColumn, sortOrder, page, rowsPerPage]);


  React.useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Failed to fetch components",
        severity: "error",
      });
    }
  }, [error]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedSeries.length > 0 || selectedTypes.length > 0 || selectedUnits.length > 0
  );

  const activeChips: FilterChip[] = useMemo(() => {
    const chips: FilterChip[] = [];
    if (searchQuery.trim()) {
      chips.push({
        id: "search",
        label: `Search: "${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(""),
      });
    }
    selectedSeries.forEach((s) => {
      chips.push({
        id: `series-${s}`,
        label: `Series: ${s}`,
        onRemove: () => {
          setSelectedSeries((prev) => prev.filter((x) => x !== s));
          setPage(0);
        },
      });
    });
    selectedTypes.forEach((t) => {
      chips.push({
        id: `type-${t}`,
        label: `Type: ${t}`,
        onRemove: () => {
          setSelectedTypes((prev) => prev.filter((x) => x !== t));
          setPage(0);
        },
      });
    });
    selectedUnits.forEach((u) => {
      chips.push({
        id: `unit-${u}`,
        label: `Unit: ${u}`,
        onRemove: () => {
          setSelectedUnits((prev) => prev.filter((x) => x !== u));
          setPage(0);
        },
      });
    });
    return chips;
  }, [searchQuery, selectedSeries, selectedTypes, selectedUnits]);

  return (
    <Box sx={{ py: hideHeader ? 0 : { xs: 1, sm: 1.25 }, px: hideHeader ? 0 : { xs: 1.5, sm: 2 } }}>
      {!hideHeader && (
        <PageHeader
          title="Components"
          subtitle="View, search, and manage component master entries and assembly mappings."
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip
                title={!hasAddComponentAccess ? "You do not have access to add component page" : ""}
                arrow
              >
                <span>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!hasAddComponentAccess}
                    onClick={() => navigate("/assembly/add-components", { state: { fromView: true } })}
                    startIcon={<AddIcon fontSize="small" />}
                    sx={{
                      height: 34,
                      borderRadius: "6px",
                      backgroundColor: "primary.main",
                      color: "#ffffff",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                      "&:hover": { backgroundColor: "primary.dark" },
                      "&.Mui-disabled": {
                        backgroundColor: "#EAECF0",
                        color: "#98A2B3",
                      },
                    }}
                  >
                    Add Component
                  </Button>
                </span>
              </Tooltip>
            </Box>
          }
        />
      )}

      {/* Main Filter & Table Single Container TableCard */}
      <TableCard sx={{ mb: 2 }}>
        {/* Section 1: Filter Bar & Active Chips */}
        <Box sx={{ p: 1.5, pb: 1, borderBottom: "1px solid #EAECF0" }}>
          {/* Horizontal Filter Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "nowrap",
              width: "100%",
              overflowX: "auto",
              py: 0.5,
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "#D0D5DD", borderRadius: 3 },
            }}
          >
            {/* Search Box */}
            <SearchBar
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              onClear={() => {
                setSearchQuery("");
                setPage(0);
              }}
              placeholder="Search component, Part Number, Item Code, Item Description..."
              sx={{
                flex: "1 1 240px",
                minWidth: 200,
              }}
            />

            {/* Multi-Select Prod. Series Dropdown */}
            <MultiSelectFilter
              label="Prod. Series"
              value={selectedSeries}
              options={prodSeriesOptions}
              onChange={(val) => {
                setSelectedSeries(val);
                setPage(0);
              }}
              flex="0 0 140px"
              minWidth={120}
            />

            {/* Multi-Select Type Dropdown */}
            <MultiSelectFilter
              label="Type"
              value={selectedTypes}
              options={ComponentTypesList}
              onChange={(val) => {
                setSelectedTypes(val);
                setPage(0);
              }}
              flex="0 0 120px"
              minWidth={100}
            />

            {/* Multi-Select Unit Dropdown */}
            <MultiSelectFilter
              label="Unit"
              value={selectedUnits}
              options={unitOptions}
              onChange={(val) => {
                setSelectedUnits(val);
                setPage(0);
              }}
              flex="0 0 120px"
              minWidth={100}
            />

            {/* Apply Button */}
            <ActionButton
              variant="primary"
              size="standard"
              onClick={handleApplyFilters}
              disabled={!isDropdownFilterSelected || isLoading}
            >
              Apply
            </ActionButton>

            {/* Clear Button */}
            <ActionButton
              variant="secondary"
              size="standard"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              Clear
            </ActionButton>
          </Box>

          {/* Active Filter Chips & Counter Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
              pt: 0.75,
              borderTop: "1px solid #F2F4F7",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <ActiveFilterChips chips={activeChips} onClearAll={handleClearFilters} />

            <Typography variant="body2" sx={{ color: "#667085", fontSize: "0.85rem", fontWeight: 500, ml: "auto" }}>
              {totalCount.toLocaleString()} {totalCount === 1 ? "result" : "results"}
            </Typography>
          </Box>
        </Box>

        {/* Section 2: Table */}
        <TableContainer
          sx={{
            overflowX: "auto",
            minHeight: 350,
            maxHeight: "calc(100vh - 290px)",
          }}
        >
          <Table stickyHeader size="small" sx={{ width: "100%", minWidth: 1100 }}>
            <TableHead>
              <TableRow sx={{ height: 36 }}>
                <SortableTableHeader label="Sr.No" columnKey="srNo" sortColumn={sortColumn} sortDirection={sortOrder} onSort={handleSort} align="center" minWidth={55} isSortable={true} />
                <SortableTableHeader label="Part Number" columnKey="drawingNumber" sortColumn={sortColumn} sortDirection={sortOrder} onSort={handleSort} minWidth={160} />
                <SortableTableHeader label="Item Code" columnKey="lnItemCode" sortColumn={sortColumn} sortDirection={sortOrder} onSort={handleSort} minWidth={150} />
                <SortableTableHeader label="Item Description" columnKey="nomenclature" minWidth={220} isSortable={false} />
                <SortableTableHeader label="Type" columnKey="componentType" align="center" minWidth={95} isSortable={false} />
                <SortableTableHeader label="Unit" columnKey="unitName" align="center" minWidth={100} isSortable={false} />
                <SortableTableHeader label="Prod. Series" columnKey="productionSeries" align="center" minWidth={110} isSortable={false} />
                <SortableTableHeader label="Actions" columnKey="actions" align="center" minWidth={65} isSortable={false} />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ height: 280, borderBottom: "none" }}>
                    <CircularProgress size={32} color="primary" />
                    <Typography variant="body2" sx={{ color: "#667085", mt: 1 }}>
                      Loading components...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : displayData.length === 0 ? (
                <EmptyState colSpan={8} />
              ) : (
                displayData.map((drawing, index) => (
                  <DrawingNumberRowComponent
                    key={drawing.id}
                    drawingData={drawing}
                    index={page * rowsPerPage + index}
                    onDelete={handleDeleteClick}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Section 3: Footer Pagination */}
        <CustomPagination
          page={page}
          pageSize={rowsPerPage}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setRowsPerPage(newSize);
            setPage(0);
          }}
        />

      </TableCard>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => !isDeleting && setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: "#101828", fontSize: "1rem" }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#475467" }}>
            Are you sure you want to delete component with Part Number{" "}
            <strong>{deletingDrawing?.drawingNumber || "N/A"}</strong> and Item Code{" "}
            <strong>{deletingDrawing?.lnItemCode || "N/A"}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={isDeleting} size="small" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            size="small"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ textTransform: "none", borderRadius: "6px" }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === "error" ? null : 5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Components;
