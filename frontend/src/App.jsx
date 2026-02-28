import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InputPage from "./pages/InputPage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  const [result, setResult] = useState(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <>
      <style>{`
        :root {
          --bg:        #f5f0e8;
          --surface:   #ffffff;
          --surface2:  #faf7f2;
          --border:    #e0d8cc;
          --text:      #1a1410;
          --text2:     #6b5e52;
          --accent:    #c0392b;
          --accent2:   #922b21;
          --tag-bg:    #fdf0ee;
          --tag-text:  #c0392b;
          --green:     #1e8449;
          --yellow:    #b7950b;
          --red:       #c0392b;
          --shadow:    0 2px 12px rgba(0,0,0,0.08);
          --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
          --radius:    4px;
          --font-head: 'DM Serif Display', Georgia, serif;
          --font-body: 'DM Sans', 'Helvetica Neue', sans-serif;
          --font-mono: 'JetBrains Mono', 'Courier New', monospace;
        }
        [data-theme="dark"] {
          --bg:       #0f0d0b;
          --surface:  #1c1916;
          --surface2: #252220;
          --border:   #3a3530;
          --text:     #f0ebe3;
          --text2:    #9e9088;
          --accent:   #e05a4e;
          --accent2:  #c0392b;
          --tag-bg:   #2a1a18;
          --tag-text: #e05a4e;
          --shadow:    0 2px 12px rgba(0,0,0,0.4);
          --shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
        }

        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: var(--font-body);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          transition: background 0.3s, color 0.3s;
          -webkit-font-smoothing: antialiased;
        }

        /* Masthead */
        .masthead {
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow);
        }
        .masthead-left {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .masthead-title {
          font-family: var(--font-head);
          font-size: 1.4rem;
          color: var(--text);
          letter-spacing: -0.02em;
        }
        .masthead-badge {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          background: var(--accent);
          color: #fff;
          padding: 2px 7px;
          border-radius: 2px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .theme-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--surface2);
          color: var(--text2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .theme-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        /* Page wrapper */
        .page-wrapper {
          max-width: 780px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }
      `}</style>

      <Router>
        <header className="masthead">
          <div className="masthead-left">
            <span className="masthead-title">VerifAI</span>
            <span className="masthead-badge">AI</span>
          </div>
          <button className="theme-btn" onClick={() => setDark(d => !d)} title="Toggle theme">
            {dark ? "☀" : "☾"}
          </button>
        </header>

        <Routes>
          <Route path="/" element={<InputPage setResult={setResult} />} />
          <Route path="/results" element={<ResultsPage result={result} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;


