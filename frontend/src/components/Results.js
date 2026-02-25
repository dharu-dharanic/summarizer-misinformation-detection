
import React, { useState } from "react";
import { FiDownload, FiAlertCircle } from "react-icons/fi";

const Results = ({ result, mode }) => {
  const [activeTab, setActiveTab] = useState("summary");

  const downloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([result.summary || ""], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "summary.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="results-card">

      {/* Tabs */}
      <div className="tab-container">
        <div
          className={`tab-item ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </div>
        <div
          className={`tab-item ${activeTab === "fake" ? "active" : ""}`}
          onClick={() => setActiveTab("fake")}
        >
          Fake Data
        </div>
      </div>

      {/* Summary Panel */}
      {activeTab === "summary" && (
        <div className={`panel panel-summary ${mode}-mode`} style={{ position: "relative" }}>
          {result.summary && (
            <FiDownload
              size={22}
              className="download-icon"
              onClick={downloadSummary}
              title="Download Summary"
            />
          )}
          <p className="summary-text">{result.summary || "No summary generated."}</p>
        </div>
      )}

      {/* Fake Data Panel */}
      {activeTab === "fake" && (
        <div className={`panel panel-fake ${mode}-mode`}>
          {result.fake_sentences && result.fake_sentences.length > 0 ? (
            <>
              {/* Fake Sentences */}
              <ul className="fake-list">
                {result.fake_sentences.map((sentence, idx) => (
                  <li key={idx}>
                    <FiAlertCircle className="fake-icon" />
                    {sentence}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="no-fake">No fake data detected.</p>
          )}
        </div>
      )}

      {/* CSS */}
      <style>{`
        .results-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px;
          border-radius: 15px;
          background: ${mode === "light" ? "#fdf6e3" : "#3a3a4e"};
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        /* Tabs */
        .tab-container {
          display: flex;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 2px solid ${mode === "light" ? "#9b59b6" : "#8e44ad"};
        }
        .tab-item {
          flex: 1;
          text-align: center;
          padding: 12px 0;
          cursor: pointer;
          transition: all 0.3s ease;
          border-right: 2px solid ${mode === "light" ? "#9b59b6" : "#8e44ad"};
        }
        .tab-item:last-child { border-right: none; }
        .tab-item.active {
          background: ${mode === "light" ? "#9b59b6" : "#8e44ad"};
          color: #fff;
          font-weight: 600;
        }
        .tab-item:hover {
          background: ${mode === "light" ? "#8e44ad" : "#7d3c98"};
          color: #fff;
        }

        /* Panels */
        .panel {
          padding: 40px 25px 25px 25px;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
        }
        .panel-summary {
          background: ${mode === "light" ? "#f6eaf8" : "#5b3b7a"};
          color: ${mode === "light" ? "#7d3c98" : "#fff"};
        }
        .panel-fake {
          background: ${mode === "light" ? "#fff0f0" : "#7a2b2b"};
          color: ${mode === "light" ? "#c0392b" : "#ffc7c7"};
        }

        /* Download Icon */
        .download-icon {
          position: absolute;
          top: 12px;
          right: 15px;
          cursor: pointer;
          color: ${mode === "light" ? "#7d3c98" : "#ffc7f5"};
          transition: all 0.3s ease;
          z-index: 10;
        }
        .download-icon:hover { transform: scale(1.2); opacity: 0.85; }

        /* Text Sizes */
        .summary-text { font-size: 1.15rem; line-height: 1.6; }

        /* Fake list */
        .fake-list { padding-left: 0; }
        .fake-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          font-size: 1.1rem;
          line-height: 1.6;
        }
        .fake-icon {
          flex-shrink: 0;
          color: ${mode === "light" ? "#e74c3c" : "#ffb3b3"};
          font-size: 1.25rem;
        }
        .no-fake {
          font-size: 1.1rem;
          font-style: italic;
          color: ${mode === "light" ? "#555" : "#ccc"};
        }

        /* Risk Level */
        .risk-level {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: ${mode === "light" ? "#c0392b" : "#ffb3b3"};
        }
      `}</style>
    </div>
  );
};

export default Results;
