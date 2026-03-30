import { useEffect, useState } from "react";

export default function MedTable({ meds, selected }) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = selected
    ? meds.filter(m => m.ghost_id === selected.ghost_id)
    : meds;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, [selected, pageSize]);

  return (
    <div className="glass p-4 overflow-auto max-h-[400px]">
      <h2 className="mb-1 text-lg font-semibold">Project Lazarus - Pharmacy Portal</h2>
      <p className="mb-2 text-sm text-slate-800">
        Showing {paged.length ? start + 1 : 0}-{Math.min(start + pageSize, filtered.length)} of {filtered.length} medication records{selected ? ` for ${selected.ghost_id}` : ""}
      </p>

      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
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

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th>Ghost ID</th>
            <th>Scrambled</th>
            <th>Decrypted</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((m, i) => (
            <tr key={i} className="border-t border-white/10">
              <td>{m.ghost_id}</td>
              <td>{m.scrambled_med}</td>
              <td>{m.decrypted_med}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!filtered.length && (
        <div className="mt-3 rounded-lg border border-white/20 bg-white/10 p-3 text-sm">
          No medication records available for this patient.
        </div>
      )}
    </div>
  );
}