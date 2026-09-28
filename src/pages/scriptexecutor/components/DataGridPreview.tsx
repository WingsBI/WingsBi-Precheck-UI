import React from "react";
import { Box } from "@mui/material";
import { InsertDriveFile as FileIcon } from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { commonDataGridSx, DATAGRID_DEFAULT_PROPS } from "../../../components/tableStyles";
import { TableCard, TableCardHeader } from "../../../components/ui/TableCard";

interface DataGridPreviewProps {
  validFilesToPreview: File[];
  fileValidationStatuses: Record<string, { isValid: boolean; error?: string; columns: string[]; rows: any[] }>;
}

export const DataGridPreview: React.FC<DataGridPreviewProps> = ({
  validFilesToPreview,
  fileValidationStatuses,
}) => {
  const getGridColumnsForFile = (cols: string[], rows: any[] = []) => {
    if (cols.length === 0) return [];

    const list: GridColDef[] = [
      {
        field: "id",
        headerName: "Sr No",
        width: 70,
        headerAlign: "center",
        align: "center",
      },
    ];

    const seenFields = new Set<string>(["id"]);

    cols.forEach((col) => {
      const lowerCol = col.toLowerCase().trim();
      let fieldName = col;

      if (lowerCol === "id") {
        fieldName = "__excel_id";
      }

      if (!seenFields.has(fieldName)) {
        seenFields.add(fieldName);

        let maxLen = col.length;
        rows.forEach((row) => {
          let val = row[fieldName] !== undefined ? row[fieldName] : row[col];
          if (val === undefined || val === null) {
            const lowerKey = fieldName.toLowerCase();
            const foundKey = Object.keys(row).find((k) => k.toLowerCase().trim() === lowerKey);
            if (foundKey) {
              val = row[foundKey];
            }
          }
          if (val !== undefined && val !== null) {
            const strVal = String(val);
            if (strVal.length > maxLen) {
              maxLen = strVal.length;
            }
          }
        });

        const calculatedWidth = Math.max(130, Math.min(500, maxLen * 8 + 50));

        list.push({
          field: fieldName,
          headerName: col,
          flex: 1,
          minWidth: Math.round(calculatedWidth),
          headerAlign: "center",
          align: "center",
        });
      }
    });

    return list;
  };

  return (
    <>
      {validFilesToPreview.map((file) => {
        const status = fileValidationStatuses[file.name];
        if (!status) return null;

        const fileRows = status.rows.map((row, idx) => {
          const mappedRow = { ...row, id: idx + 1 };
          Object.keys(row).forEach((key) => {
            if (key.toLowerCase().trim() === "id") {
              mappedRow.__excel_id = row[key];
            }
          });
          return mappedRow;
        });

        const columns = getGridColumnsForFile(status.columns, fileRows);

        return (
          <TableCard key={file.name} sx={{ mb: 2 }}>
            <TableCardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FileIcon sx={{ color: "primary.main", fontSize: 20 }} />
                  <span>{file.name} Preview</span>
                </Box>
              }
              count={fileRows.length}
            />

            <Box sx={{ height: 320, width: "100%", p: 1 }}>
              <DataGrid
                {...DATAGRID_DEFAULT_PROPS}
                rows={fileRows}
                columns={columns}
                disableRowSelectionOnClick
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                sx={commonDataGridSx}
              />
            </Box>
          </TableCard>
        );
      })}
    </>
  );
};
