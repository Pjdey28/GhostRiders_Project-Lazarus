from flask import Flask, jsonify
from flask_cors import CORS
from preprocess import load_and_process

app = Flask(__name__)
CORS(app)

data = load_and_process()

@app.route('/patients', methods=['GET'])
def get_patients():
    patients = data[['ghost_id', 'name', 'age', 'ward']].drop_duplicates()
    return jsonify(patients.to_dict(orient='records'))

@app.route('/vitals', methods=['GET'])
def get_vitals():
    vitals = data[['ghost_id', 'decoded_bpm', 'spO2']]
    return jsonify(vitals.to_dict(orient='records'))

@app.route('/medications', methods=['GET'])
def get_meds():
    meds = data[['ghost_id', 'scrambled_med', 'decrypted_med']]
    return jsonify(meds.to_dict(orient='records'))

@app.route('/alerts', methods=['GET'])
def get_alerts():
    alerts = data[(data['decoded_bpm'] != "Unknown") & 
                  ((data['decoded_bpm'] < 60) | (data['decoded_bpm'] > 100))]
    return jsonify(alerts.to_dict(orient='records'))

@app.route('/risk', methods=['GET'])
def get_risk():
    return jsonify(data[['ghost_id', 'risk']].to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)