import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  Stack,
  Chip,
  CircularProgress,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
  IconButton,
} from "@mui/material";
import {
  FileDownload as DownloadIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useHasPermission } from "../../hooks/useHasPermission";
import type { RootState, AppDispatch } from "../../store/store";
import {
  getSopAssemblyData,
  exportSopAssemblyData,
  exportBomDetails,
  setSelectedAssemblyNumber,
  clearAssemblyData,
  clearBomData,
  clearError,
  setSearchCriteria,
} from "../../store/slices/sopSlice";
import { useProductionSeries, useDrawingNumbers } from "../../hooks/useMasterData";
import TreeTable from "../../components/TreeTable/TreeTable";
import ViewBOM from "./ViewBOM";
import { SopFilterCard } from "./components/SopFilterCard";
import PageHeader from "../../components/ui/PageHeader";
import ActionButton from "../../components/ui/ActionButton";
import { ComponentTypeChip } from "../../components/ComponentTypeChip";
import { TableCard, TableCardHeader } from "../../components/ui";
import { COLOUR_ROLES } from "../../components/tableStyles";

const ALL_SOP_EXPORT_COLUMNS = [
  { key: "level", label: "Level" },
  { key: "findNo", label: "Position No" },
  { key: "drawingNumber", label: "Part Number" },
  { key: "nomenclature", label: "Item Description" },
  { key: "quantity", label: "Qty/Assy" },
  { key: "componentType", label: "Component Type" },
  { key: "unit", label: "Unit" },
  { key: "idNumber", label: "ID No" },
  { key: "irNumber", label: "IR Number" },
  { key: "msnNumber", label: "MSN Number" },
  { key: "remarks", label: "Remarks" },
  { key: "assemblyNumber", label: "Assembly No" },
  { key: "build", label: "Build Number" },
  { key: "snag_Sheet_No", label: "Snag Sheet Number" },
  { key: "mrirNumber", label: "MRIR Number" },
];

const ALL_BOM_EXPORT_COLUMNS = [
  { key: "level", label: "Level" },
  { key: "childDrawingNumber", label: "Part Number" },
  { key: "nomenclature", label: "Item Description" },
  { key: "lnItemCode", label: "Item Code" },
  { key: "componentType", label: "Component Type" },
  { key: "quantity", label: "Qty" },
  { key: "findNo", label: "Position No" },
  { key: "parentDrawingNumber", label: "Assembly No" },
  { key: "idNumber", label: "ID No" },
  { key: "irNumber", label: "IR Number" },
  { key: "msnNumber", label: "MSN Number" },
  { key: "unit", label: "Unit" },
  { key: "remarks", label: "Remarks" },
];

interface FormData {
  prodSeriesId: number;
  drawingNumberId: number;
  assemblyNumber: string;
}

