import { useEffect, useState } from "react";

export default function AlertsPanel({ alerts, onSelectGhost }) {
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
    <div className="glass p-4 max-h-[420px] overflow-auto">
      <h2 className="text-lg font-semibold mb-1">Project Lazarus - Critical Alerts</h2>
      <p className="mb-2 text-sm text-slate-300">
        Showing {paged.length ? start + 1 : 0}-{Math.min(start + pageSize, alerts.length)} of {alerts.length} critical events
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="rounded-md border border-white/20 bg-slate-900/60 px-2 py-1 text-white"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
        </select>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-slate-200">Page {currentPage} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {paged.map((a, i) => (
        <div
          key={i}
          onClick={() => onSelectGhost(a.ghost_id)}
          className="bg-red-500/20 border-l-4 border-red-500 p-2 mb-2 cursor-pointer hover:bg-red-500/30 transition"
        >
          <div className="text-sm font-semibold">{a.ghost_id}</div>
          <div className="text-sm">BPM: {a.decoded_bpm}</div>
        </div>
      ))}

      {!alerts.length && (
        <div className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm">
          No critical alerts right now.
        </div>
      )}
    </div>
  );
}