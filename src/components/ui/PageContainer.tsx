/**
 * PageContainer — Page layout wrapper with standardized padding & max-width
 *
 * Usage:
 *   <PageContainer>
 *     <PageHeader … />
 *     <TableCard>…</TableCard>
 *   </PageContainer>
 */
import React from 'react';
import { Box } from '@mui/material';


interface PageContainerProps {
  children: React.ReactNode;
  /** Override max-width (default 1600px) */
  maxWidth?: number | string;
  sx?: object;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 1600,
  sx,
}) => (
  <Box
    sx={{
      width: '100%',
      maxWidth,
      mx: 'auto',
      py: 1,
      px: { xs: 1, sm: 2 },
      boxSizing: 'border-box',
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default PageContainer;
