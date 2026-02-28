import React, { useState } from "react";

export default function Results({ result }) {
  const [tab, setTab] = useState("summary");

  const downloadSummary = () => {
    const content = [
      "VERIFAI — ANALYSIS REPORT",
      "=".repeat(40),
      "",
      `Query: ${result.query || "General summary"}`,
      `Risk Level: ${result.risk_level}`,
      `Confidence: ${result.confidence}%`,
      `Word Count: ${result.word_count}`,
      "",
      "SUMMARY",
      "-".repeat(40),
      result.summary || "No summary generated.",
      "",
      "FLAGGED STATEMENTS",
      "-".repeat(40),
      ...(result.fake_sentences?.length
        ? result.fake_sentences.map((s, i) => `${i + 1}. ${s}`)
        : ["No misinformation detected."]),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "verifai-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const riskLevel    = (result.risk_level || "Low").toLowerCase();
  const riskColor    = riskLevel === "high" ? "var(--red)" : riskLevel === "medium" ? "var(--yellow)" : "var(--green)";
  const riskPct      = riskLevel === "high" ? 85 : riskLevel === "medium" ? 50 : 15;
  const fakeCount    = result.fake_sentences?.length || 0;

  return (
    <>
      <style>{`
        /* ── Risk banner ── */
        .risk-banner {
          display: flex;
          align-items: center;
          gap: 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 4px solid ${riskColor};
          border-radius: var(--radius);
          padding: 18px 20px;
          margin-bottom: 20px;
        }
        .risk-badge {
          flex-shrink: 0;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
          background: ${riskColor};
          padding: 4px 12px;
          border-radius: 2px;
        }
        .risk-meter {
          flex: 1;
        }
        .risk-meter-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text2);
          margin-bottom: 5px;
          font-family: var(--font-mono);
        }
        .risk-track {
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }
        .risk-fill {
          height: 100%;
          background: ${riskColor};
          border-radius: 3px;
          width: ${riskPct}%;
          transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        .risk-stats {
          flex-shrink: 0;
          text-align: right;
        }
        .risk-stat-val {
          font-family: var(--font-head);
          font-size: 1.4rem;
          color: ${riskColor};
          line-height: 1;
        }
        .risk-stat-lbl {
          font-size: 0.68rem;
          color: var(--text2);
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── Tabs ── */
        .result-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }
        .result-tab {
          padding: 10px 20px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text2);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.15s;
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
          font-family: var(--font-body);
        }
        .result-tab:hover { color: var(--text); }
        .result-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
          font-weight: 600;
        }
        .tab-badge {
          display: inline-block;
          margin-left: 6px;
          background: var(--accent);
          color: #fff;
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: 10px;
          font-family: var(--font-mono);
          vertical-align: middle;
        }

        /* ── Panels ── */
        .result-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          position: relative;
        }

        /* Summary */
        .summary-text {
          font-size: 1.05rem;
          line-height: 1.75;
          color: var(--text);
        }
        .download-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 500;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text2);
          cursor: pointer;
          transition: all 0.15s;
          font-family: var(--font-body);
        }
        .download-btn:hover { border-color: var(--accent); color: var(--accent); }

        /* Fake sentences */
        .fake-count-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }
        .fake-count-num {
          font-family: var(--font-head);
          font-size: 2rem;
          color: ${fakeCount > 0 ? "var(--red)" : "var(--green)"};
          line-height: 1;
        }
        .fake-count-text {
          font-size: 0.85rem;
          color: var(--text2);
          line-height: 1.4;
        }
        .fake-count-text strong { color: var(--text); display: block; }

        .fake-item {
          display: flex;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
          align-items: flex-start;
        }
        .fake-item:last-child { border-bottom: none; padding-bottom: 0; }
        .fake-num {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--tag-bg);
          border: 1px solid var(--accent);
          color: var(--accent);
          font-size: 0.7rem;
          font-family: var(--font-mono);
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }
        .fake-sentence {
          font-size: 0.95rem;
          line-height: 1.65;
          color: var(--text);
        }

        .no-fake {
          text-align: center;
          padding: 32px;
          color: var(--green);
          font-size: 1rem;
        }
        .no-fake span { font-size: 2rem; display: block; margin-bottom: 8px; }

        /* Confidence bar */
        .confidence-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .confidence-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text2);
          margin-bottom: 6px;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .confidence-track {
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), #e87c73);
          border-radius: 2px;
          width: ${result.confidence}%;
          transition: width 1s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>

      {/* Risk banner */}
      <div className="risk-banner">
        <div className="risk-badge">{result.risk_level || "Low"}</div>
        <div className="risk-meter">
          <div className="risk-meter-label">
            <span>Risk Level</span>
            <span style={{color: riskColor}}>{riskPct}%</span>
          </div>
          <div className="risk-track"><div className="risk-fill" /></div>
        </div>
        <div className="risk-stats">
          <div className="risk-stat-val">{fakeCount}</div>
          <div className="risk-stat-lbl">flags</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="result-tabs">
        <button className={`result-tab ${tab === "summary" ? "active" : ""}`} onClick={() => setTab("summary")}>
          Summary
        </button>
        <button className={`result-tab ${tab === "fake" ? "active" : ""}`} onClick={() => setTab("fake")}>
          Flagged Statements
          {fakeCount > 0 && <span className="tab-badge">{fakeCount}</span>}
        </button>
      </div>

      {/* Summary Panel */}
      {tab === "summary" && (
        <div className="result-panel">
          <button className="download-btn" onClick={downloadSummary}>
            ↓ Download Report
          </button>
          <p className="summary-text">{result.summary || "No summary generated."}</p>
          {result.confidence > 0 && (
            <div className="confidence-section">
              <div className="confidence-label">
                <span>AI Confidence</span>
                <span>{result.confidence}%</span>
              </div>
              <div className="confidence-track">
                <div className="confidence-fill" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fake Panel */}
      {tab === "fake" && (
        <div className="result-panel">
          <div className="fake-count-bar">
            <div className="fake-count-num">{fakeCount}</div>
            <div className="fake-count-text">
              <strong>{fakeCount === 0 ? "All clear" : fakeCount === 1 ? "Statement flagged" : "Statements flagged"}</strong>
              {fakeCount === 0
                ? "No misinformation detected in this document."
                : "These sentences appear false, misleading, or unverifiable."}
            </div>
          </div>

          {fakeCount > 0 ? (
            result.fake_sentences.map((s, i) => (
              <div className="fake-item" key={i}>
                <div className="fake-num">{i + 1}</div>
                <p className="fake-sentence">{s}</p>
              </div>
            ))
          ) : (
            <div className="no-fake">
              <span>✓</span>
              No fake or misleading statements detected.
            </div>
          )}
        </div>
      )}
    </>
  );
}
