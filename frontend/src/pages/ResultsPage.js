import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Results from "../components/Results";
import RiskLevel from "../components/RiskLevel";

const ResultsPage = ({ result, mode }) => {
  const navigate = useNavigate();

  if (!result) return null;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "30px 40px",
        background: mode === "light" ? "#fdf6e3" : "#3a3a4e",
        borderRadius: "15px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        transition: "0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 20px",
            borderRadius: "25px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #9b59b6, #8e44ad)",
            color: "#fff",
            boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
          }}
        >
          ← Back
        </button>

        <div style={{ width: "250px" }}>
          <RiskLevel riskLevel={result.risk_level} />
        </div>
      </div>

      <Results result={result} mode={mode} />
    </div>
  );
};

export default ResultsPage;