const ViewSOP: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"sop" | "bom">(
    location.pathname.includes("viewBOM") ||
      location.state?.tab === "bom" ||
      location.state?.drawingNumber
      ? "bom"
      : "sop"
  );

  useEffect(() => {
    if (
      location.pathname.includes("viewBOM") ||
      location.state?.tab === "bom" ||
      location.state?.drawingNumber
    ) {
      setActiveTab("bom");
    }
  }, [location.pathname, location.state]);

  // Redux state
  const {
    assemblyData,
    bomData,
    selectedAssemblyNumber,
    isLoading,
    isExporting,
    error,
  } = useSelector((state: RootState) => state.sop);

  const hasEditBomAccess = useHasPermission("Components");
  const bomAddActionRef = useRef<(() => void) | null>(null);

  // Local state
  const [drwDisplayText, setDrwDisplayText] = useState("");
  const [debouncedDrwText, setDebouncedDrwText] = useState("");
  const [selectedDrawingNumber, setSelectedDrawingNumber] = useState<any>(null);
  const [isDRWDropDownOpen, setIsDRWDropDownOpen] = useState(false);
  const [isSelectingItem, setIsSelectingItem] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [prodSeriesInputText, setProdSeriesInputText] = useState("");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const treeTableRef = useRef<any>(null);

  // Export Options Dialog State
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportMode, setExportMode] = useState<"all" | "custom">("all");

  const activeExportColumns = useMemo(() => {
    return activeTab === "sop" ? ALL_SOP_EXPORT_COLUMNS : ALL_BOM_EXPORT_COLUMNS;
  }, [activeTab]);

  const [selectedExportColumns, setSelectedExportColumns] = useState<string[]>(
    ALL_SOP_EXPORT_COLUMNS.map((c) => c.key)
  );

  // Debounce drawing number query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDrwText(drwDisplayText);
    }, 300);
    return () => clearTimeout(timer);
  }, [drwDisplayText]);

  // TanStack Query Hooks
  const { data: productionSeriesData = [] } = useProductionSeries();
  const { data: drawingNumbersData = [], isLoading: isDrawingNumbersLoading } = useDrawingNumbers(
    "",
    debouncedDrwText.length >= 3 ? debouncedDrwText : ""
  );

  // All 15 Tree table columns preserved
  const treeColumns = [
    {
      id: "serialNumber",
      label: "Sr. No.",
      minWidth: 70,
      align: "center" as const,
      format: (_: any, __: any, index?: number) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {index !== undefined ? index + 1 : ""}
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
          {value !== undefined && value !== null ? value : "0"}
        </Typography>
      ),
    },
    {
      id: "findNo",
      label: "Position No",
      minWidth: 90,
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
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "drawingNumber",
      label: "Part Number",
      minWidth: 220,
      align: "left" as const,
      format: (value: any, row: any) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: row.level === 0 ? 600 : 500,
            color: COLOUR_ROLES.textSecondary,
            fontSize: "0.775rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "nomenclature",
      label: "Item Description",
      minWidth: 220,
      align: "left" as const,
      format: (value: any, row: any) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.775rem",
            color: COLOUR_ROLES.textSecondary,
            fontWeight: row.level === 0 ? 600 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || row.nomenclature || "-"}
        </Typography>
      ),
    },
    {
      id: "quantity",
      label: "Qty/Assy",
      minWidth: 80,
      align: "center" as const,
      format: (value: any) => {
        const formattedValue =
          value !== undefined && value !== null && value !== "" && !isNaN(Number(value))
            ? Number(value)
            : (value ?? "");
        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: COLOUR_ROLES.textSecondary,
              fontSize: "0.775rem",
            }}
          >
            {formattedValue}
          </Typography>
        );
      },
    },
    {
      id: "componentType",
      label: "Component Type",
      minWidth: 130,
      align: "center" as const,
      format: (value: any, row: any) => (
        <ComponentTypeChip type={value || row?.componentType || "Standard"} />
      ),
    },
    {
      id: "unit",
      label: "Unit",
      minWidth: 70,
      align: "center" as const,
      format: (value: any) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.775rem",
            color: COLOUR_ROLES.textSecondary,
          }}
        >
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "idNumber",
      label: "ID No",
      minWidth: 100,
      align: "center" as const,
      format: (value: any, row: any) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.775rem",
            color: COLOUR_ROLES.textSecondary,
            fontWeight: row.level === 0 ? 600 : 400,
          }}
        >
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "irNumber",
      label: "IR Number",
      tooltip: "Inspection Report Number",
      minWidth: 140,
      align: "center" as const,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "msnNumber",
      label: "MSN Number",
      tooltip: "Memo Stage Number",
      minWidth: 140,
      align: "center" as const,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "remarks",
      label: "Remarks",
      minWidth: 160,
      align: "left" as const,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "assemblyNumber",
      label: "Assembly No",
      minWidth: 160,
      align: "center" as const,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "build",
      label: "Build Number",
      minWidth: 110,
      align: "center" as const,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "snag_Sheet_No",
      label: "Snag Sheet Number",
      minWidth: 150,
      align: "center" as const,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "mrirNumber",
      label: "MRIR Number",
      minWidth: 140,
      align: "center" as const,
      format: (value: any) => (
        <Typography variant="body2" sx={{ fontSize: "0.775rem", color: COLOUR_ROLES.textSecondary }}>
          {value || "-"}
        </Typography>
      ),
    },
  ];

  // Form setup
  const { control, reset, setValue, getValues, watch } = useForm<FormData>({
    defaultValues: {
      prodSeriesId: 0,
      drawingNumberId: 0,
      assemblyNumber: "",
    },
  });

  const watchProdSeriesId = watch("prodSeriesId");
  const watchDrawingNumberId = watch("drawingNumberId");
  const isSearchAndResetEnabled = watchProdSeriesId > 0 && watchDrawingNumberId > 0;

  // Transform flat data to tree structure
  const transformToTreeData = useCallback((data: any[]) => {
    if (!data || data.length === 0) return [];

    const rawItems = data.map((item, index) => {
      const defaultLevel = item.drawingNumber?.includes("-")
        ? item.drawingNumber.split("-").length - 1
        : 0;

      return {
        ...item,
        id: item.id !== undefined && item.id !== null ? item.id : item.serialNumber || index + 1,
        parentId: item.parentId !== undefined && item.parentId !== null ? item.parentId : item.parentAssemblyId || null,
        level: item.level !== undefined ? item.level : defaultLevel,
        hasChildren: item.hasChildren !== undefined ? item.hasChildren : false,
        isExpanded: item.isExpanded !== undefined ? item.isExpanded : false,
      };
    });

    const drawingToNodeMap = new Map<string, any>();
    rawItems.forEach((item) => {
      if (item.drawingNumber) {
        drawingToNodeMap.set(item.drawingNumber, item);
      }
    });

    const parentIdsSet = new Set<string | number>();
    const parentDrawingNumbersSet = new Set<string>();

    const itemsWithResolvedParents = rawItems.map((item) => {
      let parentId = item.parentId;

      if (!parentId && item.parentDrawingNumber) {
        const parentNode = drawingToNodeMap.get(item.parentDrawingNumber);
        if (parentNode) parentId = parentNode.id;
      }

      if (!parentId && item.parentAssemblyId) {
        parentId = item.parentAssemblyId;
      }

      if (!parentId && item.drawingNumber) {
        const parts = item.drawingNumber.split("-");
        if (parts.length > 1) {
          const parentDrawing = parts.slice(0, -1).join("-");
          const parentNode = drawingToNodeMap.get(parentDrawing);
          if (parentNode) parentId = parentNode.id;
        }
      }

      if (parentId) parentIdsSet.add(parentId);
      if (item.parentDrawingNumber) parentDrawingNumbersSet.add(item.parentDrawingNumber);

      return { ...item, parentId };
    });

    const resolvedIdToNodeMap = new Map<string | number, any>();
    itemsWithResolvedParents.forEach((item) => {
      resolvedIdToNodeMap.set(item.id, item);
    });

    return itemsWithResolvedParents.map((item) => {
      let level = item.level;
      let parentId = item.parentId;

      if (parentId) {
        let currentParent = resolvedIdToNodeMap.get(parentId);
        let count = 0;
        while (currentParent && count < 10) {
          count++;
          let nextParentId = currentParent.parentId;
          if (!nextParentId && currentParent.parentDrawingNumber) {
            const nextParentNode = drawingToNodeMap.get(currentParent.parentDrawingNumber);
            nextParentId = nextParentNode ? nextParentNode.id : null;
          }
          currentParent = nextParentId ? resolvedIdToNodeMap.get(nextParentId) : null;
        }
        level = count;
      }

      const hasChildren =
        item.hasChildren ||
        parentIdsSet.has(item.id) ||
        (item.drawingNumber && parentDrawingNumbersSet.has(item.drawingNumber));

      return {
        ...item,
        level,
        hasChildren,
      };
    });
  }, []);

  const treeData = useMemo(() => {
    return transformToTreeData(assemblyData);
  }, [assemblyData, transformToTreeData]);

  // Set default selected node to root when tree loads
  useEffect(() => {
    if (treeData && treeData.length > 0 && !selectedNode) {
      setSelectedNode(treeData[0]);
    }
  }, [treeData, selectedNode]);

  // Clear Redux assembly data & BOM data on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAssemblyData());
      dispatch(clearBomData());
      dispatch(setSelectedAssemblyNumber(null));
    };
  }, [dispatch]);

  // Clear success messages after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validateRequiredFields = useCallback((): string[] => {
    const values = getValues();
    const missingFields: string[] = [];
    if (!values.drawingNumberId || values.drawingNumberId <= 0) missingFields.push("Part Number");
    if (!values.prodSeriesId || values.prodSeriesId <= 0) missingFields.push("Series Number");
    return missingFields;
  }, [getValues]);

  const executeSearch = useCallback(async () => {
    try {
      const missingFields = validateRequiredFields();
      if (missingFields.length > 0) {
        setSuccessMessage(`Please fill required fields: ${missingFields.join(", ")}`);
        return;
      }

      const values = getValues();
      const request = {
        assemblyDrawingId: values.drawingNumberId || 0,
        serielNumberId: parseInt(values.assemblyNumber || "0") || 0,
        prodSeriesId: values.prodSeriesId || 0,
        assemblyDrawing: selectedDrawingNumber?.drawingNumber || drwDisplayText || "",
      };

      setSuccessMessage("");
      setSelectedNode(null);
      dispatch(setSearchCriteria(request));
      const action = getSopAssemblyData(request);
      const result = await dispatch(action as any);

      if (
        getSopAssemblyData.fulfilled.match(result) &&
        Array.isArray(result.payload) &&
        result.payload.length > 0
      ) {
        setSuccessMessage(`Loaded ${result.payload.length} records matching criteria.`);
      } else {
        setSuccessMessage("No records found matching criteria.");
      }
    } catch (error) {
      console.error("Error during search:", error);
      setSuccessMessage("Error during search");
    }
  }, [dispatch, validateRequiredFields, getValues, selectedDrawingNumber, drwDisplayText]);

  const executeExport = useCallback(
    async (customSelectedCols?: string[]) => {
      try {
        const missingFields = validateRequiredFields();
        if (missingFields.length > 0) {
          setSuccessMessage(`Please select required fields before exporting.`);
          return;
        }

        if (!assemblyData || assemblyData.length === 0) {
          setSuccessMessage("No data available to export. Please perform a search first.");
          return;
        }

        const values = getValues();
        const request = {
          assemblyDrawingId: values.drawingNumberId || 0,
          serielNumberId: parseInt(values.assemblyNumber || "0") || 0,
          prodSeriesId: values.prodSeriesId || 0,
          assemblyDrawing: selectedDrawingNumber?.drawingNumber || drwDisplayText || "",
          selectedColumns: customSelectedCols || ALL_SOP_EXPORT_COLUMNS.map((c) => c.key),
        };

        await dispatch(exportSopAssemblyData(request) as any);
        const isFiltersApplied = Boolean(
          values.drawingNumberId > 0 ||
          values.prodSeriesId > 0 ||
          values.assemblyNumber
        );
        let msg = "Data exported successfully.";
        if (isFiltersApplied && exportMode === "custom") {
          msg = "Data exported successfully based on the selected filters and columns.";
        } else if (isFiltersApplied) {
          msg = "Data exported successfully based on the selected filters.";
        } else if (exportMode === "custom") {
          msg = "Data exported successfully based on the selected columns.";
        }
        setSuccessMessage(msg);
      } catch (error) {
        console.error("Error during export:", error);
        setSuccessMessage("Error during export");
      }
    },
    [dispatch, validateRequiredFields, assemblyData, getValues, selectedDrawingNumber, drwDisplayText, exportMode]
  );



  const handleOpenExportDialog = useCallback(() => {
    const hasData =
      activeTab === "sop"
        ? Boolean(assemblyData && assemblyData.length > 0)
        : Boolean(bomData && bomData.length > 0);

    if (!hasData) {
      setSuccessMessage("No data available to export. Please perform a search first.");
      return;
    }
    setExportMode("all");
    setSelectedExportColumns(activeExportColumns.map((c) => c.key));
    setExportDialogOpen(true);
  }, [activeTab, assemblyData, bomData, activeExportColumns]);

  const handleToggleColumn = (colKey: string) => {
    setSelectedExportColumns((prev) => {
      const updated = prev.includes(colKey)
        ? prev.filter((k) => k !== colKey)
        : [...prev, colKey];
      return activeExportColumns.map((c) => c.key).filter((k) => updated.includes(k));
    });
  };

  const handleToggleSelectAllColumns = () => {
    if (selectedExportColumns.length === activeExportColumns.length) {
      setSelectedExportColumns([]);
    } else {
      setSelectedExportColumns(activeExportColumns.map((c) => c.key));
    }
  };

  const handleConfirmExportData = async () => {
    setExportDialogOpen(false);
    const colsToExport =
      exportMode === "custom"
        ? activeExportColumns.filter((col) => selectedExportColumns.includes(col.key)).map((col) => col.key)
        : activeExportColumns.map((c) => c.key);

    if (activeTab === "sop") {
      await executeExport(colsToExport);
    } else {
      const activeBomDrawing =
        selectedDrawingNumber?.drawingNumber ||
        selectedAssemblyNumber ||
        (bomData && bomData.length > 0
          ? bomData[0]?.parentDrawingNumber || bomData[0]?.assemblyNumber || bomData[0]?.childDrawingNumber
          : "");

      const request = {
        assemblyNumber: activeBomDrawing || drwDisplayText || "",
        selectedColumn: colsToExport,
      };

      const isFiltersApplied = Boolean(activeBomDrawing || drwDisplayText);
      let msg = "Data exported successfully.";
      if (isFiltersApplied && exportMode === "custom") {
        msg = "Data exported successfully based on the selected filters and columns.";
      } else if (isFiltersApplied) {
        msg = "Data exported successfully based on the selected filters.";
      } else if (exportMode === "custom") {
        msg = "Data exported successfully based on the selected columns.";
      }

      await dispatch(exportBomDetails(request) as any);
      setSuccessMessage(msg);
    }
  };

  const executeReset = useCallback(() => {
    reset({
      prodSeriesId: 0,
      drawingNumberId: 0,
      assemblyNumber: "",
    });
    setDrwDisplayText("");
    setProdSeriesInputText("");
    setSelectedDrawingNumber(null);
    setIsDRWDropDownOpen(false);
    setIsSelectingItem(false);
    setSuccessMessage("");
    setSelectedNode(null);
    dispatch(clearAssemblyData());
  }, [reset, dispatch]);

  const handleDrawingNumberChange = useCallback(
    (newValue: any) => {
      if (newValue) {
        setIsSelectingItem(true);
        try {
          setSelectedDrawingNumber(newValue);
          setDrwDisplayText(newValue.drawingNumber || "");
          setValue("drawingNumberId", newValue.id || 0);
        } finally {
          setIsSelectingItem(false);
        }
      } else {
        setSelectedDrawingNumber(null);
        setValue("drawingNumberId", 0);
      }
    },
    [setValue]
  );

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: "sop" | "bom") => {
      setActiveTab(newValue);
      executeReset();
      dispatch(clearBomData());
      dispatch(setSelectedAssemblyNumber(null));
    },
    [executeReset, dispatch]
  );

  const isExportDisabled = useMemo(() => {
    if (isExporting) return true;
    if (activeTab === "sop") {
      return !assemblyData || assemblyData.length === 0;
    }
    return !bomData || bomData.length === 0;
  }, [isExporting, activeTab, assemblyData, bomData]);

  const isAddDisabled = useMemo(() => {
    if (!hasEditBomAccess) return true;
    return !bomData || bomData.length === 0;
  }, [hasEditBomAccess, bomData]);

  const addTooltipTitle = useMemo(() => {
    if (!hasEditBomAccess) return "You do not have access to add assembly mapping";
    if (!bomData || bomData.length === 0) return "Search for an assembly drawing to add mapping";
    return "";
  }, [hasEditBomAccess, bomData]);

  const handleHeaderExportClick = useCallback(() => {
    handleOpenExportDialog();
  }, [handleOpenExportDialog]);

  // Compute stats for current tree summary
  const rootNode = treeData.length > 0 ? treeData[0] : null;
  const maxLevels = useMemo(() => {
    if (!treeData.length) return 0;
    return Math.max(...treeData.map((d: any) => d.level || 0)) + 1;
  }, [treeData]);

  return (
    <Box
      sx={{
        py: { xs: 1, sm: 1.25 },
        px: { xs: 1.5, sm: 2 },
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Top Header */}
      <PageHeader
        title="Assembly Explorer"
        mb={0.5}
        subtitle={
          activeTab === "sop"
            ? "Browse the BOM tree of a production order"
            : "Browse the BOM tree of an assembly"
        }
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
            <ActionButton
              variant="secondary"
              size="standard"
              onClick={handleHeaderExportClick}
              disabled={isExportDisabled}
              startIcon={
                isExporting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DownloadIcon fontSize="small" />
                )
              }
            >
              Export
            </ActionButton>

            {activeTab === "bom" && (
              <Tooltip title={addTooltipTitle} arrow>
                <Box component="span" sx={{ display: "inline-flex" }}>
                  <ActionButton
                    variant="primary"
                    size="standard"
                    disabled={isAddDisabled}
                    startIcon={<AddIcon fontSize="small" />}
                    onClick={() => bomAddActionRef.current?.()}
                  >
                    Add
                  </ActionButton>
                </Box>
              </Tooltip>
            )}
          </Stack>
        }
      />

      {/* Navigation Tabs Bar */}
      <Box sx={{ borderBottom: "1px solid #EAECF0", mb: 1.25 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 36,
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: "0.85rem",
              textTransform: "none",
              minWidth: 100,
              py: 0.75,
            },
            "& .MuiTab-root.Mui-selected": { color: "primary.main" },
            "& .MuiTabs-indicator": {
              backgroundColor: "primary.main",
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab
            value="sop"
            label={
              <Tooltip title="Standard Operating Procedure" arrow placement="top">
                <Box component="span">View SOP</Box>
              </Tooltip>
            }
          />
          <Tab
            value="bom"
            label={
              <Tooltip title="Bill Of Material" arrow placement="top">
                <Box component="span">View BOM</Box>
              </Tooltip>
            }
          />
        </Tabs>
      </Box>

      {/* Success / Error Alerts */}
      {(successMessage || error) && (
        <Alert
          severity={error ? "error" : successMessage.includes("fill") ? "error" : "success"}
          sx={{ mb: 1.25, borderRadius: "8px", py: 0.25 }}
          onClose={() => {
            setSuccessMessage("");
            dispatch(clearError());
          }}
        >
          {error || successMessage}
        </Alert>
      )}

      {/* Tab Panels */}
      {activeTab === "sop" ? (
        /* Unified Single TableCard Container */
        <TableCard sx={{ mb: 2 }}>
          {/* Section 1: SOP Search Filter Controls */}
          <SopFilterCard
            control={control}
            productionSeriesData={productionSeriesData}
            drawingNumbersData={drawingNumbersData}
            isDrawingNumbersLoading={isDrawingNumbersLoading}
            drwDisplayText={drwDisplayText}
            setDrwDisplayText={setDrwDisplayText}
            selectedDrawingNumber={selectedDrawingNumber}
            handleDrawingNumberChange={handleDrawingNumberChange}
            isDRWDropDownOpen={isDRWDropDownOpen}
            setIsDRWDropDownOpen={setIsDRWDropDownOpen}
            isSelectingItem={isSelectingItem}
            prodSeriesInputText={prodSeriesInputText}
            setProdSeriesInputText={setProdSeriesInputText}
            executeSearch={executeSearch}
            executeReset={executeReset}
            isLoading={isLoading}
            isSearchAndResetEnabled={isSearchAndResetEnabled}
            executeExport={handleOpenExportDialog}
            isExporting={isExporting}
            hasAssemblyData={assemblyData && assemblyData.length > 0}
          />

          {/* Section 2: SOP Details Table */}
          <TableCardHeader
            title={"SOP Details"}
            count={treeData.length > 0 ? treeData.length : undefined}
            actions={
              treeData.length > 0 ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => treeTableRef.current?.expandAll()}
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
                    onClick={() => treeTableRef.current?.collapseAll()}
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

          {/* Tree Table View */}
          <Box sx={{ overflow: "hidden" }}>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                  color: "#667085",
                }}
              >
                <CircularProgress size={32} color="primary" sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Loading SOP details...
                </Typography>
              </Box>
            ) : (
              <TreeTable
                ref={treeTableRef}
                data={treeData}
                columns={treeColumns}
                idField="id"
                parentIdField="parentId"
                height={600}
                enableVirtualization={Boolean(assemblyData && assemblyData.length > 80)}
                onRowClick={(row) => {
                  setSelectedNode(row);
                }}
              />
            )}
          </Box>
        </TableCard>
      ) : (
        /* BOM Details Tab */
        <ViewBOM hideHeader onRegisterAddAction={(fn) => { bomAddActionRef.current = fn; }} />
      )}

      {/* Exporting Backdrop */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isExporting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Export Options Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => !isExporting && setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", p: 1 },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "primary.main",
            fontSize: "1.1rem",
            pb: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <DownloadIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" fontWeight="700" color="primary.main">
              {activeTab === "sop" ? "Export SOP Details" : "Export BOM Details"}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setExportDialogOpen(false)} disabled={isExporting}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2 }}>
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <Typography variant="subtitle2" fontWeight="600" color="#475467" sx={{ mb: 1 }}>
              Choose Export Option:
            </Typography>

            <RadioGroup
              value={exportMode}
              onChange={(e) => {
                const newMode = e.target.value as "all" | "custom";
                setExportMode(newMode);
                if (newMode === "custom") {
                  setSelectedExportColumns(activeExportColumns.map((c) => c.key));
                }
              }}
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="all"
                control={<Radio size="small" sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }} />}
                label={<Typography variant="body2" fontWeight="600">Export All Columns</Typography>}
              />
              <FormControlLabel
                value="custom"
                control={<Radio size="small" sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }} />}
                label={<Typography variant="body2" fontWeight="600">Select Specific Columns to Export</Typography>}
              />
            </RadioGroup>

            {exportMode === "custom" && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} pb={1} borderBottom="1px solid #e2e8f0">
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedExportColumns.length === activeExportColumns.length}
                        indeterminate={
                          selectedExportColumns.length > 0 &&
                          selectedExportColumns.length < activeExportColumns.length
                        }
                        onChange={handleToggleSelectAllColumns}
                        sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight="700">
                        {selectedExportColumns.length === activeExportColumns.length ? "Deselect All" : "Select All Columns"}
                      </Typography>
                    }
                  />
                  <Chip
                    label={`${selectedExportColumns.length} / ${activeExportColumns.length} selected`}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: "primary.main", color: "primary.main" }}
                  />
                </Box>

                <Grid container spacing={1}>
                  {activeExportColumns.map((col) => (
                    <Grid item xs={6} sm={4} key={col.key}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedExportColumns.includes(col.key)}
                            onChange={() => handleToggleColumn(col.key)}
                            sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }}
                          />
                        }
                        label={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{col.label}</Typography>}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <ActionButton
            variant="secondary"
            size="compact"
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            size="compact"
            startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
            onClick={handleConfirmExportData}
            disabled={isExporting || (exportMode === "custom" && selectedExportColumns.length === 0)}
          >
            {isExporting ? "Exporting..." : "Export"}
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewSOP;
