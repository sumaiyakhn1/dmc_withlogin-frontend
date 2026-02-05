import { useState } from "react";
import "./App.css";

interface LoginResponse {
  name: string;
  regNo: string;
  sessionList: string[];
}

function App() {
  const [rollNumber, setRollNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loginData, setLoginData] = useState<LoginResponse | null>(null);
  const [selectedSession, setSelectedSession] = useState("");
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // YYYY-MM-DD → 01-Mar-2005
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setLoginData(null);
    setStudentDetails(null);

    try {
      const response = await fetch(
        "https://dmc-withlogin-backend.onrender.com/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            login_id: rollNumber,
            password: formatDate(birthday),
          }),
        }
      );

      const res = await response.json();

      if (!response.ok) {
        setError(res.detail || "Login failed");
      } else {
        setLoginData(res);
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH STUDENT DETAILS ----------------
  const fetchStudentDetails = async () => {
    if (!loginData || !selectedSession) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://dmc-withlogin-backend.onrender.com/student/details?regNo=${loginData.regNo}&session=${encodeURIComponent(
          selectedSession
        )}`
      );

      const json = await res.json();

      if (!res.ok) {
        setError("Failed to fetch student details");
      } else {
        setStudentDetails(json);
      }
    } catch {
      setError("Server error while fetching details");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="login-container">
      {!loginData ? (
        // -------- LOGIN CARD --------
        <form onSubmit={handleLogin} className="login-card">
          <h2>Student Login</h2>

          <label>Roll Number</label>
          <input
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
          />

          <label>Date of Birth</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <p className="error">{error}</p>}
        </form>
      ) : (
        // -------- DASHBOARD --------
        <div className="login-card success-card">
          <h2>Welcome 🎉</h2>

          <p><strong>Name:</strong> {loginData.name}</p>
          <p><strong>Roll No:</strong> {loginData.regNo}</p>

          <label>Select Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">-- Select --</option>
            {loginData.sessionList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            onClick={fetchStudentDetails}
            disabled={!selectedSession || loading}
          >
            {loading ? "Loading..." : "View Details"}
          </button>

          {error && <p className="error">{error}</p>}

          {/* -------- STUDENT DETAILS -------- */}
          {studentDetails && (
            <div className="details-container">
              <div className="details-section basic-info">
                <h3>Basic Details</h3>
                <p><strong>Name:</strong> {studentDetails.basic.name}</p>
                <p><strong>Roll No:</strong> {studentDetails.basic.regNo}</p>
                <p><strong>Gender:</strong> {studentDetails.basic.gender}</p>
              </div>

              <div className="details-section academic-info">
                <h3>Academic Details</h3>
                <p><strong>Course:</strong> {studentDetails.academic.course}</p>
                <p><strong>Stream:</strong> {studentDetails.academic.stream}</p>
                <p><strong>Semester:</strong> {studentDetails.academic.batch}</p>
                <p><strong>Section:</strong> {studentDetails.academic.section}</p>
                <p><strong>Session:</strong> {studentDetails.academic.session}</p>
              </div>

              <div className="details-section subject-info">
                <h3>Subjects</h3>
                <ul className="subjects-list">
                  {studentDetails.subjects.map((sub: any, idx: number) => (
                    <li key={idx}>
                      {sub.name} <small>({sub.mode})</small>
                    </li>
                  ))}
                </ul>
              </div>

              {/* <div className="details-section fee-info">
                <h3>Fee Summary</h3>
                <div className="fee-card total">Total: ₹{studentDetails.fee.total}</div>
                <div className="fee-card paid">Paid: ₹{studentDetails.fee.paid}</div>
                <div className="fee-card due">Due: ₹{studentDetails.fee.due}</div>
              </div> */}
            </div>
          )}



          <button
            className="logout"
            onClick={() => {
              setLoginData(null);
              setStudentDetails(null);
              setSelectedSession("");
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
