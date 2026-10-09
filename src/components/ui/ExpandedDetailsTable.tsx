import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Box } from "@mui/material";
import { commonTableHeaderStyle, commonTableRowStyle, TABLE_TOKENS } from "../tableStyles";

export interface ExpandedTableColumn {
  label: React.ReactNode;
  key: string;
  align?: "left" | "center" | "right";
  render?: (row: any, index: number) => React.ReactNode;
}

export interface ExpandedDetailsTableProps {
  columns: ExpandedTableColumn[];
  rows: any[];
  emptyMessage?: string;
}

export const ExpandedDetailsTable: React.FC<ExpandedDetailsTableProps> = ({
  columns,
  rows,
  emptyMessage = "No details available",
}) => {
  const dataRows = Array.isArray(rows) ? rows : rows ? [rows] : [];

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: TABLE_TOKENS.expandedRowBg,
        borderTop: `1px solid ${TABLE_TOKENS.expandedRowBorder}`,
        borderBottom: `1px solid ${TABLE_TOKENS.expandedRowBorder}`,
        overflowX: "auto",
      }}
    >
      <Table size="small" sx={{ width: "100%" }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align={col.align || "center"}
                sx={{
                  ...commonTableHeaderStyle,
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataRows.length > 0 ? (
            dataRows.map((row, index) => (
              <TableRow key={row.id ?? row.srNo ?? index} sx={commonTableRowStyle}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align || "center"}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {col.render ? col.render(row, index) : (row[col.key] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow sx={commonTableRowStyle}>
              <TableCell colSpan={columns.length} align="center" sx={{ color: "text.secondary", py: 1.5 }}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ExpandedDetailsTable;
