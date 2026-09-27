/**
 * PageHeader — Title Case page title with Info (i) icon tooltip (sentence case)
 *
 * Text Casing Conventions:
 *   Page headings     → Title Case   (e.g. "Store In", "Part Verification")
 *   Tooltip / subtitle → Sentence case (e.g. "Scan and verify BOM parts against production order")
 *
 * Usage:
 *   <PageHeader title="Part Verification" subtitle="Scan and verify BOM parts against production order" />
 */
import React from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const FONT_FAMILY = '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

/**
 * Convert a string to Title Case.
 *  "store in"            → "Store In"
 *  "part verification"   → "Part Verification"
 *  "production order details" → "Production Order Details"
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert a string to sentence case.
 *  "scan and verify BOM parts" → "Scan and verify BOM parts"
 *  "view details"              → "View details"
 */
export function toSentenceCase(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface PageHeaderProps {
  /** Page title — rendered in Title Case or ReactNode */
  title: React.ReactNode;
  /** Subtitle shown inside the tooltip when hovering on the (i) icon — rendered in sentence case */
  subtitle?: string;
  /** Extra content rendered to the right (e.g. action buttons, breadcrumbs) */
  actions?: React.ReactNode;
  /** Optional back button handler */
  onBack?: () => void;
  /** If true, the title & subtitle are displayed as-is without case conversion */
  skipCaseConversion?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  onBack,
  skipCaseConversion = false,
}) => {
  const displayTitle =
    typeof title === 'string'
      ? skipCaseConversion
        ? title
        : toTitleCase(title)
      : title;
  const displaySubtitle = subtitle
    ? skipCaseConversion
      ? subtitle
      : toSentenceCase(subtitle)
    : '';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {/* Back button + Title + Info icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {onBack && (
          <IconButton
            onClick={onBack}
            sx={{
              color: '#6D2A8F',
              p: 0.5,
              ml: -0.5,
              mr: 0.25,
              '&:hover': { backgroundColor: 'rgba(109, 42, 143, 0.08)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
            color: '#6D2A8F',
            lineHeight: 1.3,
          }}
        >
          {displayTitle}
        </Typography>

        {displaySubtitle && (
          <Tooltip title={displaySubtitle} placement="right" arrow>
            <IconButton
              size="small"
              sx={{
                p: 0.25,
                color: '#4B5563',
                '&:hover': { color: '#6D2A8F' },
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Right-side actions slot */}
      {actions && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
