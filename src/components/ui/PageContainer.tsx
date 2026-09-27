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
  maxWidth = spacing.maxContentWidth,
  sx,
}) => (
  <Box
    sx={{
      width: '100%',
      maxWidth,
      mx: 'auto',
      py: spacing.pagePaddingY,
      px: spacing.pagePaddingX,
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default PageContainer;
