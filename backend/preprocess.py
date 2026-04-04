from pathlib import Path

import pandas as pd


DATA_DIR = Path(__file__).resolve().parent / "data"
STREAM_START = pd.Timestamp("2026-04-05T06:00:00")


def load_sources():
    dem = pd.read_csv(DATA_DIR / "patient_demographics.csv")
    tele = pd.read_csv(DATA_DIR / "telemetry_logs.csv")
    pres = pd.read_csv(DATA_DIR / "prescription_audit.csv")
    return dem, tele, pres


def safe_hex(value):
    try:
        return int(str(value), 16)
    except (TypeError, ValueError):
        return None


def decrypt_medication(medication, age):
    if pd.isna(medication) or pd.isna(age):
        return medication

    shift = int(age) % 26
    result = []

    for char in str(medication):
        if char.isalpha():
            result.append(chr((ord(char.lower()) - 97 - shift) % 26 + 97))
        else:
            result.append(char)

    return "".join(result)


def risk_score(row):
    bpm = row.get("decoded_bpm")
    spo2 = row.get("spO2")
    age = row.get("age")
    medication_load = row.get("medication_load", 0)

    if pd.isna(bpm) or pd.isna(spo2):
        return None

    score = 0.0

    if bpm < 55:
        score += (55 - bpm) * 1.45
    elif bpm > 110:
        score += 24 + (bpm - 110) * 1.55
    elif bpm < 65:
        score += (65 - bpm) * 0.9
    elif bpm > 95:
        score += (bpm - 95) * 0.5
    else:
        score += abs(bpm - 78) * 0.25

    if spo2 < 92:
        score += (92 - spo2) * 4.5
    elif spo2 < 96:
        score += (96 - spo2) * 1.1

    if age >= 80:
        score += 16
    elif age >= 65:
        score += 11
    elif age >= 50:
        score += 7

    score += min(12, medication_load * 2.5)

    if row.get("identity_parity") is not None and bpm % 2 == row.get("identity_parity"):
        score += 1.5

    return round(min(100, score), 1)


def risk_level(score):
    if score is None:
        return "UNKNOWN"
    if score >= 30:
        return "HIGH"
    if score >= 20:
        return "MEDIUM"
    return "NORMAL"


def alert_reason(row):
    reasons = []
    bpm = row.get("decoded_bpm")
    spo2 = row.get("spO2")

    if bpm is not None:
        if bpm < 60:
            reasons.append("bradycardia")
        elif bpm > 110:
            reasons.append("tachycardia")

    if spo2 is not None and spo2 < 92:
        reasons.append("hypoxemia")

    if row.get("risk_level") == "HIGH":
        reasons.append("escalated risk")

    return ", ".join(reasons) if reasons else "monitoring"


def json_safe_value(value):
    if value is None:
        return None

    if pd.isna(value):
        return None

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    if hasattr(value, "item"):
        try:
            value = value.item()
        except Exception:
            pass

    if isinstance(value, dict):
        return {key: json_safe_value(item) for key, item in value.items()}

    if isinstance(value, list):
        return [json_safe_value(item) for item in value]

    if isinstance(value, tuple):
        return [json_safe_value(item) for item in value]

    return value


def to_records(frame):
    clean = frame.copy()
    records = clean.to_dict(orient="records")
    return [
        {key: json_safe_value(value) for key, value in record.items()}
        for record in records
    ]


