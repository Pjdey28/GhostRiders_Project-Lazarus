import axios from "axios";

const API = "http://127.0.0.1:5000";

export const getPatients = () => axios.get(`${API}/patients`);
export const getVitals = () => axios.get(`${API}/vitals`);
export const getMeds = () => axios.get(`${API}/medications`);
export const getAlerts = () => axios.get(`${API}/alerts`);
export const getRisk = () => axios.get(`${API}/risk`);