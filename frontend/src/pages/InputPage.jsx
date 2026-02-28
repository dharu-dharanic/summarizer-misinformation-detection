import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const MAX_CHARS = 15000;

export default function InputPage({ setResult }) {
  const [tab, setTab]           = useState("text");
  const [text, setText]         = useState("");
  const [query, setQuery]       = useState("");
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [ollamaOk, setOllamaOk] = useState(null); // null=checking, true, false
  const fileRef                 = useRef();
  const navigate                = useNavigate();

  // Health-check on mount
  useEffect(() => {
    fetch("http://127.0.0.1:5000/health")
      .then(r => r.json())
      .then(d => setOllamaOk(d.ollama))
      .catch(() => setOllamaOk(false));
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (tab === "text" && !text.trim()) {
      setError("Please enter some text to analyse.");
      return;
    }
    if (tab === "file" && !file) {
      setError("Please select a .txt or .pdf file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("query", query);
    if (tab === "text") formData.append("text", text);
    else                formData.append("file", file);

    try {
      const res  = await fetch("http://127.0.0.1:5000/summarize", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
        navigate("/results");
      }
    } catch {
      setError("Cannot reach the server. Make sure Flask is running.");
    } finally {
      setLoading(false);
    }
  };

  const charPct    = Math.min((text.length / MAX_CHARS) * 100, 100);
  const charColor  = charPct > 90 ? "var(--red)" : charPct > 70 ? "var(--yellow)" : "var(--green)";

  return (
    <>
      <style>{`
        /* ── Status bar ── */
        .status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text2);
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .status-dot.ok   { background: var(--green); box-shadow: 0 0 0 3px rgba(30,132,73,0.2); }
        .status-dot.fail { background: var(--red);   box-shadow: 0 0 0 3px rgba(192,57,43,0.2); }
        .status-dot.wait { background: var(--text2); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── Page hero ── */
        .page-hero { margin-bottom: 36px; }
        .page-hero h1 {
          font-family: var(--font-head);
          font-size: clamp(2rem, 5vw, 3rem);
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 10px;
        }
        .page-hero h1 em {
          font-style: italic;
          color: var(--accent);
        }
        .page-hero p {
          font-size: 0.95rem;
          color: var(--text2);
          line-height: 1.6;
          max-width: 520px;
        }

        /* ── Tabs ── */
        .tabs {
          display: flex;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          margin-bottom: 24px;
          width: fit-content;
        }
        .tab-btn {
          padding: 9px 24px;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          border: none;
          background: var(--surface2);
          color: var(--text2);
          cursor: pointer;
          transition: all 0.15s;
          border-right: 1px solid var(--border);
          letter-spacing: 0.01em;
        }
        .tab-btn:last-child { border-right: none; }
        .tab-btn.active {
          background: var(--accent);
          color: #fff;
        }
        .tab-btn:hover:not(.active) {
          background: var(--border);
          color: var(--text);
        }

        /* ── Input card ── */
        .input-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
          margin-bottom: 16px;
        }
        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text2);
          margin-bottom: 8px;
        }
        .field-row { margin-bottom: 20px; }
        .field-row:last-child { margin-bottom: 0; }

        textarea.styled-input {
          width: 100%;
          padding: 14px;
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.6;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text);
          resize: vertical;
          min-height: 220px;
          transition: border-color 0.15s;
          outline: none;
        }
        textarea.styled-input:focus { border-color: var(--accent); }

        .char-bar-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }
        .char-bar-track {
          flex: 1;
          height: 3px;
          background: var(--border);
          border-radius: 2px;
          margin-right: 10px;
          overflow: hidden;
        }
        .char-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.2s, background 0.2s;
        }
        .char-count {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text2);
          white-space: nowrap;
        }

        input.styled-input {
          width: 100%;
          padding: 11px 14px;
          font-family: var(--font-body);
          font-size: 0.9rem;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text);
          outline: none;
          transition: border-color 0.15s;
        }
        input.styled-input:focus { border-color: var(--accent); }
        input.styled-input::placeholder { color: var(--text2); opacity: 0.7; }

        /* ── File drop zone ── */
        .drop-zone {
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s;
          background: var(--surface2);
        }
        .drop-zone:hover { border-color: var(--accent); background: var(--tag-bg); }
        .drop-zone.has-file { border-color: var(--green); background: rgba(30,132,73,0.04); }
        .drop-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .drop-title { font-size: 1rem; font-weight: 500; color: var(--text); margin-bottom: 4px; }
        .drop-sub { font-size: 0.8rem; color: var(--text2); }
        .drop-filename {
          margin-top: 8px;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--green);
        }

        /* ── Submit button ── */
        .submit-btn {
          width: 100%;
          padding: 14px;
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: all 0.15s;
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--accent2);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(192,57,43,0.3);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Loading overlay ── */
        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 32px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          margin-top: 16px;
          text-align: center;
        }
        .loading-dots { display: flex; gap: 8px; }
        .loading-dot {
          width: 8px; height: 8px;
          background: var(--accent);
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.5} 40%{transform:scale(1.2);opacity:1} }
        .loading-text { font-size: 0.9rem; color: var(--text2); }

        /* ── Error ── */
        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: var(--tag-bg);
          border: 1px solid var(--accent);
          border-radius: var(--radius);
          padding: 12px 16px;
          margin-top: 12px;
          font-size: 0.88rem;
          color: var(--accent);
        }
      `}</style>

      <div className="page-wrapper">
        {/* Status bar */}
        <div className="status-bar">
          <span className={`status-dot ${ollamaOk === null ? "wait" : ollamaOk ? "ok" : "fail"}`} />
          {ollamaOk === null && "Checking Ollama…"}
          {ollamaOk === true  && "Ollama connected · llama3.2 ready"}
          {ollamaOk === false && "Ollama offline — run: ollama serve"}
        </div>

        {/* Hero */}
        <div className="page-hero">
          <h1>Summarise. <em>Verify.</em> Know.</h1>
          <p>Paste text or upload a document to get an AI-generated summary and instant misinformation detection.</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === "text" ? "active" : ""}`} onClick={() => setTab("text")}>
            ✏ Text Input
          </button>
          <button className={`tab-btn ${tab === "file" ? "active" : ""}`} onClick={() => setTab("file")}>
            📎 File Upload
          </button>
        </div>

        {/* Input Card */}
        <div className="input-card">
          {tab === "text" ? (
            <div className="field-row">
              <label className="field-label">Document / Article</label>
              <textarea
                className="styled-input"
                placeholder="Paste your text here…"
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={MAX_CHARS}
              />
              <div className="char-bar-wrap">
                <div className="char-bar-track">
                  <div className="char-bar-fill" style={{ width: `${charPct}%`, background: charColor }} />
                </div>
                <span className="char-count" style={{ color: charColor }}>
                  {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="field-row">
              <label className="field-label">Upload File</label>
              <div
                className={`drop-zone ${file ? "has-file" : ""}`}
                onClick={() => fileRef.current?.click()}
              >
                <div className="drop-icon">{file ? "✅" : "📄"}</div>
                <div className="drop-title">{file ? "File selected" : "Click to choose a file"}</div>
                <div className="drop-sub">Supports .txt and .pdf</div>
                {file && <div className="drop-filename">{file.name} ({(file.size / 1024).toFixed(1)} KB)</div>}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.pdf"
                  style={{ display: "none" }}
                  onChange={e => setFile(e.target.files[0] || null)}
                />
              </div>
            </div>
          )}

          <div className="field-row">
            <label className="field-label">Focus Query <span style={{fontWeight:400, textTransform:"none", letterSpacing:0}}>(optional)</span></label>
            <input
              className="styled-input"
              type="text"
              placeholder="e.g. What are the main health claims? Is the data reliable?"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading || ollamaOk === false}>
          {loading ? "Analysing…" : "Analyse →"}
        </button>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-dots">
              <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
            </div>
            <p className="loading-text">Running fact-check and summarisation…</p>
          </div>
        )}

        {error && (
          <div className="error-box">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </>
  );
}

