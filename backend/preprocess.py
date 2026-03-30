import pandas as pd

def load_and_process():
    dem = pd.read_csv('data/patient_demographics.csv')
    tele = pd.read_csv('data/telemetry_logs.csv')
    pres = pd.read_csv('data/prescription_audit.csv')

    # Ward mapping
    dem['ward'] = dem['parity_group'].map({0: 'Ward A', 1: 'Ward B'})

    # Decode heart rate
    def safe_hex(x):
        try:
            return int(x, 16)
        except:
            return None

    tele['decoded_bpm'] = tele['heart_rate_hex'].apply(safe_hex)

    # Interpolate oxygen
    tele['spO2'] = tele.groupby('ghost_id')['spO2'].transform(lambda x: x.interpolate())

    # Merge age for decryption
    pres = pres.merge(dem[['ghost_id', 'age']], on='ghost_id', how='left')

    # Decrypt meds
    def decrypt_med(med, age):
        if pd.isna(med) or pd.isna(age):
            return med
        
        shift = int(age) % 26
        result = ""
        for ch in med:
            if ch.isalpha():
                result += chr((ord(ch.lower()) - 97 - shift) % 26 + 97)
            else:
                result += ch
        return result

    pres['decrypted_med'] = pres.apply(
        lambda x: decrypt_med(x['scrambled_med'], x['age']), axis=1
    )
    def predict_risk(row):
        bpm = row['decoded_bpm']
        spo2 = row['spO2']
        if bpm == "Unknown" or spo2 == "Unknown":
            return "Unknown"
        if bpm > 110 or spo2 < 92:
            return "HIGH"
        elif bpm < 60:
            return "MEDIUM"
        return "NORMAL"
    # Merge all
    master = tele.merge(dem, on='ghost_id', how='left')
    master = master.merge(pres[['ghost_id', 'scrambled_med', 'decrypted_med']], on='ghost_id', how='left')
    master['risk'] = master.apply(predict_risk, axis=1)
    return master.fillna("Unknown")