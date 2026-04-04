import eventlet

eventlet.monkey_patch()

import threading
import time

from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from preprocess import build_monitoring_state, json_safe_value, to_records


app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

monitoring_state = build_monitoring_state()
stream_frame = monitoring_state["telemetry"].reset_index(drop=True)
stream_cursor = 0
stream_started = False
stream_lock = threading.Lock()


def build_snapshot():
    return {
        "summary": monitoring_state["summary"],
        "patients": to_records(monitoring_state["patients"]),
        "medications": to_records(monitoring_state["medications"]),
        "telemetry": to_records(monitoring_state["telemetry"]),
        "alerts": to_records(monitoring_state["alerts"]),
        "timeline": to_records(monitoring_state["timeline"]),
        "risk_history": to_records(monitoring_state["risk_history"]),
        "latest_risk": to_records(monitoring_state["latest_risk"]),
    }


def row_to_record(row):
    return {
        key: json_safe_value(value)
        for key, value in row.to_dict().items()
    }


def ensure_streaming():
    global stream_started

    if stream_started:
        return

    stream_started = True

    def broadcast():
        global stream_cursor

        while True:
            with stream_lock:
                row = stream_frame.iloc[stream_cursor % len(stream_frame)]
                stream_cursor += 1

            socketio.emit("icu_packet", row_to_record(row))
            time.sleep(1)

    thread = threading.Thread(target=broadcast, daemon=True)
    thread.start()


@app.route("/snapshot", methods=["GET"])
def get_snapshot():
    return jsonify(build_snapshot())


@app.route("/patients", methods=["GET"])
def get_patients():
    return jsonify(to_records(monitoring_state["patients"]))


@app.route("/vitals", methods=["GET"])
def get_vitals():
    return jsonify(to_records(monitoring_state["timeline"]))


@app.route("/medications", methods=["GET"])
def get_meds():
    return jsonify(to_records(monitoring_state["medications"]))


@app.route("/alerts", methods=["GET"])
def get_alerts():
    return jsonify(to_records(monitoring_state["alerts"]))


@app.route("/risk", methods=["GET"])
def get_risk():
    return jsonify(to_records(monitoring_state["latest_risk"]))


@socketio.on("connect")
def handle_connect():
    ensure_streaming()
    emit("icu_snapshot", build_snapshot())


if __name__ == "__main__":
    ensure_streaming()
    socketio.run(app, debug=True)