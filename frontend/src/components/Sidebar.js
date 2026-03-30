import { Box, Typography } from "@mui/material";

export default function Sidebar() {
  return (
    <Box width={200} bgcolor="#020617" p={2}>
      <Typography variant="h6">Lazarus</Typography>
      <Typography mt={2}>Dashboard</Typography>
      <Typography mt={1}>Patients</Typography>
      <Typography mt={1}>Analytics</Typography>
    </Box>
  );
}