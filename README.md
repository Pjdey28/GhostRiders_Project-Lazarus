# Project Lazarus

Project Lazarus is a full-stack ICU early warning dashboard that combines patient demographics, telemetry logs, and prescription audit data into a single interactive monitoring interface. The system resolves identity collisions in ghost patient data, decodes telemetry in real-time, and streams live updates to clinicians with risk scoring and alert detection.

## Project Overview

**Phase 1: Foundation & Core Dashboard**
- Built initial React dashboard with patient search, filtering, and pagination
- Integrated backend Flask API with CSV data preprocessing
- Decoded hexadecimal heart rate values to BPM in telemetry data
- Implemented medication decryption using age-based shift ciphers
- Created multi-panel UI: Patient cards, Vitals charts (Recharts), Medication table, Alerts panel, and Timeline
- Added selection drawer to view detailed patient information
- Implemented role-based filtering and ward-based organization

**Phase 2: Live Streaming & Real-Time Monitoring**
- Integrated Socket.IO for WebSocket-based real-time data streaming
- Implemented parity-based ghost identity collision resolution to create accurate patient records
- Added live risk scoring model that evaluates each telemetry packet
- Built rolling risk history tracking with HIGH/MEDIUM/LOW classification
- Developed live telemetry stream emitting every 5 seconds (tuned for readability vs responsiveness)
- Enhanced timeline with live alert feed showing risk events
- Optimized frontend components to handle live updates without re-rendering on every packet
- Added connection status indicators (live/connecting/offline)

## Tech Stack

- Frontend: React (Create React App), Axios, Recharts, Tailwind CSS
- Backend: Flask, Flask-CORS, Pandas, NumPy
- Data: CSV files under backend/data

## Repository Structure

- backend: Flask API, preprocessing, and source datasets
- frontend: React application and dashboard UI

## How It Works

### Data Pipeline

1. **Load & Parse**: backend/preprocess.py loads three source CSV files:
   - patient_demographics.csv (ghost_id, name, age, ward)
   - prescription_audit.csv (medication records with encrypted names)
   - telemetry_logs.csv (raw vital signs with hex-encoded heart rates)

2. **Decode Telemetry**: Convert hexadecimal BPM values to decimal for readability

3. **Interpolate Missing Data**: Fill gaps in SpO2 measurements within each patient timeline using linear interpolation

4. **Decrypt Medications**: Resolve scrambled medication names using a Caesar cipher with patient age as the shift key

5. **Resolve Identity Collisions**: Ghost IDs may collide due to data encoding errors. Match collisions by comparing parity (even/odd) of decoded BPM values and map to correct ward assignments

6. **Build Monitoring State**: Merge processed data into unified records with patient info, vitals, medications, and alerts ready for the dashboard

### Real-Time Processing

1. **Live Snapshot**: When a client connects, the backend sends a complete dashboard snapshot via `icu_snapshot` event (full patient list, alerts, medications)

2. **Telemetry Stream**: Backend continuously broadcasts `icu_packet` events every 5 seconds, cycling through telemetry records

3. **Risk Scoring**: Each incoming packet is evaluated against thresholds:
   - HIGH: BPM > 120 or SpO2 < 92 or risk_score > 0.7
   - MEDIUM: BPM 100-120 or SpO2 92-95 or risk_score 0.5-0.7
   - LOW: Otherwise

4. **Frontend Updates**: React components subscribe to Socket.IO events and update charts, timeline, and alerts in real-time without full page reloads

### Architecture Flow

```
CSV Files → Preprocess → Merge & Enrich → API Endpoints & WebSocket Stream → React Dashboard
                                                                           ↓
                                                                    Live Charts & Timeline
```

## API Endpoints

Base URL: http://127.0.0.1:5000

**REST Endpoints:**
- GET /snapshot: Full dashboard payload including all patients, alerts, medications, timeline, and risk data
- GET /patients: Complete patient registry with resolved ghost IDs, names, ages, and wards
- GET /vitals: Recent telemetry timeline (BPM, SpO2, risk scores)
- GET /medications: Resolved medication records for all patients
- GET /alerts: High-risk alert feed with timestamps and risk levels
- GET /risk: Latest per-patient risk summary with scores and classifications

**WebSocket Events (Socket.IO):**
- `icu_snapshot`: Emitted on client connect; contains full initial dashboard state
- `icu_packet`: Emitted every 5 seconds; contains a single telemetry record with BPM, SpO2, risk_score, patient identity, and alert metadata
- Connection status events: Clients can listen for `connect`, `disconnect`, and `connect_error` to track session state

**Live Stream Cadence:** Telemetry updates stream at 5-second intervals, allowing 12 data points per patient per minute while balancing responsiveness and readability.

## Local Setup

### 1) Backend Setup

From the backend directory:

1. python -m venv venv
2. On Windows PowerShell: .\\venv\\Scripts\\Activate.ps1
3. pip install -r requirements.txt
4. python app.py

Backend runs at http://127.0.0.1:5000

The backend now requires Flask-SocketIO and Simple-WebSocket support, so keep the virtual environment active when starting it.

### 2) Frontend Setup

From the frontend directory:

1. npm install
2. npm start

Frontend typically runs at http://localhost:3000

If port 3000 is busy, run on another port in PowerShell:

1. $env:PORT=3001
2. npm start

## Build

From the frontend directory:

1. npm run build

## Key UI Behavior

- Project Lazarus dashboard header with overview counts
- Patient search by ID, name, ward, or age
- Pagination controls (Prev/Next and 10 or 20 rows per page)
- Select a patient card or alert to focus related data
- Vitals chart updates based on selected patient
- Medication table filters by selected patient

## Data Files

- backend/data/patient_demographics.csv
- backend/data/telemetry_logs.csv
- backend/data/prescription_audit.csv

## Notes and Troubleshooting

- If Tailwind classes do not appear:
	1. Confirm frontend/src/index.css includes Tailwind directives.
	2. Confirm frontend/tailwind.config.js content paths include src files.
	3. Restart the frontend dev server.
- If you see CORS errors, ensure backend is running before frontend.
- Some Node deprecation warnings may appear during CRA development builds; they do not block the app.

## Future Improvements

- Server-side pagination and filtering for large datasets
- Authentication and role-based views
- Persistent patient detail history
- Alert acknowledgement workflow
- Unit and integration test expansion

