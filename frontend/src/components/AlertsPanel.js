import { useEffect, useState } from "react";

export default function AlertsPanel({ alerts, onSelectIdentity }) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(alerts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paged = alerts.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, [alerts.length, pageSize]);

  return (
    <div className="glass flex max-h-[800px] flex-col p-4">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Automated Alert Feed</h2>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Triage</span>
      </div>
      <p className="mb-2 text-sm text-slate-300">
        Showing {paged.length ? start + 1 : 0}-{Math.min(start + pageSize, alerts.length)} of {alerts.length} live events
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="rounded-md border border-white/10 bg-slate-950/70 px-2 py-1 text-white"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
        </select>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-slate-200">Page {currentPage} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {paged.map((a, i) => (
          <div
            key={`${a.packet_id ?? i}-${i}`}
            onClick={() => onSelectIdentity(a.identity_key)}
            className="mb-2 cursor-pointer rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 transition hover:bg-rose-500/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">{a.resolved_name ?? a.identity_key}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-rose-100/70">{a.identity_key}</div>
              </div>
              <div className="rounded-full border border-rose-300/20 bg-rose-400/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-100">
                {a.risk_level}
              </div>
            </div>
            <div className="mt-2 text-sm text-slate-100">BPM {a.decoded_bpm} | SpO2 {a.spO2}</div>
            <div className="mt-1 text-xs text-slate-300">{a.alert_reason}</div>
          </div>
        ))}

        {!alerts.length && (
          <div className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-white">
            No critical alerts right now.
          </div>
        )}
      </div>
    </div>
  );
}