def build_monitoring_state(window_size=120):
    dem, tele, pres = load_sources()

    dem = dem.copy()
    tele = tele.copy()
    pres = pres.copy()

    dem["ward"] = dem["parity_group"].map({0: "Ward A", 1: "Ward B"}).fillna("Unknown")
    dem["identity_key"] = dem.apply(
        lambda row: f"{row['ghost_id']}-P{int(row['parity_group'])}", axis=1
    )
    dem["resolved_name"] = dem["name"]

    tele["decoded_bpm"] = tele["heart_rate_hex"].apply(safe_hex)
    tele["identity_parity"] = tele["decoded_bpm"].fillna(0).astype(int) % 2
    tele["spO2"] = pd.to_numeric(tele["spO2"], errors="coerce")
    tele["spO2"] = tele.groupby("ghost_id")["spO2"].transform(
        lambda series: series.interpolate().bfill().ffill()
    )
    tele["timestamp"] = STREAM_START + pd.to_timedelta(tele["packet_id"], unit="s")

    resolved = tele.merge(
        dem,
        left_on=["ghost_id", "identity_parity"],
        right_on=["ghost_id", "parity_group"],
        how="left",
        suffixes=("", "_patient"),
    )
    resolved["identity_key"] = resolved.apply(
        lambda row: f"{row['ghost_id']}-P{int(row['parity_group'])}", axis=1
    )

    med_load = pres.groupby("ghost_id").size().rename("medication_load").reset_index()
    pres = pres.merge(
        dem[["ghost_id", "parity_group", "identity_key", "resolved_name", "age", "ward"]],
        on="ghost_id",
        how="left",
    )
    pres["decrypted_med"] = pres.apply(
        lambda row: decrypt_medication(row["scrambled_med"], row["age"]), axis=1
    )
    pres = pres.merge(med_load, on="ghost_id", how="left")

    resolved = resolved.merge(med_load, on="ghost_id", how="left")
    resolved["medication_load"] = resolved["medication_load"].fillna(0)
    resolved["risk_score"] = resolved.apply(risk_score, axis=1)
    resolved["risk_level"] = resolved["risk_score"].apply(risk_level)
    resolved["alert_reason"] = resolved.apply(alert_reason, axis=1)

    latest_by_identity = resolved.sort_values("timestamp").groupby("identity_key", as_index=False).tail(1)
    patients = dem.merge(
        latest_by_identity[
            [
                "identity_key",
                "decoded_bpm",
                "spO2",
                "risk_score",
                "risk_level",
                "alert_reason",
                "timestamp",
                "packet_id",
                "room_id",
                "medication_load",
            ]
        ],
        on="identity_key",
        how="left",
    )

    patients["status"] = patients["risk_level"].fillna("UNKNOWN")
    patients["condition_tag"] = patients["status"].replace({"UNKNOWN": "WATCH"})

    timeline = resolved.sort_values("timestamp").tail(window_size).copy()
    timeline["event_type"] = timeline["risk_level"].map(
        {"HIGH": "escalation", "MEDIUM": "watch", "NORMAL": "steady"}
    ).fillna("watch")

    alerts = resolved[resolved["risk_level"] == "HIGH"].copy()
    alerts = alerts.sort_values(["risk_score", "timestamp"], ascending=[False, False]).head(window_size)

    risk_history = resolved[
        [
            "timestamp",
            "identity_key",
            "ghost_id",
            "resolved_name",
            "risk_score",
            "risk_level",
            "decoded_bpm",
            "spO2",
        ]
    ].tail(window_size)

    latest_risk = latest_by_identity[
        [
            "identity_key",
            "ghost_id",
            "resolved_name",
            "risk_score",
            "risk_level",
            "decoded_bpm",
            "spO2",
            "timestamp",
        ]
    ].copy()

    summary = {
        "patient_count": int(len(patients)),
        "telemetry_count": int(len(resolved)),
        "critical_alerts": int(len(alerts)),
        "high_risk_patients": int((latest_risk["risk_level"] == "HIGH").sum()),
        "watch_patients": int((latest_risk["risk_level"] == "MEDIUM").sum()),
        "normal_patients": int((latest_risk["risk_level"] == "NORMAL").sum()),
        "average_risk_score": round(float(latest_risk["risk_score"].fillna(0).mean()), 1),
    }

    return {
        "patients": patients.sort_values(["risk_score", "ghost_id"], ascending=[False, True]),
        "medications": pres.sort_values(["identity_key", "rx_id"]),
        "telemetry": resolved.sort_values("timestamp"),
        "alerts": alerts,
        "timeline": timeline,
        "risk_history": risk_history,
        "latest_risk": latest_risk.sort_values(["risk_score", "ghost_id"], ascending=[False, True]),
        "summary": summary,
    }