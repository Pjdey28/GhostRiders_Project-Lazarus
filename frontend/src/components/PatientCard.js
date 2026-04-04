const riskClasses = {
  HIGH: "border-rose-400/40 bg-rose-500/10 text-rose-100",
  MEDIUM: "border-amber-400/40 bg-amber-500/10 text-amber-100",
  NORMAL: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
  UNKNOWN: "border-white/10 bg-white/5 text-slate-100",
};

export default function PatientCard({ patient, onClick, isSelected }) {
  return (
    <div
      onClick={() => onClick(patient)}
      className={`cursor-pointer rounded-2xl border p-4 transition duration-200 hover:-translate-y-1 hover:border-cyan-300/40 ${isSelected ? "border-cyan-300/70 bg-cyan-500/10 shadow-lg shadow-cyan-500/10" : "border-white/10 bg-slate-950/45"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{patient.identity_key}</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{patient.resolved_name ?? patient.name}</h2>
        </div>

        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${riskClasses[patient.risk_level] ?? riskClasses.UNKNOWN}`}>
          {patient.risk_level ?? "UNKNOWN"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Age</p>
          <p className="mt-1 text-white">{patient.age}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ward</p>
          <p className="mt-1 text-white">{patient.ward}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">BPM</p>
          <p className="mt-1 text-white">{patient.decoded_bpm ?? "--"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">SpO2</p>
          <p className="mt-1 text-white">{patient.spO2 ?? "--"}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">Risk score {patient.risk_score ?? "--"} | {patient.alert_reason ?? "monitoring"}</p>
    </div>
  );
}