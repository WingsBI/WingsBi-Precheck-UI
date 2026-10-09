/**
 * StyledTabs — Branded tabs with active indicator & Nunito Sans font
 *
 * Usage:
 *   <StyledTabs value={tab} onChange={(_, v) => setTab(v)}>
 *     <StyledTab label="Store In" />
 *     <StyledTab label="Available" />
 *   </StyledTabs>
 */
import { styled } from '@mui/material/styles';
import { Tabs, Tab } from '@mui/material';

const FONT_FAMILY = '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const StyledTabs = styled(Tabs)({
  minHeight: 40,
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    backgroundColor: '#6D2A8F',
  },
});

export const StyledTab = styled(Tab)({
  fontFamily: FONT_FAMILY,
  fontWeight: 600,
  fontSize: '0.85rem',
  textTransform: 'none',
  minHeight: 40,
  padding: '8px 16px',
  color: '#4B5563',
  '&.Mui-selected': {
    color: '#6D2A8F',
    fontWeight: 700,
  },
  '&:hover': {
    color: '#6D2A8F',
    backgroundColor: 'rgba(109, 42, 143, 0.04)',
  },
});

export default StyledTabs;
