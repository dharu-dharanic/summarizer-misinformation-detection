import React, { useEffect, useState } from "react";

const RiskLevel = ({ riskLevel = "low" }) => {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  const level = String(riskLevel).toLowerCase();

  // Convert risk level → percent
  const levelToPercent = {
    low: 20,
    medium: 50,
    high: 85,
  };

  const targetPercent = levelToPercent[level] || 0;

  // Pick color
  const getColor = () => {
    if (level === "high") return "#e74c3c";     // red
    if (level === "medium") return "#f1c40f";   // yellow
    return "#2ecc71";                           // green
  };

  // Animate pointer
  useEffect(() => {
    setAnimatedPercent(0);

    const t = setTimeout(() => {
      setAnimatedPercent(targetPercent);
    }, 100);

    return () => clearTimeout(t);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskLevel]); // only depend on riskLevel

  return (
    <div style={{ width: "100%", marginTop: "20px" }}>
      {/* Risk Label */}
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "8px",
          fontSize: "1rem",
          textAlign: "center",
        }}
      >
        Risk Level
      </div>

      {/* Bar Track */}
      <div
        style={{
          width: "100%",
          height: "14px",
          background: "#d0d0d0",
          borderRadius: "10px",
          position: "relative",
        }}
      >
        {/* Filled portion */}
        <div
          style={{
            height: "100%",
            width: `${animatedPercent}%`,
            background: getColor(),
            borderRadius: "10px",
            transition: "width 0.8s ease",
          }}
        ></div>

        {/* Pointer */}
        <div
          style={{
            position: "absolute",
            top: "-6px",
            left: `calc(${animatedPercent}% - 7px)`,
            width: "14px",
            height: "14px",
            background: getColor(),
            borderRadius: "50%",
            border: "2px solid white",
            boxShadow: "0 0 6px rgba(0,0,0,0.5)",
            transition: "left 0.8s ease",
          }}
        ></div>
      </div>

      {/* Text below */}
      <div
        style={{
          marginTop: "10px",
          fontWeight: "bold",
          textAlign: "center",
          color: getColor(),
        }}
      >
        {level.toUpperCase()} • {targetPercent}%
      </div>
    </div>
  );
};

export default RiskLevel;
