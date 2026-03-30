import { useEffect, useState } from "react";
import {
  getPatients, getVitals, getMeds, getAlerts
} from "../api/api";

import PatientCard from "../components/PatientCard";
import AlertsPanel from "../components/AlertsPanel";
import VitalsChart from "../components/VitalsChart";
import MedTable from "../components/MedTable";
import PatientDrawer from "../components/PatientDrawer";
export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [meds, setMeds] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientPageSize, setPatientPageSize] = useState(10);
  const [patientPage, setPatientPage] = useState(1);

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getPatients().then(r => setPatients(r.data));
    getVitals().then(r => setVitals(r.data));
    getMeds().then(r => setMeds(r.data));
    getAlerts().then(r => setAlerts(r.data));
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const term = patientQuery.trim()
    .toLowerCase();
    if (!term) return true;

    return [
      patient.ghost_id,
      patient.name,
      patient.ward,
      String(patient.age),
    ]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  const totalPatientPages = Math.max(1, Math.ceil(filteredPatients.length / patientPageSize));
  const currentPatientPage = Math.min(patientPage, totalPatientPages);
  const patientPageStart = (currentPatientPage - 1) * patientPageSize;
  const pagedPatients = filteredPatients.slice(patientPageStart, patientPageStart + patientPageSize);

  useEffect(() => {
    setPatientPage(1);
  }, [patientQuery, patientPageSize]);

  const handleSelectByGhostId = (ghostId) => {
    const patientInfo =
      patients.find((patient) => patient.ghost_id === ghostId) || {
        ghost_id: ghostId,
        name: ghostId,
        age: "N/A",
        ward: "Unknown",
      };

    const latestVital = [...vitals]
      .reverse()
      .find((entry) => entry.ghost_id === ghostId);

    setSelected({
      ...patientInfo,
      decoded_bpm: latestVital?.decoded_bpm ?? "Unknown",
      spO2: latestVital?.spO2 ?? "Unknown",
    });
  };

  const handleSelectPatient = (patient) => {
    handleSelectByGhostId(patient.ghost_id);
  };

  return (
    <div className="p-4 space-y-5">
      <header className="glass p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-600">Intelligence Dashboard</p>
            <h1 className="text-3xl font-extrabold text-black">Project Lazarus</h1>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div className="rounded-lg bg-white/10 px-3 py-2">Patients: {patients.length}</div>
            <div className="rounded-lg bg-white/10 px-3 py-2">Vitals: {vitals.length}</div>
            <div className="rounded-lg bg-white/10 px-3 py-2">Meds: {meds.length}</div>
            <div className="rounded-lg bg-white/10 px-3 py-2">Alerts: {alerts.length}</div>
          </div>
        </div>
      </header>

      <section className="glass p-4">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold">Project Lazarus - Patients</h2>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <input
              type="text"
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
              placeholder="Search by ID, name, ward, or age"
              className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-300 md:w-96"
            />

            <select
              value={patientPageSize}
              onChange={(e) => setPatientPageSize(Number(e.target.value))}
              className="rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        </div>

        <div className="mb-2 flex flex-col gap-2 text-sm text-slate-800 md:flex-row md:items-center md:justify-between">
          <span>
            Showing {pagedPatients.length ? patientPageStart + 1 : 0}-{Math.min(patientPageStart + patientPageSize, filteredPatients.length)} of {filteredPatients.length} filtered patients
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPatientPage((p) => Math.max(1, p - 1))}
              disabled={currentPatientPage === 1}
              className="rounded-md border border-white/20 bg-white/10 px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <span>Page {currentPatientPage} / {totalPatientPages}</span>
            <button
              onClick={() => setPatientPage((p) => Math.min(totalPatientPages, p + 1))}
              disabled={currentPatientPage === totalPatientPages}
              className="rounded-md border border-white/20 bg-white/10 px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pagedPatients.map((patient, i) => (
            <PatientCard key={`${patient.ghost_id}-${i}`} patient={patient} onClick={handleSelectPatient} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <VitalsChart data={vitals} selected={selected} />
        </div>

        <div className="col-span-4">
          <AlertsPanel alerts={alerts} onSelectGhost={handleSelectByGhostId} />
        </div>

        <div className="col-span-12">
          <MedTable meds={meds} selected={selected} />
        </div>
      </div>

      <PatientDrawer
        patient={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}