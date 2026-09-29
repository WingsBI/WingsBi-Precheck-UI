import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";
import { useForm } from "react-hook-form";
import { useHasPermission } from "../../hooks/useHasPermission";
import debounce from "lodash/debounce";
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
  Alert,
  IconButton,
  Button,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import {
  getBomDetails,
  searchAssemblyNumbers,
  clearBomData,
  clearAssemblySearchResults,
  setSelectedAssemblyNumber,
  clearError,
} from "../../store/slices/sopSlice";
import { COLOUR_ROLES, commonTableRowStyle } from "../../components/tableStyles";
import { ComponentTypeChip } from "../../components/ComponentTypeChip";
import { useHierarchicalTable } from "../../hooks/useHierarchicalTable";
import { BomFilterCard } from "./components/BomFilterCard";
import { EmptyState } from "../../components/EmptyState";
import ActionButton from "../../components/ui/ActionButton";
import PageHeader from "../../components/ui/PageHeader";
import SortableTableHeader from "../../components/ui/SortableTableHeader";
import { TableCard, TableCardHeader } from "../../components/ui/TableCard";
import api from "../../services/api";

interface AssemblyOption {
  id: number;
  drawingNumber: string;
  nomenclature: string;
  lnItemCode?: string;
}

export interface ViewBOMProps {
  hideHeader?: boolean;
  onRegisterAddAction?: (actionFn: () => void) => void;
}

