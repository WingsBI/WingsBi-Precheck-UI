import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Stack,
  Tooltip,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  AccountTree as TreeIcon,
} from "@mui/icons-material";
import { FixedSizeList as List } from "react-window";
import { useTreeData } from "../../hooks/useTreeData";
import { TABLE_TOKENS, COLOUR_ROLES, commonTableHeaderStyle } from "../tableStyles";
import { EmptyState } from "../EmptyState";

interface TreeTableColumn {
  id: string;
  label: string;
  tooltip?: string;
  minWidth?: number;
  align?: "left" | "center" | "right";
  format?: (value: any, row: any, index?: number) => React.ReactNode;
}

interface TreeTableProps {
  data: any[];
  columns: TreeTableColumn[];
  idField?: string;
  parentIdField?: string;
  height?: number;
  rowHeight?: number;
  enableVirtualization?: boolean;
  loading?: boolean;
  onRowClick?: (row: any) => void;
  renderRowActions?: (row: any) => React.ReactNode;
}

interface TreeRowProps {
  node: any;
  columns: TreeTableColumn[];
  onToggle: (nodeId: string | number) => void;
  onRowClick?: (row: any) => void;
  renderRowActions?: (row: any) => React.ReactNode;
  style?: React.CSSProperties;
  rowIndex?: number;
  isVirtualized?: boolean;
}

const TreeRow: React.FC<TreeRowProps> = React.memo(({
  node,
  columns,
  onToggle,
  onRowClick,
  renderRowActions,
  rowIndex,
  isVirtualized = false,
}) => {
  const theme = useTheme();

  // Automatically find the first column that is NOT serialNumber, level, or findNo to render the expander hierarchy
  const expanderIndex = useMemo(() => {
    const nonSrIndex = columns.findIndex((col) => col.id !== "serialNumber" && col.id !== "level" && col.id !== "findNo");
    return nonSrIndex !== -1 ? nonSrIndex : 0;
  }, [columns]);

  const handleRowClick = useCallback(() => {
    if (onRowClick) {
      onRowClick(node);
    }
  }, [node, onRowClick]);

  const handleToggleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggle(node.id);
    },
    [node.id, onToggle],
  );

  return (
    <tr
      onClick={handleRowClick}
      style={{
        cursor: onRowClick ? "pointer" : "default",
        backgroundColor: "inherit",
        transition: "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        height: TABLE_TOKENS.rowHeight,
        display: "table-row",
        verticalAlign: "middle",
        outline: 0,
      }}
      className="tree-table-row"
    >
      {columns.map((column, index) => {
        const isExpander = index === expanderIndex;
        return (
          <td
            key={column.id}
            style={{
              width: column.minWidth,
              minWidth: column.minWidth,
              maxWidth: column.minWidth,
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: `${TABLE_TOKENS.cellPy * 8}px`,
              paddingBottom: `${TABLE_TOKENS.cellPy * 8}px`,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              borderBottom: isVirtualized ? "none" : `1px solid ${TABLE_TOKENS.rowBorderColor}`,
              fontSize: TABLE_TOKENS.bodyFontSize,
              color: COLOUR_ROLES.textSecondary,
              textAlign: column.align || "left",
              verticalAlign: "middle",
              height: TABLE_TOKENS.rowHeight,
            }}
          >
            {isExpander && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  pl: (node.level || 0) * 2.5,
                  width: "100%",
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
                  {node.hasChildren && (
                    <IconButton
                      size="small"
                      onClick={handleToggleClick}
                      sx={{
                        p: 0,
                        width: 18,
                        height: 18,
                        color: COLOUR_ROLES.textSecondary,
                        "&:hover": { color: COLOUR_ROLES.textMain },
                      }}
                    >
                      {node.isExpanded ? (
                        <KeyboardArrowDown sx={{ fontSize: 18 }} />
                      ) : (
                        <KeyboardArrowRight sx={{ fontSize: 18 }} />
                      )}
                    </IconButton>
                  )}
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {column.format
                    ? column.format(node[column.id], node, rowIndex)
                    : node[column.id]}
                </Box>
              </Box>
            )}
            {!isExpander && (
              <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                {column.format
                  ? column.format(node[column.id], node, rowIndex)
                  : node[column.id]}
              </Box>
            )}
            {index === columns.length - 1 && renderRowActions && (
              <Box sx={{ ml: 1, display: "inline-block" }}>{renderRowActions(node)}</Box>
            )}
          </td>
        );
      })}
    </tr>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.node === nextProps.node &&
    prevProps.columns === nextProps.columns &&
    prevProps.rowIndex === nextProps.rowIndex &&
    prevProps.isVirtualized === nextProps.isVirtualized
  );
});

