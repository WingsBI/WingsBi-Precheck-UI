/**
 * ActiveFilterChips — Displays active filter chips with a "Clear All" button
 *
 * Usage:
 *   <ActiveFilterChips
 *     chips={[
 *       { id: "search", label: "Search: bolt", onRemove: () => clearSearch() },
 *       { id: "status", label: "Status: Active", onRemove: () => clearStatus() },
 *     ]}
 *     onClearAll={handleClearAll}
 *   />
 */
import React from 'react';
import { Box, Chip } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ActionButton from './ActionButton';

const FONT_FAMILY = '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onClearAll?: () => void;
}

const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({ chips, onClearAll }) => {
  if (!chips.length) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 0.75,
        py: 0.75,
      }}
    >
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          label={chip.label}
          size="small"
          deleteIcon={<ClearIcon sx={{ fontSize: 14 }} />}
          onDelete={chip.onRemove}
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: '0.775rem',
            fontWeight: 500,
            backgroundColor: '#F3E8F8',
            color: '#6D2A8F',
            borderRadius: '6px',
            height: 26,
            '& .MuiChip-deleteIcon': {
              color: '#6D2A8F',
              fontSize: 14,
              '&:hover': { color: '#571F73' },
            },
          }}
        />
      ))}
      {onClearAll && chips.length > 1 && (
        <ActionButton
          variant="secondary"
          size="compact"
          onClick={onClearAll}
          sx={{ height: 26, minWidth: 'auto', px: 1.5, fontSize: '0.75rem' }}
        >
          Clear All
        </ActionButton>
      )}
    </Box>
  );
};

export default ActiveFilterChips;
