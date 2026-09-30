/**
 * ActionButton — Standardized button variants
 */
import React from 'react';
import { Button, type ButtonProps } from '@mui/material';

type ActionVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'dropdown';
type ActionSize = 'small' | 'medium' | 'large' | 'compact' | 'standard' | 'hero';

interface ActionButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  /** Semantic button variant */
  variant?: ActionVariant;
  /** Height tier (defaults to standard: 38px) */
  size?: ActionSize;
  /** Pass-through MUI variant for edge cases */
  muiVariant?: ButtonProps['variant'];
}

const variantStyles: Record<ActionVariant, Record<string, any>> = {
  primary: {
    backgroundColor: '#6D2A8F',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
    '&:hover': {
      backgroundColor: '#571F73',
      boxShadow: 'none',
    },
    '&.Mui-disabled': {
      backgroundColor: '#EAECF0',
      color: '#98A2B3',
    },
  },
  secondary: {
    backgroundColor: '#ffffff',
    color: '#667085',
    border: '1px solid #D0D5DD',
    '&:hover': {
      borderColor: '#98A2B3',
      backgroundColor: '#F9FAFB',
      color: '#101828',
    },
    '&.Mui-disabled': {
      borderColor: '#EAECF0',
      color: '#98A2B3',
    },
  },
  danger: {
    backgroundColor: '#DC2626',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
    '&:hover': {
      backgroundColor: '#B91C1C',
      boxShadow: 'none',
    },
    '&.Mui-disabled': {
      backgroundColor: '#EAECF0',
      color: '#98A2B3',
    },
  },
  warning: {
    backgroundColor: '#D97706',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
    '&:hover': {
      backgroundColor: '#B45309',
      boxShadow: 'none',
    },
    '&.Mui-disabled': {
      backgroundColor: '#EAECF0',
      color: '#98A2B3',
    },
  },
  dropdown: {
    backgroundColor: '#ffffff',
    color: '#6D2A8F',
    border: '1px solid #6D2A8F',
    '&:hover': {
      borderColor: '#571F73',
      backgroundColor: '#F9FAFB',
    },
    '&.Mui-disabled': {
      borderColor: '#EAECF0',
      color: '#98A2B3',
    },
  },
};

const sizeTierStyles: Record<'compact' | 'standard' | 'hero', Record<string, any>> = {
  compact: {
    height: '34px !important',
    minHeight: '34px !important',
    maxHeight: '34px !important',
    py: '0px !important',
    px: '14px !important',
    minWidth: '60px',
    fontSize: '0.8rem !important',
    fontWeight: '600 !important',
    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      '& > *:first-of-type': {
        fontSize: '16px !important',
      },
    },
  },
  standard: {
    height: '38px !important',
    minHeight: '38px !important',
    maxHeight: '38px !important',
    py: '0px !important',
    px: '16px !important',
    minWidth: '65px',
    fontSize: '0.82rem !important',
    fontWeight: '600 !important',
    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      '& > *:first-of-type': {
        fontSize: '18px !important',
      },
    },
  },
  hero: {
    height: '44px !important',
    minHeight: '44px !important',
    maxHeight: '44px !important',
    py: '0px !important',
    px: '20px !important',
    minWidth: '100px',
    fontSize: '0.875rem !important',
    fontWeight: '600 !important',
    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      '& > *:first-of-type': {
        fontSize: '20px !important',
      },
    },
  },
};

const normalizeSize = (size: ActionSize): 'compact' | 'standard' | 'hero' => {
  if (size === 'large' || size === 'hero') return 'hero';
  if (size === 'compact') return 'compact';
  return 'standard';
};

const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  size = 'standard',
  muiVariant,
  children,
  sx,
  ...rest
}) => {
  const vStyles = variantStyles[variant];
  const normalizedTier = normalizeSize(size);
  const sStyles = sizeTierStyles[normalizedTier];

  // Determine MUI variant: primary/danger/warning → "contained", secondary/dropdown → "outlined"
  const resolvedMuiVariant =
    muiVariant ??
    (variant === 'secondary' || variant === 'dropdown' ? 'outlined' : 'contained');

  return (
    <Button
      variant={resolvedMuiVariant}
      sx={{
        borderRadius: '6px',
        textTransform: 'none',
        fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.4,
        ...sStyles,
        ...vStyles,
        ...(typeof sx === 'function' ? {} : sx),
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