const VirtualizedTreeRow: React.FC<{
  index: number;
  style: React.CSSProperties;
  data: {
    nodes: any[];
    columns: TreeTableColumn[];
    onToggle: (nodeId: string | number) => void;
    onRowClick?: (row: any) => void;
    renderRowActions?: (row: any) => React.ReactNode;
  };
}> = React.memo(({ index, style, data }) => {
  const { nodes, columns, onToggle, onRowClick, renderRowActions } = data;
  const node = nodes[index];

  return (
    <div
      style={{
        ...style,
        boxSizing: "border-box",
        borderBottom: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
      }}
    >
      <table
        style={{
          tableLayout: "fixed",
          width: "100%",
          height: "calc(100% - 1px)",
          margin: 0,
          border: "none",
          borderCollapse: "collapse",
          backgroundColor: "transparent",
        }}
      >
        <tbody>
          <TreeRow
            node={node}
            columns={columns}
            onToggle={onToggle}
            onRowClick={onRowClick}
            renderRowActions={renderRowActions}
            rowIndex={index}
            isVirtualized={true}
          />
        </tbody>
      </table>
    </div>
  );
}, (prevProps, nextProps) => {
  const prevNode = prevProps.data.nodes[prevProps.index];
  const nextNode = nextProps.data.nodes[nextProps.index];

  return (
    prevProps.index === nextProps.index &&
    prevNode === nextNode &&
    prevProps.data.columns === nextProps.data.columns &&
    prevProps.style.top === nextProps.style.top &&
    prevProps.style.height === nextProps.style.height
  );
});

