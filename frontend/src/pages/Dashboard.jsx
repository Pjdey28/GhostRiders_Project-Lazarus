import { useEffect, useState } from "react";
import { getSnapshot } from "../api/api";

import PatientCard from "../components/PatientCard";
import AlertsPanel from "../components/AlertsPanel";
import VitalsChart from "../components/VitalsChart";
import MedTable from "../components/MedTable";
import PatientDrawer from "../components/PatientDrawer";
import RiskChart from "../components/RiskChart";
import Timeline from "../components/Timeline";
import useIcuStream from "../hooks/useIcuStream";

const VITAL_WINDOW = 36;
const TELEMETRY_BUFFER = 5000; // Keeps ~5 records per patient (10k records / 1000 patients)
const ALERT_WINDOW = 40;
const RISK_WINDOW = 60;

function sortPatients(records) {
  return [...records].sort((left, right) => {
    const leftScore = Number(left.risk_score ?? -1);
    const rightScore = Number(right.risk_score ?? -1);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return String(left.resolved_name ?? left.name ?? left.identity_key ?? "").localeCompare(
      String(right.resolved_name ?? right.name ?? right.identity_key ?? "")
    );
  });
}

function trimWindow(records, size) {
  return records.slice(-size);
}

function upsertPatient(records, packet) {
  const updated = records.map((patient) => {
    if (patient.identity_key !== packet.identity_key) {
      return patient;
    }

    return {
      ...patient,
      decoded_bpm: packet.decoded_bpm,
      spO2: packet.spO2,
      risk_score: packet.risk_score,
      risk_level: packet.risk_level,
      alert_reason: packet.alert_reason,
      timestamp: packet.timestamp,
      packet_id: packet.packet_id,
      room_id: packet.room_id,
      medication_load: packet.medication_load ?? patient.medication_load,
      status: packet.risk_level ?? patient.status,
      condition_tag: packet.risk_level ?? patient.condition_tag,
    };
  });

  return sortPatients(updated);
}

