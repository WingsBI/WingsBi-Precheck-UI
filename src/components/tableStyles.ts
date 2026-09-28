export const TABLE_TOKENS = {
  // Header Tokens
  headerBg: "#F9FAFB",
  headerColor: "#475467",
  headerFontSize: "0.8rem",
  headerFontWeight: 700,
  headerHeight: "40px",
  headerHeightNum: 40,
  headerPy: 0.75,
  headerPx: 1.25,

  // Body Tokens
  bodyFontSize: "0.775rem",
  bodyTextColor: "#1F2937",
  rowHeight: 40,
  cellPy: 0.15,
  cellPx: 0.75,
  rowBorderColor: "#E5E7EB",
  rowHoverColor: "transparent !important",

  // Special Column & Expanded Row Tokens
  stickyColumnBg: "#FFFFFF",
  expandedRowBg: "#F8FAFC",
  expandedRowBorder: "#EAECF0",
  loadingRowHeight: 280,
  emptyStateHeight: 260,

  // Footer / Pagination Tokens
  footerBorderColor: "#EAECF0",
  footerPy: 0.75,
  footerPx: 2,
  footerHeight: "44px",
  footerFontSize: "0.775rem",
  footerTextColor: "#475467",

  // Status Row Highlight Tokens
  statusRowRejected: "transparent",
  statusRowUpdated: "transparent",
  statusRowShort: "transparent",
};

export const DATAGRID_DEFAULT_PROPS = {
  rowHeight: TABLE_TOKENS.rowHeight,
  columnHeaderHeight: TABLE_TOKENS.headerHeightNum,
};

export const STATUS_ROW_TOKENS = {
  rejected: "transparent",
  updated: "transparent",
  short: "transparent",
  default: "transparent",
};

export const COLOUR_ROLES = {
  primary: "#6D2A8F",
  primaryHover: "#571F73",
  primaryTint: "#F3E8F8",
  destructive: "#B91C1C",
  link: "#2563EB",
  textMain: TABLE_TOKENS.bodyTextColor,
  textSecondary: TABLE_TOKENS.headerColor,
  placeholder: "#6B7280",
  borderStrong: "#D1D5DB",
  hairline: TABLE_TOKENS.rowBorderColor,
  canvas: "#F4F4F6",
  headerBg: TABLE_TOKENS.headerBg,
  rowHover: TABLE_TOKENS.rowHoverColor,
};

export const commonTableHeaderStyle = {
  fontWeight: TABLE_TOKENS.headerFontWeight,
  backgroundColor: TABLE_TOKENS.headerBg,
  color: TABLE_TOKENS.headerColor,
  fontSize: TABLE_TOKENS.headerFontSize,
  borderBottom: `1px solid ${TABLE_TOKENS.rowBorderColor}`,
  py: TABLE_TOKENS.headerPy,
  px: TABLE_TOKENS.headerPx,
};

export const commonTableRowStyle = {
  height: TABLE_TOKENS.rowHeight,
  "&:hover": { backgroundColor: TABLE_TOKENS.rowHoverColor },
  "& td, & th": {
    borderBottom: `1px solid ${TABLE_TOKENS.rowBorderColor}`,
    fontSize: TABLE_TOKENS.bodyFontSize,
    color: TABLE_TOKENS.bodyTextColor,
    py: TABLE_TOKENS.cellPy,
    px: TABLE_TOKENS.cellPx,
  },
};

export const commonExpandedRowStyle = {
  height: "auto",
  "& > td": {
    padding: "0 !important",
    borderBottom: "none !important",
  },
  "& .MuiCollapse-wrapperInner": {
    backgroundColor: TABLE_TOKENS.expandedRowBg,
    borderTop: `1px solid ${TABLE_TOKENS.expandedRowBorder}`,
    borderBottom: `1px solid ${TABLE_TOKENS.expandedRowBorder}`,
  },
};

