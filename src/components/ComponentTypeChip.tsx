import React from "react";
import { Box } from "@mui/material";

export interface ComponentTypeChipProps {
  type: string | undefined | null;
}

export const ComponentTypeChip: React.FC<ComponentTypeChipProps> = ({ type }) => {
  const typeStr = String(type || "N/A").trim().toUpperCase();

  let bg = "#F8FAFC";
  let color = "#475467";
  let borderColor = "#CBD5E1";

  if (typeStr === "BATCH") {
    bg = "#F3E8F8";
    color = "#6D2A8F";
    borderColor = "#E9D5FF";
  } else if (typeStr === "ID") {
    bg = "#EFF6FF";
    color = "#1D4ED8";
    borderColor = "#BFDBFE";
  } else if (typeStr === "FIM") {
    bg = "#FFFBEB";
    color = "#B45309";
    borderColor = "#FDE68A";
  } else if (typeStr === "SI") {
    bg = "#ECFDF5";
    color = "#047857";
    borderColor = "#A7F3D0";
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        px: 0.75,
        py: 0,
        height: 18,
        borderRadius: "3px",
        bgcolor: bg,
        color: color,
        border: `1px solid ${borderColor}`,
        fontWeight: 700,
        fontSize: "0.68rem",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {typeStr}
    </Box>
  );
};
