import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend
} from "recharts";

export default function RiskChart({ data }) {
  const hasData = data.length > 0;

  return (
    <div className="glass p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-bold text-white">Dynamic Risk Score Chart</h2>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Rolling window</span>
      </div>

      {!hasData && (
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">
          Waiting for live risk packets.
        </p>
      )}

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(148,163,184,0.14)" strokeDasharray="4 4" />
          <XAxis dataKey="timestamp" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
          <YAxis domain={[0, 40]} tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
          <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12, color: "#e2e8f0" }} />
          <Legend />
          <ReferenceLine y={30} stroke="#fb7185" strokeDasharray="6 6" label="HIGH" />
          <ReferenceLine y={20} stroke="#fbbf24" strokeDasharray="6 6" label="WATCH" />
          <Line type="monotone" dataKey="risk_score" name="Risk score" stroke="#f43f5e" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}