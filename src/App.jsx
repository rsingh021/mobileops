function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "32px" }}>
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
          MobileOps Dashboard
        </h1>
        <p style={{ color: "#64748b" }}>
          Operations dashboard prototype for a mobile diagnostic imaging company.
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        <div style={cardStyle}>
          <p style={labelStyle}>Pending Orders</p>
          <h2 style={numberStyle}>12</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Scheduled Today</p>
          <h2 style={numberStyle}>4</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Reports Due</p>
          <h2 style={numberStyle}>3</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Billing Pending</p>
          <h2 style={numberStyle}>7</h2>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
          Recent Imaging Orders
        </h2>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={thStyle}>Facility</th>
              <th style={thStyle}>Exam Type</th>
              <th style={thStyle}>Patient</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Billing</th>
            </tr>
          </thead>

          <tbody>
            <tr style={rowStyle}>
              <td style={tdStyle}>Peachtree Rehab Center</td>
              <td style={tdStyle}>Venous Doppler</td>
              <td style={tdStyle}>J.D.</td>
              <td style={tdStyle}>Scheduled</td>
              <td style={tdStyle}>Pending</td>
            </tr>

            <tr style={rowStyle}>
              <td style={tdStyle}>Gwinnett Senior Care</td>
              <td style={tdStyle}>Echocardiogram</td>
              <td style={tdStyle}>M.S.</td>
              <td style={tdStyle}>Report Sent</td>
              <td style={tdStyle}>Ready</td>
            </tr>

            <tr style={rowStyle}>
              <td style={tdStyle}>North Atlanta Rehab</td>
              <td style={tdStyle}>Abdominal Ultrasound</td>
              <td style={tdStyle}>A.K.</td>
              <td style={tdStyle}>Requested</td>
              <td style={tdStyle}>Not Started</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.12)",
  border: "1px solid #e2e8f0",
};

const labelStyle = {
  color: "#64748b",
  fontSize: "14px",
  marginBottom: "8px",
};

const numberStyle = {
  fontSize: "28px",
  fontWeight: "bold",
};

const thStyle = {
  padding: "12px",
  color: "#475569",
  fontSize: "14px",
};

const tdStyle = {
  padding: "12px",
  fontSize: "14px",
};

const rowStyle = {
  borderBottom: "1px solid #f1f5f9",
};

export default App;