export const commonTableCellCompactCheckbox = {
  padding: "checkbox",
  textAlign: "center",
  py: 0,
  px: 0.5,
  height: TABLE_TOKENS.rowHeight,
  "& .MuiCheckbox-root": {
    p: 0.5,
    height: 28,
    width: 28,
    color: "#D0D5DD",
    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
      color: "primary.main",
    },
  },
};

export const commonTableLoadingRowSx = {
  height: TABLE_TOKENS.loadingRowHeight,
  borderBottom: "none",
};

export const commonDataGridSx = {
  border: `1px solid ${TABLE_TOKENS.rowBorderColor}`,
  borderRadius: "12px",
  backgroundColor: "#FFFFFF",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: TABLE_TOKENS.headerBg,
    color: TABLE_TOKENS.headerColor,
    fontWeight: TABLE_TOKENS.headerFontWeight,
    fontSize: TABLE_TOKENS.headerFontSize,
    borderBottom: `1px solid ${TABLE_TOKENS.rowBorderColor}`,
    minHeight: `${TABLE_TOKENS.headerHeight} !important`,
    maxHeight: `${TABLE_TOKENS.headerHeight} !important`,
    lineHeight: `${TABLE_TOKENS.headerHeight} !important`,
  },
  "& .MuiDataGrid-columnHeader": {
    paddingLeft: `${TABLE_TOKENS.cellPx * 8}px !important`,
    paddingRight: `${TABLE_TOKENS.cellPx * 8}px !important`,
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    padding: "0 !important",
    marginLeft: "0 !important",
  },
  "& .MuiDataGrid-cell": {
    fontSize: TABLE_TOKENS.bodyFontSize,
    color: TABLE_TOKENS.bodyTextColor,
    borderBottom: `1px solid ${TABLE_TOKENS.rowBorderColor}`,
    display: "flex",
    alignItems: "center",
    paddingLeft: `${TABLE_TOKENS.cellPx * 8}px !important`,
    paddingRight: `${TABLE_TOKENS.cellPx * 8}px !important`,
    py: "2px",
  },
  "& .MuiDataGrid-row": {
    minHeight: `${TABLE_TOKENS.rowHeight}px !important`,
    maxHeight: `${TABLE_TOKENS.rowHeight}px !important`,
    "&:hover": { backgroundColor: TABLE_TOKENS.rowHoverColor },
  },
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus": {
    outline: "none !important",
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: `1px solid ${TABLE_TOKENS.footerBorderColor}`,
    minHeight: `${TABLE_TOKENS.footerHeight} !important`,
    "& .MuiTablePagination-root": {
      width: "100%",
    },
    "& .MuiTablePagination-toolbar": {
      display: "flex",
      justifyContent: "space-between !important",
      width: "100%",
      px: TABLE_TOKENS.footerPx,
    },
    "& .MuiTablePagination-spacer": {
      display: "none !important",
    },
    "& .MuiTablePagination-selectLabel": {
      margin: 0,
      fontSize: TABLE_TOKENS.footerFontSize,
      color: TABLE_TOKENS.footerTextColor,
      fontWeight: 500,
    },
    "& .MuiDataGrid-displayedRows, & .MuiTablePagination-displayedRows": {
      fontSize: TABLE_TOKENS.footerFontSize,
      color: TABLE_TOKENS.footerTextColor,
      fontWeight: 500,
      marginLeft: "auto !important",
    },
    "& .MuiBox-root": {
      width: "100%",
      borderTop: "none",
    },
  },
};