const ViewBOM: React.FC<ViewBOMProps> = ({ hideHeader = false, onRegisterAddAction }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const hasEditBomAccess = useHasPermission("Components");

  // Redux state
  const {
    bomData,
    assemblySearchResults,
    isBomLoading,
    isSearchingAssembly,
    error,
    selectedAssemblyNumber,
  } = useSelector((state: RootState) => state.sop);

  const [selectedAssembly, setSelectedAssembly] =
    useState<AssemblyOption | null>(null);
  const [assemblyInputValue, setAssemblyInputValue] = useState("");

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Modal / Dialog States
  // 1. Add Parent Assembly Mapping Dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addParentNumber, setAddParentNumber] = useState("");
  const [addParentLnCode, setAddParentLnCode] = useState("");
  const [selectedChildOption, setSelectedChildOption] = useState<any | null>(null);
  const [childOptions, setChildOptions] = useState<any[]>([]);
  const [isSearchingChild, setIsSearchingChild] = useState(false);
  const [addFindNo, setAddFindNo] = useState("");
  const [addQuantity, setAddQuantity] = useState<number | string>(1);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const handleOpenAddDialog = useCallback(() => {
    const parentDwg =
      selectedAssembly?.drawingNumber ||
      selectedAssemblyNumber ||
      assemblyInputValue ||
      (bomData && bomData.length > 0
        ? bomData[0]?.parentDrawingNumber ||
          bomData[0]?.assemblyNumber ||
          bomData[0]?.childDrawingNumber ||
          ""
        : "");
    const parentLn =
      selectedAssembly?.lnItemCode ||
      (bomData && bomData.length > 0 ? bomData[0]?.lnItemCode || "" : "");

    setAddParentNumber(parentDwg);
    setAddParentLnCode(parentLn);
    setSelectedChildOption(null);
    setChildOptions([]);
    setAddFindNo("");
    setAddQuantity(1);
    setOpenAddDialog(true);
  }, [selectedAssembly, selectedAssemblyNumber, assemblyInputValue, bomData]);

  React.useEffect(() => {
    if (onRegisterAddAction) {
      onRegisterAddAction(handleOpenAddDialog);
    }
  }, [onRegisterAddAction, handleOpenAddDialog]);

  // 2. Edit Part Number Dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [editFindNo, setEditFindNo] = useState("");
  const [editQuantity, setEditQuantity] = useState<number | string>("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // 3. Delete Parent Assembly Mapping Dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteRow, setDeleteRow] = useState<any | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // 4. Action Menu (Three-dot) state
  const [actionMenuAnchor, setActionMenuAnchor] = useState<{
    anchorEl: HTMLElement;
    row: any;
  } | null>(null);

  const handleOpenActionMenu = (e: React.MouseEvent<HTMLElement>, row: any) => {
    e.stopPropagation();
    setActionMenuAnchor({ anchorEl: e.currentTarget, row });
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
  };

  // Hierarchical Table Hook
  const { visibleRows, toggleRow, expandedRowIds, expandAll, collapseAll } = useHierarchicalTable({
    data: bomData || [],
    defaultExpanded: false,
  });

  // Sorting State
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

  const sortedVisibleRows = React.useMemo(() => {
    if (!visibleRows || !sortColumn) return visibleRows;
    return [...visibleRows].sort((a: any, b: any) => {
      let valA = a[sortColumn] ?? "";
      let valB = b[sortColumn] ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [visibleRows, sortColumn, sortDirection]);

  // Form
  const { reset, setValue } = useForm({
    defaultValues: {
      assemblyNumber: "",
    },
  });

  // Refresh BOM table helper
  const refreshBomTable = () => {
    const activeDwg =
      selectedAssembly?.drawingNumber ||
      selectedAssemblyNumber ||
      assemblyInputValue ||
      (bomData && bomData.length > 0
        ? bomData[0]?.parentDrawingNumber ||
        bomData[0]?.assemblyNumber ||
        bomData[0]?.childDrawingNumber ||
        ""
        : "");
    if (activeDwg) {
      dispatch(getBomDetails(activeDwg));
    }
  };

  // Debounced search for child drawing number in Add Dialog
  const debouncedChildSearch = useCallback(
    debounce(async (searchText: string) => {
      if (!searchText || searchText.trim().length < 3) {
        setChildOptions([]);
        return;
      }
      setIsSearchingChild(true);
      try {
        const response = await api.get("/api/Common/GetAllDrawingNumber", {
          params: { ComponentType: "", search: searchText },
        });
        setChildOptions(response.data || []);
      } catch (err) {
        console.error("Failed to search child drawings:", err);
        setChildOptions([]);
      } finally {
        setIsSearchingChild(false);
      }
    }, 300),
    []
  );

  // Restore/auto-search selected drawing number when passed via navigation state
  React.useEffect(() => {
    const passedDwg = location.state?.drawingNumber;
    const passedLn = location.state?.lnItemCode;
    if (passedDwg && typeof passedDwg === "string" && passedDwg.trim()) {
      const dwgTrimmed = passedDwg.trim();
      setAssemblyInputValue(dwgTrimmed);
      setSelectedAssembly((prev) => {
        if (!prev || prev.drawingNumber !== dwgTrimmed) {
          return {
            id: 0,
            drawingNumber: dwgTrimmed,
            nomenclature: "",
            lnItemCode: passedLn || "",
          };
        }
        return prev;
      });
      setValue("assemblyNumber", dwgTrimmed);
      if (!bomData || bomData.length === 0) {
        dispatch(getBomDetails(dwgTrimmed));
      }
    }
  }, [location.state?.drawingNumber, dispatch, setValue]);

  // Clear BOM data on unmount
  React.useEffect(() => {
    return () => {
      dispatch(clearBomData());
      dispatch(clearAssemblySearchResults());
      dispatch(setSelectedAssemblyNumber(null));
    };
  }, [dispatch]);

  // API Call Handlers
  // 1. Add Parent Assembly Mapping
  const handleSaveAddMapping = async () => {
    if (!addParentNumber || !selectedChildOption) return;
    setIsSubmittingAdd(true);
    try {
      const payload = {
        assemblyLnItemCode: addParentLnCode || selectedAssembly?.lnItemCode || "",
        childLnItemCode: selectedChildOption.lnItemCode || "",
        consumedProdSeriesId: "1",
        drawingNumber: selectedChildOption.drawingNumber || "",
        findNo: addFindNo || "1",
        nomenclature: selectedChildOption.nomenclature || "",
        parentDrawingNumber: addParentNumber,
        quantity: Number(addQuantity) || 1,
        unit: selectedChildOption.unitName || selectedChildOption.unit || "PCS",
      };
      await api.post("/api/Common/AddAssemblyDrawingMapping", payload);
      setSnackbar({
        open: true,
        message: "Parent assembly mapping added successfully!",
        severity: "success",
      });
      setOpenAddDialog(false);
      refreshBomTable();
    } catch (err: any) {
      console.error("Failed to add mapping:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to add parent assembly mapping",
        severity: "error",
      });
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // 2. Edit Part Number (Reassign Parent Drawing)
  const handleSaveEditMapping = async () => {
    if (!editRow) return;
    setIsSubmittingEdit(true);
    try {
      const payload = {
        drawingNumberLnItemCode: editRow.lnItemCode || editRow.childLnItemCode || "",
        findNo: editFindNo,
        parentDrawingNumberLnItemCode: editRow.assemblyLnItemCode || editRow.parentLnItemCode || selectedAssembly?.lnItemCode || "",
        quantity: Number(editQuantity) || 0,
      };
      await api.post("/api/Common/ReassignParentDrawing", payload);
      setSnackbar({
        open: true,
        message: "Part number updated successfully!",
        severity: "success",
      });
      setOpenEditDialog(false);
      refreshBomTable();
    } catch (err: any) {
      console.error("Failed to edit part number:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update part number",
        severity: "error",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // 3. Delete Parent Assembly Mapping (Remove Child Drawing)
  const handleConfirmDeleteMapping = async () => {
    if (!deleteRow) return;
    setIsSubmittingDelete(true);
    try {
      const activeParentDwg = deleteRow.parentDrawingNumber || deleteRow.assemblyDrawingNumber || selectedAssembly?.drawingNumber || "";
      const activeParentLn = deleteRow.assemblyLnItemCode || deleteRow.parentLnItemCode || selectedAssembly?.lnItemCode || "";
      const activeChildDwg = deleteRow.childDrawingNumber || deleteRow.drawingNumber || "";
      const activeChildLn = deleteRow.childLnItemCode || deleteRow.lnItemCode || "";

      const payload = {
        assemblyDrawingNumber: activeParentDwg,
        assemblyLnItemCode: activeParentLn,
        childDrawingNumber: activeChildDwg,
        childLnItemCode: activeChildLn,
      };
      await api.post("/api/Common/RemoveChildDrawing", payload);
      setSnackbar({
        open: true,
        message: "Parent assembly mapping deleted successfully!",
        severity: "success",
      });
      setOpenDeleteDialog(false);
      refreshBomTable();
    } catch (err: any) {
      console.error("Failed to delete mapping:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete parent assembly mapping",
        severity: "error",
      });
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Column configuration
  const columns = [
    {
      id: "serialNumber",
      label: "Sr. No.",
      minWidth: 70,
      align: "center" as const,
      format: (_: any, __: any, index: number) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {index + 1}
        </Typography>
      ),
    },
    {
      id: "level",
      label: "Level",
      minWidth: 70,
      align: "center" as const,
      format: (value: any, row: any) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.775rem",
            fontWeight: row.level === 0 ? 600 : row.level === 1 ? 500 : 400,
            color: COLOUR_ROLES.textSecondary,
          }}
        >
          {row.level !== undefined && row.level !== null ? row.level : "0"}
        </Typography>
      ),
    },
    {
      id: "childDrawingNumber",
      label: "Part Number",
      minWidth: 160,
      align: "left" as const,
      format: (value: any, row: any) => {
        const level = row.level || 0;
        const hasChildren = Boolean(row.hasChildren);
        const indent = level * 2.5;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              pl: indent,
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 0.5,
                flexShrink: 0,
              }}
            >
              {hasChildren && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRow(row.id);
                  }}
                  sx={{
                    padding: 0,
                    width: 18,
                    height: 18,
                    color: COLOUR_ROLES.textSecondary,
                    "&:hover": { color: COLOUR_ROLES.textMain },
                  }}
                >
                  {expandedRowIds.has(row.id) ? (
                    <KeyboardArrowDown sx={{ fontSize: 18 }} />
                  ) : (
                    <KeyboardArrowRight sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: level === 0 ? 600 : 500,
                color: COLOUR_ROLES.textSecondary,
                fontSize: "0.775rem",
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "nomenclature",
      label: "Item Description",
      minWidth: 150,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "lnItemCode",
      label: "Item Code",
      minWidth: 120,
      format: (value: any) => (
        <Typography
          variant="body2"
          sx={{ fontSize: "0.775rem", fontWeight: 500, color: COLOUR_ROLES.textSecondary }}
        >
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "componentType",
      label: "Component Type",
      minWidth: 120,
      align: "center" as const,
      format: (value: any) => (
        <ComponentTypeChip type={value || "Standard"} />
      ),
    },
    {
      id: "quantity",
      label: "Qty",
      minWidth: 60,
      align: "center" as const,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: COLOUR_ROLES.textSecondary, fontSize: "0.775rem" }}>
          {value || "0"}
        </Typography>
      ),
    },
    {
      id: "findNo",
      label: "Position No",
      minWidth: 80,
      align: "center" as const,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "parentDrawingNumber",
      label: "Assembly No",
      minWidth: 120,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 70,
      align: "center" as const,
      format: (_: any, row: any) => (
        <IconButton
          size="small"
          onClick={(e) => handleOpenActionMenu(e, row)}
          sx={{
            color: "text.secondary",
            p: 0.5,
            "&:hover": { backgroundColor: "grey.100", color: "text.primary" },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  // Debounced search for assembly numbers
  const debouncedSearch = useCallback(
    debounce((searchText: string) => {
      if (searchText && searchText.length >= 3) {
        dispatch(searchAssemblyNumbers(searchText));
      } else {
        dispatch(clearAssemblySearchResults());
      }
    }, 300),
    [dispatch]
  );

  const handleAssemblyInputChange = (_: any, newInputValue: string) => {
    setAssemblyInputValue(newInputValue);
    debouncedSearch(newInputValue);
  };

  const handleAssemblyChange = (_: any, newValue: AssemblyOption | null) => {
    setSelectedAssembly(newValue);
    if (newValue) {
      setValue("assemblyNumber", newValue.drawingNumber);
      dispatch(setSelectedAssemblyNumber(newValue.drawingNumber));
    } else {
      setValue("assemblyNumber", "");
      dispatch(setSelectedAssemblyNumber(null));
    }
  };

  const handleSearch = () => {
    const assemblyNumber = selectedAssembly?.drawingNumber;
    if (assemblyNumber) {
      dispatch(getBomDetails(assemblyNumber));
    }
  };

  const handleReset = () => {
    reset();
    setSelectedAssembly(null);
    setAssemblyInputValue("");
    dispatch(clearBomData());
    dispatch(clearAssemblySearchResults());
    dispatch(setSelectedAssemblyNumber(null));
    if (location.state?.drawingNumber) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {!hideHeader && (
        <PageHeader
          title="Bill of Materials (BOM)"
          subtitle="View hierarchical breakdown of assembly components"
        />
      )}
      {/* Error Alert */}
      {!hideHeader && error && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: "8px" }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Unified Single TableCard Container */}
      <TableCard sx={{ mb: 2 }}>
        {/* Section 1: Bom Search Filter Card */}
        <BomFilterCard
          selectedAssembly={selectedAssembly}
          handleAssemblyChange={handleAssemblyChange}
          assemblyInputValue={assemblyInputValue}
          handleAssemblyInputChange={handleAssemblyInputChange}
          assemblySearchResults={assemblySearchResults}
          isSearchingAssembly={isSearchingAssembly}
          handleSearch={handleSearch}
          handleReset={handleReset}
          isBomLoading={isBomLoading}
          hasBomData={bomData && bomData.length > 0}
        />

        {/* Section 2: Results Table Header */}
        <TableCardHeader
          title="BOM Details"
          actions={
            bomData && bomData.length > 0 ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  size="small"
                  variant="text"
                  onClick={expandAll}
                  sx={{
                    fontSize: "0.775rem",
                    fontWeight: 600,
                    color: "primary.main",
                    textTransform: "none",
                    p: 0,
                    minWidth: "auto",
                    "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                  }}
                >
                  Expand all
                </Button>
                <Typography variant="caption" sx={{ color: "#D0D5DD" }}>
                  ·
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={collapseAll}
                  sx={{
                    fontSize: "0.775rem",
                    fontWeight: 600,
                    color: "#667085",
                    textTransform: "none",
                    p: 0,
                    minWidth: "auto",
                    "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                  }}
                >
                  Collapse
                </Button>
              </Stack>
            ) : undefined
          }
        />

        <Box sx={{ position: "relative" }}>
          <TableContainer
            className="scroll-hover"
            sx={{
              maxHeight: "calc(100vh - 280px)",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((column) => {
                    const isSortableCol = column.id === "childDrawingNumber" || column.id === "lnItemCode";
                    const isPartNoCol = column.id === "childDrawingNumber";
                    return (
                      <SortableTableHeader
                        key={column.id}
                        label={column.label}
                        columnKey={column.id}
                        activeSortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        align={column.align || "left"}
                        minWidth={column.minWidth}
                        isSortable={isSortableCol}
                        sx={isPartNoCol ? { pl: "32px !important" } : undefined}
                      />
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {isBomLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ height: 280, borderBottom: "none" }}>
                      <CircularProgress color="primary" />
                    </TableCell>
                  </TableRow>
                ) : sortedVisibleRows && sortedVisibleRows.length > 0 ? (
                  sortedVisibleRows.map((item: any, index: number) => (
                    <TableRow
                      key={`${item.childDrawingId}-${index}`}
                      hover
                      sx={commonTableRowStyle}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.id} align={column.align || "left"} sx={{ py: 0.15, px: 1, fontSize: "0.775rem" }}>
                          {column.format
                            ? column.format(item[column.id], item, index)
                            : item[column.id]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <EmptyState
                    colSpan={columns.length}
                    title="Apply filters to search"

                    height={260}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>

        </Box>
      </TableCard>

      {/* 1. Add Parent Assembly Mapping Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px", p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#6D2A8F", fontSize: "1.2rem", pb: 1 }}>
          Add Parent Assembly Mapping
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField
            size="small"
            label="Parent Part Number *"
            value={addParentNumber}
            onChange={(e) => setAddParentNumber(e.target.value)}
            fullWidth
          />
          <Autocomplete
            size="small"
            options={childOptions}
            loading={isSearchingChild}
            value={selectedChildOption}
            onChange={(_, newValue) => setSelectedChildOption(newValue)}
            onInputChange={(_, newInputValue) => debouncedChildSearch(newInputValue)}
            getOptionLabel={(option) =>
              typeof option === "string"
                ? option
                : option.drawingNumber
                  ? `${option.drawingNumber}${option.lnItemCode ? ` - ${option.lnItemCode}` : ""}`
                  : ""
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Child Part Number *"
                placeholder="Search child part number..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isSearchingChild ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <TextField
            size="small"
            label="Position No"
            value={addFindNo}
            onChange={(e) => setAddFindNo(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            size="small"
            onClick={() => setOpenAddDialog(false)}
            sx={{ color: "#344054", textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={!addParentNumber || !selectedChildOption || isSubmittingAdd}
            onClick={handleSaveAddMapping}
            sx={{
              backgroundColor: "#6D2A8F",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              borderRadius: "6px",
              "&:hover": { backgroundColor: "#572172" },
              "&:disabled": { backgroundColor: "#E2E8F0", color: "#94A3B8" },
            }}
          >
            {isSubmittingAdd ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. Edit Part Number Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px", p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#6D2A8F", fontSize: "1.2rem", pb: 1 }}>
          Edit Part Number
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField
            size="small"
            label="Part Number"
            value={editRow?.childDrawingNumber || editRow?.drawingNumber || ""}
            disabled
            fullWidth
            InputProps={{
              style: { backgroundColor: "#F8FAFC" },
            }}
          />
          <TextField
            size="small"
            label="Position No"
            value={editFindNo}
            onChange={(e) => setEditFindNo(e.target.value)}
            fullWidth
          />
          <TextField
            size="small"
            label="Quantity"
            type="number"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            size="small"
            onClick={() => setOpenEditDialog(false)}
            sx={{ color: "#344054", textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={isSubmittingEdit}
            onClick={handleSaveEditMapping}
            sx={{
              backgroundColor: "#6D2A8F",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              borderRadius: "6px",
              "&:hover": { backgroundColor: "#572172" },
            }}
          >
            {isSubmittingEdit ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. Delete Parent Assembly Mapping Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px", p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#6D2A8F", fontSize: "1.2rem", pb: 1 }}>
          Delete Parent Assembly Mapping
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
            Are you sure you want to delete the parent assembly mapping{" "}
            <strong>
              {deleteRow?.parentDrawingNumber || deleteRow?.assemblyDrawingNumber || selectedAssembly?.drawingNumber || "N/A"}
            </strong>{" "}
            for child Part Number <strong>{deleteRow?.childDrawingNumber || deleteRow?.drawingNumber || "N/A"}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            size="small"
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ color: "#344054", textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            disabled={isSubmittingDelete}
            onClick={handleConfirmDeleteMapping}
            sx={{
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              borderRadius: "6px",
              "&:hover": { backgroundColor: "#B91C1C" },
            }}
          >
            {isSubmittingDelete ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Three-dot Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchor?.anchorEl}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        transitionDuration={0}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 140,
            borderRadius: "8px",
            border: "1px solid #EAECF0",
            py: 0.5,
          },
        }}
      >
        <MenuItem
          disabled={!hasEditBomAccess}
          onClick={() => {
            if (actionMenuAnchor?.row) {
              const row = actionMenuAnchor.row;
              setEditRow(row);
              setEditFindNo(row.findNo || "");
              setEditQuantity(row.quantity ?? 0);
              setOpenEditDialog(true);
            }
            handleCloseActionMenu();
          }}
          sx={{ py: 0.75, px: 1.5, fontSize: "0.825rem" }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: "#6D2A8F" }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: "0.825rem", fontWeight: 500 }}>
            Edit
          </ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!hasEditBomAccess}
          onClick={() => {
            if (actionMenuAnchor?.row) {
              setDeleteRow(actionMenuAnchor.row);
              setOpenDeleteDialog(true);
            }
            handleCloseActionMenu();
          }}
          sx={{ py: 0.75, px: 1.5, fontSize: "0.825rem", color: "#DC2626" }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: "#DC2626" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: "0.825rem", fontWeight: 500, color: "#DC2626" }}>
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ViewBOM;
