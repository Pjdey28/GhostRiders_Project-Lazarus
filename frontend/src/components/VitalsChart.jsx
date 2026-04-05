import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function VitalsChart({ data, selected }) {
  const filtered = selected
    ? data.filter((d) => d.identity_key === selected.identity_key)
    : data.slice(-24);

  const chartData = filtered.length ? filtered : data.slice(-24);
  const isFallback = Boolean(selected && !filtered.length && data.length);

  // Check if vitals are in critical range (based on actual dataset: BPM 60-111, SpO2 92-100)
  const latestVital = chartData.length ? chartData[chartData.length - 1] : null;
  const bpm = latestVital ? Number(latestVital.decoded_bpm) : 0;
  const spO2 = latestVital ? Number(latestVital.spO2) : 100;
  const isCritical = latestVital && (bpm >= 110 || spO2 <= 93);

  return (
    <div className={`glass h-[420px] p-6 ${isCritical ? 'border-2 border-red-500' : ''}`}>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Project Lazarus - Vitals Monitor</h2>
        {isCritical && <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold uppercase text-white">⚠ Critical</span>}
      </div>
      <p className="mb-2 text-sm text-slate-300">
        Showing {chartData.length} telemetry records{selected ? ` for ${selected.identity_key}` : ""}
      </p>

      {isFallback && (
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-amber-300">
          No history found for this identity in the current window. Showing recent telemetry instead.
        </p>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="rgba(148,163,184,0.16)" strokeDasharray="4 4" />
          <XAxis dataKey="timestamp" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
          <YAxis yAxisId="left" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
          <YAxis yAxisId="right" orientation="right" domain={[85, 100]} tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
          <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12, color: "#e2e8f0" }} />
          <Legend />
          {/* Reference lines for normal ranges */}
          <ReferenceLine yAxisId="left" y={60} stroke="rgba(34,197,94,0.3)" strokeDasharray="4 4" label={<span style={{ fontSize: 10, fill: '#86efac', dy: -10 }}>Min</span>} />
          <ReferenceLine yAxisId="left" y={110} stroke="rgba(239,68,68,0.5)" strokeDasharray="4 4" label={<span style={{ fontSize: 10, fill: '#fca5a5', dy: 15 }}>⚠ High</span>} />
          <ReferenceLine yAxisId="right" y={93} stroke="rgba(239,68,68,0.5)" strokeDasharray="4 4" label={<span style={{ fontSize: 10, fill: '#fca5a5', dy: -5 }}>⚠ Low</span>} />
          
          <Line yAxisId="left" type="monotone" dataKey="decoded_bpm" name="BPM (bpm)" stroke="#38bdf8" strokeWidth={3} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="spO2" name="SpO2 (%)" stroke="#34d399" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}