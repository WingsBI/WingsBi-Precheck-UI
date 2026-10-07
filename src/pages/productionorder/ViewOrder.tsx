import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Stack,
  TextField,
  Autocomplete,
} from "@mui/material";
import { CustomPagination } from "../../components/CustomPagination";
import { usePONumbers } from "../../hooks/usePONumbers";

import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import PageHeader from "../../components/ui/PageHeader";
import ActionButton from "../../components/ui/ActionButton";
import SortableTableHeader from "../../components/ui/SortableTableHeader";
import { TableCard, TableCardHeader } from "../../components/ui/TableCard";
import { commonTableRowStyle } from "../../components/tableStyles";
import type { RootState, AppDispatch } from "../../store/store";
import {
  getAvailableComponentsForBOM,
  getProductionOrderDetails,
} from "../../store/slices/precheckSlice";

interface BOMItem {
  sr: number;
  lnitemcode: string;
  drawingNumber: string;
  qty: number;
  availableQuantity: number;
  totalQuantity: number;
  id: number;
  totalQrQty: number;
  unit: string;
}

interface QRCodeItem {
  qrCodeNumber: string;
  id: string;
  qty: number;
  status: string;
  location: string;
  expiry: string;
  mfg: string;
  remainingQuantity: number;
  remarks?: string;
}

const formatQuantity = (qty: any) => {
  if (qty === undefined || qty === null || qty === '') return '0';
  const num = Number(qty);
  if (isNaN(num)) return String(qty);
  const match = String(qty).match(/^-?\d+(?:\.\d{0,4})?/);
  return match ? match[0] : String(qty);
};

