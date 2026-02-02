import { useState } from "react";
import "./App.css";

interface Student {
  "Name as per 10th Document": string;
  "Roll Number": number;
}

function App() {
  const [rollNumber, setRollNumber] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Convert YYYY-MM-DD → 01-Mar-2005
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
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
    setStudent(null);

    try {
      const formattedBirthday = formatDate(birthday);

      const response = await fetch(
        "https://dmc-withlogin-backend.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login_id: rollNumber,
            password: formattedBirthday,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Invalid Roll Number or Date of Birth");
      } else {
        setStudent(data.student);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {!student ? (
        <form onSubmit={handleLogin} className="login-card">
          <h2>Student Login</h2>
          <p className="subtitle">Access your student portal</p>

          <label>Roll Number</label>
          <input
            type="text"
            placeholder="Enter roll number"
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
          <p>
            Welcome{" "}
            <strong>{student["Name as per 10th Document"]}</strong>
          </p>
          <p>Roll Number: {student["Roll Number"]}</p>

          <button onClick={() => setStudent(null)}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
