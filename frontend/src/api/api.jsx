import axios from "axios";

const isLocalDev = typeof window !== "undefined" && window.location.port === "3000";

// Prefer explicit env override. Otherwise:
// - local CRA dev server -> backend on localhost:5000
// - Docker/nginx and production reverse-proxy -> same-origin requests
const API = process.env.REACT_APP_API_URL || (isLocalDev ? "http://127.0.0.1:5000" : "");

export const getSnapshot = () => axios.get(`${API}/snapshot`);
export const getPatients = () => axios.get(`${API}/patients`);
export const getVitals = () => axios.get(`${API}/vitals`);
export const getMeds = () => axios.get(`${API}/medications`);
export const getAlerts = () => axios.get(`${API}/alerts`);
export const getRisk = () => axios.get(`${API}/risk`);