const ViewOrder: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as any;
  const poFromState = navigationState?.productionOrderNumber;

  // Redux state
  const { availableComponents } = useSelector(
    (state: RootState) => state.precheck,
  );

  // Local state
  const [error, setError] = useState("");
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [bomData, setBomData] = useState<BOMItem[]>([]);
  const [qrCodeData, setQrCodeData] = useState<QRCodeItem[]>([]);
  const [selectedBomRow, setSelectedBomRow] = useState<number | null>(null);
  const [qrPage, setQrPage] = useState(0);
  const [qrRowsPerPage, setQrRowsPerPage] = useState(10);
  const [bomLoading, setBomLoading] = useState(false);
  const [poMasterDetails, setPoMasterDetails] = useState<any>(() => navigationState || null);
  const fetchedPoRef = useRef<string | null>(null);

  // Filter controls state
  const [poSearchText, setPoSearchText] = useState("");
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [idNumber, setIdNumber] = useState("");

  // Master data queries
  const { data: poNumbersData = [], isLoading: poLoading } = usePONumbers(poSearchText);

  // Sync controls with poMasterDetails
  useEffect(() => {
    if (poMasterDetails) {
      if (poMasterDetails.productionOrderNumber) {
        setSelectedPO({
          productionOrderNumber: poMasterDetails.productionOrderNumber,
          ...poMasterDetails,
        });
      }
      const startId = poMasterDetails.startIdNumber ?? poMasterDetails.idNumber ?? "";
      if (startId) {
        setIdNumber(String(startId));
      }
    }
  }, [poMasterDetails]);

  // Derived auto-populated values from selected PO
  const drawingNumberValue = useMemo(() => {
    return poMasterDetails?.drawingNumber || selectedPO?.drawingNumber || "";
  }, [poMasterDetails, selectedPO]);

  const lnItemCodeValue = useMemo(() => {
    return (
      poMasterDetails?.lnItemCode ||
      poMasterDetails?.lnitemcode ||
      selectedPO?.lnItemCode ||
      selectedPO?.lnitemcode ||
      ""
    );
  }, [poMasterDetails, selectedPO]);

  const prodSeriesValue = useMemo(() => {
    return poMasterDetails?.productionSeries || selectedPO?.productionSeries || "";
  }, [poMasterDetails, selectedPO]);

  // Memoized options for PO dropdown
  const poOptions = useMemo(() => {
    const base = Array.isArray(poNumbersData) ? poNumbersData.slice(0, 100) : [];
    if (
      selectedPO &&
      !base.some((opt: any) => opt.productionOrderNumber === selectedPO.productionOrderNumber)
    ) {
      return [selectedPO, ...base];
    }
    return base;
  }, [poNumbersData, selectedPO]);

  const isApplyEnabled = useMemo(() => {
    return Boolean(selectedPO?.productionOrderNumber || poSearchText.trim());
  }, [selectedPO, poSearchText]);

  const handleApplyFilters = () => {
    const poNumToFetch = selectedPO?.productionOrderNumber || poSearchText.trim();
    if (poNumToFetch) {
      handleFetchDetails(poNumToFetch);
    }
  };

  const handleClearFilters = () => {
    setSelectedPO(null);
    setPoSearchText("");
    setPoMasterDetails(null);
    setIdNumber("");
    setBomData([]);
    setQrCodeData([]);
    setSelectedBomRow(null);
  };



  // Fetch PO Details helper
  const handleFetchDetails = async (poNumber: string) => {
    setBomLoading(true);
    setError("");
    try {
      const result = await dispatch(
        getProductionOrderDetails(poNumber),
      ).unwrap();

      if (result && result.master) {
        setPoMasterDetails(result.master);

        // Set BOM data
        if (result.bomItems && Array.isArray(result.bomItems)) {
          const mappedBomData = result.bomItems.map(
            (item: any, index: number) => ({
              sr: index + 1,
              lnitemcode: item.lnitemcode || "",
              drawingNumber: item.drawingNumber || "",
              qty: item.quantity || 0,
              availableQuantity: item.availableQuantity || 0,
              totalQuantity: item.totalQuantity || 0,
              totalQrQty: item.totalQrQty || 0,
              id: item.drawingNumberId || 0,
              unit: item.unitName || item.unit || "",
            }),
          );
          setBomData(mappedBomData);
        }
      }
    } catch (err: any) {
      setError(err || "Failed to fetch production order details");
    } finally {
      setBomLoading(false);
    }
  };

  // Single execution of details fetch per PO number
  useEffect(() => {
    if (poFromState && fetchedPoRef.current !== poFromState) {
      fetchedPoRef.current = poFromState;
      handleFetchDetails(poFromState);
    }
  }, [poFromState]);

  // Update QR code data when available components change
  useEffect(() => {
    const rawList = Array.isArray(availableComponents)
      ? availableComponents
      : (availableComponents as any)?.data || [];
    if (Array.isArray(rawList)) {
      const mappedQrData: QRCodeItem[] = rawList.map((item: any) => ({
        qrCodeNumber: item.qrCodeNumber || item.qrCode || "",
        id: item.idNumber || item.id || "",
        qty: item.quantity || item.qty || 0,
        status: item.status || "Available",
        location: item.location || item.storeLocation || "",
        expiry: item.expiryDate || item.expiry || "",
        mfg: item.manufacturingDate || item.mfg || "",
        remainingQuantity: item.remainingQuantity !== undefined ? item.remainingQuantity : item.quantity || 0,
        remarks: item.remarks || "-",
      }));
      setQrCodeData(mappedQrData);
    }
  }, [availableComponents]);

  const handleBomRowClick = async (bomItem: BOMItem, index: number) => {
    const prodSeriesId = poMasterDetails?.prodSeriesId || navigationState?.prodSeriesId;

    if (!prodSeriesId) {
      setError("Production Series not found");
      return;
    }

    setSelectedBomRow(index);
    setQrCodeLoading(true);
    setError("");

    try {
      const requestData = {
        prodSeriesId: Number(prodSeriesId),
        drawingNumberId: Number(bomItem.id),
        quantity: bomItem.qty || 1,
      };

      await dispatch(getAvailableComponentsForBOM(requestData)).unwrap();
    } catch (err: any) {
      setError(err || "Failed to fetch available components");
      setQrCodeData([]);
    } finally {
      setQrCodeLoading(false);
    }
  };



  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string | null) => {
    if (columnKey === null) {
      setSortColumn("");
      setSortDirection("asc");
    } else if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedBomData = useMemo(() => {
    if (!sortColumn) return bomData;
    return [...bomData].sort((a: any, b: any) => {
      let valA = a[sortColumn] ?? "";
      let valB = b[sortColumn] ?? "";
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [bomData, sortColumn, sortDirection]);

  const sortedQrCodeData = useMemo(() => {
    if (!sortColumn) return qrCodeData;
    return [...qrCodeData].sort((a: any, b: any) => {
      let valA = a[sortColumn] ?? "";
      let valB = b[sortColumn] ?? "";
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [qrCodeData, sortColumn, sortDirection]);

  const paginatedQrResults = useMemo(() => {
    const startIndex = qrPage * qrRowsPerPage;
    const endIndex = startIndex + qrRowsPerPage;
    return sortedQrCodeData.slice(startIndex, endIndex);
  }, [sortedQrCodeData, qrPage, qrRowsPerPage]);

  const renderStatusChip = (statusStr: string | undefined) => {
    const status = (statusStr || "N/A").toLowerCase();
    let bg = "#f4f5f7";
    let color = "#344054";
    let borderColor = "#d0d5dd";

    if (status.includes("available") || status.includes("ready") || status.includes("complete")) {
      bg = "#ecfdf5";
      color = "#047857";
      borderColor = "#a7f3d0";
    } else if (status.includes("pending") || status.includes("hold")) {
      bg = "#fffbeb";
      color = "#d97706";
      borderColor = "#fde68a";
    } else if (status.includes("used") || status.includes("consumed")) {
      bg = "#eff6ff";
      color = "#2563eb";
      borderColor = "#bfdbfe";
    } else if (status.includes("reject") || status.includes("scrap")) {
      bg = "#fef2f2";
      color = "#b91c1c";
      borderColor = "#fecaca";
    }

    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.25,
          py: 0.25,
          borderRadius: "12px",
          bgcolor: bg,
          color: color,
          border: `1px solid ${borderColor}`,
          fontWeight: 600,
          fontSize: "0.75rem",
          whiteSpace: "nowrap",
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: color,
          }}
        />
        {statusStr || "N/A"}
      </Box>
    );
  };

  const renderBomTable = () => (
    <TableContainer
      sx={{
        overflowX: "auto",
        overflowY: "auto",
        flexGrow: 1,
      }}
    >
      <Table stickyHeader size="small" sx={{ width: "100%" }}>
        <TableHead>
          <TableRow>
            <SortableTableHeader label="Sr No" align="center" isSortable={false} />
            <SortableTableHeader
              label="Item Code"
              columnKey="lnitemcode"
              activeSortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="center"
              isSortable={true}
            />
            <SortableTableHeader
              label="Part Number"
              columnKey="drawingNumber"
              activeSortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="center"
              isSortable={true}
            />
            <SortableTableHeader
              label="Unit"
              align="center"
              isSortable={false}
            />
            <SortableTableHeader
              label="Qty / Assembly"
              align="center"
              isSortable={false}
            />
            <SortableTableHeader
              label="Total Req Qty"
              align="center"
              isSortable={false}
            />
            <SortableTableHeader
              label="Total QR Qty"
              align="center"
              isSortable={false}
            />
            <SortableTableHeader
              label="Available Store Qty"
              align="center"
              isSortable={false}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {bomLoading ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6, borderBottom: "none" }}>
                <CircularProgress size={28} color="primary" />
              </TableCell>
            </TableRow>
          ) : (
            <>
              {sortedBomData.map((item, index) => {
                const isSelected = selectedBomRow === index;
                return (
                  <TableRow
                    key={item.sr}
                    hover
                    onClick={() => handleBomRowClick(item, index)}
                    sx={{
                      ...commonTableRowStyle,
                      cursor: "pointer",
                      backgroundColor: isSelected ? "rgba(107, 40, 138, 0.06)" : "inherit",
                    }}
                  >
                    <TableCell align="center">{item.sr}</TableCell>
                    <TableCell sx={{ color: "#101828" }} align="center">{item.lnitemcode}</TableCell>
                    <TableCell align="center">{item.drawingNumber}</TableCell>
                    <TableCell align="center">{item.unit || "-"}</TableCell>
                    <TableCell align="center">{item.qty}</TableCell>
                    <TableCell align="center">{item.totalQuantity}</TableCell>
                    <TableCell align="center">{item.totalQrQty}</TableCell>
                    <TableCell align="center">{item.availableQuantity}</TableCell>
                  </TableRow>
                );
              })}
              {bomData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, borderBottom: "none" }}>
                    <Typography variant="body2" sx={{ color: "#667085", fontWeight: 500 }}>
                      No BOM details available for this production order
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );



  return (
    <Box
      sx={{
        py: { xs: 0.75, sm: 1 },
        px: { xs: 1.25, sm: 1.5 },
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header Section */}
      <PageHeader
        title={`View Available QR Codes ${poFromState ? `— ${poFromState}` : ""}`}
        subtitle="View available QR codes for part verification."
        onBack={() => navigate(-1)}
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: "8px" }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Form Controls Bar (PO Number dropdown, Drawing Number/LN Item Code/Prod Series read-only fields & ID Number text field) */}
      <Paper
        elevation={0}
        sx={{
          p: 1.25,
          px: 1.5,
          mb: 1.25,
          borderRadius: "12px",
          border: "1px solid #EAECF0",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            width: "100%",
          }}
        >
          {/* PO Number Dropdown */}
          <Autocomplete
            size="small"
            options={poOptions}
            getOptionLabel={(option: any) =>
              typeof option === "string" ? option : option.productionOrderNumber || ""
            }
            value={selectedPO}
            loading={poLoading}
            onInputChange={(_, value) => setPoSearchText(value)}
            onChange={(_, newValue) => {
              const item = typeof newValue === "string" ? null : newValue;
              setSelectedPO(item);
              if (item?.productionOrderNumber) {
                handleFetchDetails(item.productionOrderNumber);
              }
            }}
            isOptionEqualToValue={(option: any, val: any) =>
              option.productionOrderNumber === (typeof val === "string" ? val : val?.productionOrderNumber)
            }
            renderOption={(props: any, option: any) => {
              const { key, ...optionProps } = props;
              const poNum = typeof option === "string" ? option : option.productionOrderNumber || "";
              const lnCode = option?.lnItemCode || option?.lnitemcode || "";
              const dwgNum = option?.drawingNumber || "";
              const nom = option?.nomenclature || option?.itemDescription || "";
              const compType = option?.componentType || "";

              return (
                <li {...optionProps} key={key}>
                  <Box sx={{ display: "flex", flexDirection: "column", py: 0.5, width: "100%" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.875rem" }}>
                      {poNum}
                    </Typography>
                    {(lnCode || dwgNum || nom || compType) && (
                      <Typography variant="caption" sx={{ color: "#667085", fontSize: "0.75rem" }}>
                        {lnCode ? `Item Code: ${lnCode}` : ""}
                        {dwgNum ? `${lnCode ? " | " : ""}Part No: ${dwgNum}` : ""}
                        {nom ? ` | ${nom}` : ""}
                        {compType ? ` | ${compType}` : ""}
                      </Typography>
                    )}
                  </Box>
                </li>
              );
            }}
            ListboxProps={{ style: { maxHeight: "300px" } }}
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 200px", md: 1.6 },
              minWidth: 175,
            }}
            renderInput={(params) => (
              <TextField {...params} label="Production Order Number" size="small" placeholder="Select PO" />
            )}
          />

          {/* Drawing Number Field (Read-only, auto-populated on PO selection) */}
          <TextField
            size="small"
            label="Part Number"
            value={drawingNumberValue}
            placeholder="Auto-populated"
            variant="outlined"
            fullWidth
            InputProps={{
              readOnly: true,
              style: { backgroundColor: "#F9FAFB" },
            }}
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 140px", md: 1.1 },
              minWidth: 130,
            }}
          />

          {/* LN Item Code Field (Read-only, auto-populated on PO selection) */}
          <TextField
            size="small"
            label="Item Code"
            value={lnItemCodeValue}
            placeholder="Auto-populated"
            variant="outlined"
            fullWidth
            InputProps={{
              readOnly: true,
              style: { backgroundColor: "#F9FAFB" },
            }}
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 140px", md: 1.1 },
              minWidth: 130,
            }}
          />

          {/* Prod Series Field (Read-only, auto-populated on PO selection) */}
          <TextField
            size="small"
            label="Prod Series"
            value={prodSeriesValue}
            placeholder="Auto-populated"
            variant="outlined"
            fullWidth
            InputProps={{
              readOnly: true,
              style: { backgroundColor: "#F9FAFB" },
            }}
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 90px", md: 0.7 },
              minWidth: 85,
            }}
          />

          {/* ID Number Field */}
          <TextField
            size="small"
            label="ID"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="ID"
            variant="outlined"
            fullWidth
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 75px", md: 0.5 },
              minWidth: 75,
            }}
          />

          {/* Actions */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: "auto", flex: "0 0 auto" }}>
            <ActionButton
              variant="primary"
              size="standard"
              onClick={handleApplyFilters}
              disabled={!isApplyEnabled || bomLoading}
            >
              Apply
            </ActionButton>
            <ActionButton
              variant="secondary"
              size="standard"
              onClick={handleClearFilters}
            >
              Clear
            </ActionButton>
          </Stack>
        </Box>
      </Paper>

      {/* Main Content Area: BOM Details & Available QRs */}
      <Grid container spacing={1} sx={{ flexGrow: 1 }}>
        {/* Left Panel: BOM Details */}
        <Grid item xs={12} lg={selectedBomRow !== null ? 6 : 12}>
          <TableCard sx={{ height: 520, display: "flex", flexDirection: "column" }}>
            <TableCardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: "#1F2937",

                    }}
                  >
                    Material available in store
                  </Typography>
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{
                      color: "#98A2B3",
                      fontSize: "0.75rem",
                      fontStyle: "italic",
                      fontWeight: 400,
                      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    (Click a row to view available QR codes)
                  </Typography>
                </Box>
              }

            />

            {renderBomTable()}
          </TableCard>
        </Grid>

        {/* Right Panel: Available QR Codes (Shown only when a row is clicked) */}
        {selectedBomRow !== null && (
          <Grid item xs={12} lg={6}>
            <TableCard sx={{ height: 520, display: "flex", flexDirection: "column" }}>
              <TableCardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: "#1F2937",
                      }}
                    >
                      Available QR Codes
                    </Typography>
                  </Box>
                }
                count={qrCodeData.length}
                actions={
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedBomRow(null);
                      setQrCodeData([]);
                    }}
                    title="Close QR details"
                    sx={{ p: 0.25, color: "#667085", "&:hover": { color: "#101828", backgroundColor: "#F2F4F7" } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              />

              <TableContainer sx={{ overflowX: "auto", flexGrow: 1 }}>
                <Table stickyHeader size="small" sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <SortableTableHeader
                        label="QR Code Number"
                        align="center"
                        isSortable={false}
                      />
                      <SortableTableHeader
                        label="ID"
                        align="center"
                        isSortable={false}
                      />
                      <SortableTableHeader
                        label="Qty"
                        align="center"
                        isSortable={false}
                      />
                      <SortableTableHeader
                        label="Status"
                        align="center"
                        isSortable={false}
                      />
                      <SortableTableHeader
                        label="Location"
                        align="center"
                        isSortable={false}
                      />
                      <SortableTableHeader
                        label="Remarks"
                        align="center"
                        isSortable={false}
                      />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {qrCodeLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: "none" }}>
                          <CircularProgress size={28} color="primary" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {paginatedQrResults.map((item, index) => (
                          <TableRow
                            key={index}
                            hover
                            sx={commonTableRowStyle}
                          >
                            <TableCell sx={{ color: "#101828" }} align="center">
                              {item.qrCodeNumber || "N/A"}
                            </TableCell>
                            <TableCell align="center">{item.id || "N/A"}</TableCell>
                            <TableCell align="center">{formatQuantity(item.remainingQuantity)}</TableCell>
                            <TableCell align="center">{renderStatusChip(item.status)}</TableCell>
                            <TableCell align="center">{item.location || "N/A"}</TableCell>
                            <TableCell align="center">{item.remarks || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                        {qrCodeData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: "none" }}>
                              <Typography variant="body2" sx={{ color: "#667085", fontWeight: 500 }}>
                                {selectedBomRow !== null
                                  ? "No available QR components found for selected BOM item"
                                  : "Click a BOM row on the left to view matching QR codes"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <CustomPagination
                page={qrPage}
                pageSize={qrRowsPerPage}
                totalCount={qrCodeData.length}
                pageSizeOptions={[5, 10, 25, 50]}
                onPageChange={(newPage) => setQrPage(newPage)}
                onPageSizeChange={(newSize) => {
                  setQrRowsPerPage(newSize);
                  setQrPage(0);
                }}
              />

            </TableCard>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ViewOrder;
