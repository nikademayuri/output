import React, { useState, useEffect } from "react";
import SemiCircleGauge from "./SemiCircleGauge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    org: "St. Mary's Health",
    failureProbability: 27,
    confidence: 82,
    maintenance: {
      recommendation: "Schedule in 2–3 weeks",
      priority: "Medium",
      priorityDesc: "Based on risk & cost",
    },
    inputSnapshot: {
      "Age (months)": 36,
      "Usage hrs/day": 8,
      "Operational hours": 12400,
      "Temperature Avg": "22°C",
      Humidity: "48%",
      "Vibration Avg": "0.35g",
      "Voltage fluctuation": "3.1%",
      "Last repair cost": "$1,250",
      "Errors (24h)": 5,
      "Device type": "MRI",
    },
  });

  // 👇 State for animated gauge (linked to failureProbability)
  const [animatedRisk, setAnimatedRisk] = useState(
    dashboardData.failureProbability
  );

  // Animate gauge when failureProbability changes
  useEffect(() => {
    let start = animatedRisk;
    let end = dashboardData.failureProbability;
    let step = start < end ? 1 : -1;

    if (start === end) return;

    const interval = setInterval(() => {
      start += step;
      setAnimatedRisk(start);
      if (start === end) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [dashboardData.failureProbability]);

  // 🔥 NEW: Update maintenance priority dynamically
  useEffect(() => {
    let priority = "Low";
    let priorityDesc = "Minimal risk detected";

    if (dashboardData.failureProbability >= 80) {
      priority = "High";
      priorityDesc = "Immediate maintenance required";
    } else if (dashboardData.failureProbability >= 50) {
      priority = "Medium";
      priorityDesc = "Based on risk & cost";
    }

    setDashboardData((prev) => ({
      ...prev,
      maintenance: {
        ...prev.maintenance,
        priority,
        priorityDesc,
      },
    }));
  }, [dashboardData.failureProbability]); // 👈 runs whenever probability changes

  function handleRunAgain() {
    setDashboardData((prev) => ({
      ...prev,
      failureProbability: Math.floor(Math.random() * 100), // 👈 drives both card + gauge
      confidence: Math.floor(80 + Math.random() * 20),
    }));
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("MedPredict Maintenance Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Organization: ${dashboardData.org}`, 14, 30);
    doc.text(
      `Failure Probability (30 days): ${dashboardData.failureProbability}%`,
      14,
      38
    );
    doc.text(`Confidence: ${dashboardData.confidence}%`, 14, 46);
    doc.text(
      `Maintenance Recommendation: ${dashboardData.maintenance.recommendation}`,
      14,
      54
    );
    doc.text(
      `Maintenance Priority: ${dashboardData.maintenance.priority}`,
      14,
      62
    );
    doc.text(
      `Priority Description: ${dashboardData.maintenance.priorityDesc}`,
      14,
      70
    );
    doc.text(`Failure Risk: ${dashboardData.failureProbability}%`, 14, 78);

    autoTable(doc, {
      startY: 85,
      head: [["Parameter", "Value"]],
      body: Object.entries(dashboardData.inputSnapshot),
    });

    doc.save("MedPredict_Report.pdf");
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <aside className="sidebar p-4">
        <h2 className="logo mb-5 text-primary">MedPredict</h2>
        <ul className="list-unstyled fs-5">
          <li className="mb-3 active">Home</li>
          <li>Account Settings</li>
        </ul>
      </aside>
      <main className="flex-grow-1 p-4">
        <section className="dashboard-header bg-white rounded-4 shadow-sm px-4 py-3 d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="fs-4 fw-bold text-dark">Prediction Results</span>
            <span className="org-badge ms-3">Org: {dashboardData.org}</span>
          </div>
          <div>
            <button className="btn btn-primary me-2">Model Input</button>
            <button
              className="btn btn-outline-primary me-2"
              onClick={handleRunAgain}
            >
              Run Again
            </button>
            <button className="btn btn-success me-2" onClick={generatePDF}>
              Export
            </button>
            <span className="profile-avatar ms-2"></span>
          </div>
        </section>

        {/* Top cards */}
        <div className="d-flex gap-3 mb-4">
          <div className="card dashboard-card flex-fill">
            <div className="card-title text-secondary fw-semibold">
              Failure Probability (30 days)
            </div>
            <div className="display-5 fw-bold text-dark">
              {dashboardData.failureProbability}%
            </div>
            <div className="text-muted">
              Confidence: {dashboardData.confidence}%
            </div>
          </div>
          <div className="card dashboard-card flex-fill">
            <div className="card-title text-secondary fw-semibold">
              Maintenance Recommendation
            </div>
            <div className="h3 fw-bold text-success">
              {dashboardData.maintenance.recommendation}
            </div>
            <div className="text-muted">Window before peak risk</div>
          </div>
          <div className="card dashboard-card flex-fill">
            <div className="card-title text-secondary fw-semibold">
              Maintenance Priority
            </div>
            <div
              className={`h3 fw-bold ${
                dashboardData.maintenance.priority === "High"
                  ? "text-danger"
                  : dashboardData.maintenance.priority === "Medium"
                  ? "text-warning"
                  : "text-success"
              }`}
            >
              {dashboardData.maintenance.priority}
            </div>
            <div className="text-muted">
              {dashboardData.maintenance.priorityDesc}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="d-flex gap-4">
          {/* Failure Risk Speedometer */}
          <div className="card dashboard-card flex-fill">
            <div className="card-title text-secondary fw-semibold">
              Failure Risk Speedometer
            </div>
            <div className="my-3 px-2 py-5 rounded bg-body-tertiary text-center text-info">
              {/* 👇 animated gauge tied to failureProbability */}
              <SemiCircleGauge percent={animatedRisk} />
            </div>
            <div className="d-flex justify-content-between small text-info mb-2 px-2">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            <div className="fw-bold text-primary text-end">
              {dashboardData.failureProbability}% risk
            </div>
          </div>

          {/* Input Snapshot */}
          <div className="card dashboard-card" style={{ minWidth: "260px" }}>
            <div className="card-title text-info fw-bold mb-2">
              Input Snapshot
            </div>
            <ul className="ps-0 mb-0">
              {Object.entries(dashboardData.inputSnapshot).map(([k, v]) => (
                <li
                  key={k}
                  className="d-flex justify-content-between text-dark fs-6 mb-1"
                >
                  <span>{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
