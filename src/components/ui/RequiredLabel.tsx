import React from 'react';

export interface RequiredLabelProps {
  /** The label text to display */
  text: string;
  /** Whether to show the "Required" badge (default: false) */
  required?: boolean;
}

/**
 * RequiredLabel — Unified label component for MUI Outlined form fields.
 */
const RequiredLabel: React.FC<RequiredLabelProps> = ({ text, required = false }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
    {text}
    {required && (
      <span
        style={{
          display: 'inline-block',
          marginLeft: '0.45em',
          padding: '0.05em 0.45em',
          fontSize: '0.82em',
          fontWeight: 600,
          lineHeight: 1.2,
          color: '#c62828',
          backgroundColor: '#fde2e4',
          borderRadius: '10px',
          verticalAlign: 'middle',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Required
      </span>
    )}
  </span>
);

export default RequiredLabel;
