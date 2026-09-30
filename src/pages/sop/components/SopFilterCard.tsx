import React from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Autocomplete,
  CircularProgress,
  Paper,
} from "@mui/material";
import ActionButton from "../../../components/ui/ActionButton";
import RequiredLabel from "../../../components/ui/RequiredLabel";
import {
  Search as SearchIcon,
  Refresh as ResetIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import { Controller } from "react-hook-form";

interface SopFilterCardProps {
  control: any;
  productionSeriesData: any[];
  drawingNumbersData: any[];
  isDrawingNumbersLoading: boolean;
  drwDisplayText: string;
  setDrwDisplayText: (val: string) => void;
  selectedDrawingNumber: any;
  handleDrawingNumberChange: (val: any) => void;
  isDRWDropDownOpen: boolean;
  setIsDRWDropDownOpen: (val: boolean) => void;
  isSelectingItem: boolean;
  prodSeriesInputText: string;
  setProdSeriesInputText: (val: string) => void;
  executeSearch: () => void;
  executeReset: () => void;
  isLoading: boolean;
  isSearchAndResetEnabled: boolean;
  executeExport: () => void;
  isExporting: boolean;
  hasAssemblyData: boolean;
}

export const SopFilterCard: React.FC<SopFilterCardProps> = ({
  control,
  productionSeriesData,
  drawingNumbersData,
  isDrawingNumbersLoading,
  drwDisplayText,
  setDrwDisplayText,
  selectedDrawingNumber,
  handleDrawingNumberChange,
  isDRWDropDownOpen,
  setIsDRWDropDownOpen,
  isSelectingItem,
  prodSeriesInputText,
  setProdSeriesInputText,
  executeSearch,
  executeReset,
  isLoading,
  isSearchAndResetEnabled,
  executeExport,
  isExporting,
  hasAssemblyData,
}) => {
  return (
    <Box
      sx={{
        p: 1.5,
        pb: 1.25,
        borderBottom: "1px solid #EAECF0",
      }}
    >
      <Grid container spacing={1.25} alignItems="center">
        {/* Production Series */}
        <Grid item xs={12} sm={4} md={3}>
          <Controller
            name="prodSeriesId"
            control={control}
            render={({ field: { onChange, value } }) => {
              const selectedOption =
                productionSeriesData.find((s: any) => s.id === value) || null;
              return (
                <Autocomplete
                  size="small"
                  options={productionSeriesData}
                  getOptionLabel={(option: any) => {
                    if (!option) return "";
                    if (typeof option === "string") return option;
                    return option.productionSeries || "";
                  }}
                  isOptionEqualToValue={(option: any, val: any) => {
                    if (!option || !val) return false;
                    const optId = typeof option === "object" ? option.id : option;
                    const valId = typeof val === "object" ? val.id : val;
                    return optId === valId;
                  }}
                  value={selectedOption}
                  inputValue={prodSeriesInputText}
                  onInputChange={(_, newInputValue, reason) => {
                    setProdSeriesInputText(newInputValue);
                    if (reason === "input") {
                      const match = productionSeriesData.find(
                        (s: any) =>
                          s.productionSeries?.toLowerCase() ===
                          newInputValue.trim().toLowerCase()
                      );
                      if (match) {
                        onChange(match.id);
                      } else if (!newInputValue) {
                        onChange(0);
                      }
                    } else if (reason === "clear") {
                      onChange(0);
                    }
                  }}
                  onChange={(_, newValue: any) => {
                    if (newValue && typeof newValue !== "string") {
                      onChange(newValue.id);
                      setProdSeriesInputText(newValue.productionSeries || "");
                    } else if (typeof newValue === "string") {
                      const match = productionSeriesData.find(
                        (s: any) =>
                          s.productionSeries?.toLowerCase() ===
                          newValue.toLowerCase()
                      );
                      onChange(match ? match.id : 0);
                      setProdSeriesInputText(newValue);
                    } else {
                      onChange(0);
                      setProdSeriesInputText("");
                    }
                  }}
                  ListboxProps={{
                    sx: {
                      "& li": {
                        alignItems: "flex-start !important",
                        textAlign: "left !important",
                        justifyContent: "flex-start !important",
                      },
                    },
                  }}
                  renderOption={(props, option: any) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box
                        component="li"
                        key={option.id || key}
                        {...otherProps}
                        sx={{
                          fontSize: "0.85rem",
                          py: 0.5,
                          width: "100%",
                          textAlign: "left !important",
                          justifyContent: "flex-start !important",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", textAlign: "left !important", width: "100%" }}>
                          {option.productionSeries}
                        </Typography>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<RequiredLabel text="Prod. Series" required />}
                       
                        placeholder="Select series..."
                      />
                  )}
                />
              );
            }}
          />
        </Grid>

        {/* Drawing Number */}
        <Grid item xs={12} sm={4} md={4}>
          <Autocomplete
            options={drawingNumbersData || []}
            filterOptions={(options, { inputValue }) => {
              if (inputValue.length < 3) return [];
              return options.slice(0, 100);
            }}
            getOptionLabel={(option: any) => option.drawingNumber || ""}
            value={selectedDrawingNumber}
            onChange={(_, newValue) => handleDrawingNumberChange(newValue)}
            inputValue={drwDisplayText}
            onInputChange={(_, newInputValue) => {
              if (!isSelectingItem) {
                setDrwDisplayText(newInputValue);
              }
            }}
            open={isDRWDropDownOpen}
            onOpen={() => setIsDRWDropDownOpen(true)}
            onClose={() => setIsDRWDropDownOpen(false)}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label={<RequiredLabel text="Assembly No / Item Code" required />}
             
                placeholder="Type 3+ chars (e.g. CK310)..."
              />
            )}
            ListboxProps={{
              sx: {
                "& li": {
                  alignItems: "flex-start !important",
                  textAlign: "left !important",
                  justifyContent: "flex-start !important",
                },
              },
            }}
            renderOption={(props, option: any) => {
              const { key, ...otherProps } = props;
              return (
                <Box
                  component="li"
                  key={option.id || key}
                  {...otherProps}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start !important",
                    textAlign: "left !important",
                    justifyContent: "flex-start !important",
                    py: 0.75,
                    width: "100%",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem", textAlign: "left !important", width: "100%" }}>
                    {option.drawingNumber}
                  </Typography>
                  {option.nomenclature && (
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem", textAlign: "left !important", width: "100%" }}>
                      {option.nomenclature}
                    </Typography>
                  )}
                </Box>
              );
            }}
            loading={isDrawingNumbersLoading}
            loadingText="Loading drawings..."
            noOptionsText={
              isDrawingNumbersLoading
                ? "Loading drawings..."
                : drwDisplayText.length < 3
                ? "Type 3+ characters"
                : "No drawings found"
            }
          />
        </Grid>

        {/* Assembly ID Number */}
        <Grid item xs={12} sm={4} md={2.5}>
          <Controller
            name="assemblyNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Assembly ID No."
                placeholder="ID number..."
                fullWidth
                size="small"
              
              />
            )}
          />
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12} md={2.5}>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", alignItems: "center" }}>
            <ActionButton
              variant="primary"
              size="standard"
              onClick={executeSearch}
              disabled={isLoading || !isSearchAndResetEnabled}
            >
              {isLoading ? "Apply" : "Apply"}
            </ActionButton>
            <ActionButton
              variant="secondary"
              size="standard"
              onClick={executeReset}
              disabled={!isSearchAndResetEnabled}
            >
              Clear
            </ActionButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
