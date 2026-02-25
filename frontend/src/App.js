import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import InputPage from "./pages/InputPage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState(localStorage.getItem("theme") || "light");
  const [toggleRotate, setToggleRotate] = useState(false); // for rotation

  useEffect(() => {
    document.body.className = mode + "-mode";
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(mode === "light" ? "dark" : "light");
    setToggleRotate(!toggleRotate);
  };

  return (
    <Router>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<InputPage mode={mode} setResult={setResult} />} />
        <Route path="/results" element={<ResultsPage mode={mode} result={result} />} />
      </Routes>

      {/* Mode Toggle Icon */}
      <div
        className={`mode-toggle ${toggleRotate ? "rotated" : ""} ${mode}-bg`}
        onClick={toggleMode}
        title={mode === "light" ? "Dark Mode" : "Light Mode"}
      >
        {mode === "light" ? <FiMoon size={24} /> : <FiSun size={24} />}
      </div>

      {/* Global CSS */}
      <style>{`
        body.light-mode { background: #fdf6e3; color: #333; transition: all 0.3s ease; }
        body.dark-mode { background: #2c2c3e; color: #eee; transition: all 0.3s ease; }

        .mode-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          transition: transform 0.6s ease, background 0.6s ease;
          z-index: 1000;
        }

        /* Smooth background gradient swap */
        .mode-toggle.light-bg {
          background: linear-gradient(135deg, #f6d365, #fda085);
        }
        .mode-toggle.dark-bg {
          background: linear-gradient(135deg, #4b6cb7, #182848);
        }

        .mode-toggle:hover {
          transform: scale(1.15);
        }

        .mode-toggle.rotated {
          transform: rotate(180deg);
        }

        .app-container {
          max-width: 900px;
          margin: 50px auto;
          padding: 30px 40px;
          background: ${mode === "light" ? "#fdf6e3" : "#3a3a4e"};
          border-radius: 15px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }

        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .app-header h1 {
          font-size: 28px;
          letter-spacing: 0.5px;
          color: ${mode === "light" ? "#7d3c98" : "#ffc7f5"};
        }

        .tab-container {
          display: flex;
          margin-bottom: 20px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .tab-item {
          flex: 1;
          text-align: center;
          padding: 12px 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-item.active {
          background: ${mode === "light" ? "#9b59b6" : "#8e44ad"};
          color: #fff;
          font-weight: 600;
        }

        .tab-item:hover {
          background: ${mode === "light" ? "#8e44ad" : "#7d3c98"};
          color: #fff;
        }

        .loading-container {
          text-align: center;
          margin-top: 30px;
          font-weight: 500;
          color: ${mode === "light" ? "#333" : "#eee"};
        }

        .spinner {
          border: 5px solid #eee;
          border-top: 5px solid ${mode === "light" ? "#9b59b6" : "#ffc7f5"};
          border-radius: 50%;
          width: 60px;
          height: 60px;
          margin: 0 auto 10px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </Router>
  );
}

export default App;
