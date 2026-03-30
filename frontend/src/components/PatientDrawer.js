export default function PatientDrawer({ patient, onClose }) {
  if (!patient) return null;

  const isCritical =
    patient.decoded_bpm < 60 || patient.decoded_bpm > 100;

  return (
    <div className="fixed right-0 top-0 w-80 bg-blue-800 p-5 shadow-lg text-white">
      <button onClick={onClose} className="mb-4">Close</button>

      <h2 className="text-xl font-bold">{patient.name}</h2>

      <p className="mt-2">Age: {patient.age}</p>
      <p>Ward: {patient.ward}</p>

      <p className="mt-3">BPM: {patient.decoded_bpm}</p>
      <p>SpO2: {patient.spO2}</p>

      <p className={`mt-4 font-bold ${isCritical ? "text-red-500" : "text-green-400"}`}>
        {isCritical ? "CRITICAL" : "NORMAL"}
      </p>
    </div>
  );
}