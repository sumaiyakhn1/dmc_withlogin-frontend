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
  const [data, setData] = useState<LoginResponse | null>(null);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

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
        setData(res);
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {!data ? (
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
        <div className="login-card success-card">
          <h2>Login Successful 🎉</h2>

          <p><strong>Name:</strong> {data.name}</p>
          <p><strong>Roll No:</strong> {data.regNo}</p>

          <p><strong>Session List:</strong></p>
          <ul>
            {data.sessionList.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <button onClick={() => setData(null)}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
