# Project Lazarus

Project Lazarus is a full-stack healthcare intelligence dashboard that combines patient demographics, telemetry logs, and prescription audit data into a single interactive monitoring interface.

The backend is a Flask API that preprocesses and serves merged data. The frontend is a React dashboard styled with Tailwind CSS.

## Highlights

- Unified patient intelligence view across demographics, vitals, alerts, and medications
- On-the-fly telemetry decoding (hex heart rate to BPM)
- Medication decryption logic based on patient age
- Risk classification (NORMAL, MEDIUM, HIGH, Unknown)
- Interactive dashboard with search, filters, selection drawer, and pagination controls

## Tech Stack

- Frontend: React (Create React App), Axios, Recharts, Tailwind CSS
- Backend: Flask, Flask-CORS, Pandas, NumPy
- Data: CSV files under backend/data

## Repository Structure

- backend: Flask API, preprocessing, and source datasets
- frontend: React application and dashboard UI

## How It Works

1. backend/preprocess.py loads source CSV files.
2. It maps parity groups to wards.
3. It decodes heart rate from hexadecimal values.
4. It interpolates missing SpO2 values per ghost_id.
5. It decrypts scrambled medication names using a shift derived from age.
6. It merges processed sources into a master dataset and predicts risk.
7. backend/app.py exposes API endpoints used by the frontend.

## API Endpoints

Base URL: http://127.0.0.1:5000

- GET /patients: ghost_id, name, age, ward
- GET /vitals: ghost_id, decoded_bpm, spO2
- GET /medications: ghost_id, scrambled_med, decrypted_med
- GET /alerts: records where decoded_bpm is out of safe range
- GET /risk: ghost_id, risk

## Local Setup

### 1) Backend Setup

From the backend directory:

1. python -m venv venv
2. On Windows PowerShell: .\\venv\\Scripts\\Activate.ps1
3. pip install -r requirements.txt
4. python app.py

Backend runs at http://127.0.0.1:5000

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

## License

This project is intended for educational and prototype use.
