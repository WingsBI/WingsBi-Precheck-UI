/**
 * SearchBar — Quick search input with search/clear adornments
 *
 * Usage:
 *   <SearchBar
 *     value={searchTerm}
 *     onChange={(e) => setSearchTerm(e.target.value)}
 *     onClear={() => setSearchTerm("")}
 *     placeholder="Search by part number…"
 *   />
 */
import React from 'react';
import { TextField, InputAdornment, IconButton, type TextFieldProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const FONT_FAMILY = '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

interface SearchBarProps extends Omit<TextFieldProps, 'variant'> {
  /** Called when the X clear button is clicked */
  onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onClear,
  placeholder = 'Search…',
  sx,
  ...rest
}) => (
  <TextField
    size="small"
    variant="outlined"
    placeholder={placeholder}
    value={value}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon sx={{ fontSize: 18, color: '#98A2B3' }} />
        </InputAdornment>
      ),
      endAdornment: value ? (
        <InputAdornment position="end">
          <IconButton size="small" onClick={onClear} sx={{ p: 0.25 }}>
            <ClearIcon sx={{ fontSize: 16, color: '#98A2B3' }} />
          </IconButton>
        </InputAdornment>
      ) : null,
    }}
    sx={{
      minWidth: 200,
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontFamily: FONT_FAMILY,
        backgroundColor: '#FFFFFF',
        '& fieldset': {
          borderColor: '#D0D5DD',
        },
        '&:hover fieldset': {
          borderColor: '#6D2A8F',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#6D2A8F',
          borderWidth: '1.5px',
        },
      },
      '& .MuiOutlinedInput-input': {
        fontFamily: FONT_FAMILY,
        fontSize: '0.85rem',
        color: '#1F2937',
        '&::placeholder': {
          color: '#98A2B3',
          opacity: 1,
        },
      },
      ...((sx as object) || {}),
    }}
    {...rest}
  />
);

export default SearchBar;
