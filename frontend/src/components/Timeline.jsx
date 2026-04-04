export default function Timeline({ history }) {
  return (
    <div className="glass p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-bold text-white">Patient Flow Timeline</h2>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Live feed</span>
      </div>

      <div className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
        {history.map((h, i) => (
          <div key={`${h.packet_id ?? i}-${i}`} className={`rounded-2xl border-l-4 p-3 ${h.risk_level === "HIGH" ? "border-rose-400 bg-rose-500/10" : h.risk_level === "MEDIUM" ? "border-amber-400 bg-amber-500/10" : "border-emerald-400 bg-emerald-500/10"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">{h.timestamp}</p>
                <p className="mt-1 text-sm font-semibold text-white">{h.resolved_name ?? h.identity_key}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-950/50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">{h.risk_level}</span>
            </div>
            <p className="mt-2 text-sm text-slate-200">
              BPM {h.decoded_bpm} | SpO2 {h.spO2} | Risk {h.risk_score}
            </p>
            <p className="mt-1 text-xs text-slate-300">{h.alert_reason ?? "monitoring"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}