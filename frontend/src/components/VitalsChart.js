import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, Typography } from "@mui/material";

export default function VitalsChart({ data }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Vitals Monitor</Typography>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="ghost_id" />
            <YAxis />
            <Tooltip />
            <Line dataKey="decoded_bpm" stroke="#00e676" />
            <Line dataKey="spO2" stroke="#1976d2" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}