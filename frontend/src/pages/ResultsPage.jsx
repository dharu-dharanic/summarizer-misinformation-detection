import React from "react";
import { useNavigate } from "react-router-dom";
import Results from "../components/Results";

export default function ResultsPage({ result }) {
  const navigate = useNavigate();

  if (!result) {
    navigate("/");
    return null;
  }

  return (
    <>
      <style>{`
        .results-page-wrapper {
          max-width: 780px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }
        .back-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text2);
          cursor: pointer;
          transition: all 0.15s;
        }
        .back-btn:hover { border-color: var(--accent); color: var(--accent); }
        .meta-chips {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .meta-chip {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          padding: 4px 10px;
          border-radius: 2px;
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--text2);
        }
        .results-hero {
          margin-bottom: 28px;
        }
        .results-hero h2 {
          font-family: var(--font-head);
          font-size: 1.8rem;
          letter-spacing: -0.02em;
          color: var(--text);
          margin-bottom: 6px;
        }
        .query-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text2);
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 4px 12px;
        }
        .query-tag strong { color: var(--text); }
      `}</style>

      <div className="results-page-wrapper">
        <div className="back-row">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>
          <div className="meta-chips">
            {result.word_count && (
              <span className="meta-chip">{result.word_count.toLocaleString()} words</span>
            )}
            {result.confidence > 0 && (
              <span className="meta-chip">Confidence {result.confidence}%</span>
            )}
          </div>
        </div>

        <div className="results-hero">
          <h2>Analysis Results</h2>
          {result.query && (
            <div className="query-tag">
              <span>Query:</span>
              <strong>{result.query}</strong>
            </div>
          )}
        </div>

        <Results result={result} />
      </div>
    </>
  );
}
