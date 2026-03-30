import { Card, CardContent, Typography } from "@mui/material";

export default function Alerts({ alerts }) {
  return (
    <Card sx={{ bgcolor: "#2a0f0f" }}>
      <CardContent>
        <Typography variant="h6">Critical Alerts</Typography>

        {alerts.map((a, i) => (
          <Typography key={i} color="error">
            ⚠ BPM: {a.decoded_bpm}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
}