export default function PatientDrawer({ patient, history = [], onClose }) {
  if (!patient) return null;

  const isCritical =
    Number(patient.decoded_bpm) < 60 || Number(patient.decoded_bpm) > 110 || Number(patient.spO2) < 92;

  return (
    <div className="fixed right-4 top-4 z-50 w-[22rem] max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-slate-950/95 p-5 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Selected patient</p>
          <h2 className="mt-1 text-xl font-bold">{patient.resolved_name ?? patient.name}</h2>
        </div>
        <button onClick={onClose} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-200 transition hover:bg-white/10">Close</button>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
        <p>Identity: {patient.identity_key}</p>
        <p>Ghost ID: {patient.ghost_id}</p>
        <p>Parity group: {patient.parity_group}</p>
        <p>Ward: {patient.ward}</p>
        <p>Age: {patient.age}</p>
        <p>BPM: {patient.decoded_bpm ?? "--"}</p>
        <p>SpO2: {patient.spO2 ?? "--"}</p>
        <p>Risk score: {patient.risk_score ?? "--"}</p>
        <p>Alert: {patient.alert_reason ?? "monitoring"}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Status</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${isCritical ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>
            {isCritical ? "Critical" : "Stable"}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Live updates are resolved by parity before the risk model scores the packet.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Recent packets</p>
        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
          {history.slice(-6).reverse().map((entry) => (
            <div key={entry.packet_id} className="rounded-xl border border-white/10 bg-slate-900/80 p-3 text-sm text-slate-200">
              <div className="flex items-center justify-between gap-3">
                <span>{entry.timestamp}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{entry.risk_level}</span>
              </div>
              <p className="mt-1 text-slate-300">BPM {entry.decoded_bpm} | SpO2 {entry.spO2} | Risk {entry.risk_score}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}