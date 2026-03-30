import React, { useEffect, useState } from "react";
import { Grid, Box } from "@mui/material";
import { getPatients, getVitals, getMeds, getAlerts, getRisk } from "../api/api";

import KPI from "../components/KPI";
import VitalsChart from "../components/VitalsChart";
import MedTable from "../components/MedTable";
import Alerts from "../components/Alerts";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [meds, setMeds] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [risk, setRisk] = useState([]);

  useEffect(() => {
    getPatients().then(res => setPatients(res.data));
    getVitals().then(res => setVitals(res.data));
    getMeds().then(res => setMeds(res.data));
    getAlerts().then(res => setAlerts(res.data));
    getRisk().then(res => setRisk(res.data));
  }, []);

  const avgBPM = Math.round(
    vitals.reduce((sum, v) => sum + (v.decoded_bpm || 0), 0) / vitals.length
  );

  const avgSpO2 = Math.round(
    vitals.reduce((sum, v) => sum + (v.spO2 || 0), 0) / vitals.length
  );

  const highRisk = risk.filter(r => r.risk === "HIGH").length;

  return (
    <Box display="flex">
      <Sidebar />

      <Box flex={1} p={3}>
        <Topbar />

        <Grid container spacing={2}>
          <Grid item xs={3}><KPI title="Patients" value={patients.length} /></Grid>
          <Grid item xs={3}><KPI title="Avg BPM" value={avgBPM} /></Grid>
          <Grid item xs={3}><KPI title="Avg SpO2" value={`${avgSpO2}%`} /></Grid>
          <Grid item xs={3}><KPI title="High Risk" value={highRisk} /></Grid>
        </Grid>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={8}>
            <VitalsChart data={vitals} />
          </Grid>
          <Grid item xs={4}>
            <Alerts alerts={alerts} />
          </Grid>

          <Grid item xs={12}>
            <MedTable meds={meds} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}