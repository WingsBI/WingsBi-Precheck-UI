/**
 * Form Styles — Unified form field styling tokens
 *
 * Import `formFieldStyle` into any page or shared component
 * to get consistent input/autocomplete look & feel.
 */

const FONT_FAMILY = '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const formFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontFamily: FONT_FAMILY,
    backgroundColor: '#FFFFFF',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D0D5DD',
    },
    '&:hover fieldset': {
      borderColor: '#6D2A8F',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6D2A8F',
      borderWidth: '1.5px',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F9FAFB',
    },
    '& input': {
      backgroundColor: 'transparent !important',
    },
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
      WebkitBoxShadow: '0 0 0 100px #ffffff inset !important',
      WebkitTextFillColor: '#1F2937 !important',
      transition: 'background-color 5000s ease-in-out 0s',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.85rem',
    fontFamily: FONT_FAMILY,
    color: '#4B5563',
    '&.Mui-focused': {
      color: '#6D2A8F',
    },
  },
  '& .MuiOutlinedInput-input': {
    fontSize: '0.85rem',
    fontFamily: FONT_FAMILY,
    color: '#1F2937',
  },
} as const;

/**
 * Compact variant for dialogs / modals with tighter spacing
 */
export const formFieldCompactStyle = {
  ...formFieldStyle,
  '& .MuiOutlinedInput-root': {
    ...formFieldStyle['& .MuiOutlinedInput-root'],
    fontSize: '0.82rem',
  },
  '& .MuiInputLabel-root': {
    ...formFieldStyle['& .MuiInputLabel-root'],
    fontSize: '0.82rem',
  },
  '& .MuiOutlinedInput-input': {
    ...formFieldStyle['& .MuiOutlinedInput-input'],
    fontSize: '0.82rem',
  },
} as const;