export const TreeTable = ({
  ref,
  data,
  columns,
  idField = "id",
  parentIdField = "parentId",
  height = 400,
  rowHeight = 53,
  enableVirtualization = false,
  loading = false,
  onRowClick,
  renderRowActions,
}: TreeTableProps & { ref?: React.Ref<any> }) => {
  React.useImperativeHandle(ref, () => ({
    expandAll: handleExpandAll,
    collapseAll: handleCollapseAll,
  }));

  const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(
    () => {
      const initial = new Set<string | number>();
      if (data) {
        data.forEach((item) => {
          if (item.level === 0 || item.isExpanded) {
            initial.add(item[idField] || item.id);
          }
        });
      }
      return initial;
    },
  );

  useEffect(() => {
    if (data && data.length > 0) {
      setExpandedNodes((prev) => {
        if (prev.size > 0) return prev;
        const initial = new Set<string | number>();
        data.forEach((item) => {
          if (item.level === 0 || item.isExpanded) {
            initial.add(item[idField] || item.id);
          }
        });
        return initial;
      });
    }
  }, [data, idField]);

  const { treeData, flattenedData, toggleNode, expandAll, collapseAll } =
    useTreeData({
      data,
      idField,
      parentIdField,
      expandedNodes,
    });

  const handleToggle = useCallback(
    (nodeId: string | number) => {
      toggleNode(nodeId);
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    },
    [toggleNode],
  );

  const handleExpandAll = useCallback(() => {
    expandAll();
    const allNodeIds = new Set<string | number>();
    const collectIds = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.hasChildren) {
          allNodeIds.add(node.id);
        }
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedNodes(allNodeIds);
  }, [expandAll, treeData]);

  const handleCollapseAll = useCallback(() => {
    collapseAll();
    setExpandedNodes(new Set());
  }, [collapseAll]);

  // Dynamic column widths state for interactive drag-resizing
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Sync initial column widths whenever columns prop changes
  useEffect(() => {
    setColWidths((prev) => {
      const next = { ...prev };
      columns.forEach((col) => {
        if (!next[col.id]) {
          next[col.id] = col.minWidth || 100;
        }
      });
      return next;
    });
  }, [columns]);

  const handleResizeStart = useCallback((e: React.MouseEvent, colId: string) => {
    e.preventDefault();
    e.stopPropagation();

    startXRef.current = e.clientX;
    const baseCol = columns.find((c) => c.id === colId);
    const initialWidth = colWidths[colId] || baseCol?.minWidth || 100;
    startWidthRef.current = initialWidth;
    isDraggingRef.current = true;

    // Add drag cursor styling to document body
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = moveEvent.clientX - startXRef.current;
      const minW = baseCol?.minWidth ? Math.min(baseCol.minWidth, 50) : 50;
      const newWidth = Math.max(minW, startWidthRef.current + deltaX);
      setColWidths((prev) => ({
        ...prev,
        [colId]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [columns, colWidths]);

  // Effective columns with live updated widths
  const effectiveColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      minWidth: colWidths[col.id] || col.minWidth || 100,
    }));
  }, [columns, colWidths]);

  const totalWidth = useMemo(() => {
    return effectiveColumns.reduce((sum, col) => sum + (col.minWidth || 100), 0);
  }, [effectiveColumns]);

  const expanderIndex = useMemo(() => {
    const nonSrIndex = columns.findIndex((col) => col.id !== "serialNumber" && col.id !== "level" && col.id !== "findNo");
    return nonSrIndex !== -1 ? nonSrIndex : 0;
  }, [columns]);

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      {/* Table Container */}
      <TableContainer
        className="scroll-hover"
        sx={{
          width: "100%",
          maxHeight: height || "calc(100vh - 280px)",
          overflowY: enableVirtualization ? "hidden" : "auto",
          overflowX: "auto",
        }}
      >
        <Box sx={{ minWidth: totalWidth, width: "100%" }}>
          <Table stickyHeader size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {effectiveColumns.map((column, index) => {
                  const isExpanderCol = index === expanderIndex;
                  const colWidth = column.minWidth || 100;
                  return (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      sx={{
                        ...commonTableHeaderStyle,
                        width: colWidth,
                        minWidth: colWidth,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        boxSizing: "border-box",
                        pl: isExpanderCol ? "36px !important" : "12px !important",
                        pr: "12px !important",
                        position: "relative",
                        cursor: "default",
                        userSelect: "none",
                        zIndex: 3,
                        transition: "background-color 0.15s ease",
                        "&:hover": {
                          backgroundColor: "#f2f4f7",
                        },
                      }}
                    >
                      <Tooltip title={column.tooltip} arrow placement="top">
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.4,
                            justifyContent: column.align === "center" ? "center" : column.align === "right" ? "flex-end" : "flex-start",
                            width: "100%",
                            pr: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              color: COLOUR_ROLES.textSecondary,
                              letterSpacing: "0.2px",
                              textTransform: "none",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {column.label}
                          </Typography>
                        </Box>
                      </Tooltip>
                      {/* Visible Drag Divider Line with Tooltip */}
                      <Tooltip title="Drag to resize column width" arrow placement="top">
                        <Box
                          className="col-resizer-line"
                          onMouseDown={(e) => handleResizeStart(e, column.id)}
                          sx={{
                            position: "absolute",
                            right: 0,
                            top: "30%",
                            bottom: "30%",
                            width: 2,
                            borderRadius: "1px",
                            cursor: "col-resize",
                            backgroundColor: "#94A3B8",
                            opacity: 0.4,
                            transition: "all 0.15s ease",
                            zIndex: 5,
                            "&:hover": {
                              backgroundColor: "#6D2A8F",
                              opacity: 1,
                              width: 3,
                              top: "10%",
                              bottom: "10%",
                            },
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            {(!enableVirtualization || flattenedData.length === 0 || loading) && (
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={effectiveColumns.length}
                      align="center"
                      sx={{ borderBottom: "none", py: 8 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 4,
                          color: "#667085",
                        }}
                      >
                        <CircularProgress size={32} color="primary" sx={{ mb: 2 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Loading SOP details...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : flattenedData.length > 0 ? (
                  flattenedData.map((node, index) => (
                    <TreeRow
                      key={node.id}
                      node={node}
                      columns={effectiveColumns}
                      onToggle={handleToggle}
                      onRowClick={onRowClick}
                      renderRowActions={renderRowActions}
                      rowIndex={index}
                    />
                  ))
                ) : (
                  <EmptyState
                    colSpan={effectiveColumns.length}
                    title="Apply filters to search"
                    height={260}
                  />
                )}
              </TableBody>
            )}
          </Table>

          {enableVirtualization && flattenedData.length > 0 && (
            <List
              height={height - 44}
              width="100%"
              itemCount={flattenedData.length}
              itemSize={rowHeight}
              overscanCount={15}
              style={{ overflowX: "hidden", overflowY: "auto" }}
              itemData={{
                nodes: flattenedData,
                columns: effectiveColumns,
                onToggle: handleToggle,
                onRowClick,
                renderRowActions,
              }}
            >
              {VirtualizedTreeRow}
            </List>
          )}
        </Box>
      </TableContainer>
    </Box>
  );
};

export default TreeTable;
