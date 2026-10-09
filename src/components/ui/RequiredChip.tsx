import React from 'react';
import { Box, Typography, GlobalStyles, type SxProps, type Theme } from '@mui/material';

export interface RequiredChipProps {
  label?: string;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

/**
 * RequiredChip — A reusable pill badge chip for highlighting required fields.
 * Uses GlobalStyles to:
 * 1. Counter-scale the chip when the parent MUI InputLabel is NOT shrunk.
 * 2. Size the invisible chip inside notchedOutline legend so the outline border line resumes immediately after the chip without any extra gap.
 */
export const RequiredChip: React.FC<RequiredChipProps> = ({
  label = "Required",
  sx,
}) => {
  return (
    <>
      <GlobalStyles
        styles={{
          // 1. Uniform small badge sizing when parent InputLabel is NOT shrunk (inside field)
          '.MuiInputLabel-root:not(.MuiInputLabel-shrink) .required-chip-badge': {
            fontSize: '0.52rem !important',
            padding: '0.5px 3.5px !important',
            marginLeft: '4px !important',
            lineHeight: '1 !important',
            transform: 'none !important',
            verticalAlign: 'middle !important',
          },
          // 2. Adjust badge sizing inside notchedOutline legend so border line resumes immediately after chip badge
          '.MuiOutlinedInput-notchedOutline legend .required-chip-badge': {
            fontSize: '0.46rem !important',
            padding: '0 2px !important',
            marginLeft: '2px !important',
            letterSpacing: '-0.02em !important',
          },
        }}
      />
      <Box
        component="span"
        className="required-chip-badge"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(220, 38, 38, 0.15)",
          color: "#DC2626",
          borderRadius: "3px",
          px: 0.5,
          py: 0.05,
          fontSize: "0.64rem",
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: "nowrap",
          userSelect: "none",
          verticalAlign: "middle",
          flexShrink: 0,
          ml: 0.6,
          transition: "all 0.15s ease",
          ...sx,
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: "inherit",
            fontWeight: "inherit",
            color: "inherit",
            lineHeight: "inherit",
          }}
        >
          {label}
        </Typography>
      </Box>
    </>
  );
};

export default RequiredChip;