export const adminDataGridSx = {
  border: "none !important",
  borderRadius: "0px",
  backgroundColor: "#FFFFFF",
  "& .MuiDataGrid-main": {
    borderRadius: "0px",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: `${TABLE_TOKENS.headerBg} !important`,
    color: `${TABLE_TOKENS.headerColor} !important`,
    fontWeight: `${TABLE_TOKENS.headerFontWeight} !important`,
    fontSize: `${TABLE_TOKENS.headerFontSize} !important`,
    borderBottom: `1px solid ${TABLE_TOKENS.expandedRowBorder} !important`,
    minHeight: `${TABLE_TOKENS.headerHeight} !important`,
    maxHeight: `${TABLE_TOKENS.headerHeight} !important`,
    lineHeight: `${TABLE_TOKENS.headerHeight} !important`,
  },
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: `${TABLE_TOKENS.headerBg} !important`,
    color: `${TABLE_TOKENS.headerColor} !important`,
    fontWeight: `${TABLE_TOKENS.headerFontWeight} !important`,
    fontSize: `${TABLE_TOKENS.headerFontSize} !important`,
    borderBottom: `1px solid ${TABLE_TOKENS.expandedRowBorder} !important`,
    minHeight: `${TABLE_TOKENS.headerHeight} !important`,
    maxHeight: `${TABLE_TOKENS.headerHeight} !important`,
    paddingLeft: `${TABLE_TOKENS.cellPx * 8}px !important`,
    paddingRight: `${TABLE_TOKENS.cellPx * 8}px !important`,
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    padding: "0 !important",
    marginLeft: "0 !important",
  },
  "& .MuiDataGrid-columnHeadersInner, & .MuiDataGrid-columnHeaderRow, & .MuiDataGrid-columnHeaderTitleContainerContent": {
    backgroundColor: `${TABLE_TOKENS.headerBg} !important`,
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: `${TABLE_TOKENS.headerFontWeight} !important`,
    fontSize: `${TABLE_TOKENS.headerFontSize} !important`,
    color: `${TABLE_TOKENS.headerColor} !important`,
  },
  "& .MuiDataGrid-columnSeparator, & .MuiDataGrid-iconSeparator": {
    display: "none !important",
    opacity: "0 !important",
    visibility: "hidden !important",
  },
  "& .MuiDataGrid-cell": {
    fontSize: TABLE_TOKENS.bodyFontSize,
    color: TABLE_TOKENS.bodyTextColor,
    borderBottom: `1px solid ${TABLE_TOKENS.expandedRowBorder}`,
    display: "flex",
    alignItems: "center",
    paddingLeft: `${TABLE_TOKENS.cellPx * 8}px !important`,
    paddingRight: `${TABLE_TOKENS.cellPx * 8}px !important`,
  },
  "& .MuiDataGrid-row": {
    minHeight: `${TABLE_TOKENS.rowHeight}px !important`,
    maxHeight: `${TABLE_TOKENS.rowHeight}px !important`,
    "&:hover": { backgroundColor: TABLE_TOKENS.rowHoverColor },
    "&.Mui-selected": { backgroundColor: "#F1F5F9 !important" },
    "&.Mui-selected:hover": { backgroundColor: "#F1F5F9 !important" },
  },
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
    outline: "none !important",
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: `1px solid ${TABLE_TOKENS.footerBorderColor} !important`,
    minHeight: `${TABLE_TOKENS.footerHeight} !important`,
    backgroundColor: "#FFFFFF",
    "& .MuiTablePagination-root": {
      width: "100%",
    },
    "& .MuiTablePagination-toolbar": {
      display: "flex",
      justifyContent: "space-between !important",
      width: "100%",
      px: TABLE_TOKENS.footerPx,
    },
    "& .MuiTablePagination-spacer": {
      display: "none !important",
    },
    "& .MuiTablePagination-selectLabel": {
      margin: 0,
      fontSize: TABLE_TOKENS.footerFontSize,
      color: TABLE_TOKENS.footerTextColor,
      fontWeight: 500,
    },
    "& .MuiDataGrid-displayedRows, & .MuiTablePagination-displayedRows": {
      fontSize: TABLE_TOKENS.footerFontSize,
      color: TABLE_TOKENS.footerTextColor,
      fontWeight: 500,
      marginLeft: "auto !important",
    },
    "& .MuiBox-root": {
      width: "100%",
      borderTop: "none",
    },
  },
};