function averageRisk(records) {
  if (!records.length) {
    return 0;
  }

  const total = records.reduce((sum, record) => sum + Number(record.risk_score ?? 0), 0);
  return Math.round((total / records.length) * 10) / 10;
}

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [meds, setMeds] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [riskHistory, setRiskHistory] = useState([]);
  const [summary, setSummary] = useState({});
  const [patientQuery, setPatientQuery] = useState("");
  const [patientPageSize, setPatientPageSize] = useState(10);
  const [patientPage, setPatientPage] = useState(1);
  const [selectedIdentity, setSelectedIdentity] = useState(null);
  const [socketStatus, setSocketStatus] = useState("connecting");

  useEffect(() => {
    getSnapshot().then((response) => {
      const payload = response.data;
      const nextPatients = sortPatients(payload.patients ?? []);

      setPatients(nextPatients);
      setMeds(payload.medications ?? []);
      setTelemetry(payload.telemetry ?? []);
      setAlerts(payload.alerts ?? []);
      setTimeline(payload.timeline ?? []);
      setRiskHistory(payload.risk_history ?? []);
      setSummary(payload.summary ?? {});
    });
  }, []);

  useIcuStream({
    onStatus: setSocketStatus,
    onSnapshot: (payload) => {
      if (payload?.summary) {
        setSummary(payload.summary);
      }

      if (payload?.patients?.length) {
        const nextPatients = sortPatients(payload.patients);
        setPatients(nextPatients);
      }

      if (payload?.medications?.length) {
        setMeds(payload.medications);
      }

      if (payload?.telemetry?.length) {
        setTelemetry(payload.telemetry);
      }

      if (payload?.alerts?.length) {
        setAlerts(payload.alerts.slice(0, ALERT_WINDOW));
      }

      if (payload?.timeline?.length) {
        setTimeline(payload.timeline.slice(-VITAL_WINDOW));
      }

      if (payload?.risk_history?.length) {
        setRiskHistory(payload.risk_history.slice(-RISK_WINDOW));
      }
    },
    onPacket: (packet) => {
      setTelemetry((current) => trimWindow([...current, packet], TELEMETRY_BUFFER));
      setTimeline((current) => trimWindow([...current, packet], VITAL_WINDOW));
      setRiskHistory((current) => trimWindow([...current, packet], RISK_WINDOW));

      if (packet.risk_level === "HIGH") {
        setAlerts((current) => {
          const next = [packet, ...current.filter((item) => item.packet_id !== packet.packet_id)];
          return trimWindow(next, ALERT_WINDOW);
        });
      }

      setPatients((current) => upsertPatient(current, packet));
    },
  });

  const filteredPatients = patients.filter((patient) => {
    const term = patientQuery.trim().toLowerCase();
    if (!term) return true;

    return [
      patient.identity_key,
      patient.ghost_id,
      patient.resolved_name,
      patient.ward,
      patient.risk_level,
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

  const selectedPatient = patients.find((patient) => patient.identity_key === selectedIdentity) ?? null;

  const selectedTimeline = selectedIdentity
    ? telemetry.filter((entry) => entry.identity_key === selectedIdentity)
    : timeline;

  const selectedRiskHistory = selectedIdentity
    ? riskHistory.filter((entry) => entry.identity_key === selectedIdentity)
    : riskHistory;

  const selectedMeds = selectedIdentity
    ? meds.filter((medication) => medication.identity_key === selectedIdentity)
    : meds;

  const livePatientCount = patients.length;
  const liveAverageRisk = averageRisk(patients);

  const liveFeed = selectedIdentity
    ? telemetry.filter((entry) => entry.identity_key === selectedIdentity)
    : timeline;

  const feedAlerts = alerts.length
    ? alerts
    : liveFeed.slice(-10);

  const handleSelectPatient = (patient) => {
    setSelectedIdentity(patient.identity_key);
  };

  return (
    <div className="min-h-screen px-4 py-4 text-slate-100 lg:px-6 lg:py-6">
      <header className="glass relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.15),transparent_28%)]" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              <span className={`h-2 w-2 rounded-full ${socketStatus === "live" ? "bg-emerald-400" : "bg-amber-300"}`} />
              {socketStatus}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">ICU Early Warning System</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">Project Lazarus</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-200 md:text-base">
                Live parity resolution, risk scoring, and triage telemetry for colliding ghost identities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[42rem]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Patients</p>
              <p className="mt-2 text-2xl font-bold text-white">{summary.patient_count ?? livePatientCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Alerts</p>
              <p className="mt-2 text-2xl font-bold text-white">{alerts.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Avg risk</p>
              <p className="mt-2 text-2xl font-bold text-white">{liveAverageRisk}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Feed</p>
              <p className="mt-2 text-2xl font-bold text-white">{timeline.length}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="glass p-4 lg:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Patient registry</h2>
              <p className="text-sm text-slate-300">Resolved by identity parity before each telemetry packet reaches the risk model.</p>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <input
                type="text"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="Search by identity, ghost ID, name, ward, or risk"
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white placeholder:text-slate-400 lg:w-96"
              />

              <select
                value={patientPageSize}
                onChange={(e) => setPatientPageSize(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
              </select>
            </div>
          </div>

          <div className="mb-3 flex flex-col gap-2 text-sm text-slate-300 lg:flex-row lg:items-center lg:justify-between">
            <span>
              Showing {pagedPatients.length ? patientPageStart + 1 : 0}-{Math.min(patientPageStart + patientPageSize, filteredPatients.length)} of {filteredPatients.length} patients
            </span>

            <div className="flex items-center gap-2 text-white">
              <button
                onClick={() => setPatientPage((page) => Math.max(1, page - 1))}
                disabled={currentPatientPage === 1}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-sm text-slate-300">Page {currentPatientPage} / {totalPatientPages}</span>
              <button
                onClick={() => setPatientPage((page) => Math.min(totalPatientPages, page + 1))}
                disabled={currentPatientPage === totalPatientPages}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pagedPatients.map((patient) => (
              <PatientCard
                key={patient.identity_key}
                patient={patient}
                onClick={handleSelectPatient}
                isSelected={patient.identity_key === selectedIdentity}
              />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <RiskChart data={selectedRiskHistory} />
          <AlertsPanel alerts={feedAlerts} onSelectIdentity={setSelectedIdentity} />
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <VitalsChart data={selectedTimeline} selected={selectedPatient} />
        <Timeline history={timeline} selectedIdentity={selectedIdentity} />
      </section>

      <section className="mt-5 glass p-4 lg:p-5">
        <MedTable meds={selectedMeds} selected={selectedPatient} />
      </section>

      <PatientDrawer
        patient={selectedPatient}
        history={selectedTimeline}
        onClose={() => setSelectedIdentity(null)}
      />
    </div>
  );
}
