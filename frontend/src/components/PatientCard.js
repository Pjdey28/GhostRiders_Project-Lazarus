export default function PatientCard({ patient, onClick }) {
  return (
    <div
      onClick={() => onClick(patient)}
      className="glass p-4 cursor-pointer hover:scale-105 transition"
    >
      <h2 className="text-lg font-semibold">{patient.name}</h2>
      <p className="text-sm opacity-80">Age: {patient.age}</p>
      <p className="text-sm">{patient.ward}</p>
    </div>
  );
}