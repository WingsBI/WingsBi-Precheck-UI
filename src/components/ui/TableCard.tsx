/**
 * TableCard — Standardized table outer container & header bar
 *
 * Usage:
 *   <TableCard>
 *     <TableCardHeader title="BOM Lines" count={42} actions={<ActionButton>Export</ActionButton>} />
 *     <Table>…</Table>
 *   </TableCard>
 */
import React from 'react';
import { Paper, Box, Typography, Chip } from '@mui/material';

const FONT_FAMILY = '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// ─── Card Wrapper ───────────────────────────────────────────────
interface TableCardProps {
  children: React.ReactNode;
  sx?: object;
}

export const TableCard: React.FC<TableCardProps> = ({ children, sx }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: '12px',
      border: '1px solid #EAECF0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      ...sx,
    }}
  >
    {children}
  </Paper>
);

// ─── Header Bar ─────────────────────────────────────────────────
interface TableCardHeaderProps {
  /** Title shown on the left, e.g. "BOM Lines" */
  title?: React.ReactNode;
  /** Numeric badge beside the title */
  count?: number;
  /** Action slot on the right */
  actions?: React.ReactNode;
  /** Extra content between title and actions */
  children?: React.ReactNode;
  sx?: object;
}

export const TableCardHeader: React.FC<TableCardHeaderProps> = ({
  title,
  count,
  actions,
  children,
  sx,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2,
      py: 1.25,
      borderBottom: '1px solid #EAECF0',
      backgroundColor: '#FFFFFF',
      flexWrap: 'wrap',
      gap: 1,
      boxSizing: 'border-box',
      ...sx,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {title && (
        typeof title === 'string' ? (
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9rem',
              fontFamily: FONT_FAMILY,
              color: '#1F2937',
            }}
          >
            {title}
          </Typography>
        ) : (
          title
        )
      )}
      {count !== undefined && (
        <Chip
          label={count}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.75rem',
            fontWeight: 600,
            fontFamily: FONT_FAMILY,
            backgroundColor: '#F3E8F8',
            color: '#6D2A8F',
          }}
        />
      )}
      {children}
    </Box>

    {actions && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {actions}
      </Box>
    )}
  </Box>
);

export default TableCard;
