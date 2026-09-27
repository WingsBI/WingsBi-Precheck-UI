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
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Edit as EditIcon,
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

interface AssemblyOption {
  id: number;
  drawingNumber: string;
  nomenclature: string;
  lnItemCode?: string;
}

const ViewBOM: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
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
            color: row.level === 0 ? "primary.main" : row.level === 1 ? "#2e7d32" : COLOUR_ROLES.textSecondary,
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
      format: (value: any, row: any) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            pl: row.level * 3,
          }}
        >
          {row.hasChildren ? (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleRow(row.id);
              }}
              sx={{ padding: 0.25, marginRight: 0.5 }}
            >
              {expandedRowIds.has(row.id) ? (
                <KeyboardArrowDown fontSize="small" />
              ) : (
                <KeyboardArrowRight fontSize="small" />
              )}
            </IconButton>
          ) : (
            <Box sx={{ width: 24, display: "inline-block" }} />
          )}
          <Typography
            variant="body2"
            sx={{
              fontWeight: row.level === 0 ? 600 : 500,
              color: row.level === 0 ? "primary.main" : COLOUR_ROLES.textMain,
              fontSize: "0.775rem",
            }}
          >
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "nomenclature",
      label: "Item Description",
      minWidth: 150,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem" }}>
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
          sx={{ fontSize: "0.775rem", fontWeight: 500 }}
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
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#059669", fontSize: "0.775rem" }}>
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
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textMain }}>
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

      {/* Bom Search Filter Card */}
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

      {/* Results Table Card */}
      <TableCard>
        <TableCardHeader
          title="BOM Details"
          count={bomData && bomData.length > 0 ? bomData.length : undefined}
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {bomData && bomData.length > 0 && (
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
              )}
              <Tooltip
                title={!hasEditBomAccess ? "You do not have access to edit BOM" : ""}
                arrow
              >
                <span>
                  <ActionButton
                    variant="primary"
                    size="compact"
                    disabled={!hasEditBomAccess || !bomData || bomData.length === 0}
                    startIcon={<EditIcon sx={{ fontSize: "0.95rem" }} />}
                    onClick={() => {
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
                      const activeLn =
                        selectedAssembly?.lnItemCode ||
                        (bomData && bomData.length > 0
                          ? bomData[0]?.lnItemCode || ""
                          : "");
                      navigate("/assembly/editbom", {
                        state: {
                          drawingNumber: activeDwg,
                          lnItemCode: activeLn,
                        },
                      });
                    }}
                  >
                    Edit BOM
                  </ActionButton>
                </span>
              </Tooltip>
            </Box>
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
                      />
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedVisibleRows && sortedVisibleRows.length > 0 ? (
                  sortedVisibleRows.map((item: any, index: number) => (
                    <TableRow
                      key={`${item.childDrawingId}-${index}`}
                      hover
                      sx={commonTableRowStyle}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.id} align={column.align || "left"} sx={{ py: 0.15, px: 0.75, fontSize: "0.775rem" }}>
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
                    subtitle="Search for an assembly to view BOM details."
                    height={260}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {isBomLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                zIndex: 20,
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
        </Box>
      </TableCard>
    </Box>
  );
};

export default ViewBOM;
