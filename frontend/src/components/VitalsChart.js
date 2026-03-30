import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function VitalsChart({ data, selected }) {
  const filtered = selected
    ? data.filter(d => d.ghost_id === selected.ghost_id)
    : data.slice(0, 20);

  return (
    <div className="glass p-6 h-[400px]">
      <h2 className="mb-1 text-lg font-semibold">Project Lazarus - Vitals Monitor</h2>
      <p className="mb-2 text-sm text-slate-800">
        Showing {filtered.length} telemetry records{selected ? ` for ${selected.ghost_id}` : ""}
      </p>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filtered}>
          <XAxis
            dataKey="ghost_id"
            tick={{ fill: "#0d0e10", fontSize: 16 }}
            axisLine={{ stroke: "#94a3b8" }}
            tickLine={{ stroke: "#94a3b8" }}
          />
          <YAxis
            tick={{ fill: "#0d0e10", fontSize: 16 }}
            axisLine={{ stroke: "#94a3b8" }}
            tickLine={{ stroke: "#94a3b8" }}
          />
          <Tooltip />
          <Line type="monotone" dataKey="decoded_bpm" stroke="#38bdf8" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}